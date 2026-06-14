import api from '../config/api.js';

export const chatbotService = {
  sendMessage: (query) => api.post('/chatbot/message', { query }),
  getHistory: (params) => api.get('/chatbot/history', { params }),
  clearHistory: () => api.delete('/chatbot/history'),
};
