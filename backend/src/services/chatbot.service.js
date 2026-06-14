import ChatSession from '../models/chat-session.js';
import Timetable from '../models/timetable.js';
import Attendance from '../models/attendance.js';
import Expense from '../models/expense.js';
import ExpenseBudget from '../models/expense-budget.js';
import Document from '../models/document.js';
import KnowledgeResource from '../models/knowledge-resource.js';
import BurnoutRecord from '../models/burnout-record.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import AppError from '../utils/app-error.js';
import { invokeAIJSON } from './ai.service.js';
import { CHATBOT_SYSTEM, buildChatbotPrompt } from '../ai/prompts/chatbot.js';
import { getCurrentMonth, getMonthRange } from '../utils/date.js';
import { calculateAttendanceStats } from '../utils/attendance.js';

/**
 * Chatbot service.
 *
 * Rules:
 * - Only access current user's data
 * - Never browse the internet
 * - Never invent information
 * - Never modify data
 * - Store conversation history
 */

/**
 * Process a user message and return AI response.
 */
export const sendMessage = async (userId, data) => {
  const { query } = data;

  if (!query || query.trim().length === 0) {
    throw new AppError('Query is required', 400, 'VALIDATION_ERROR');
  }

  const message = query.trim();

  // Step 1: Build user-scoped context (deterministic, before AI)
  const context = await buildUserContext(userId);

  // Step 2: Get recent conversation history
  const history = await ChatSession.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('role message')
    .lean();
  history.reverse();

  // Step 3: Call AI orchestrator
  let aiResult;
  try {
    const userMessage = buildChatbotPrompt(message, context, history);
    aiResult = await invokeAIJSON(CHATBOT_SYSTEM, userMessage);
  } catch (error) {
    // AI failure — save user message and return graceful error
    await ChatSession.create({ userId, role: 'user', message });
    const errorReply = 'I\'m having trouble processing your request right now. Please try again in a moment.';
    await ChatSession.create({ userId, role: 'assistant', message: errorReply, dataNotFound: true });

    return {
      answer: errorReply,
      sources: [],
      dataNotFound: true,
    };
  }

  // Step 4: Store conversation in history
  await ChatSession.create({ userId, role: 'user', message });
  await ChatSession.create({
    userId,
    role: 'assistant',
    message: aiResult.reply || 'I don\'t have that information.',
    sources: sanitizeSources(aiResult.sources),
    dataNotFound: aiResult.dataNotFound || false,
  });

  return {
    answer: aiResult.reply || 'I don\'t have that information.',
    sources: sanitizeSources(aiResult.sources),
    dataNotFound: aiResult.dataNotFound || false,
  };
};

/**
 * Get chat history for user.
 */
export const getHistory = async (userId, filters = {}) => {
  const limit = Math.min(parseInt(filters.limit) || 50, 100);

  const messages = await ChatSession.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('role message sources dataNotFound createdAt')
    .lean();

  return { messages: messages.reverse() };
};

/**
 * Clear chat history for user.
 */
export const clearHistory = async (userId) => {
  await ChatSession.deleteMany({ userId });
  return { message: 'Chat history cleared' };
};

/**
 * Build user-scoped context for AI prompt.
 * Retrieves relevant data from ALL modules for cross-module intelligence.
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
  };
};

const safeResolve = (result, fallback) => {
  return result.status === 'fulfilled' ? result.value : fallback;
};

/**
 * Profile context: user identity and preferences.
 */
const fetchProfileContext = async (userId) => {
  const user = await User.findById(userId)
    .select('name college semester branch')
    .lean();

  if (!user) return {};
  return {
    name: user.name,
    college: user.college,
    semester: user.semester,
    branch: user.branch,
  };
};

/**
 * Timetable context: current schedule.
 */
const fetchTimetableContext = async (userId) => {
  const subjects = await Timetable.find({ userId })
    .select('name code day startTime endTime room faculty')
    .lean();

  // Deduplicate by name, include schedule
  const grouped = {};
  for (const s of subjects) {
    if (!grouped[s.name]) {
      grouped[s.name] = { name: s.name, code: s.code, faculty: s.faculty, schedule: [] };
    }
    grouped[s.name].schedule.push({ day: s.day, time: `${s.startTime}-${s.endTime}`, room: s.room });
  }
  return Object.values(grouped).slice(0, 10);
};

