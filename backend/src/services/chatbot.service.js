import ChatSession from '../models/chat-session.js';
import ChatThread from '../models/chat-thread.js';
import Timetable from '../models/timetable.js';
import Attendance from '../models/attendance.js';
import Expense from '../models/expense.js';
import ExpenseBudget from '../models/expense-budget.js';
import Document from '../models/document.js';
import KnowledgeResource from '../models/knowledge-resource.js';
import BurnoutRecord from '../models/burnout-record.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import ShoppingItem from '../models/shopping-item.js';
import FocusSession from '../models/focus-session.js';
import AppError from '../utils/app-error.js';
import { invokeAIJSON } from './ai.service.js';
import { CHATBOT_SYSTEM, buildChatbotPrompt } from '../ai/prompts/chatbot.js';
import { getCurrentMonth, getMonthRange } from '../utils/date.js';
import { calculateAttendanceStats } from '../utils/attendance.js';

/**
 * Chatbot service with multi-session support.
 *
 * Backward compatible:
 * - sendMessage still works without sessionId (creates/uses default session)
 * - getHistory still works without sessionId (returns all or session-specific)
 * - clearHistory still works (clears current session or all)
 */

// ═══════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════

/**
 * List all chat threads for user.
 */
export const listThreads = async (userId) => {
  const threads = await ChatThread.find({ userId, isActive: true })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();
  return { threads };
};

/**
 * Create a new chat thread.
 */
export const createThread = async (userId, data = {}) => {
  const thread = await ChatThread.create({
    userId,
    title: data.title || 'New Chat',
  });
  return { thread };
};

/**
 * Rename a chat thread.
 */
export const renameThread = async (userId, threadId, data) => {
  const thread = await ChatThread.findOne({ _id: threadId, userId });
  if (!thread) throw new AppError('Chat not found', 404, 'NOT_FOUND');
  thread.title = data.title || thread.title;
  await thread.save();
  return { thread };
};

/**
 * Delete a chat thread and all its messages.
 */
export const deleteThread = async (userId, threadId) => {
  const thread = await ChatThread.findOne({ _id: threadId, userId });
  if (!thread) throw new AppError('Chat not found', 404, 'NOT_FOUND');
  await ChatSession.deleteMany({ userId, sessionId: threadId });
  await ChatThread.deleteOne({ _id: threadId });
  return { message: 'Chat deleted' };
};

// ═══════════════════════════════════════════
// MESSAGING (backward compatible)
// ═══════════════════════════════════════════

/**
 * Process a user message and return AI response.
 * If sessionId is provided, continues that session.
 * If not, creates or uses a default session (backward compatible).
 */
export const sendMessage = async (userId, data) => {
  const { query, sessionId } = data;

  if (!query || query.trim().length === 0) {
    throw new AppError('Query is required', 400, 'VALIDATION_ERROR');
  }

  const message = query.trim();

  // Resolve or create thread
  let thread;
  if (sessionId) {
    thread = await ChatThread.findOne({ _id: sessionId, userId });
    if (!thread) throw new AppError('Chat session not found', 404, 'NOT_FOUND');
  } else {
    // Create new thread with auto-title from first message
    const title = message.length > 60 ? message.slice(0, 57) + '...' : message;
    thread = await ChatThread.create({ userId, title });
  }

  // Step 1: Build user-scoped context
  const context = await buildUserContext(userId);

  // Step 2: Get session conversation history (full session context)
  const history = await ChatSession.find({ userId, sessionId: thread._id })
    .sort({ createdAt: 1 })
    .select('role message')
    .lean();

  // If conversation is very long, summarize older messages
  const contextHistory = buildConversationContext(history);

  // Step 3: Call AI orchestrator
  let aiResult;
  try {
    const userMessage = buildChatbotPrompt(message, context, contextHistory);
    aiResult = await invokeAIJSON(CHATBOT_SYSTEM, userMessage);
  } catch (error) {
    // AI failure — save user message and return graceful error
    await ChatSession.create({ userId, sessionId: thread._id, role: 'user', message });
    const errorReply = 'I\'m having trouble processing your request right now. Please try again in a moment.';
    await ChatSession.create({ userId, sessionId: thread._id, role: 'assistant', message: errorReply, dataNotFound: true });
    await updateThreadMeta(thread, errorReply);

    return {
      answer: errorReply,
      sources: [],
      dataNotFound: true,
      sessionId: thread._id,
    };
  }

  const reply = aiResult.reply || 'I don\'t have that information.';

  // Step 4: Store conversation in history
  await ChatSession.create({
    userId,
    sessionId: thread._id,
    role: 'user',
    message,
    contextModules: Object.keys(context).filter((k) => {
      const v = context[k];
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'object' && v !== null) return Object.keys(v).length > 0;
      return false;
    }),
  });

  await ChatSession.create({
    userId,
    sessionId: thread._id,
    role: 'assistant',
    message: reply,
    sources: sanitizeSources(aiResult.sources),
    dataNotFound: aiResult.dataNotFound || false,
  });

  await updateThreadMeta(thread, reply);

  return {
    answer: reply,
    sources: sanitizeSources(aiResult.sources),
    dataNotFound: aiResult.dataNotFound || false,
    sessionId: thread._id,
  };
};

