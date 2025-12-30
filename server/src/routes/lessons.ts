import { Router } from 'express';
import * as lessonController from '../controllers/lessonController.js';

const router = Router();

// GET /api/lessons - List lessons (optional ?language=es filter)
router.get('/', lessonController.getLessons);

// GET /api/lessons/:id - Get lesson details
router.get('/:id', lessonController.getLesson);

// GET /api/lessons/:id/sentences - Get all sentences for a lesson
router.get('/:id/sentences', lessonController.getLessonSentences);

// GET /api/lessons/:id/full - Get lesson with all sentences
router.get('/:id/full', lessonController.getLessonFull);

export default router;