/**
 * Attendance context: summary per subject with safe skips.
 */
const fetchAttendanceContext = async (userId) => {
  const subjects = await Timetable.find({ userId }).lean();
  const records = await Attendance.find({ userId }).lean();

  // Group by unique subject name
  const uniqueNames = [...new Set(subjects.map((s) => s.name))];

  return uniqueNames.map((name) => {
    const subjectEntries = subjects.filter((s) => s.name === name);
    const subjectIds = subjectEntries.map((s) => s._id.toString());
    const threshold = subjectEntries[0]?.targetThreshold || 75;
    const subjectRecords = records.filter((r) => subjectIds.includes(r.subjectId.toString()));
    const stats = calculateAttendanceStats(subjectRecords, threshold);

    return {
      subject: name,
      percentage: stats.percentage,
      attended: stats.attended,
      total: stats.total,
      safeSkips: stats.safeSkips,
      classesNeeded: stats.classesNeeded,
      threshold,
    };
  });
};

/**
 * Expense context: recent transactions and spending summary.
 */
const fetchExpenseContext = async (userId) => {
  const month = getCurrentMonth();
  const { start, end } = getMonthRange(month);

  const expenses = await Expense.find({ userId, date: { $gte: start, $lte: end } })
    .select('amount category description date merchant')
    .sort({ date: -1 })
    .limit(25)
    .lean();

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const byCategory = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  }

  return {
    month,
    totalSpent: total,
    transactionCount: expenses.length,
    byCategory,
    recentTransactions: expenses.slice(0, 8).map((e) => ({
      amount: e.amount,
      category: e.category,
      description: e.description,
      merchant: e.merchant,
      date: e.date,
    })),
  };
};

/**
 * Budget context: monthly budgets with utilization.
 */
const fetchBudgetContext = async (userId) => {
  const month = getCurrentMonth();
  const { start, end } = getMonthRange(month);

  const [budgets, expenses] = await Promise.all([
    ExpenseBudget.find({ userId, month }).lean(),
    Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
  ]);

  if (budgets.length === 0) return { hasBudgets: false };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryStatus = budgets.map((b) => {
    const categorySpent = expenses
      .filter((e) => e.category === b.category)
      .reduce((sum, e) => sum + e.amount, 0);
    const percentage = b.limit > 0 ? Math.round((categorySpent / b.limit) * 100) : 0;

    return {
      category: b.category,
      limit: b.limit,
      spent: categorySpent,
      remaining: Math.max(0, b.limit - categorySpent),
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe',
    };
  });

  return {
    hasBudgets: true,
    month,
    totalBudget,
    totalSpent,
    totalRemaining: Math.max(0, totalBudget - totalSpent),
    overallPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
    categories: categoryStatus,
  };
};

/**
 * Document context: uploaded documents, extracted deadlines, summaries.
 */
const fetchDocumentContext = async (userId) => {
  const docs = await Document.find({ userId })
    .select('fileName category status extractedData createdAt source')
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  const confirmed = docs.filter((d) => d.status === 'confirmed');
  const now = new Date();

  // Extract deadlines
  const deadlines = [];
  const summaries = [];

  for (const doc of confirmed) {
    if (!doc.extractedData) continue;

    // Deadlines
    if (doc.extractedData.dates) {
      for (const dateEntry of doc.extractedData.dates) {
        const dueDate = new Date(dateEntry.date);
        deadlines.push({
          title: doc.extractedData.title || doc.fileName,
          label: dateEntry.label,
          date: dateEntry.date,
          category: doc.category,
          isPast: dueDate < now,
        });
      }
    }

    // Summaries
    summaries.push({
      title: doc.extractedData.title || doc.fileName,
      category: doc.category,
      keyInfo: (doc.extractedData.keyInfo || []).slice(0, 3),
      subjects: doc.extractedData.subjects || [],
    });
  }

  // Sort deadlines: upcoming first
  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    totalDocuments: docs.length,
    confirmedCount: confirmed.length,
    upcomingDeadlines: deadlines.filter((d) => !d.isPast).slice(0, 10),
    pastDeadlines: deadlines.filter((d) => d.isPast).slice(0, 5),
    documentSummaries: summaries.slice(0, 8),
    recentUploads: docs.slice(0, 5).map((d) => ({
      fileName: d.fileName,
      category: d.category,
      status: d.status,
    })),
  };
};

