import asyncHandler from '../utils/async-handler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import * as expenseService from '../services/expense.service.js';

export const getExpenses = asyncHandler(async (req, res) => {
  const data = await expenseService.getExpenses(req.user._id, req.query);
  sendSuccess(res, data);
});

export const createManualExpense = asyncHandler(async (req, res) => {
  const data = await expenseService.createManualExpense(req.user._id, req.body);
  sendCreated(res, data);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const data = await expenseService.updateExpense(req.user._id, req.params.id, req.body);
  sendSuccess(res, data);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const data = await expenseService.deleteExpense(req.user._id, req.params.id);
  sendSuccess(res, data);
});

export const uploadBankStatement = asyncHandler(async (req, res) => {
  const data = await expenseService.uploadBankStatement(req.user._id, req.file);
  sendSuccess(res, data);
});

export const confirmBankStatement = asyncHandler(async (req, res) => {
  const data = await expenseService.confirmBankStatement(req.user._id, req.body);
  sendCreated(res, data);
});

export const getBudgets = asyncHandler(async (req, res) => {
  const data = await expenseService.getBudgets(req.user._id, req.query);
  sendSuccess(res, data);
});

export const createBudget = asyncHandler(async (req, res) => {
  const data = await expenseService.createBudget(req.user._id, req.body);
  sendCreated(res, data);
});

export const updateBudget = asyncHandler(async (req, res) => {
  const data = await expenseService.updateBudget(req.user._id, req.params.id, req.body);
  sendSuccess(res, data);
});

export const getSummary = asyncHandler(async (req, res) => {
  const data = await expenseService.getSummary(req.user._id, req.query);
  sendSuccess(res, data);
});
