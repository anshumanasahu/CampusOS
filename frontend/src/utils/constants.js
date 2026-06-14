/**
 * CampusOS Frontend Constants.
 * Single source of truth for enums and fixed values.
 */

// API Routes
export const API_ROUTES = {
  AUTH: {
    GOOGLE: '/auth/google',
    DEMO: '/auth/demo',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  DASHBOARD: '/dashboard',
  ATTENDANCE: {
    BASE: '/attendance',
    SUBJECTS: '/attendance/subjects',
    MARK: '/attendance/mark',
    MARK_DAY: '/attendance/mark-day',
    REPORT: '/attendance/report',
  },
  EXPENSES: {
    BASE: '/expenses',
    BANK_STATEMENT: '/expenses/bank-statement',
    BANK_STATEMENT_CONFIRM: '/expenses/bank-statement/confirm',
    BUDGET: '/expenses/budget',
    SUMMARY: '/expenses/summary',
  },
  DOCUMENTS: {
    BASE: '/documents',
    UPLOAD: '/documents/upload',
    MANUAL: '/documents/manual',
    CONFIRM: (id) => `/documents/${id}/confirm`,
    REJECT: (id) => `/documents/${id}/reject`,
    DETAIL: (id) => `/documents/${id}`,
  },
  CHATBOT: {
    MESSAGE: '/chatbot/message',
    HISTORY: '/chatbot/history',
  },
  KNOWLEDGE: {
    BASE: '/knowledge',
    UPLOAD: '/knowledge/upload',
    PROFESSOR_REVIEW: '/knowledge/professor-review',
    POINTS: '/knowledge/points',
  },
  BURNOUT: {
    BASE: '/burnout',
    HISTORY: '/burnout/history',
    CHECKIN: '/burnout/checkin',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    DISMISS_ALL: '/notifications/dismiss-all',
    DISMISS: (id) => `/notifications/${id}/dismiss`,
  },
  PROFILE: {
    BASE: '/profile',
    RESET_DEMO: '/profile/reset-demo',
  },
};

// Document Categories (11 categories — frozen)
export const DOCUMENT_CATEGORIES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam' },
  { value: 'placement', label: 'Placement' },
  { value: 'club_event', label: 'Club Event' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'hostel_notice', label: 'Hostel Notice' },
  { value: 'fee_payment', label: 'Fee Payment' },
  { value: 'transport', label: 'Transport' },
  { value: 'personal_reminder', label: 'Personal Reminder' },
  { value: 'other', label: 'Other' },
];

// Expense Categories (9 categories — frozen)
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'academics', label: 'Academics' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'medical', label: 'Medical' },
  { value: 'bills', label: 'Bills' },
  { value: 'other', label: 'Other' },
];

// Attendance Statuses (5 states — frozen)
export const ATTENDANCE_STATUSES = [
  { value: 'attended', label: 'Attended', color: 'green' },
  { value: 'missed', label: 'Missed', color: 'red' },
  { value: 'skipped', label: 'Skipped', color: 'orange' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
  { value: 'holiday', label: 'Holiday', color: 'blue' },
];

// Burnout Levels (frozen)
export const BURNOUT_LEVELS = [
  { value: 'low', label: 'Low', color: 'green', min: 0, max: 32 },
  { value: 'medium', label: 'Medium', color: 'orange', min: 33, max: 65 },
  { value: 'high', label: 'High', color: 'red', min: 66, max: 100 },
];

// Notification Priorities (frozen)
export const NOTIFICATION_PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: 'red' },
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'low', label: 'Low', color: 'gray' },
];

// Notification Types (frozen)
export const NOTIFICATION_TYPES = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'budget', label: 'Budget' },
  { value: 'burnout', label: 'Burnout' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'general', label: 'General' },
];

// Knowledge Resource Types (frozen)
export const KNOWLEDGE_TYPES = [
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'PYQ' },
  { value: 'professor_review', label: 'Professor Review' },
];

// Payment Modes
export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

// Days of the week
export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

// Good Senior Points values (frozen)
export const POINTS_MAP = {
  notes: 10,
  pyq: 15,
  professor_review: 5,
};
