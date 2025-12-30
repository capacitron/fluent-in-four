import { eq, desc, sql, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users, userLanguages, languages } from '../db/schema.js';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
}

// Get global leaderboard
export async function getGlobalLeaderboard(
  limit = 10,
  offset = 0
): Promise<LeaderboardEntry[]> {
  const result = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      totalXp: users.totalXp,
      level: users.level,
    })
    .from(users)
    .orderBy(desc(users.totalXp))
    .limit(limit)
    .offset(offset);

  return result.map((row, index) => ({
    rank: offset + index + 1,
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    totalXp: row.totalXp,
    level: row.level,
  }));
}

// Get language-specific leaderboard
export async function getLanguageLeaderboard(
  languageCode: string,
  limit = 10,
  offset = 0
): Promise<LeaderboardEntry[]> {
  // First get the language
  const language = await db.query.languages.findFirst({
    where: eq(languages.code, languageCode),
  });

  if (!language) {
    return [];
  }

  // Get users who are learning this language, ordered by XP
  const result = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      totalXp: users.totalXp,
      level: users.level,
    })
    .from(users)
    .innerJoin(userLanguages, eq(users.id, userLanguages.userId))
    .where(eq(userLanguages.languageId, language.id))
    .orderBy(desc(users.totalXp))
    .limit(limit)
    .offset(offset);

  return result.map((row, index) => ({
    rank: offset + index + 1,
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    totalXp: row.totalXp,
    level: row.level,
  }));
}

// Get user's rank
export async function getUserRank(userId: string): Promise<{
  globalRank: number;
  totalUsers: number;
}> {
  // Get user's XP
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { globalRank: 0, totalUsers: 0 };
  }

  // Count users with more XP
  const [rankResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .where(sql`${users.totalXp} > ${user.totalXp}`);

  const [totalResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(users);

  return {
    globalRank: (rankResult?.count || 0) + 1,
    totalUsers: totalResult?.count || 0,
  };
}

// Get user's language rank
export async function getUserLanguageRank(
  userId: string,
  languageCode: string
): Promise<{
  rank: number;
  totalUsers: number;
}> {
  const language = await db.query.languages.findFirst({
    where: eq(languages.code, languageCode),
  });

  if (!language) {
    return { rank: 0, totalUsers: 0 };
  }

  // Check if user is learning this language
  const userLang = await db.query.userLanguages.findFirst({
    where: and(
      eq(userLanguages.userId, userId),
      eq(userLanguages.languageId, language.id)
    ),
  });

  if (!userLang) {
    return { rank: 0, totalUsers: 0 };
  }

  // Get user's XP
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { rank: 0, totalUsers: 0 };
  }

  // Count users in this language with more XP
  const [rankResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .innerJoin(userLanguages, eq(users.id, userLanguages.userId))
    .where(
      and(
        eq(userLanguages.languageId, language.id),
        sql`${users.totalXp} > ${user.totalXp}`
      )
    );

  const [totalResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(userLanguages)
    .where(eq(userLanguages.languageId, language.id));

  return {
    rank: (rankResult?.count || 0) + 1,
    totalUsers: totalResult?.count || 0,
  };
}
