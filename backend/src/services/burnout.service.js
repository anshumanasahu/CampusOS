import BurnoutRecord from '../models/burnout-record.js';
import AppError from '../utils/app-error.js';
import { validateRequired, validateRange } from '../utils/validators.js';

/**
 * Burnout service.
 *
 * Rules:
 * - User-scoped data only
 * - No medical diagnosis
 * - No psychological evaluation
 * - No external APIs
 * - No cross-user analytics
 * - Informational output only
 */

/**
 * Compute burnout score from inputs.
 * Uses the approved formula exactly.
 */
const computeBurnoutScore = ({ workload, sleep, missedTasks, lateNightSpending, mood }) => {
  const workloadScore = Math.min(workload / 10, 1) * 30;
  const sleepScore = Math.max(0, (8 - sleep) / 8) * 25;
  const missedScore = Math.min(missedTasks / 5, 1) * 20;
  const spendingScore = lateNightSpending ? 10 : 0;
  const moodScore = Math.max(0, (5 - mood) / 5) * 15;

  const total = workloadScore + sleepScore + missedScore + spendingScore + moodScore;
  const rounded = Math.round(total);

  let level;
  if (total < 33) level = 'low';
  else if (total < 66) level = 'medium';
  else level = 'high';

  return { score: rounded, level };
};

/**
 * Get latest burnout record for user.
 */
export const getLatest = async (userId) => {
  const record = await BurnoutRecord.findOne({ userId })
    .sort({ date: -1 })
    .lean();

  if (!record) {
    return {
      hasData: false,
      message: 'No burnout data yet. Complete a daily check-in to start tracking.',
    };
  }

  return {
    hasData: true,
    burnoutLevel: record.level,
    score: record.score,
    factors: {
      workload: record.workloadEstimate,
      sleep: record.sleepHours,
      missedTasks: record.pendingTasksCount,
      lateNightSpending: record.lateNightSpending,
      mood: record.mood,
    },
    date: record.date,
  };
};

/**
 * Get burnout history for user.
 */
export const getHistory = async (userId, filters = {}) => {
  const limit = Math.min(parseInt(filters.limit) || 30, 90);

  const records = await BurnoutRecord.find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .select('mood sleepHours workloadEstimate pendingTasksCount lateNightSpending score level date')
    .lean();

  return { records: records.reverse() };
};

/**
 * Create a daily burnout check-in.
 * Calculates score and saves.
 */
export const checkin = async (userId, data) => {
  validateRequired(data, ['workload', 'sleep', 'mood']);
  validateRange(data.workload, 1, 10, 'workload');
  validateRange(data.sleep, 0, 24, 'sleep');
  validateRange(data.mood, 1, 5, 'mood');

  const workload = Number(data.workload);
  const sleep = Number(data.sleep);
  const mood = Number(data.mood);
  const missedTasks = Number(data.missedTasks) || 0;
  const lateNightSpending = Boolean(data.lateNightSpending);

  // Compute score using approved formula
  const { score, level } = computeBurnoutScore({
    workload,
    sleep,
    missedTasks,
    lateNightSpending,
    mood,
  });

  // Use today's date (one check-in per day, upsert)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await BurnoutRecord.findOneAndUpdate(
    { userId, date: today },
    {
      userId,
      mood,
      sleepHours: sleep,
      workloadEstimate: workload,
      pendingTasksCount: missedTasks,
      lateNightSpending,
      score,
      level,
      date: today,
    },
    { upsert: true, new: true, runValidators: true }
  );

  return {
    burnoutLevel: level,
    score,
    factors: {
      workload,
      sleep,
      missedTasks,
      lateNightSpending,
      mood,
    },
    record,
  };
};
