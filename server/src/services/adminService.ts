import { db } from '../db/index.js';
import {
  users,
  languages,
  lessons,
  sentences,
  lessonProgress,
  userLanguages,
  contentUploads,
  streaks,
} from '../db/schema.js';
import { eq, sql, and, gte, desc, count } from 'drizzle-orm';

// ============================================
// DASHBOARD STATS
// ============================================

export interface DashboardStats {
  totalUsers: number;
  activeUsers7d: number;
  activeUsers30d: number;
  lessonsCompleted: number;
  totalLanguages: number;
  totalLessons: number;
  totalSentences: number;
  languageStats: {
    code: string;
    name: string;
    usersLearning: number;
    lessonsCompleted: number;
  }[];
  recentActivity: {
    date: string;
    newUsers: number;
    lessonsCompleted: number;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total users
  const [totalUsersResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, 'user'));
  const totalUsers = totalUsersResult?.count ?? 0;

  // Active users (7d and 30d)
  const [activeUsers7dResult] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.role, 'user'),
        gte(users.lastActiveAt, sevenDaysAgo)
      )
    );
  const activeUsers7d = activeUsers7dResult?.count ?? 0;

  const [activeUsers30dResult] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.role, 'user'),
        gte(users.lastActiveAt, thirtyDaysAgo)
      )
    );
  const activeUsers30d = activeUsers30dResult?.count ?? 0;

  // Completed lessons
  const [lessonsCompletedResult] = await db
    .select({ count: count() })
    .from(lessonProgress)
    .where(eq(lessonProgress.status, 'completed'));
  const lessonsCompleted = lessonsCompletedResult?.count ?? 0;

  // Total languages, lessons, sentences
  const [languagesResult] = await db
    .select({ count: count() })
    .from(languages)
    .where(eq(languages.isActive, true));
  const totalLanguages = languagesResult?.count ?? 0;

  const [lessonsResult] = await db
    .select({ count: count() })
    .from(lessons);
  const totalLessons = lessonsResult?.count ?? 0;

  const [sentencesResult] = await db
    .select({ count: count() })
    .from(sentences);
  const totalSentences = sentencesResult?.count ?? 0;

  // Language stats
  const languageStatsRaw = await db
    .select({
      code: languages.code,
      name: languages.name,
      usersLearning: sql<number>`count(distinct ${userLanguages.userId})`.as('users_learning'),
    })
    .from(languages)
    .leftJoin(userLanguages, eq(languages.id, userLanguages.languageId))
    .where(eq(languages.isActive, true))
    .groupBy(languages.id);

  // Get lessons completed per language
  const lessonsPerLanguage = await db
    .select({
      languageCode: languages.code,
      completed: count(),
    })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(languages, eq(lessons.languageId, languages.id))
    .where(eq(lessonProgress.status, 'completed'))
    .groupBy(languages.code);

  const lessonsMap = new Map(
    lessonsPerLanguage.map((l) => [l.languageCode, l.completed])
  );

  const languageStats = languageStatsRaw.map((lang) => ({
    code: lang.code,
    name: lang.name,
    usersLearning: Number(lang.usersLearning) || 0,
    lessonsCompleted: lessonsMap.get(lang.code) || 0,
  }));

  // Recent activity (last 7 days)
  const recentActivity: DashboardStats['recentActivity'] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [newUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, date),
          sql`${users.createdAt} < ${nextDate}`
        )
      );

    const [completedResult] = await db
      .select({ count: count() })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.status, 'completed'),
          gte(lessonProgress.completedAt, date),
          sql`${lessonProgress.completedAt} < ${nextDate}`
        )
      );

    recentActivity.push({
      date: dateStr,
      newUsers: newUsersResult?.count ?? 0,
      lessonsCompleted: completedResult?.count ?? 0,
    });
  }

  return {
    totalUsers,
    activeUsers7d,
    activeUsers30d,
    lessonsCompleted,
    totalLanguages,
    totalLessons,
    totalSentences,
    languageStats,
    recentActivity,
  };
}

// ============================================
// LESSON MANAGEMENT
// ============================================

