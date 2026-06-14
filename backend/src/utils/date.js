/**
 * Get the start and end of a month from a YYYY-MM string.
 */
export const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Get current month as YYYY-MM.
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
 * Get start of today (midnight).
 */
export const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

/**
 * Get a date N days from now.
 */
export const getDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Check if a date is within the last N days.
 */
export const isWithinDays = (date, days) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(date) >= cutoff;
};

/**
 * Get the hour from a Date object (0-23).
 */
export const getHour = (date) => {
  return new Date(date).getHours();
};
