import { createContext, useState, useCallback } from 'react';
import api from '../config/api.js';
import { API_ROUTES } from '../utils/constants.js';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load notifications from backend.
   */
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(API_ROUTES.NOTIFICATIONS.BASE);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Dismiss (mark as read) a single notification.
   */
  const dismissNotification = useCallback(async (notificationId) => {
    try {
      await api.put(API_ROUTES.NOTIFICATIONS.DISMISS(notificationId));
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message || 'Failed to dismiss notification');
    }
  }, []);

  /**
   * Dismiss all notifications.
   */
  const dismissAll = useCallback(async () => {
    try {
      await api.put(API_ROUTES.NOTIFICATIONS.DISMISS_ALL);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message || 'Failed to dismiss notifications');
    }
  }, []);

  /**
   * Clear viewed (read) notifications.
   */
  const clearViewedNotifications = useCallback(async () => {
    try {
      await api.delete(`${API_ROUTES.NOTIFICATIONS.BASE}/clear-viewed`);
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      setError(err.message || 'Failed to clear notifications');
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    dismissNotification,
    dismissAll,
    clearViewedNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