export interface LessonWithDetails {
  id: string;
  languageCode: string;
  languageName: string;
  lessonNumber: number;
  title: string;
  description: string | null;
  sentenceCount: number;
  estimatedMinutes: number | null;
  shortAudioKey: string | null;
  longAudioKey: string | null;
  isActive: boolean;
  isLocked: boolean;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAllLessons(
  languageCode?: string
): Promise<LessonWithDetails[]> {
  let query = db
    .select({
      id: lessons.id,
      languageCode: languages.code,
      languageName: languages.name,
      lessonNumber: lessons.lessonNumber,
      title: lessons.title,
      description: lessons.description,
      sentenceCount: lessons.sentenceCount,
      estimatedMinutes: lessons.estimatedMinutes,
      shortAudioKey: lessons.shortAudioKey,
      longAudioKey: lessons.longAudioKey,
      isActive: lessons.isActive,
      isLocked: lessons.isLocked,
      xpReward: lessons.xpReward,
      createdAt: lessons.createdAt,
      updatedAt: lessons.updatedAt,
    })
    .from(lessons)
    .innerJoin(languages, eq(lessons.languageId, languages.id))
    .orderBy(languages.code, lessons.lessonNumber);

  if (languageCode) {
    query = query.where(eq(languages.code, languageCode)) as typeof query;
  }

  return query;
}

export async function updateLesson(
  lessonId: string,
  data: Partial<{
    title: string;
    description: string;
    estimatedMinutes: number;
    isActive: boolean;
    isLocked: boolean;
    xpReward: number;
    shortAudioKey: string;
    longAudioKey: string;
  }>
): Promise<LessonWithDetails | null> {
  await db
    .update(lessons)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, lessonId));

  const [updated] = await db
    .select({
      id: lessons.id,
      languageCode: languages.code,
      languageName: languages.name,
      lessonNumber: lessons.lessonNumber,
      title: lessons.title,
      description: lessons.description,
      sentenceCount: lessons.sentenceCount,
      estimatedMinutes: lessons.estimatedMinutes,
      shortAudioKey: lessons.shortAudioKey,
      longAudioKey: lessons.longAudioKey,
      isActive: lessons.isActive,
      isLocked: lessons.isLocked,
      xpReward: lessons.xpReward,
      createdAt: lessons.createdAt,
      updatedAt: lessons.updatedAt,
    })
    .from(lessons)
    .innerJoin(languages, eq(lessons.languageId, languages.id))
    .where(eq(lessons.id, lessonId));

  return updated || null;
}

// ============================================
// USER MANAGEMENT
// ============================================

export interface UserDetails {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  totalXp: number;
  level: number;
  languagesLearning: number;
  lessonsCompleted: number;
  currentStreak: number;
  createdAt: Date;
  lastActiveAt: Date | null;
}

export async function searchUsers(
  query?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ users: UserDetails[]; total: number }> {
  // Get total count
  let countQuery = db.select({ count: count() }).from(users);

  if (query && query.trim()) {
    const searchPattern = `%${query.trim().toLowerCase()}%`;
    countQuery = countQuery.where(
      sql`lower(${users.email}) like ${searchPattern} OR lower(${users.displayName}) like ${searchPattern}`
    ) as typeof countQuery;
  }

  const [countResult] = await countQuery;
  const total = countResult?.count ?? 0;

  // Get users with stats
  let usersQuery = db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      role: users.role,
      totalXp: users.totalXp,
      level: users.level,
      createdAt: users.createdAt,
      lastActiveAt: users.lastActiveAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  if (query && query.trim()) {
    const searchPattern = `%${query.trim().toLowerCase()}%`;
    usersQuery = usersQuery.where(
      sql`lower(${users.email}) like ${searchPattern} OR lower(${users.displayName}) like ${searchPattern}`
    ) as typeof usersQuery;
  }

  const rawUsers = await usersQuery;

  // Get additional stats for each user
  const userDetails: UserDetails[] = await Promise.all(
    rawUsers.map(async (user) => {
      // Languages learning
      const [langCount] = await db
        .select({ count: count() })
        .from(userLanguages)
        .where(eq(userLanguages.userId, user.id));

      // Lessons completed
      const [lessonCount] = await db
        .select({ count: count() })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, user.id),
            eq(lessonProgress.status, 'completed')
          )
        );

      // Streak
      const [streak] = await db
        .select({ currentStreak: streaks.currentStreak })
        .from(streaks)
        .where(eq(streaks.userId, user.id));

      return {
        ...user,
        languagesLearning: langCount?.count ?? 0,
        lessonsCompleted: lessonCount?.count ?? 0,
        currentStreak: streak?.currentStreak ?? 0,
      };
    })
  );

  return { users: userDetails, total };
}