/**
 * Get chat history. If sessionId provided, returns that session.
 * Otherwise returns all messages (backward compatible).
 */
export const getHistory = async (userId, filters = {}) => {
  const limit = Math.min(parseInt(filters.limit) || 50, 200);
  const query = { userId };

  if (filters.sessionId) {
    query.sessionId = filters.sessionId;
  }

  const messages = await ChatSession.find(query)
    .sort({ createdAt: filters.sessionId ? 1 : -1 })
    .limit(limit)
    .select('role message sources dataNotFound sessionId createdAt')
    .lean();

  // If fetching by session, return in chronological order; otherwise reverse for latest-first
  const ordered = filters.sessionId ? messages : messages.reverse();

  return { messages: ordered, sessionId: filters.sessionId || null };
};

/**
 * Clear chat history.
 * If sessionId provided, clears only that session.
 * Otherwise clears all (backward compatible).
 */
export const clearHistory = async (userId, data = {}) => {
  if (data.sessionId) {
    await ChatSession.deleteMany({ userId, sessionId: data.sessionId });
    const thread = await ChatThread.findOne({ _id: data.sessionId, userId });
    if (thread) {
      thread.totalMessages = 0;
      thread.lastMessage = null;
      await thread.save();
    }
    return { message: 'Session cleared' };
  }

  // Clear all
  await ChatSession.deleteMany({ userId });
  await ChatThread.deleteMany({ userId });
  return { message: 'All chat history cleared' };
};

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

/**
 * Update thread metadata after new message.
 */
const updateThreadMeta = async (thread, lastMessage) => {
  thread.lastMessage = lastMessage.length > 200 ? lastMessage.slice(0, 197) + '...' : lastMessage;
  thread.totalMessages = await ChatSession.countDocuments({ sessionId: thread._id });
  thread.updatedAt = new Date();
  await thread.save();
};

/**
 * Build conversation context from session history.
 * For long conversations, summarize older messages to stay within token limits.
 */
const buildConversationContext = (history) => {
  if (history.length <= 20) return history;

  // Keep last 15 messages in full, summarize earlier ones
  const recent = history.slice(-15);
  const older = history.slice(0, -15);

  // Create a compact summary of older messages
  const summary = {
    role: 'system',
    message: `[Earlier in this conversation (${older.length} messages): ${
      older.filter((m) => m.role === 'user').slice(-5).map((m) => m.message.slice(0, 50)).join('; ')
    }]`,
  };

  return [summary, ...recent];
};

/**
 * Build user-scoped context for AI prompt.
 * Retrieves relevant data from ALL modules.
 */
const buildUserContext = async (userId) => {
  const results = await Promise.allSettled([
    fetchTimetableContext(userId),
    fetchAttendanceContext(userId),
    fetchExpenseContext(userId),
    fetchBudgetContext(userId),
    fetchDocumentContext(userId),
    fetchKnowledgeContext(userId),
    fetchBurnoutContext(userId),
    fetchNotificationContext(userId),
    fetchProfileContext(userId),
    fetchShoppingContext(userId),
    fetchFocusContext(userId),
  ]);

  return {
    profile: safeResolve(results[8], {}),
    timetable: safeResolve(results[0], []),
    attendance: safeResolve(results[1], []),
    expenses: safeResolve(results[2], {}),
    budget: safeResolve(results[3], {}),
    documents: safeResolve(results[4], {}),
    knowledge: safeResolve(results[5], []),
    burnout: safeResolve(results[6], {}),
    notifications: safeResolve(results[7], []),
    shopping: safeResolve(results[9], {}),
    focus: safeResolve(results[10], {}),
  };
};

