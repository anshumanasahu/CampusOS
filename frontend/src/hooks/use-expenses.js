import { useState, useCallback, useEffect } from 'react';
import { expenseService } from '../services/expense-service.js';

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [reviewData, setReviewData] = useState(null); // Bank statement AI review state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshExpenses = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await expenseService.getExpenses(params);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSummary = useCallback(async (params) => {
    try {
      const res = await expenseService.getSummary(params);
      setSummary(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load summary');
    }
  }, []);

  const refreshBudgets = useCallback(async (params) => {
    try {
      const res = await expenseService.getBudgets(params);
      setBudgets(res.data.budgets || []);
    } catch (err) {
      setError(err.message || 'Failed to load budgets');
    }
  }, []);

  const addExpense = useCallback(async (data) => {
    setError(null);
    try {
      await expenseService.createManual(data);
      await refreshExpenses();
      await refreshSummary();
    } catch (err) {
      setError(err.message || 'Failed to add expense');
      throw err;
    }
  }, [refreshExpenses, refreshSummary]);

  const updateExpense = useCallback(async (id, data) => {
    setError(null);
    try {
      await expenseService.updateExpense(id, data);
      await refreshExpenses();
    } catch (err) {
      setError(err.message || 'Failed to update expense');
      throw err;
    }
  }, [refreshExpenses]);

  const deleteExpense = useCallback(async (id) => {
    setError(null);
    try {
      await expenseService.deleteExpense(id);
      await refreshExpenses();
      await refreshSummary();
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      throw err;
    }
  }, [refreshExpenses, refreshSummary]);

  // Upload bank statement → returns REVIEW state (never auto-saves)
  const uploadStatement = useCallback(async (file) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await expenseService.uploadBankStatement(formData);
      setReviewData(res.data);
      return res.data;
    } catch (err) {
      setError(err.message || 'Failed to upload bank statement');
      throw err;
    }
  }, []);

  // Confirm reviewed transactions (user-edited)
  const confirmTransactions = useCallback(async (confirmedTransactions) => {
    setError(null);
    try {
      await expenseService.confirmBankStatement({ confirmedTransactions });
      setReviewData(null);
      await refreshExpenses();
      await refreshSummary();
    } catch (err) {
      setError(err.message || 'Failed to confirm transactions');
      throw err;
    }
  }, [refreshExpenses, refreshSummary]);

  // Reject review data (discard without saving)
  const rejectReview = useCallback(() => {
    setReviewData(null);
  }, []);

  const createBudget = useCallback(async (data) => {
    setError(null);
    try {
      await expenseService.createBudget(data);
      await refreshBudgets();
    } catch (err) {
      setError(err.message || 'Failed to create budget');
      throw err;
    }
  }, [refreshBudgets]);

  const updateBudget = useCallback(async (id, data) => {
    setError(null);
    try {
      await expenseService.updateBudget(id, data);
      await refreshBudgets();
    } catch (err) {
      setError(err.message || 'Failed to update budget');
      throw err;
    }
  }, [refreshBudgets]);

  useEffect(() => {
    refreshExpenses();
    refreshSummary();
    refreshBudgets();
  }, [refreshExpenses, refreshSummary, refreshBudgets]);

  return {
    expenses,
    summary,
    budgets,
    reviewData,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    uploadStatement,
    confirmTransactions,
    rejectReview,
    createBudget,
    updateBudget,
    refreshExpenses,
    refreshSummary,
    refreshBudgets,
  };
}
