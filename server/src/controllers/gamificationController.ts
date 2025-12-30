import { Request, Response, NextFunction } from 'express';
import * as xpService from '../services/xpService.js';
import * as streakService from '../services/streakService.js';
import * as achievementService from '../services/achievementService.js';
import * as leaderboardService from '../services/leaderboardService.js';

// GET /api/gamification/xp
export async function getUserXP(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const xp = await xpService.getUserXP(userId);
    res.json({
      success: true,
      data: xp,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/gamification/xp/history
export async function getXPHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await xpService.getXPHistory(userId, limit);
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/gamification/streak
export async function getStreak(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const streak = await streakService.getStreak(userId);
    res.json({
      success: true,
      data: streak,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/gamification/achievements
export async function getAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const achievements = await achievementService.getUserAchievements(userId);
    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/gamification/achievements/definitions
export async function getAchievementDefinitions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const definitions = await achievementService.getAchievementDefinitions();
    res.json({
      success: true,
      data: definitions,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/gamification/achievements/progress
export async function getAchievementProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const progress = await achievementService.getAchievementProgress(userId);
    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/gamification/achievements/check
export async function checkAchievements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const unlocked = await achievementService.checkAchievements(userId);
    res.json({
      success: true,
      data: {
        newlyUnlocked: unlocked,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/gamification/leaderboard
export async function getGlobalLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const leaderboard = await leaderboardService.getGlobalLeaderboard(limit, offset);

    // Get current user's rank if authenticated
    let userRank = null;
    if (req.user) {
      userRank = await leaderboardService.getUserRank(req.user.id);
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        userRank,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/gamification/leaderboard/:language
export async function getLanguageLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { language } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const leaderboard = await leaderboardService.getLanguageLeaderboard(
      language,
      limit,
      offset
    );

    // Get current user's rank if authenticated
    let userRank = null;
    if (req.user) {
      userRank = await leaderboardService.getUserLanguageRank(req.user.id, language);
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        userRank,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/gamification/stats
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const [xp, streak, achievementProgress] = await Promise.all([
      xpService.getUserXP(userId),
      streakService.getStreak(userId),
      achievementService.getAchievementProgress(userId),
    ]);

    res.json({
      success: true,
      data: {
        xp,
        streak,
        progress: achievementProgress,
      },
    });
  } catch (error) {
    next(error);
  }
}
