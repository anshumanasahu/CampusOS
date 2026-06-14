import api from '../config/api.js';

export const expenseService = {
  getExpenses: (params) => api.get('/expenses', { params }),
  createManual: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  uploadBankStatement: (formData) =>
    api.post('/expenses/bank-statement', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  confirmBankStatement: (data) => api.post('/expenses/bank-statement/confirm', data),
  getBudgets: (params) => api.get('/expenses/budget', { params }),
  createBudget: (data) => api.post('/expenses/budget', data),
  updateBudget: (id, data) => api.put(`/expenses/budget/${id}`, data),
  getSummary: (params) => api.get('/expenses/summary', { params }),
};
