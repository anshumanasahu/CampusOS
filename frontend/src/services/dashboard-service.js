import api from '../config/api.js';

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
};
