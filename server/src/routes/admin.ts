import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/stats', adminController.getStats);

// Lessons
router.get('/lessons', adminController.getLessons);
router.patch('/lessons/:id', adminController.updateLessonDetails);
router.post('/lessons/:lessonId/sentences', adminController.importLessonSentences);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/role', adminController.setUserRole);

// Content uploads
router.get('/uploads', adminController.getUploads);
router.post('/uploads', adminController.createUpload);
router.patch('/uploads/:id/status', adminController.updateUploadStatus);

export default router;
