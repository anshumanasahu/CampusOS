/**
 * Date helper utilities.
 * Pure functions — no side effects, no API calls.
 */

/**
 * Get today's date at midnight.
 */
export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get start of the current month.
 */
export const startOfMonth = (date) => {
  const d = date ? new Date(date) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get end of the current month.
 */
export const endOfMonth = (date) => {
  const d = date ? new Date(date) : new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Compare two dates.
 * Returns: -1 (a < b), 0 (same day), 1 (a > b)
 */
export const compareDates = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  da.setHours(0, 0, 0, 0);
  db.setHours(0, 0, 0, 0);
  if (da < db) return -1;
  if (da > db) return 1;
  return 0;
};

/**
 * Calculate days remaining until a target date.
 * Returns negative if date has passed.
 */
export const daysRemaining = (targetDate) => {
  if (!targetDate) return 0;
  const now = today();
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get current month as YYYY-MM string.
 */
export const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Get today's day name (lowercase).
 */
export const getTodayDayName = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

/**
 * Format a date to YYYY-MM-DD for input fields.
 */
export const toInputDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Get relative time description (e.g., "2 days left", "overdue").
 */
export const getRelativeTime = (date) => {
  const days = daysRemaining(date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `${days} days left`;
  return `${Math.abs(days)} days overdue`;
};
