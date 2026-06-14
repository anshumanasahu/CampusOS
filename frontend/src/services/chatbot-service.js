import api from '../config/api.js';

export const chatbotService = {
  // Messaging (backward compatible)
  sendMessage: (query, sessionId) => api.post('/chatbot/message', { query, sessionId }),
  getHistory: (params) => api.get('/chatbot/history', { params }),
  clearHistory: (sessionId) => api.delete('/chatbot/history', { data: { sessionId } }),

  // Session management
  listThreads: () => api.get('/chatbot/threads'),
  createThread: (title) => api.post('/chatbot/threads', { title }),
  renameThread: (id, title) => api.put(`/chatbot/threads/${id}`, { title }),
  deleteThread: (id) => api.delete(`/chatbot/threads/${id}`),
};
