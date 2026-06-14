import { Router } from 'express';
import {
  getNotifications,
  dismissNotification,
  dismissAll,
  deleteNotification,
  clearViewed,
} from '../controllers/notification.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// List notifications
router.get('/', getNotifications);

// Dismiss (mark as read)
router.put('/dismiss-all', dismissAll);
router.put('/:id/dismiss', dismissNotification);

// Delete
router.delete('/clear-viewed', clearViewed);
router.delete('/:id', deleteNotification);

export default router;
