import { Router } from 'express';
import { sendChatMessage, getHistory, clearHistory } from '../controllers/chatbot.controller.js';
import authMiddleware from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.use(authMiddleware);

router.post('/message', aiLimiter, sendChatMessage);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export default router;
