/**
 * Budget helper utilities.
 * Pure functions for budget calculations.
 * Mirrors backend threshold logic.
 */

/**
 * Calculate total spent from expense records.
 * @param {Array} expenses - Array of { amount } objects
 * @returns {number} Total spent
 */
export const calculateSpent = (expenses) => {
  if (!expenses || expenses.length === 0) return 0;
  return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
};

/**
 * Calculate remaining budget.
 * @param {number} limit - Budget limit
 * @param {number} spent - Amount spent
 * @returns {number} Remaining (min 0)
 */
export const calculateRemaining = (limit, spent) => {
  return Math.max(0, (limit || 0) - (spent || 0));
};

/**
 * Calculate percentage of budget used.
 * @param {number} spent - Amount spent
 * @param {number} limit - Budget limit
 * @returns {number} Percentage (0-100+, can exceed 100)
 */
export const calculatePercentage = (spent, limit) => {
  if (!limit || limit <= 0) return 0;
  return Math.round((spent / limit) * 100);
};

/**
 * Determine budget threshold status.
 * Matches backend rules:
 * - >= 100% → 'exceeded' (critical)
 * - >= 80% → 'warning'
 * - < 80% → 'safe'
 *
 * @param {number} spent
 * @param {number} limit
 * @returns {{ status: string, percentage: number, color: string }}
 */
export const thresholdStatus = (spent, limit) => {
  const percentage = calculatePercentage(spent, limit);

  if (percentage >= 100) {
    return { status: 'exceeded', percentage, color: 'red' };
  }
  if (percentage >= 80) {
    return { status: 'warning', percentage, color: 'orange' };
  }
  return { status: 'safe', percentage, color: 'green' };
};

/**
 * Calculate category-wise spending breakdown.
 * @param {Array} expenses - Array of { category, amount }
 * @returns {Object} { [category]: totalAmount }
 */
export const categoryBreakdown = (expenses) => {
  if (!expenses || expenses.length === 0) return {};

  const breakdown = {};
  for (const e of expenses) {
    breakdown[e.category] = (breakdown[e.category] || 0) + (e.amount || 0);
  }
  return breakdown;
};
