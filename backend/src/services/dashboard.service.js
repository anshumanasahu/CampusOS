import Timetable from '../models/timetable.js';
import Attendance from '../models/attendance.js';
import Expense from '../models/expense.js';
import ExpenseBudget from '../models/expense-budget.js';
import Document from '../models/document.js';
import BurnoutRecord from '../models/burnout-record.js';
import GoodSeniorPoints from '../models/good-senior-points.js';
import Notification from '../models/notification.js';
import { getTodayDayName, getCurrentMonth, getMonthRange, getDaysFromNow } from '../utils/date.js';
import { calculateAttendanceStats } from '../utils/attendance.js';
import { calculateSpendingSummary, checkBudgetThresholds } from '../utils/budget.js';

/**
 * Dashboard aggregation service.
 *
 * Rules:
 * - User-scoped data only (always filter by userId)
 * - No AI generation
 * - No persistence (read-only)
 * - Partial failures do not crash the dashboard
 * - Missing data returns empty arrays/objects
 */

/**
 * Get full dashboard data for a user.
 * Each aggregation is independent — one failure does not block others.
 */
export const getDashboard = async (userId) => {
  const results = await Promise.allSettled([
    fetchTodayClasses(userId),
    fetchUpcomingDeadlines(userId),
    fetchAttendanceSummary(userId),
    fetchBudgetSummary(userId),
    fetchBurnoutSummary(userId),
    fetchRecentUploads(userId),
    fetchGoodSeniorPoints(userId),
    fetchImportantNotifications(userId),
  ]);

  return {
    todayClasses: resolveOrDefault(results[0], []),
    upcomingDeadlines: resolveOrDefault(results[1], []),
    attendanceSummary: resolveOrDefault(results[2], {}),
    budgetSummary: resolveOrDefault(results[3], {}),
    burnoutSummary: resolveOrDefault(results[4], {}),
    recentUploads: resolveOrDefault(results[5], []),
    goodSeniorPoints: resolveOrDefault(results[6], { totalPoints: 0 }),
    importantNotifications: resolveOrDefault(results[7], []),
    quickActions: getQuickActions(),
  };
};

/**
 * Safely resolve a Promise.allSettled result or return default.
 */
const resolveOrDefault = (result, defaultValue) => {
  if (result.status === 'fulfilled') return result.value;
  console.warn('Dashboard aggregation partial failure:', result.reason?.message);
  return defaultValue;
};

/**
 * Today's classes from timetable.
 */
const fetchTodayClasses = async (userId) => {
  const today = getTodayDayName();
  const classes = await Timetable.find({ userId, day: today })
    .sort({ startTime: 1 })
    .select('name code startTime endTime room faculty')
    .lean();
  return classes;
};

/**
 * Upcoming deadlines from confirmed documents with future dates.
 */
const fetchUpcomingDeadlines = async (userId) => {
  const now = new Date();
  const nextWeek = getDaysFromNow(7);

  const documents = await Document.find({
    userId,
    status: 'confirmed',
    'extractedData.dates': { $exists: true },
  })
    .select('extractedData.title extractedData.dates category')
    .lean();

  const deadlines = [];
  for (const doc of documents) {
    if (!doc.extractedData?.dates) continue;
    for (const dateEntry of doc.extractedData.dates) {
      const dueDate = new Date(dateEntry.date);
      if (dueDate >= now && dueDate <= nextWeek) {
        deadlines.push({
          title: doc.extractedData.title || 'Untitled',
          label: dateEntry.label,
          date: dateEntry.date,
          category: doc.category,
          documentId: doc._id,
        });
      }
    }
  }

  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  return deadlines.slice(0, 10);
};

/**
 * Overall attendance summary across all subjects.
 */
