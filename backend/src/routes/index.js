import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import attendanceRoutes from './attendance.routes.js';
import expenseRoutes from './expense.routes.js';
import documentRoutes from './document.routes.js';
import chatbotRoutes from './chatbot.routes.js';
import knowledgeRoutes from './knowledge.routes.js';
import burnoutRoutes from './burnout.routes.js';
import notificationRoutes from './notification.routes.js';
import profileRoutes from './profile.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/expenses', expenseRoutes);
router.use('/documents', documentRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/burnout', burnoutRoutes);
router.use('/notifications', notificationRoutes);
router.use('/profile', profileRoutes);

export default router;
