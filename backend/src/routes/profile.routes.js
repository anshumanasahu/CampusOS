import { Router } from 'express';
import { getProfile, updatePreferences, resetDemo } from '../controllers/profile.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updatePreferences);
router.post('/reset-demo', resetDemo);

export default router;
