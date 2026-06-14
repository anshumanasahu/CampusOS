import Notification from '../models/notification.js';
import AppError from '../utils/app-error.js';
import { validateObjectId } from '../utils/validators.js';

const MAX_NOTIFICATIONS = 50;

/**
 * Priority sort weight for deterministic ordering.
 */
const PRIORITY_WEIGHT = { urgent: 3, normal: 2, low: 1 };

/**
 * Get notifications for user, sorted by priority then date.
 */
export const getNotifications = async (userId, filters = {}) => {
  const query = { userId };

  if (filters.unread === 'true') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .limit(MAX_NOTIFICATIONS)
    .lean();

  // Re-sort with deterministic priority ordering
  notifications.sort((a, b) => {
    const weightDiff = (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount };
};

/**
 * Dismiss (mark as read) a single notification.
 */
export const dismissNotification = async (userId, notificationId) => {
  validateObjectId(notificationId, 'notificationId');

  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOT_FOUND');
  }

  notification.isRead = true;
  await notification.save();

  return { notification };
};

/**
 * Dismiss all unread notifications for user.
 */
export const dismissAll = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { message: 'All notifications dismissed' };
};

/**
 * Delete a single notification.
 */
export const deleteNotification = async (userId, notificationId) => {
  validateObjectId(notificationId, 'notificationId');

  const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOT_FOUND');
  }

  return { message: 'Notification deleted' };
};

/**
 * Clear all viewed (read) notifications.
 * Does NOT remove unviewed notifications.
 */
export const clearViewed = async (userId) => {
  const result = await Notification.deleteMany({ userId, isRead: true });
  return { message: `Cleared ${result.deletedCount} viewed notifications` };
};

/**
 * Enforce max notification limit for a user.
 * Removes oldest viewed notifications when over limit.
 * Called internally by modules that create notifications.
 */
export const enforceLimit = async (userId) => {
  const count = await Notification.countDocuments({ userId });

  if (count > MAX_NOTIFICATIONS) {
    const excess = count - MAX_NOTIFICATIONS;

    // Remove oldest viewed first
    const oldestViewed = await Notification.find({ userId, isRead: true })
      .sort({ createdAt: 1 })
      .limit(excess)
      .select('_id');

    if (oldestViewed.length > 0) {
      await Notification.deleteMany({ _id: { $in: oldestViewed.map((n) => n._id) } });
    }
  }
};

/**
 * Create a notification (called by other services, not by controller).
 * Exported for use by document.service, expense.service, etc.
 */
export const createNotification = async (userId, data) => {
  const notification = await Notification.create({
    userId,
    title: data.title,
    message: data.message,
    type: data.type || 'general',
    priority: data.priority || 'normal',
    isRead: false,
    relatedEntity: data.relatedEntity || null,
  });

  // Enforce limit after creation
  await enforceLimit(userId);

  return notification;
};
