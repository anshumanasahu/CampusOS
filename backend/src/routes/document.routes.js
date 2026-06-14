import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  confirmDocument,
  rejectDocument,
  createManualDocument,
  deleteDocument,
} from '../controllers/document.controller.js';
import authMiddleware from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rate-limiter.js';
import upload from '../middleware/file-upload.js';

const router = Router();

router.use(authMiddleware);

// Document listing
router.get('/', getDocuments);
router.get('/:id', getDocumentById);

// Upload with AI extraction (rate limited)
router.post('/upload', aiLimiter, upload.single('file'), uploadDocument);

// Review actions
router.post('/:id/confirm', confirmDocument);
router.post('/:id/reject', rejectDocument);

// Manual fallback entry
router.post('/manual', createManualDocument);

// Delete
router.delete('/:id', deleteDocument);

export default router;
