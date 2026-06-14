import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getDashboard);

export default router;
