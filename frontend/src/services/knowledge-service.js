import api from '../config/api.js';

export const knowledgeService = {
  getResources: (params) => api.get('/knowledge', { params }),
  getResource: (id) => api.get(`/knowledge/${id}`),
  upload: (data) => api.post('/knowledge/upload', data),
  createProfessorReview: (data) => api.post('/knowledge/professor-review', data),
  updateResource: (id, data) => api.put(`/knowledge/${id}`, data),
  deleteResource: (id) => api.delete(`/knowledge/${id}`),
  getPoints: () => api.get('/knowledge/points'),
};
