import { Router } from 'express';
import * as gamificationController from '../controllers/gamificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// XP routes (require auth)
router.get('/xp', authenticate, gamificationController.getUserXP);
router.get('/xp/history', authenticate, gamificationController.getXPHistory);

// Streak routes (require auth)
router.get('/streak', authenticate, gamificationController.getStreak);

// Achievement routes (require auth)
router.get('/achievements', authenticate, gamificationController.getAchievements);
router.get('/achievements/definitions', gamificationController.getAchievementDefinitions);
router.get('/achievements/progress', authenticate, gamificationController.getAchievementProgress);
router.post('/achievements/check', authenticate, gamificationController.checkAchievements);

// Leaderboard routes (optional auth for user rank)
router.get('/leaderboard', gamificationController.getGlobalLeaderboard);
router.get('/leaderboard/:language', gamificationController.getLanguageLeaderboard);

// Combined stats (require auth)
router.get('/stats', authenticate, gamificationController.getStats);

export default router;
