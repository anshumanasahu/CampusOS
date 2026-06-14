/**
 * Burnout calculator — mirrors backend logic exactly.
 *
 * Formula matches: backend/src/services/burnout.service.js
 *
 * Factors:
 * - workload (1-10): workloadScore = min(workload/10, 1) × 30
 * - sleep (0-24): sleepScore = max(0, (8-sleep)/8) × 25
 * - missedTasks (0+): missedScore = min(missedTasks/5, 1) × 20
 * - lateNightSpending (bool): spendingScore = 10 if true, 0 if false
 * - mood (1-5): moodScore = max(0, (5-mood)/5) × 15
 *
 * Total: 0-100
 * Level: <33 = low, 33-65 = medium, ≥66 = high
 */

/**
 * Compute burnout score from inputs.
 * @param {Object} inputs
 * @param {number} inputs.workload - 1 to 10
 * @param {number} inputs.sleep - 0 to 24 hours
 * @param {number} inputs.missedTasks - 0+
 * @param {boolean} inputs.lateNightSpending
 * @param {number} inputs.mood - 1 to 5
 * @returns {{ score: number, level: string }}
 */
export const computeBurnoutScore = ({ workload, sleep, missedTasks, lateNightSpending, mood }) => {
  const workloadScore = Math.min(workload / 10, 1) * 30;
  const sleepScore = Math.max(0, (8 - sleep) / 8) * 25;
  const missedScore = Math.min(missedTasks / 5, 1) * 20;
  const spendingScore = lateNightSpending ? 10 : 0;
  const moodScore = Math.max(0, (5 - mood) / 5) * 15;

  const total = workloadScore + sleepScore + missedScore + spendingScore + moodScore;
  const score = Math.round(total);

  let level;
  if (total < 33) level = 'low';
  else if (total < 66) level = 'medium';
  else level = 'high';

  return { score, level };
};

/**
 * Get burnout level color.
 */
export const getBurnoutColor = (level) => {
  switch (level) {
    case 'low': return 'green';
    case 'medium': return 'orange';
    case 'high': return 'red';
    default: return 'gray';
  }
};

/**
 * Get burnout level label.
 */
export const getBurnoutLabel = (level) => {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'medium': return 'Moderate Risk';
    case 'high': return 'High Risk';
    default: return 'Unknown';
  }
};
