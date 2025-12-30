import { Router } from 'express';
import * as progressController from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/progress - Get all user progress
router.get('/', progressController.getUserProgress);

// GET /api/progress/stats - Get user stats summary
router.get('/stats', progressController.getUserStats);

// GET /api/progress/lessons/:id - Get lesson progress
router.get('/lessons/:id', progressController.getLessonProgress);

// POST /api/progress/lessons/:id - Update lesson progress
router.post('/lessons/:id', progressController.updateLessonProgress);

// POST /api/progress/lessons/:id/tasks/:taskNum - Update task progress
router.post('/lessons/:id/tasks/:taskNum', progressController.updateTaskProgress);

// POST /api/progress/sync - Batch sync offline progress
router.post('/sync', progressController.syncProgress);

export default router;