const safeResolve = (result, fallback) => {
  return result.status === 'fulfilled' ? result.value : fallback;
};

const fetchProfileContext = async (userId) => {
  const user = await User.findById(userId).select('name college semester branch').lean();
  if (!user) return {};
  return { name: user.name, college: user.college, semester: user.semester, branch: user.branch };
};

const fetchTimetableContext = async (userId) => {
  const subjects = await Timetable.find({ userId }).select('name code day startTime endTime room faculty').lean();
  const grouped = {};
  for (const s of subjects) {
    if (!grouped[s.name]) grouped[s.name] = { name: s.name, code: s.code, faculty: s.faculty, schedule: [] };
    grouped[s.name].schedule.push({ day: s.day, time: `${s.startTime}-${s.endTime}`, room: s.room });
  }
  return Object.values(grouped).slice(0, 10);
};

const fetchAttendanceContext = async (userId) => {
  const subjects = await Timetable.find({ userId }).lean();
  const records = await Attendance.find({ userId }).lean();
  const uniqueNames = [...new Set(subjects.map((s) => s.name))];
  return uniqueNames.map((name) => {
    const subjectEntries = subjects.filter((s) => s.name === name);
    const subjectIds = subjectEntries.map((s) => s._id.toString());
    const threshold = subjectEntries[0]?.targetThreshold || 75;
    const subjectRecords = records.filter((r) => subjectIds.includes(r.subjectId.toString()));
    const stats = calculateAttendanceStats(subjectRecords, threshold);
    return { subject: name, percentage: stats.percentage, attended: stats.attended, total: stats.total, safeSkips: stats.safeSkips, classesNeeded: stats.classesNeeded, threshold };
  });
};

const fetchExpenseContext = async (userId) => {
  const month = getCurrentMonth();
  const { start, end } = getMonthRange(month);
  const expenses = await Expense.find({ userId, date: { $gte: start, $lte: end } }).select('amount category description date merchant').sort({ date: -1 }).limit(25).lean();
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = {};
  for (const e of expenses) byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  return { month, totalSpent: total, transactionCount: expenses.length, byCategory, recentTransactions: expenses.slice(0, 8).map((e) => ({ amount: e.amount, category: e.category, description: e.description, merchant: e.merchant, date: e.date })) };
};

const fetchBudgetContext = async (userId) => {
  const month = getCurrentMonth();
  const { start, end } = getMonthRange(month);
  const [budgets, expenses] = await Promise.all([ExpenseBudget.find({ userId, month }).lean(), Expense.find({ userId, date: { $gte: start, $lte: end } }).lean()]);
  if (budgets.length === 0) return { hasBudgets: false };
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categories = budgets.map((b) => {
    const spent = expenses.filter((e) => e.category === b.category).reduce((sum, e) => sum + e.amount, 0);
    const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    return { category: b.category, limit: b.limit, spent, remaining: Math.max(0, b.limit - spent), percentage: pct, status: pct >= 100 ? 'exceeded' : pct >= 80 ? 'warning' : 'safe' };
  });
  return { hasBudgets: true, month, totalBudget, totalSpent, totalRemaining: Math.max(0, totalBudget - totalSpent), categories };
};

const fetchDocumentContext = async (userId) => {
  const docs = await Document.find({ userId }).select('fileName category status extractedData createdAt').sort({ createdAt: -1 }).limit(15).lean();
  const confirmed = docs.filter((d) => d.status === 'confirmed');
  const now = new Date();
  const deadlines = [];
  const summaries = [];
  for (const doc of confirmed) {
    if (!doc.extractedData) continue;
    if (doc.extractedData.dates) {
      for (const d of doc.extractedData.dates) {
        deadlines.push({ title: doc.extractedData.title || doc.fileName, label: d.label, date: d.date, category: doc.category, isPast: new Date(d.date) < now });
      }
    }
    summaries.push({ title: doc.extractedData.title || doc.fileName, category: doc.category, keyInfo: (doc.extractedData.keyInfo || []).slice(0, 3), subjects: doc.extractedData.subjects || [] });
  }
  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  return { totalDocuments: docs.length, upcomingDeadlines: deadlines.filter((d) => !d.isPast).slice(0, 10), documentSummaries: summaries.slice(0, 8) };
};

