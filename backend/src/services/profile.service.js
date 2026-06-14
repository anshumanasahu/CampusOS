import User from '../models/user.js';
import Timetable from '../models/timetable.js';
import Attendance from '../models/attendance.js';
import Expense from '../models/expense.js';
import ExpenseBudget from '../models/expense-budget.js';
import Document from '../models/document.js';
import BurnoutRecord from '../models/burnout-record.js';
import KnowledgeResource from '../models/knowledge-resource.js';
import GoodSeniorPoints from '../models/good-senior-points.js';
import AppError from '../utils/app-error.js';
import { calculateAttendanceStats } from '../utils/attendance.js';
import { getCurrentMonth, getMonthRange } from '../utils/date.js';

/**
 * Profile service — deterministic aggregation only.
 * No AI. No business logic duplication. Reads from existing collections.
 */

/**
 * Get complete profile summary for user.
 */
export const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-__v -googleId').lean();
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  const [academics, wellness, finances, contributions] = await Promise.allSettled([
    getAcademicSummary(userId),
    getWellnessSummary(userId),
    getFinanceSummary(userId),
    getContributionSummary(userId),
  ]);

  return {
    user,
    academics: safeResolve(academics, {}),
    wellness: safeResolve(wellness, {}),
    finances: safeResolve(finances, {}),
    contributions: safeResolve(contributions, {}),
  };
};

/**
 * Update user preferences.
 * Only allowed fields can be updated.
 */
export const updatePreferences = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Allowed profile fields
  if (data.name) user.name = data.name;
  if (data.college !== undefined) user.college = data.college;
  if (data.semester !== undefined) user.semester = data.semester;
  if (data.branch !== undefined) user.branch = data.branch;
  if (data.avatar !== undefined) user.avatar = data.avatar;

  await user.save();

  return { user: user.toObject() };
};

/**
 * Reset demo account data.
 * Only available for demo accounts.
 */
export const resetDemo = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  if (!user.isDemo) {
    throw new AppError('Reset is only available for demo accounts', 403, 'FORBIDDEN');
  }

  // Clear all user data
  await Promise.all([
    Timetable.deleteMany({ userId }),
    Attendance.deleteMany({ userId }),
    Expense.deleteMany({ userId }),
    ExpenseBudget.deleteMany({ userId }),
    Document.deleteMany({ userId }),
    BurnoutRecord.deleteMany({ userId }),
    KnowledgeResource.deleteMany({ userId }),
    GoodSeniorPoints.deleteMany({ userId }),
  ]);

  return { message: 'Demo account reset. Run seed to repopulate data.' };
};

/**
 * Academic summary: attendance, subjects, deadlines, uploads.
 */
const getAcademicSummary = async (userId) => {
  const [subjects, records, documents] = await Promise.all([
    Timetable.find({ userId }).lean(),
    Attendance.find({ userId }).lean(),
    Document.find({ userId, status: 'confirmed' }).countDocuments(),
  ]);

  // Overall attendance
  const uniqueNames = [...new Set(subjects.map((s) => s.name))];
  let totalAttended = 0;
  let totalCountable = 0;

  for (const name of uniqueNames) {
    const subjectIds = subjects.filter((s) => s.name === name).map((s) => s._id.toString());
    const subjectRecords = records.filter((r) => subjectIds.includes(r.subjectId.toString()));
    const stats = calculateAttendanceStats(subjectRecords, 75);
    totalAttended += stats.attended;
    totalCountable += stats.total;
  }

  const overallPercentage = totalCountable > 0
    ? Math.round((totalAttended / totalCountable) * 100)
    : 0;

  // Upcoming deadlines count
  const now = new Date();
  const confirmedDocs = await Document.find({ userId, status: 'confirmed' }).lean();
  let upcomingDeadlines = 0;
  for (const doc of confirmedDocs) {
    if (!doc.extractedData?.dates) continue;
    for (const d of doc.extractedData.dates) {
      if (new Date(d.date) > now) upcomingDeadlines++;
    }
  }

  return {
    overallAttendance: overallPercentage,
    totalSubjects: uniqueNames.length,
    totalClasses: totalCountable,
    upcomingDeadlines,
    confirmedDocuments: documents,
  };
};

/**
 * Wellness summary: burnout status and history.
 */
const getWellnessSummary = async (userId) => {
  const latest = await BurnoutRecord.findOne({ userId }).sort({ date: -1 }).lean();
  const totalCheckins = await BurnoutRecord.countDocuments({ userId });

  if (!latest) {
    return { hasData: false, totalCheckins: 0 };
  }

  return {
    hasData: true,
    currentLevel: latest.level,
    currentScore: latest.score,
    lastCheckin: latest.date,
    totalCheckins,
  };
};

/**
 * Finance summary: budget and spending for current month.
 */
const getFinanceSummary = async (userId) => {
  const month = getCurrentMonth();
  const { start, end } = getMonthRange(month);

  const [expenses, budgets] = await Promise.all([
    Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
    ExpenseBudget.find({ userId, month }).lean(),
  ]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  return {
    month,
    totalSpent,
    totalBudget,
    remaining: Math.max(0, totalBudget - totalSpent),
    transactionCount: expenses.length,
    budgetsSet: budgets.length,
  };
};

/**
 * Contribution summary: knowledge hub + points.
 */
const getContributionSummary = async (userId) => {
  const [points, resourceCount] = await Promise.all([
    GoodSeniorPoints.findOne({ userId }).lean(),
    KnowledgeResource.countDocuments({ userId }),
  ]);

  return {
    totalPoints: points?.totalPoints || 0,
    totalContributions: resourceCount,
    recentContributions: (points?.contributions || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5),
  };
};

const safeResolve = (result, fallback) => {
  return result.status === 'fulfilled' ? result.value : fallback;
};
