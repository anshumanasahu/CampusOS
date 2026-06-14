import { Router } from 'express';
import { getRecommendation, getHistory, getPlaylists } from '../controllers/focus.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/recommendation', getRecommendation);
router.get('/history', getHistory);
router.get('/playlists', getPlaylists);

export default router;
