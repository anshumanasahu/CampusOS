import api from '../config/api.js';

export const focusService = {
  getRecommendation: () => api.get('/focus/recommendation'),
  getHistory: (params) => api.get('/focus/history', { params }),
  getPlaylists: () => api.get('/focus/playlists'),
};
