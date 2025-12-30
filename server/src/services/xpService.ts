import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users, xpLogs } from '../db/schema.js';
import { createError } from '../middleware/errorHandler.js';

// Level thresholds - XP needed to reach each level
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  850,    // Level 5
  1300,   // Level 6
  1850,   // Level 7
  2500,   // Level 8
  3250,   // Level 9
  4100,   // Level 10
  5050,   // Level 11
  6100,   // Level 12
  7250,   // Level 13
  8500,   // Level 14
  9850,   // Level 15
  11300,  // Level 16
  12850,  // Level 17
  14500,  // Level 18
  16250,  // Level 19
  18100,  // Level 20
];

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  2: 'Beginner',
  3: 'Apprentice',
  4: 'Student',
  5: 'Learner',
  6: 'Scholar',
  7: 'Enthusiast',
  8: 'Devotee',
  9: 'Practitioner',
  10: 'Adept',
  11: 'Proficient',
  12: 'Skilled',
  13: 'Expert',
  14: 'Master',
  15: 'Virtuoso',
  16: 'Sage',
  17: 'Luminary',
  18: 'Prodigy',
  19: 'Maestro',
  20: 'Legend',
};

// Calculate level from total XP
export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Get progress toward next level
export function getLevelProgress(totalXp: number): {
  level: number;
  title: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
} {
  const level = calculateLevel(totalXp);
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
  );

  return {
    level,
    title: LEVEL_TITLES[level] || 'Legend',
    currentXp: totalXp,
    xpForCurrentLevel: currentLevelXp,
    xpForNextLevel: nextLevelXp,
    progressPercent,
  };
}

// Award XP to user
export async function awardXP(
  userId: string,
  amount: number,
  source: string,
  sourceId?: string
): Promise<{ totalXp: number; level: number; leveledUp: boolean; previousLevel: number }> {
  // Get current user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw createError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const previousLevel = user.level;
  const newTotalXp = user.totalXp + amount;
  const newLevel = calculateLevel(newTotalXp);

  // Update user XP and level
  await db
    .update(users)
    .set({
      totalXp: newTotalXp,
      level: newLevel,
    })
    .where(eq(users.id, userId));

  // Log XP gain
  await db.insert(xpLogs).values({
    userId,
    amount,
    source,
    sourceId,
    totalAfter: newTotalXp,
  });

  return {
    totalXp: newTotalXp,
    level: newLevel,
    leveledUp: newLevel > previousLevel,
    previousLevel,
  };
}

// Get user XP info
export async function getUserXP(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw createError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return getLevelProgress(user.totalXp);
}

// Get XP history
export async function getXPHistory(userId: string, limit = 20) {
  return db.query.xpLogs.findMany({
    where: eq(xpLogs.userId, userId),
    orderBy: [desc(xpLogs.createdAt)],
    limit,
  });
}
