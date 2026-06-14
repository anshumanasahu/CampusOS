import { Router } from 'express';
import {
  getAttendance,
  createSubject,
  updateSubject,
  deleteSubject,
  markAttendance,
  markDay,
  getReport,
} from '../controllers/attendance.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Core attendance data
router.get('/', getAttendance);

// Subject management
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Marking attendance
router.post('/mark', markAttendance);
router.post('/mark-day', markDay);

// Report
router.get('/report', getReport);

export default router;
