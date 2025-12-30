import { Request, Response, NextFunction } from 'express';
import * as lessonService from '../services/lessonService.js';

// GET /api/languages
export async function getLanguages(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const languages = await lessonService.getLanguages();
    res.json({
      success: true,
      data: languages,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/languages/:code
export async function getLanguage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { code } = req.params;
    const language = await lessonService.getLanguageByCode(code);
    res.json({
      success: true,
      data: language,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/languages/:code/lessons
export async function getLanguageLessons(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { code } = req.params;
    const lessons = await lessonService.getLessonsByLanguageCode(code);
    res.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/lessons
export async function getLessons(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { language } = req.query;

    if (language && typeof language === 'string') {
      const lessons = await lessonService.getLessonsByLanguageCode(language);
      res.json({
        success: true,
        data: lessons,
      });
    } else {
      // Return empty if no language specified (or could return all)
      res.json({
        success: true,
        data: [],
      });
    }
  } catch (error) {
    next(error);
  }
}

// GET /api/lessons/:id
export async function getLesson(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLesson(id);
    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/lessons/:id/sentences
export async function getLessonSentences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const sentences = await lessonService.getSentences(id);
    res.json({
      success: true,
      data: sentences,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/lessons/:id/full (lesson with sentences)
export async function getLessonFull(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLessonWithSentences(id);
    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
}
