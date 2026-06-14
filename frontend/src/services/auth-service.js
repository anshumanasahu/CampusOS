import api from '../config/api.js';

export const authService = {
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  demoLogin: () => api.post('/auth/demo'),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};
