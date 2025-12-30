import { Router } from 'express';
import * as lessonController from '../controllers/lessonController.js';

const router = Router();

// GET /api/languages - List all active languages
router.get('/', lessonController.getLanguages);

// GET /api/languages/:code - Get language details
router.get('/:code', lessonController.getLanguage);

// GET /api/languages/:code/lessons - Get lessons for a language
router.get('/:code/lessons', lessonController.getLanguageLessons);

export default router;