const fetchKnowledgeContext = async (userId) => {
  const resources = await KnowledgeResource.find({}).select('title type subject description rating').sort({ createdAt: -1 }).limit(15).lean();
  return resources.map((r) => ({ title: r.title, type: r.type, subject: r.subject, rating: r.rating }));
};

const fetchBurnoutContext = async (userId) => {
  const records = await BurnoutRecord.find({ userId }).sort({ date: -1 }).limit(14).select('mood sleepHours workloadEstimate pendingTasksCount lateNightSpending score level date').lean();
  if (records.length === 0) return { hasData: false };
  const latest = records[0];
  const avgMood = (records.reduce((s, r) => s + r.mood, 0) / records.length).toFixed(1);
  const avgSleep = (records.reduce((s, r) => s + r.sleepHours, 0) / records.length).toFixed(1);
  const recent3 = records.slice(0, 3);
  const prev3 = records.slice(3, 6);
  let moodTrend = 'stable';
  if (recent3.length && prev3.length) {
    const rAvg = recent3.reduce((s, r) => s + r.mood, 0) / recent3.length;
    const pAvg = prev3.reduce((s, r) => s + r.mood, 0) / prev3.length;
    if (rAvg - pAvg > 0.5) moodTrend = 'improving';
    else if (pAvg - rAvg > 0.5) moodTrend = 'declining';
  }
  return { hasData: true, currentScore: latest.score, currentLevel: latest.level, latestMood: latest.mood, latestSleep: latest.sleepHours, averages: { mood: avgMood, sleep: avgSleep }, trends: { mood: moodTrend }, recentHistory: records.slice(0, 5).map((r) => ({ date: r.date, mood: r.mood, sleep: r.sleepHours, score: r.score, level: r.level })) };
};

const fetchNotificationContext = async (userId) => {
  const notifications = await Notification.find({ userId }).sort({ priority: -1, createdAt: -1 }).limit(15).select('title message type priority isRead createdAt').lean();
  const unread = notifications.filter((n) => !n.isRead);
  const urgent = unread.filter((n) => n.priority === 'urgent');
  return { totalUnread: unread.length, urgentCount: urgent.length, urgentAlerts: urgent.map((n) => ({ title: n.title, message: n.message, type: n.type })), recentAlerts: unread.slice(0, 8).map((n) => ({ title: n.title, message: n.message, type: n.type, priority: n.priority })) };
};

const sanitizeSources = (sources) => {
  if (!Array.isArray(sources)) return [];
  return sources.filter((s) => s && s.label).map((s) => ({ type: s.type || 'general', id: s.id ? String(s.id) : null, label: String(s.label) }));
};

/**
 * Shopping context: pending purchase list with budget impact.
 */
const fetchShoppingContext = async (userId) => {
  const items = await ShoppingItem.find({ userId, purchased: false })
    .sort({ priority: -1 })
    .limit(10)
    .select('title category priority estimatedCost reason')
    .lean();

  if (items.length === 0) return { hasItems: false };

  const totalEstimated = items.reduce((s, i) => s + (i.estimatedCost || 0), 0);
  return {
    hasItems: true,
    pendingCount: items.length,
    totalEstimatedCost: totalEstimated,
    highPriority: items.filter((i) => i.priority === 'high').map((i) => ({ title: i.title, cost: i.estimatedCost, reason: i.reason })),
    otherItems: items.filter((i) => i.priority !== 'high').map((i) => ({ title: i.title, cost: i.estimatedCost })),
  };
};

/**
 * Focus context: latest recommendation.
 */
const fetchFocusContext = async (userId) => {
  const latest = await FocusSession.findOne({ userId }).sort({ generatedAt: -1 }).lean();
  if (!latest) return { hasData: false };

  return {
    hasData: true,
    latestRecommendation: latest.recommendation,
    playlistType: latest.playlistType,
    duration: latest.duration,
    reason: latest.reason,
    generatedAt: latest.generatedAt,
  };
};
