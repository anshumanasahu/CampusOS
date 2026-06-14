import { Router } from 'express';
import {
  getExpenses,
  createManualExpense,
  updateExpense,
  deleteExpense,
  uploadBankStatement,
  confirmBankStatement,
  getBudgets,
  createBudget,
  updateBudget,
  getSummary,
} from '../controllers/expense.controller.js';
import authMiddleware from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rate-limiter.js';
import upload from '../middleware/file-upload.js';

const router = Router();

router.use(authMiddleware);

// Expenses CRUD
router.get('/', getExpenses);
router.post('/', createManualExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

// Bank statement upload + AI categorization
router.post('/bank-statement', aiLimiter, upload.single('file'), uploadBankStatement);
router.post('/bank-statement/confirm', confirmBankStatement);

// Budgets
router.get('/budget', getBudgets);
router.post('/budget', createBudget);
router.put('/budget/:id', updateBudget);

// Summary
router.get('/summary', getSummary);

export default router;
