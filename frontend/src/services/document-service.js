import api from '../config/api.js';

export const documentService = {
  getDocuments: (params) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  upload: (formData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  confirm: (id, data) => api.post(`/documents/${id}/confirm`, data),
  reject: (id, data) => api.post(`/documents/${id}/reject`, data || {}),
  createManual: (data) => api.post('/documents/manual', data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};
