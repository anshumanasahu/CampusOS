import { Router } from 'express';
import { getLatest, getHistory, checkin } from '../controllers/burnout.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getLatest);
router.get('/history', getHistory);
router.post('/checkin', checkin);

export default router;
