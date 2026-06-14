import Timetable from '../models/timetable.js';
import Attendance from '../models/attendance.js';
import AppError from '../utils/app-error.js';
import { calculateAttendanceStats } from '../utils/attendance.js';
import { validateRequired, validateEnum, validateObjectId } from '../utils/validators.js';

const VALID_STATUSES = ['attended', 'missed', 'skipped', 'cancelled', 'holiday'];
const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Get all attendance data for user (subjects + records).
 */
export const getAttendance = async (userId) => {
  const [subjects, records] = await Promise.all([
    Timetable.find({ userId }).sort({ day: 1, startTime: 1 }).lean(),
    Attendance.find({ userId }).sort({ date: -1 }).lean(),
  ]);

  return { subjects, records };
};

/**
 * Create a new subject (timetable entry).
 * A subject may have multiple schedule entries (one per day).
 */
export const createSubject = async (userId, data) => {
  validateRequired(data, ['name']);

  const { name, code, faculty, schedule, targetThreshold, notes } = data;

  // If schedule is provided, create one timetable entry per day
  if (schedule && Array.isArray(schedule) && schedule.length > 0) {
    const entries = schedule.map((slot) => {
      validateRequired(slot, ['day', 'startTime', 'endTime']);
      validateEnum(slot.day?.toLowerCase(), VALID_DAYS, 'day');

      return {
        userId,
        name,
        code: code || null,
        faculty: faculty || null,
        day: slot.day.toLowerCase(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: slot.room || null,
        targetThreshold: targetThreshold || null,
        notes: notes || null,
      };
    });

    const created = await Timetable.insertMany(entries);
    return created;
  }

  // Single entry without full schedule
  const entry = await Timetable.create({
    userId,
    name,
    code: code || null,
    faculty: faculty || null,
    day: data.day?.toLowerCase() || 'monday',
    startTime: data.startTime || '09:00',
    endTime: data.endTime || '10:00',
    room: data.room || null,
    targetThreshold: targetThreshold || null,
    notes: notes || null,
  });

  return [entry];
};

/**
 * Update a subject/timetable entry.
 */
export const updateSubject = async (userId, subjectId, data) => {
  validateObjectId(subjectId, 'subjectId');

  const subject = await Timetable.findOne({ _id: subjectId, userId });
  if (!subject) {
    throw new AppError('Subject not found', 404, 'NOT_FOUND');
  }

  if (data.name) subject.name = data.name;
  if (data.code !== undefined) subject.code = data.code;
  if (data.faculty !== undefined) subject.faculty = data.faculty;
  if (data.day) {
    validateEnum(data.day.toLowerCase(), VALID_DAYS, 'day');
    subject.day = data.day.toLowerCase();
  }
  if (data.startTime) subject.startTime = data.startTime;
  if (data.endTime) subject.endTime = data.endTime;
  if (data.room !== undefined) subject.room = data.room;
  if (data.targetThreshold !== undefined) subject.targetThreshold = data.targetThreshold;
  if (data.notes !== undefined) subject.notes = data.notes;

  await subject.save();
  return subject;
};

/**
 * Delete a subject and all its attendance records.
 */
export const deleteSubject = async (userId, subjectId) => {
  validateObjectId(subjectId, 'subjectId');

  const subject = await Timetable.findOne({ _id: subjectId, userId });
  if (!subject) {
    throw new AppError('Subject not found', 404, 'NOT_FOUND');
  }

  await Promise.all([
    Timetable.deleteOne({ _id: subjectId }),
    Attendance.deleteMany({ userId, subjectId }),
  ]);

  return { message: 'Subject and related attendance deleted' };
};

/**
 * Mark attendance for a class.
 */
export const markAttendance = async (userId, data) => {
  validateRequired(data, ['subjectId', 'status']);
  validateObjectId(data.subjectId, 'subjectId');
  validateEnum(data.status, VALID_STATUSES, 'status');

  // Verify subject belongs to user
  const subject = await Timetable.findOne({ _id: data.subjectId, userId });
  if (!subject) {
    throw new AppError('Subject not found', 404, 'NOT_FOUND');
  }

  const date = data.date ? new Date(data.date) : new Date();
  date.setHours(0, 0, 0, 0);

  // Upsert — update if exists for same subject+date, create otherwise
  const record = await Attendance.findOneAndUpdate(
    { userId, subjectId: data.subjectId, date },
    { userId, subjectId: data.subjectId, date, status: data.status },
    { upsert: true, new: true, runValidators: true }
  );

  // Return updated stats for this subject
  const allRecords = await Attendance.find({ userId, subjectId: data.subjectId }).lean();
  const stats = calculateAttendanceStats(allRecords, subject.targetThreshold || 75);

  return { record, stats };
};

/**
 * Mark an entire day as cancelled or holiday for all subjects.
 */
export const markDay = async (userId, data) => {
  validateRequired(data, ['date', 'status']);
  validateEnum(data.status, ['cancelled', 'holiday'], 'status');

  const date = new Date(data.date);
  date.setHours(0, 0, 0, 0);

  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

  // Find all subjects scheduled for this day
  const subjects = await Timetable.find({ userId, day: dayName }).lean();
  if (subjects.length === 0) {
    return { records: [], message: 'No classes scheduled for this day' };
  }

  // Mark all subjects for this day
  const records = [];
  for (const subject of subjects) {
    const record = await Attendance.findOneAndUpdate(
      { userId, subjectId: subject._id, date },
      { userId, subjectId: subject._id, date, status: data.status },
      { upsert: true, new: true, runValidators: true }
    );
    records.push(record);
  }

  return { records, message: `Marked ${records.length} classes as ${data.status}` };
};

/**
 * Get attendance report with stats per subject.
 */
export const getReport = async (userId, filters = {}) => {
  const subjects = await Timetable.find({ userId }).lean();
  if (subjects.length === 0) {
    return { subjects: [], overall: { percentage: 0, total: 0, attended: 0 } };
  }

  // Group by unique subject name
  const uniqueNames = [...new Set(subjects.map((s) => s.name))];
  const allRecords = await Attendance.find({ userId }).lean();

  let overallAttended = 0;
  let overallTotal = 0;

  const subjectReports = uniqueNames.map((name) => {
    const subjectEntries = subjects.filter((s) => s.name === name);
    const subjectIds = subjectEntries.map((s) => s._id.toString());
    const threshold = subjectEntries[0]?.targetThreshold || 75;

    const records = allRecords.filter((r) => subjectIds.includes(r.subjectId.toString()));
    const stats = calculateAttendanceStats(records, threshold);

    overallAttended += stats.attended;
    overallTotal += stats.total;

    return {
      name,
      code: subjectEntries[0]?.code || null,
      targetThreshold: threshold,
      ...stats,
    };
  });

  const overallPercentage = overallTotal > 0
    ? Math.round((overallAttended / overallTotal) * 100)
    : 0;

  return {
    subjects: subjectReports,
    overall: {
      percentage: overallPercentage,
      total: overallTotal,
      attended: overallAttended,
    },
  };
};