export async function getUserById(userId: string): Promise<UserDetails | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      role: users.role,
      totalXp: users.totalXp,
      level: users.level,
      createdAt: users.createdAt,
      lastActiveAt: users.lastActiveAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return null;

  const [langCount] = await db
    .select({ count: count() })
    .from(userLanguages)
    .where(eq(userLanguages.userId, userId));

  const [lessonCount] = await db
    .select({ count: count() })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.status, 'completed')
      )
    );

  const [streak] = await db
    .select({ currentStreak: streaks.currentStreak })
    .from(streaks)
    .where(eq(streaks.userId, userId));

  return {
    ...user,
    languagesLearning: langCount?.count ?? 0,
    lessonsCompleted: lessonCount?.count ?? 0,
    currentStreak: streak?.currentStreak ?? 0,
  };
}

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<boolean> {
  // Check that we're not removing the last admin
  if (role === 'user') {
    const [adminCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'));

    if ((adminCount?.count ?? 0) <= 1) {
      throw new Error('Cannot remove the last admin');
    }
  }

  // Check max 2 admins
  if (role === 'admin') {
    const [adminCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'));

    if ((adminCount?.count ?? 0) >= 2) {
      throw new Error('Maximum 2 admins allowed');
    }
  }

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return true;
}

// ============================================
// CONTENT UPLOAD
// ============================================

export interface ContentUploadRecord {
  id: string;
  uploadedBy: string;
  fileName: string;
  fileType: string;
  storageKey: string;
  fileSizeBytes: number;
  status: string;
  processingNotes: string | null;
  createdAt: Date;
}

export async function getContentUploads(
  limit: number = 50
): Promise<ContentUploadRecord[]> {
  return db
    .select()
    .from(contentUploads)
    .orderBy(desc(contentUploads.createdAt))
    .limit(limit);
}

export async function createContentUpload(
  data: {
    uploadedBy: string;
    fileName: string;
    fileType: string;
    storageKey: string;
    fileSizeBytes: number;
  }
): Promise<ContentUploadRecord> {
  const [upload] = await db
    .insert(contentUploads)
    .values({
      ...data,
      status: 'pending',
    })
    .returning();

  return upload;
}

export async function updateContentUploadStatus(
  uploadId: string,
  status: string,
  notes?: string
): Promise<void> {
  await db
    .update(contentUploads)
    .set({
      status,
      processingNotes: notes,
    })
    .where(eq(contentUploads.id, uploadId));
}

// ============================================
// CSV IMPORT
// ============================================

export interface CSVSentence {
  english: string;
  target: string;
  audioStartMs?: number;
  audioEndMs?: number;
  pronunciation?: string;
  notes?: string;
}

export async function importSentences(
  lessonId: string,
  sentenceData: CSVSentence[]
): Promise<number> {
  // Delete existing sentences for this lesson
  await db.delete(sentences).where(eq(sentences.lessonId, lessonId));

  // Insert new sentences
  const toInsert = sentenceData.map((s, index) => ({
    lessonId,
    orderIndex: index,
    english: s.english,
    target: s.target,
    audioStartMs: s.audioStartMs,
    audioEndMs: s.audioEndMs,
    pronunciation: s.pronunciation,
    notes: s.notes,
  }));

  if (toInsert.length > 0) {
    await db.insert(sentences).values(toInsert);
  }

  // Update lesson sentence count
  await db
    .update(lessons)
    .set({
      sentenceCount: toInsert.length,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, lessonId));

  return toInsert.length;
}
