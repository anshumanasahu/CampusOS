import Expense from '../models/expense.js';
import ExpenseBudget from '../models/expense-budget.js';
import AppError from '../utils/app-error.js';
import { invokeAIJSON } from './ai.service.js';
import {
  EXPENSE_CATEGORIZATION_SYSTEM,
  buildExpenseCategorizationPrompt,
} from '../ai/prompts/expense-categorization.js';
import { parseCSVTransactions } from '../utils/document-parser.js';
import { validateRequired, validateEnum, validateObjectId } from '../utils/validators.js';
import { getMonthRange, getCurrentMonth } from '../utils/date.js';
import { calculateSpendingSummary, checkBudgetThresholds, calculateSpendingTrend } from '../utils/budget.js';

const VALID_CATEGORIES = ['food', 'travel', 'academics', 'shopping', 'entertainment', 'hostel', 'medical', 'bills', 'other'];
const VALID_PAYMENT_MODES = ['cash', 'upi', 'card', 'bank_transfer', 'other'];

/**
 * Get all expenses for user with optional filters.
 */
export const getExpenses = async (userId, filters = {}) => {
  const query = { userId };

  if (filters.category) {
    validateEnum(filters.category, VALID_CATEGORIES, 'category');
    query.category = filters.category;
  }

  if (filters.month) {
    const { start, end } = getMonthRange(filters.month);
    query.date = { $gte: start, $lte: end };
  }

  const expenses = await Expense.find(query).sort({ date: -1 }).lean();
  return { expenses };
};

/**
 * Create a manual expense entry.
 */
export const createManualExpense = async (userId, data) => {
  validateRequired(data, ['amount', 'category', 'description', 'date']);
  validateEnum(data.category, VALID_CATEGORIES, 'category');

  if (data.paymentMode) {
    validateEnum(data.paymentMode, VALID_PAYMENT_MODES, 'paymentMode');
  }

  if (Number(data.amount) <= 0) {
    throw new AppError('Amount must be positive', 400, 'VALIDATION_ERROR');
  }

  const expense = await Expense.create({
    userId,
    amount: Number(data.amount),
    date: new Date(data.date),
    merchant: data.merchant || null,
    description: data.description,
    category: data.category,
    paymentMode: data.paymentMode || 'cash',
    upiRef: data.upiRef || null,
    recurring: data.recurring || false,
    source: 'manual',
    aiCategorized: false,
  });

  return { expense };
};

/**
 * Update an expense. Validates ownership.
 */
export const updateExpense = async (userId, expenseId, data) => {
  validateObjectId(expenseId, 'expenseId');

  const expense = await Expense.findOne({ _id: expenseId, userId });
  if (!expense) {
    throw new AppError('Expense not found', 404, 'NOT_FOUND');
  }

  if (data.amount !== undefined) expense.amount = Number(data.amount);
  if (data.date) expense.date = new Date(data.date);
  if (data.merchant !== undefined) expense.merchant = data.merchant;
  if (data.description) expense.description = data.description;
  if (data.category) {
    validateEnum(data.category, VALID_CATEGORIES, 'category');
    expense.category = data.category;
  }
  if (data.paymentMode) {
    validateEnum(data.paymentMode, VALID_PAYMENT_MODES, 'paymentMode');
    expense.paymentMode = data.paymentMode;
  }
  if (data.upiRef !== undefined) expense.upiRef = data.upiRef;
  if (data.recurring !== undefined) expense.recurring = data.recurring;

  await expense.save();
  return { expense };
};

/**
 * Delete an expense. Validates ownership.
 */
export const deleteExpense = async (userId, expenseId) => {
  validateObjectId(expenseId, 'expenseId');

  const expense = await Expense.findOneAndDelete({ _id: expenseId, userId });
  if (!expense) {
    throw new AppError('Expense not found', 404, 'NOT_FOUND');
  }

  return { message: 'Expense deleted' };
};

/**
 * Process bank statement upload.
 * Flow: Parse → AI Categorization → Return REVIEW state.
 * Does NOT save. User must confirm.
 */
