import { Router } from 'express';
import { getItems, getSummary, addItem, addBulkItems, markPurchased, deleteItem } from '../controllers/shopping.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getItems);
router.get('/summary', getSummary);
router.post('/', addItem);
router.post('/bulk', addBulkItems);
router.put('/:id/purchased', markPurchased);
router.delete('/:id', deleteItem);

export default router;
