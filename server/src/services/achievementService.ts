import { eq, and, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  achievementDefinitions,
  userAchievements,
  lessonProgress,
  userLanguages,
  streaks,
  users,
} from '../db/schema.js';
import * as xpService from './xpService.js';

// Get all achievement definitions
export async function getAchievementDefinitions() {
  return db.query.achievementDefinitions.findMany({
    orderBy: (achievements, { asc }) => [asc(achievements.displayOrder)],
  });
}

// Get user's achievements
export async function getUserAchievements(userId: string) {
  const [definitions, userAchievs] = await Promise.all([
    getAchievementDefinitions(),
    db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, userId),
    }),
  ]);

  const unlockedMap = new Map(
    userAchievs.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  return definitions.map((def) => ({
    ...def,
    isUnlocked: unlockedMap.has(def.id),
    unlockedAt: unlockedMap.get(def.id) || null,
  }));
}

// Unlock an achievement
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<{ achievement: any; xpAwarded: number } | null> {
  // Check if already unlocked
  const existing = await db.query.userAchievements.findFirst({
    where: and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ),
  });

  if (existing) {
    return null;
  }

  // Get achievement definition
  const achievement = await db.query.achievementDefinitions.findFirst({
    where: eq(achievementDefinitions.id, achievementId),
  });

  if (!achievement) {
    return null;
  }

  // Create unlock record
  await db.insert(userAchievements).values({
    userId,
    achievementId,
  });

  // Award XP for achievement
  if (achievement.xpReward > 0) {
    await xpService.awardXP(userId, achievement.xpReward, 'achievement', achievementId);
  }

  return {
    achievement,
    xpAwarded: achievement.xpReward,
  };
}

// Check and unlock achievements based on criteria
export async function checkAchievements(userId: string): Promise<Array<{ achievement: any; xpAwarded: number }>> {
  const [
    userAchievs,
    lessonProgressData,
    languagesData,
    streakData,
    userData,
  ] = await Promise.all([
    db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, userId),
    }),
    db.query.lessonProgress.findMany({
      where: eq(lessonProgress.userId, userId),
    }),
    db.query.userLanguages.findMany({
      where: eq(userLanguages.userId, userId),
    }),
    db.query.streaks.findFirst({
      where: eq(streaks.userId, userId),
    }),
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
  ]);

  const unlockedIds = new Set(userAchievs.map((ua) => ua.achievementId));
  const completedLessons = lessonProgressData.filter((l) => l.completedAt !== null).length;
  const languagesStarted = languagesData.length;
  const currentStreak = streakData?.currentStreak || 0;
  const totalXp = userData?.totalXp || 0;

  const newlyUnlocked: Array<{ achievement: any; xpAwarded: number }> = [];

  // Get all achievement definitions
  const definitions = await getAchievementDefinitions();

  for (const def of definitions) {
    if (unlockedIds.has(def.id)) continue;

    let shouldUnlock = false;

    // Check criteria based on code
    switch (def.code) {
      case 'first_lesson':
        shouldUnlock = completedLessons >= 1;
        break;
      case 'first_language':
        shouldUnlock = languagesStarted >= 1;
        break;
      case 'lessons_5':
        shouldUnlock = completedLessons >= 5;
        break;
      case 'lessons_10':
        shouldUnlock = completedLessons >= 10;
        break;
      case 'lessons_25':
        shouldUnlock = completedLessons >= 25;
        break;
      case 'two_languages':
        shouldUnlock = languagesStarted >= 2;
        break;
      case 'polyglot':
        shouldUnlock = languagesStarted >= 4;
        break;
      case 'streak_7':
        shouldUnlock = currentStreak >= 7;
        break;
      case 'streak_30':
        shouldUnlock = currentStreak >= 30;
        break;
      case 'streak_100':
        shouldUnlock = currentStreak >= 100;
        break;
      case 'xp_1000':
        shouldUnlock = totalXp >= 1000;
        break;
      case 'xp_5000':
        shouldUnlock = totalXp >= 5000;
        break;
      case 'xp_10000':
        shouldUnlock = totalXp >= 10000;
        break;
    }

    if (shouldUnlock) {
      const result = await unlockAchievement(userId, def.id);
      if (result) {
        newlyUnlocked.push(result);
      }
    }
  }

  return newlyUnlocked;
}

// Get achievement progress (for locked achievements)
export async function getAchievementProgress(userId: string) {
  const [
    lessonProgressData,
    languagesData,
    streakData,
    userData,
  ] = await Promise.all([
    db.query.lessonProgress.findMany({
      where: eq(lessonProgress.userId, userId),
    }),
    db.query.userLanguages.findMany({
      where: eq(userLanguages.userId, userId),
    }),
    db.query.streaks.findFirst({
      where: eq(streaks.userId, userId),
    }),
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
  ]);

  return {
    completedLessons: lessonProgressData.filter((l) => l.completedAt !== null).length,
    languagesStarted: languagesData.length,
    currentStreak: streakData?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || 0,
    totalXp: userData?.totalXp || 0,
  };
}
