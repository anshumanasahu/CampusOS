import { Router } from 'express';
import {
  sendChatMessage,
  getHistory,
  clearHistory,
  listThreads,
  createThread,
  renameThread,
  deleteThread,
} from '../controllers/chatbot.controller.js';
import authMiddleware from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.use(authMiddleware);

// ═══ Existing endpoints (backward compatible) ═══
router.post('/message', aiLimiter, sendChatMessage);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

// ═══ Session management (new) ═══
router.get('/threads', listThreads);
router.post('/threads', createThread);
router.put('/threads/:id', renameThread);
router.delete('/threads/:id', deleteThread);

export default router;
