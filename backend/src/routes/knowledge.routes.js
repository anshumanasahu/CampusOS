import { Router } from 'express';
import {
  getResources,
  getResourceById,
  uploadResource,
  createProfessorReview,
  updateResource,
  deleteResource,
  getPoints,
} from '../controllers/knowledge.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Resource listing and detail
router.get('/', getResources);
router.get('/points', getPoints);
router.get('/:id', getResourceById);

// Create resources
router.post('/upload', uploadResource);
router.post('/professor-review', createProfessorReview);

// Update and delete (owner only)
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

export default router;
