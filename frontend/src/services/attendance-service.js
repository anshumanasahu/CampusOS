import api from '../config/api.js';

export const attendanceService = {
  getAttendance: () => api.get('/attendance'),
  createSubject: (data) => api.post('/attendance/subjects', data),
  updateSubject: (id, data) => api.put(`/attendance/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/attendance/subjects/${id}`),
  markAttendance: (data) => api.post('/attendance/mark', data),
  markDay: (data) => api.post('/attendance/mark-day', data),
  getReport: () => api.get('/attendance/report'),
};
