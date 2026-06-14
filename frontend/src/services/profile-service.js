import api from '../config/api.js';

export const profileService = {
  getProfile: () => api.get('/profile'),
  updatePreferences: (data) => api.put('/profile', data),
  resetDemo: () => api.post('/profile/reset-demo'),
};
