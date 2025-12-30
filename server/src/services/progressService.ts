import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  lessonProgress,
  taskProgress,
  userLanguages,
  lessons,
  users,
} from '../db/schema.js';
import { createError } from '../middleware/errorHandler.js';

// XP values per task
export const TASK_XP = {
  1: 20, // Listen & Read
  2: 30, // Shadowing
  3: 25, // Scriptorium
  4: 25, // Translation Written
  5: 30, // Translation Verbal
};

export const LESSON_BONUS_XP = 50;

export interface TaskProgressData {
  timeSpentSeconds?: number;
  repetitionsCompleted?: number;
  sentencesCompleted?: number;
  currentSentenceIndex?: number;
  isCompleted?: boolean;
}

export interface LessonProgressData {
  status?: 'not_started' | 'in_progress' | 'completed';
  timeSpentSeconds?: number;
  xpEarned?: number;
}

// Get all progress for a user
export async function getUserProgress(userId: string) {
  const [lessonProgressData, taskProgressData, userLanguagesData] = await Promise.all([
    db.query.lessonProgress.findMany({
      where: eq(lessonProgress.userId, userId),
    }),
    db.query.taskProgress.findMany({
      where: eq(taskProgress.userId, userId),
    }),
    db.query.userLanguages.findMany({
      where: eq(userLanguages.userId, userId),
    }),
  ]);

  return {
    lessons: lessonProgressData,
    tasks: taskProgressData,
    languages: userLanguagesData,
  };
}

// Get progress for a specific lesson
export async function getLessonProgress(userId: string, lessonId: string) {
  const [lessonProg, taskProgs] = await Promise.all([
    db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      ),
    }),
    db.query.taskProgress.findMany({
      where: and(
        eq(taskProgress.userId, userId),
        eq(taskProgress.lessonId, lessonId)
      ),
    }),
  ]);

  return {
    lesson: lessonProg,
    tasks: taskProgs,
  };
}

// Update or create lesson progress
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  data: LessonProgressData
) {
  const existing = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, lessonId)
    ),
  });

  if (existing) {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.timeSpentSeconds !== undefined) {
      updateData.timeSpentSeconds = existing.timeSpentSeconds + data.timeSpentSeconds;
    }
    if (data.xpEarned !== undefined) {
      updateData.xpEarned = existing.xpEarned + data.xpEarned;
    }
    if (data.status === 'completed' && !existing.completedAt) {
      updateData.completedAt = new Date();
    }

    const [updated] = await db
      .update(lessonProgress)
      .set(updateData)
      .where(eq(lessonProgress.id, existing.id))
      .returning();

    return updated;
  } else {
    // Get lesson to find languageId
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
    });

    if (!lesson) {
      throw createError(404, 'LESSON_NOT_FOUND', 'Lesson not found');
    }

    // Ensure userLanguage exists
    await ensureUserLanguage(userId, lesson.languageId);

    const [created] = await db
      .insert(lessonProgress)
      .values({
        userId,
        lessonId,
        status: data.status ?? 'in_progress',
        timeSpentSeconds: data.timeSpentSeconds ?? 0,
        xpEarned: data.xpEarned ?? 0,
        completedAt: data.status === 'completed' ? new Date() : null,
      })
      .returning();

    return created;
  }
}

// Mark a specific task as completed in lesson progress
async function markTaskCompleted(
  userId: string,
  lessonId: string,
  taskNumber: number
) {
  const existing = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, lessonId)
    ),
  });

  if (!existing) {
    return;
  }

  const taskField = `task${taskNumber}Completed` as keyof typeof existing;
  if (existing[taskField]) {
    return; // Already completed
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  updateData[taskField] = true;

  await db
    .update(lessonProgress)
    .set(updateData)
    .where(eq(lessonProgress.id, existing.id));
}