/**
 * Knowledge context: shared resources.
 */
const fetchKnowledgeContext = async (userId) => {
  const resources = await KnowledgeResource.find({})
    .select('title type subject description rating')
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  return resources.map((r) => ({
    title: r.title,
    type: r.type,
    subject: r.subject,
    rating: r.rating,
  }));
};

/**
 * Burnout & Wellness context: full wellness picture.
 */
const fetchBurnoutContext = async (userId) => {
  const records = await BurnoutRecord.find({ userId })
    .sort({ date: -1 })
    .limit(14)
    .select('mood sleepHours workloadEstimate pendingTasksCount lateNightSpending score level date')
    .lean();

  if (records.length === 0) return { hasData: false };

  const latest = records[0];
  const avgMood = (records.reduce((s, r) => s + r.mood, 0) / records.length).toFixed(1);
  const avgSleep = (records.reduce((s, r) => s + r.sleepHours, 0) / records.length).toFixed(1);
  const avgWorkload = (records.reduce((s, r) => s + r.workloadEstimate, 0) / records.length).toFixed(1);

  // Trends: compare last 3 days vs previous 3 days
  const recent3 = records.slice(0, 3);
  const previous3 = records.slice(3, 6);
  const recentAvgMood = recent3.length > 0 ? (recent3.reduce((s, r) => s + r.mood, 0) / recent3.length).toFixed(1) : null;
  const prevAvgMood = previous3.length > 0 ? (previous3.reduce((s, r) => s + r.mood, 0) / previous3.length).toFixed(1) : null;

  let moodTrend = 'stable';
  if (recentAvgMood && prevAvgMood) {
    if (recentAvgMood - prevAvgMood > 0.5) moodTrend = 'improving';
    else if (prevAvgMood - recentAvgMood > 0.5) moodTrend = 'declining';
  }

  return {
    hasData: true,
    currentScore: latest.score,
    currentLevel: latest.level,
    latestMood: latest.mood,
    latestSleep: latest.sleepHours,
    latestWorkload: latest.workloadEstimate,
    lastCheckin: latest.date,
    averages: {
      mood: avgMood,
      sleep: avgSleep,
      workload: avgWorkload,
    },
    trends: {
      mood: moodTrend,
      totalCheckins: records.length,
    },
    recentHistory: records.slice(0, 5).map((r) => ({
      date: r.date,
      mood: r.mood,
      sleep: r.sleepHours,
      workload: r.workloadEstimate,
      score: r.score,
      level: r.level,
    })),
  };
};

/**
 * Notification context: active alerts and reminders.
 */
const fetchNotificationContext = async (userId) => {
  const notifications = await Notification.find({ userId })
    .sort({ priority: -1, createdAt: -1 })
    .limit(15)
    .select('title message type priority isRead createdAt')
    .lean();

  const unread = notifications.filter((n) => !n.isRead);
  const urgent = notifications.filter((n) => n.priority === 'urgent' && !n.isRead);

  return {
    totalUnread: unread.length,
    urgentCount: urgent.length,
    urgentAlerts: urgent.map((n) => ({ title: n.title, message: n.message, type: n.type })),
    recentAlerts: unread.slice(0, 8).map((n) => ({
      title: n.title,
      message: n.message,
      type: n.type,
      priority: n.priority,
    })),
  };
};

/**
 * Sanitize AI-returned sources to ensure they can be saved.
 * AI may return malformed ids or missing fields.
 */
const sanitizeSources = (sources) => {
  if (!Array.isArray(sources)) return [];
  return sources
    .filter((s) => s && s.label)
    .map((s) => ({
      type: s.type || 'general',
      id: s.id ? String(s.id) : null,
      label: String(s.label),
    }));
};
