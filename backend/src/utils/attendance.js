/**
 * Attendance calculation utilities.
 *
 * Rules (from PRD):
 * - "cancelled" and "holiday" do NOT affect calculations
 * - Only "attended", "missed", "skipped" count toward totals
 * - "attended" is positive, "missed" and "skipped" are negative
 * - Safe skips = how many more classes can be skipped and still meet threshold
 * - Classes needed = how many classes must be attended to reach threshold
 */

/**
 * Calculate attendance stats for a set of records.
 * @param {Array} records - Attendance records with { status }
 * @param {number|null} targetThreshold - Target percentage (e.g. 75)
 * @returns {Object} Stats object
 */
export const calculateAttendanceStats = (records, targetThreshold = 75) => {
  // Filter out cancelled and holiday — they don't affect calculations
  const countable = records.filter(
    (r) => r.status !== 'cancelled' && r.status !== 'holiday'
  );

  const total = countable.length;
  const attended = countable.filter((r) => r.status === 'attended').length;
  const missed = countable.filter((r) => r.status === 'missed').length;
  const skipped = countable.filter((r) => r.status === 'skipped').length;

  const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

  // Safe skips: how many more classes can be missed while staying >= threshold
  const safeSkips = calculateSafeSkips(attended, total, targetThreshold);

  // Classes needed: how many consecutive "attended" needed to reach threshold
  const classesNeeded = calculateClassesNeeded(attended, total, targetThreshold);

  return {
    percentage,
    total,
    attended,
    missed,
    skipped,
    safeSkips,
    classesNeeded,
  };
};

/**
 * Calculate how many classes can be safely skipped.
 * Formula: find max N where attended / (total + N) >= threshold/100
 * Rearranged: N <= (attended * 100 / threshold) - total
 */
const calculateSafeSkips = (attended, total, threshold) => {
  if (threshold <= 0 || total === 0) return 0;

  const maxTotal = Math.floor((attended * 100) / threshold);
  const safeSkips = maxTotal - total;

  return Math.max(0, safeSkips);
};

/**
 * Calculate how many classes need to be attended to reach threshold.
 * Formula: find min N where (attended + N) / (total + N) >= threshold/100
 * Rearranged: N >= (threshold * total - 100 * attended) / (100 - threshold)
 */
const calculateClassesNeeded = (attended, total, threshold) => {
  if (threshold <= 0 || threshold >= 100) return 0;

  const percentage = total > 0 ? (attended / total) * 100 : 100;

  // Already at or above threshold
  if (percentage >= threshold) return 0;

  const needed = Math.ceil(
    (threshold * total - 100 * attended) / (100 - threshold)
  );

  return Math.max(0, needed);
};
