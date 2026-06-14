import { Router } from 'express';
import { googleLogin, demoLogin, getMe, logout } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.js';
import { authLimiter } from '../middleware/rate-limiter.js';

const router = Router();

// Public routes
router.post('/google', authLimiter, googleLogin);
router.post('/demo', authLimiter, demoLogin);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

export default router;
