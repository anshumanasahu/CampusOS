import api from '../config/api.js';

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  dismiss: (id) => api.put(`/notifications/${id}/dismiss`),
  dismissAll: () => api.put('/notifications/dismiss-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearViewed: () => api.delete('/notifications/clear-viewed'),
};