const fetchAttendanceSummary = async (userId) => {
  const subjects = await Timetable.find({ userId }).select('name targetThreshold').lean();
  if (subjects.length === 0) return { subjects: [], overall: {} };

  // Get unique subject names (timetable can have multiple entries per subject for different days)
  const uniqueSubjects = [...new Map(subjects.map((s) => [s.name, s])).values()];
  const allRecords = await Attendance.find({ userId }).lean();

  let totalAttended = 0;
  let totalCountable = 0;

  const subjectSummaries = uniqueSubjects.map((subject) => {
    const subjectRecords = allRecords.filter(
      (r) => r.subjectId.toString() === subject._id?.toString()
    );

    // For dashboard, get records matching any timetable entry with this name
    const matchingIds = subjects
      .filter((s) => s.name === subject.name)
      .map((s) => s._id.toString());

    const records = allRecords.filter((r) => matchingIds.includes(r.subjectId.toString()));
    const stats = calculateAttendanceStats(records, subject.targetThreshold || 75);

    totalAttended += stats.attended;
    totalCountable += stats.total;

    return {
      name: subject.name,
      percentage: stats.percentage,
      safeSkips: stats.safeSkips,
      classesNeeded: stats.classesNeeded,
    };
  });

  const overallPercentage = totalCountable > 0
    ? Math.round((totalAttended / totalCountable) * 100)
    : 0;

  return {
    overall: { percentage: overallPercentage, totalSubjects: uniqueSubjects.length },
    subjects: subjectSummaries,
  };
};

/**
 * Budget summary for current month.
 */
const fetchBudgetSummary = async (userId) => {
  const month = getCurrentMonth();
  const { start, end } = getMonthRange(month);

  const [budgets, expenses] = await Promise.all([
    ExpenseBudget.find({ userId, month }).lean(),
    Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
  ]);

  if (budgets.length === 0 && expenses.length === 0) {
    return { month, totalSpent: 0, budgetsSet: 0, alerts: [] };
  }

  const summary = calculateSpendingSummary(expenses);
  const alerts = checkBudgetThresholds(budgets, expenses);

  return {
    month,
    totalSpent: summary.total,
    byCategory: summary.byCategory,
    budgetsSet: budgets.length,
    alerts,
  };
};

/**
 * Latest burnout status.
 */
const fetchBurnoutSummary = async (userId) => {
  const latest = await BurnoutRecord.findOne({ userId })
    .sort({ date: -1 })
    .select('score level mood sleepHours workloadEstimate date')
    .lean();

  if (!latest) return { hasData: false };

  return {
    hasData: true,
    score: latest.score,
    level: latest.level,
    mood: latest.mood,
    lastCheckin: latest.date,
  };
};

/**
 * Recent document uploads (last 5).
 */
const fetchRecentUploads = async (userId) => {
  const docs = await Document.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('fileName category status createdAt')
    .lean();
  return docs;
};

/**
 * Good Senior Points summary.
 */
const fetchGoodSeniorPoints = async (userId) => {
  const points = await GoodSeniorPoints.findOne({ userId })
    .select('totalPoints')
    .lean();
  return points || { totalPoints: 0 };
};

/**
 * Important notifications (unread, sorted by priority).
 */
const fetchImportantNotifications = async (userId) => {
  const notifications = await Notification.find({ userId, isRead: false })
    .sort({ priority: -1, createdAt: -1 })
    .limit(5)
    .select('title message type priority createdAt')
    .lean();
  return notifications;
};

/**
 * Static quick actions metadata.
 */
const getQuickActions = () => [
  { id: 'upload', label: 'Upload Document', path: '/documents', icon: 'upload' },
  { id: 'attendance', label: 'Mark Attendance', path: '/attendance', icon: 'check' },
  { id: 'expense', label: 'Add Expense', path: '/expenses', icon: 'wallet' },
  { id: 'chatbot', label: 'Open Chatbot', path: null, action: 'openChatbot', icon: 'chat' },
  { id: 'knowledge', label: 'Knowledge Hub', path: '/knowledge', icon: 'book' },
];
