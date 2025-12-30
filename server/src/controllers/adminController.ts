import { Request, Response, NextFunction } from 'express';
import {
  getDashboardStats,
  getAllLessons,
  updateLesson,
  searchUsers,
  getUserById,
  updateUserRole,
  getContentUploads,
  createContentUpload,
  updateContentUploadStatus,
  importSentences,
  CSVSentence,
} from '../services/adminService.js';
import { createError } from '../middleware/errorHandler.js';

// ============================================
// DASHBOARD
// ============================================

export async function getStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

// ============================================
// LESSONS
// ============================================

export async function getLessons(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { language } = req.query;
    const lessons = await getAllLessons(language as string | undefined);
    res.json({ success: true, data: lessons });
  } catch (error) {
    next(error);
  }
}

export async function updateLessonDetails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      estimatedMinutes,
      isActive,
      isLocked,
      xpReward,
      shortAudioKey,
      longAudioKey,
    } = req.body;

    const updated = await updateLesson(id, {
      title,
      description,
      estimatedMinutes,
      isActive,
      isLocked,
      xpReward,
      shortAudioKey,
      longAudioKey,
    });

    if (!updated) {
      next(createError(404, 'NOT_FOUND', 'Lesson not found'));
      return;
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

// ============================================
// USERS
// ============================================

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { q, limit = '50', offset = '0' } = req.query;
    const result = await searchUsers(
      q as string | undefined,
      parseInt(limit as string, 10),
      parseInt(offset as string, 10)
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      next(createError(404, 'NOT_FOUND', 'User not found'));
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function setUserRole(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'user' && role !== 'admin') {
      next(createError(400, 'INVALID_ROLE', 'Role must be "user" or "admin"'));
      return;
    }

    // Prevent demoting self
    if (req.user?.id === id && role === 'user') {
      next(createError(400, 'INVALID_OPERATION', 'Cannot demote yourself'));
      return;
    }

    await updateUserRole(id, role);
    res.json({ success: true, message: 'Role updated' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('last admin')) {
        next(createError(400, 'LAST_ADMIN', error.message));
        return;
      }
      if (error.message.includes('Maximum')) {
        next(createError(400, 'MAX_ADMINS', error.message));
        return;
      }
    }
    next(error);
  }
}

// ============================================
// CONTENT UPLOADS
// ============================================

export async function getUploads(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { limit = '50' } = req.query;
    const uploads = await getContentUploads(parseInt(limit as string, 10));
    res.json({ success: true, data: uploads });
  } catch (error) {
    next(error);
  }
}

export async function createUpload(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { fileName, fileType, storageKey, fileSizeBytes } = req.body;

    if (!fileName || !fileType || !storageKey || !fileSizeBytes) {
      next(createError(400, 'MISSING_FIELDS', 'Missing required fields'));
      return;
    }

    const upload = await createContentUpload({
      uploadedBy: req.user!.id,
      fileName,
      fileType,
      storageKey,
      fileSizeBytes,
    });

    res.status(201).json({ success: true, data: upload });
  } catch (error) {
    next(error);
  }
}

export async function updateUploadStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    await updateContentUploadStatus(id, status, notes);
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
}

// ============================================
// SENTENCE IMPORT
// ============================================

export async function importLessonSentences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lessonId } = req.params;
    const { sentences } = req.body as { sentences: CSVSentence[] };

    if (!Array.isArray(sentences) || sentences.length === 0) {
      next(createError(400, 'INVALID_DATA', 'Sentences array required'));
      return;
    }

    // Validate sentences
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      if (!s.english || !s.target) {
        next(
          createError(
            400,
            'INVALID_SENTENCE',
            `Sentence ${i + 1} missing english or target text`
          )
        );
        return;
      }
    }

    const count = await importSentences(lessonId, sentences);
    res.json({ success: true, data: { importedCount: count } });
  } catch (error) {
    next(error);
  }
}