export const uploadBankStatement = async (userId, file) => {
  if (!file) {
    throw new AppError('Bank statement file is required', 400, 'VALIDATION_ERROR');
  }

  // Step 1: Deterministic parsing (before AI)
  let transactions;
  try {
    const text = file.buffer.toString('utf-8');
    transactions = parseCSVTransactions(text);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Failed to parse bank statement. Ensure it is a valid CSV with date, description, and amount columns.',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Step 2: AI categorization
  let aiResult;
  try {
    const userMessage = buildExpenseCategorizationPrompt(transactions);
    aiResult = await invokeAIJSON(EXPENSE_CATEGORIZATION_SYSTEM, userMessage);
  } catch (error) {
    // AI failure — return raw transactions without categories (manual fallback)
    return {
      status: 'review',
      aiAvailable: false,
      transactions: transactions.map((tx) => ({
        date: tx.date,
        amount: tx.amount,
        merchant: null,
        description: tx.description,
        suggestedCategory: 'other',
        confidence: 0,
      })),
      message: 'AI categorization unavailable. Please categorize manually.',
    };
  }

  // Step 3: Return review state (NOT saved)
  return {
    status: 'review',
    aiAvailable: true,
    transactions: aiResult.transactions || transactions.map((tx) => ({
      date: tx.date,
      amount: tx.amount,
      merchant: null,
      description: tx.description,
      suggestedCategory: 'other',
      confidence: 0,
    })),
  };
};

/**
 * Confirm bank statement transactions after user review.
 * Saves confirmed transactions as expenses.
 */
export const confirmBankStatement = async (userId, data) => {
  const { confirmedTransactions } = data;

  if (!confirmedTransactions || !Array.isArray(confirmedTransactions) || confirmedTransactions.length === 0) {
    throw new AppError('No transactions to confirm', 400, 'VALIDATION_ERROR');
  }

  const expenses = [];
  for (const tx of confirmedTransactions) {
    validateRequired(tx, ['amount', 'description', 'category', 'date']);
    validateEnum(tx.category, VALID_CATEGORIES, 'category');

    const expense = await Expense.create({
      userId,
      amount: Number(tx.amount),
      date: new Date(tx.date),
      merchant: tx.merchant || null,
      description: tx.description,
      category: tx.category,
      paymentMode: 'bank_transfer',
      upiRef: tx.upiRef || null,
      recurring: false,
      source: 'bank_statement',
      aiCategorized: true,
    });
    expenses.push(expense);
  }

  // Check budget thresholds after saving batch
  const thresholdAlerts = await checkBudgetsForUser(userId);

  return { expenses, thresholdAlerts };
};

/**
 * Get/create/update budgets.
 */
export const getBudgets = async (userId, filters = {}) => {
  const month = filters.month || getCurrentMonth();
  const budgets = await ExpenseBudget.find({ userId, month }).lean();
  const thresholdAlerts = await checkBudgetsForUser(userId, month);
  return { budgets, thresholdAlerts };
};

export const createBudget = async (userId, data) => {
  validateRequired(data, ['category', 'limit', 'month']);
  validateEnum(data.category, VALID_CATEGORIES, 'category');

  if (Number(data.limit) < 1) {
    throw new AppError('Budget limit must be at least 1', 400, 'VALIDATION_ERROR');
  }

  // Check for existing
  const existing = await ExpenseBudget.findOne({
    userId,
    category: data.category,
    month: data.month,
  });

  if (existing) {
    throw new AppError('Budget already exists for this category and month', 400, 'VALIDATION_ERROR');
  }

  const budget = await ExpenseBudget.create({
    userId,
    category: data.category,
    limit: Number(data.limit),
    month: data.month,
  });

  return { budget };
};

export const updateBudget = async (userId, budgetId, data) => {
  validateObjectId(budgetId, 'budgetId');

  const budget = await ExpenseBudget.findOne({ _id: budgetId, userId });
  if (!budget) {
    throw new AppError('Budget not found', 404, 'NOT_FOUND');
  }

  if (data.limit !== undefined) {
    if (Number(data.limit) < 1) {
      throw new AppError('Budget limit must be at least 1', 400, 'VALIDATION_ERROR');
    }
    budget.limit = Number(data.limit);
  }

  await budget.save();
  return { budget };
};

/**
 * Get monthly spending summary with trends and budget status.
 */
export const getSummary = async (userId, filters = {}) => {
  const month = filters.month || getCurrentMonth();
  const { start, end } = getMonthRange(month);

  const [expenses, budgets] = await Promise.all([
    Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
    ExpenseBudget.find({ userId, month }).lean(),
  ]);

  const summary = calculateSpendingSummary(expenses);
  const thresholdAlerts = checkBudgetThresholds(budgets, expenses);

  // Calculate total budget
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const remaining = totalBudget > 0 ? totalBudget - summary.total : 0;
  const percentageUsed = totalBudget > 0 ? Math.round((summary.total / totalBudget) * 100) : 0;

  // Previous month trend
  const [prevYear, prevMonth] = month.split('-').map(Number);
  const prevMonthStr = prevMonth === 1
    ? `${prevYear - 1}-12`
    : `${prevYear}-${String(prevMonth - 1).padStart(2, '0')}`;
  const prevRange = getMonthRange(prevMonthStr);
  const prevExpenses = await Expense.find({
    userId,
    date: { $gte: prevRange.start, $lte: prevRange.end },
  }).lean();
  const prevTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
  const trend = calculateSpendingTrend(summary.total, prevTotal);

  // Budget warning flags
  const budgetWarning = thresholdAlerts.some((a) => a.level === 'warning');
  const budgetCritical = thresholdAlerts.some((a) => a.level === 'exceeded');

  return {
    month,
    monthlyBudget: totalBudget,
    spent: summary.total,
    remaining: Math.max(0, remaining),
    percentageUsed,
    categoryBreakdown: Object.entries(summary.byCategory).map(([cat, amount]) => ({
      category: cat,
      amount,
    })),
    trend,
    budgetWarning,
    budgetCritical,
    thresholdAlerts,
  };
};

/**
 * Internal: check budget thresholds for a user in a given month.
 */
const checkBudgetsForUser = async (userId, month) => {
  const m = month || getCurrentMonth();
  const { start, end } = getMonthRange(m);

  const [budgets, expenses] = await Promise.all([
    ExpenseBudget.find({ userId, month: m }).lean(),
    Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
  ]);

  return checkBudgetThresholds(budgets, expenses);
};