// Update or create task progress
export async function updateTaskProgress(
  userId: string,
  lessonId: string,
  taskNumber: number,
  data: TaskProgressData
) {
  const existing = await db.query.taskProgress.findFirst({
    where: and(
      eq(taskProgress.userId, userId),
      eq(taskProgress.lessonId, lessonId),
      eq(taskProgress.taskNumber, taskNumber)
    ),
  });

  let result;
  let xpAwarded = 0;
  let wasJustCompleted = false;

  if (existing) {
    // Only award XP if completing for the first time
    if (data.isCompleted && !existing.isCompleted) {
      xpAwarded = TASK_XP[taskNumber as keyof typeof TASK_XP] || 0;
      wasJustCompleted = true;
    }

    const [updated] = await db
      .update(taskProgress)
      .set({
        timeSpentSeconds: data.timeSpentSeconds
          ? existing.timeSpentSeconds + data.timeSpentSeconds
          : existing.timeSpentSeconds,
        repetitionsCompleted: data.repetitionsCompleted ?? existing.repetitionsCompleted,
        sentencesCompleted: Math.max(
          data.sentencesCompleted ?? 0,
          existing.sentencesCompleted
        ),
        currentSentenceIndex: data.currentSentenceIndex ?? existing.currentSentenceIndex,
        isCompleted: data.isCompleted ?? existing.isCompleted,
        completedAt: data.isCompleted && !existing.completedAt ? new Date() : existing.completedAt,
        updatedAt: new Date(),
      })
      .where(eq(taskProgress.id, existing.id))
      .returning();

    result = updated;
  } else {
    // Ensure lesson progress exists first
    await updateLessonProgress(userId, lessonId, { status: 'in_progress' });

    // New task progress - award XP if completing
    if (data.isCompleted) {
      xpAwarded = TASK_XP[taskNumber as keyof typeof TASK_XP] || 0;
      wasJustCompleted = true;
    }

    const [created] = await db
      .insert(taskProgress)
      .values({
        userId,
        lessonId,
        taskNumber,
        timeSpentSeconds: data.timeSpentSeconds ?? 0,
        repetitionsCompleted: data.repetitionsCompleted ?? 0,
        sentencesCompleted: data.sentencesCompleted ?? 0,
        currentSentenceIndex: data.currentSentenceIndex ?? 0,
        isCompleted: data.isCompleted ?? false,
        completedAt: data.isCompleted ? new Date() : null,
      })
      .returning();

    result = created;
  }

  // Mark task completed in lesson progress and check for lesson completion
  let lessonBonusAwarded = false;
  if (wasJustCompleted) {
    await markTaskCompleted(userId, lessonId, taskNumber);

    const allTasks = await db.query.taskProgress.findMany({
      where: and(
        eq(taskProgress.userId, userId),
        eq(taskProgress.lessonId, lessonId)
      ),
    });

    const completedTasks = allTasks.filter((t) => t.isCompleted);
    if (completedTasks.length === 5) {
      // All 5 tasks complete - award lesson bonus
      xpAwarded += LESSON_BONUS_XP;
      lessonBonusAwarded = true;

      // Mark lesson as complete
      await updateLessonProgress(userId, lessonId, {
        status: 'completed',
      });
    }
  }

  return {
    task: result,
    xpAwarded,
    lessonBonusAwarded,
  };
}

// Sync offline progress
export async function syncOfflineProgress(
  userId: string,
  progressUpdates: Array<{
    lessonId: string;
    taskNumber?: number;
    data: TaskProgressData | LessonProgressData;
  }>
) {
  const results = [];

  for (const update of progressUpdates) {
    if (update.taskNumber) {
      const result = await updateTaskProgress(
        userId,
        update.lessonId,
        update.taskNumber,
        update.data as TaskProgressData
      );
      results.push(result);
    } else {
      const result = await updateLessonProgress(
        userId,
        update.lessonId,
        update.data as LessonProgressData
      );
      results.push({ lesson: result });
    }
  }

  return results;
}

// Ensure user-language relationship exists
async function ensureUserLanguage(userId: string, languageId: string) {
  const existing = await db.query.userLanguages.findFirst({
    where: and(
      eq(userLanguages.userId, userId),
      eq(userLanguages.languageId, languageId)
    ),
  });

  if (!existing) {
    await db.insert(userLanguages).values({
      userId,
      languageId,
    });
  }
}

// Get user stats
export async function getUserStats(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw createError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const [lessonProgressData, taskProgressData, languagesData] = await Promise.all([
    db.query.lessonProgress.findMany({
      where: eq(lessonProgress.userId, userId),
    }),
    db.query.taskProgress.findMany({
      where: eq(taskProgress.userId, userId),
    }),
    db.query.userLanguages.findMany({
      where: eq(userLanguages.userId, userId),
    }),
  ]);

  const completedLessons = lessonProgressData.filter((l) => l.completedAt !== null).length;
  const completedTasks = taskProgressData.filter((t) => t.isCompleted).length;
  const totalTimeSpent = lessonProgressData.reduce((sum, l) => sum + l.timeSpentSeconds, 0);

  return {
    totalXp: user.totalXp,
    level: user.level,
    completedLessons,
    completedTasks,
    languagesStarted: languagesData.length,
    totalTimeSpentSeconds: totalTimeSpent,
  };
}
