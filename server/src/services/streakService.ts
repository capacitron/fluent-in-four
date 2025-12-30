import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { streaks } from '../db/schema.js';

// Get streak for a user
export async function getStreak(userId: string) {
  const streak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakAtRisk: true,
      hasPracticedToday: false,
    };
  }

  const today = getUTCDateString(new Date());
  const lastActivity = streak.lastActivityDate
    ? getUTCDateString(new Date(streak.lastActivityDate))
    : null;

  const hasPracticedToday = lastActivity === today;
  const streakAtRisk = !hasPracticedToday && isLateInDay();

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActivityDate: streak.lastActivityDate,
    streakAtRisk,
    hasPracticedToday,
  };
}

// Update streak on activity
export async function updateStreak(userId: string) {
  const existing = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  const today = getUTCDateString(new Date());

  if (!existing) {
    // First activity ever
    await db.insert(streaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: new Date(),
    });

    return {
      currentStreak: 1,
      longestStreak: 1,
      streakIncreased: true,
      isNewStreak: true,
    };
  }

  const lastActivity = existing.lastActivityDate
    ? getUTCDateString(new Date(existing.lastActivityDate))
    : null;

  // Already practiced today - no change
  if (lastActivity === today) {
    return {
      currentStreak: existing.currentStreak,
      longestStreak: existing.longestStreak,
      streakIncreased: false,
      isNewStreak: false,
    };
  }

  const yesterday = getUTCDateString(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  let newStreak: number;
  let streakIncreased = false;
  let isNewStreak = false;

  if (lastActivity === yesterday) {
    // Continuing streak
    newStreak = existing.currentStreak + 1;
    streakIncreased = true;
  } else {
    // Streak broken - start fresh
    newStreak = 1;
    isNewStreak = true;
  }

  const newLongest = Math.max(newStreak, existing.longestStreak);

  await db
    .update(streaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: new Date(),
    })
    .where(eq(streaks.id, existing.id));

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    streakIncreased,
    isNewStreak,
  };
}

// Helper to get UTC date string (YYYY-MM-DD)
function getUTCDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Check if it's late in the day (after 8pm local time)
function isLateInDay(): boolean {
  const hour = new Date().getHours();
  return hour >= 20;
}

// Check if streak milestone reached
export function checkStreakMilestone(currentStreak: number): number | null {
  const milestones = [7, 14, 30, 60, 100, 365];
  return milestones.includes(currentStreak) ? currentStreak : null;
}
