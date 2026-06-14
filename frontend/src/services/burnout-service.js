import api from '../config/api.js';

export const burnoutService = {
  getLatest: () => api.get('/burnout'),
  getHistory: (params) => api.get('/burnout/history', { params }),
  checkin: (data) => api.post('/burnout/checkin', data),
};
