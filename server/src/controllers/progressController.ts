import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progressService.js';
import * as xpService from '../services/xpService.js';
import * as streakService from '../services/streakService.js';

// GET /api/progress
export async function getUserProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const progress = await progressService.getUserProgress(userId);
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/progress/stats
export async function getUserStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const stats = await progressService.getUserStats(userId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/progress/lessons/:id
export async function getLessonProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;
    const progress = await progressService.getLessonProgress(userId, id);
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/progress/lessons/:id
export async function updateLessonProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;
    const data = req.body;

    const progress = await progressService.updateLessonProgress(userId, id, data);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/progress/lessons/:id/tasks/:taskNum
export async function updateTaskProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const { id, taskNum } = req.params;
    const data = req.body;

    const result = await progressService.updateTaskProgress(
      userId,
      id,
      parseInt(taskNum, 10),
      data
    );

    // Award XP if earned
    if (result.xpAwarded > 0) {
      const source = result.lessonBonusAwarded ? 'lesson_complete' : 'task_complete';
      await xpService.awardXP(userId, result.xpAwarded, source, id);
    }

    // Update streak on task completion
    if (data.isCompleted) {
      await streakService.updateStreak(userId);
    }

    res.json({
      success: true,
      data: {
        task: result.task,
        xpAwarded: result.xpAwarded,
        lessonBonusAwarded: result.lessonBonusAwarded,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/progress/sync
export async function syncProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_DATA', message: 'Updates must be an array' },
      });
      return;
    }

    const results = await progressService.syncOfflineProgress(userId, updates);

    // Update streak for any completed tasks
    const hasCompletedTasks = updates.some(
      (u: any) => u.taskNumber && u.data?.isCompleted
    );
    if (hasCompletedTasks) {
      await streakService.updateStreak(userId);
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}
