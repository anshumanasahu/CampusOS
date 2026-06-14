/**
 * Budget threshold utilities.
 *
 * Rules (from User Flow):
 * - If threshold crossed: generate financial notification, update dashboard warning, show spending insight
 * - Budget > 80% of limit → budget alert
 */

/**
 * Check budget thresholds for a user's expenses against their budgets.
 * @param {Array} budgets - Budget records [{ category, limit, month }]
 * @param {Array} expenses - Expense records for the same month [{ category, amount }]
 * @returns {Array} Threshold alerts
 */
export const checkBudgetThresholds = (budgets, expenses) => {
  const alerts = [];

  for (const budget of budgets) {
    const categoryExpenses = expenses.filter((e) => e.category === budget.category);
    const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

    if (percentage >= 100) {
      alerts.push({
        category: budget.category,
        spent,
        limit: budget.limit,
        percentage,
        level: 'exceeded',
        message: `You've exceeded your ${budget.category} budget (${percentage}%)`,
      });
    } else if (percentage >= 80) {
      alerts.push({
        category: budget.category,
        spent,
        limit: budget.limit,
        percentage,
        level: 'warning',
        message: `You're approaching your ${budget.category} budget limit (${percentage}%)`,
      });
    }
  }

  return alerts;
};

/**
 * Calculate spending summary by category.
 * @param {Array} expenses - Expense records [{ category, amount }]
 * @returns {Object} { total, byCategory: { [category]: amount } }
 */
export const calculateSpendingSummary = (expenses) => {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = {};
  for (const expense of expenses) {
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
  }

  return { total, byCategory, count: expenses.length };
};

/**
 * Calculate basic spending trends (current vs previous month).
 * @param {number} currentTotal - Current month total spending
 * @param {number} previousTotal - Previous month total spending
 * @returns {Object} Trend info
 */
export const calculateSpendingTrend = (currentTotal, previousTotal) => {
  if (previousTotal === 0) {
    return { direction: 'neutral', changePercent: 0 };
  }

  const changePercent = Math.round(
    ((currentTotal - previousTotal) / previousTotal) * 100
  );

  let direction = 'neutral';
  if (changePercent > 10) direction = 'up';
  else if (changePercent < -10) direction = 'down';

  return { direction, changePercent };
};
