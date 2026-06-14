import ChatSession from '../models/chat-session.js';
import Timetable from '../models/timetable.js';
import Attendance from '../models/attendance.js';
import Expense from '../models/expense.js';
import ExpenseBudget from '../models/expense-budget.js';
import Document from '../models/document.js';
import KnowledgeResource from '../models/knowledge-resource.js';
import BurnoutRecord from '../models/burnout-record.js';
import AppError from '../utils/app-error.js';
import { invokeAIJSON } from './ai.service.js';
import { CHATBOT_SYSTEM, buildChatbotPrompt } from '../ai/prompts/chatbot.js';
import { getCurrentMonth, getMonthRange } from '../utils/date.js';

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
 * Retrieves relevant data from all modules, limited to avoid excessive tokens.
 */
const buildUserContext = async (userId) => {
  const results = await Promise.allSettled([
    fetchTimetableContext(userId),
    fetchAttendanceContext(userId),
    fetchExpenseContext(userId),
    fetchDocumentContext(userId),
    fetchKnowledgeContext(userId),
    fetchBurnoutContext(userId),
  ]);

  return {
    timetable: safeResolve(results[0], []),
    attendance: safeResolve(results[1], {}),
    expenses: safeResolve(results[2], {}),
    deadlines: safeResolve(results[3], []),
    knowledge: safeResolve(results[4], []),
    burnoutLevel: safeResolve(results[5], 'unknown'),
  };
};

const safeResolve = (result, fallback) => {
  return result.status === 'fulfilled' ? result.value : fallback;
};

/**
 * Timetable context: current schedule.
 */
const fetchTimetableContext = async (userId) => {
  const subjects = await Timetable.find({ userId })
    .select('name code day startTime endTime room')
    .lean();

  // Deduplicate by name, include schedule
  const grouped = {};
  for (const s of subjects) {
    if (!grouped[s.name]) {
      grouped[s.name] = { name: s.name, code: s.code, schedule: [] };
    }
    grouped[s.name].schedule.push({ day: s.day, time: `${s.startTime}-${s.endTime}`, room: s.room });
  }
  return Object.values(grouped).slice(0, 10);
};

/**
 * Attendance context: summary per subject.
 */
const fetchAttendanceContext = async (userId) => {
  const records = await Attendance.find({ userId })
    .populate('subjectId', 'name')
    .lean();

  const bySubject = {};
  for (const r of records) {
    const name = r.subjectId?.name || 'Unknown';
    if (!bySubject[name]) bySubject[name] = { attended: 0, total: 0 };
    if (!['cancelled', 'holiday'].includes(r.status)) {
      bySubject[name].total++;
      if (r.status === 'attended') bySubject[name].attended++;
    }
  }

  return Object.entries(bySubject).map(([name, stats]) => ({
    subject: name,
    attended: stats.attended,
    total: stats.total,
    percentage: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0,
  }));
};

/**
 * Expense context: monthly summary.
 */
const fetchExpenseContext = async (userId) => {
  const month = getCurrentMonth();
  const { start, end } = getMonthRange(month);

  const expenses = await Expense.find({ userId, date: { $gte: start, $lte: end } })
    .select('amount category description date')
    .sort({ date: -1 })
    .limit(20)
    .lean();

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgets = await ExpenseBudget.find({ userId, month }).lean();
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  return {
    monthlySpent: total,
    monthlyBudget: totalBudget,
    recentExpenses: expenses.slice(0, 5).map((e) => ({
      amount: e.amount,
      category: e.category,
      description: e.description,
    })),
  };
};

/**
 * Document context: upcoming deadlines from confirmed documents.
 */
const fetchDocumentContext = async (userId) => {
  const docs = await Document.find({ userId, status: 'confirmed' })
    .select('extractedData category')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const deadlines = [];
  for (const doc of docs) {
    if (!doc.extractedData) continue;
    deadlines.push({
      title: doc.extractedData.title,
      category: doc.category,
      dates: doc.extractedData.dates || [],
      keyInfo: (doc.extractedData.keyInfo || []).slice(0, 3),
    });
  }
  return deadlines;
};

/**
 * Knowledge context: user's contributed resources.
 */
const fetchKnowledgeContext = async (userId) => {
  const resources = await KnowledgeResource.find({})
    .select('title type subject description')
    .sort({ createdAt: -1 })
    .limit(15)
    .lean();

  return resources.map((r) => ({
    title: r.title,
    type: r.type,
    subject: r.subject,
  }));
};

/**
 * Burnout context: latest level.
 */
const fetchBurnoutContext = async (userId) => {
  const latest = await BurnoutRecord.findOne({ userId })
    .sort({ date: -1 })
    .select('level score')
    .lean();

  return latest?.level || 'unknown';
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
