import api from '../config/api.js';

export const shoppingService = {
  getItems: (params) => api.get('/shopping', { params }),
  getSummary: () => api.get('/shopping/summary'),
  addItem: (data) => api.post('/shopping', data),
  addBulkItems: (items) => api.post('/shopping/bulk', { items }),
  markPurchased: (id) => api.put(`/shopping/${id}/purchased`),
  deleteItem: (id) => api.delete(`/shopping/${id}`),
};
