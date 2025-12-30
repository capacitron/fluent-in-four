// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: 'user' | 'admin';
  preferredLanguage: string | null;
  theme: 'light' | 'dark' | 'system';
  soundEffects: boolean;
  totalXp: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

// ============================================
// LANGUAGES & CONTENT
// ============================================

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Lesson {
  id: string;
  languageId: string;
  lessonNumber: number;
  title: string;
  description: string | null;
  sentenceCount: number;
  estimatedMinutes: number;
  shortAudioKey: string | null;
  longAudioKey: string | null;
  audioTimestamps: AudioTimestamp[] | null;
  isActive: boolean;
  isLocked: boolean;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sentence {
  id: string;
  lessonId: string;
  orderIndex: number;
  english: string;
  target: string;
  audioStartMs: number | null;
  audioEndMs: number | null;
  pronunciation: string | null;
  notes: string | null;
}

export interface AudioTimestamp {
  sentenceIndex: number;
  startMs: number;
  endMs: number;
}

// ============================================
// PROGRESS
// ============================================

export interface UserLanguage {
  id: string;
  userId: string;
  languageId: string;
  currentLessonId: string | null;
  lessonsCompleted: number;
  totalTimeMinutes: number;
  startedAt: Date;
  lastPracticedAt: Date | null;
}

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: LessonStatus;
  task1Completed: boolean;
  task2Completed: boolean;
  task3Completed: boolean;
  task4Completed: boolean;
  task5Completed: boolean;
  timeSpentSeconds: number;
  completedAt: Date | null;
  xpEarned: number;
  startedAt: Date;
  updatedAt: Date;
}

export interface TaskProgress {
  id: string;
  userId: string;
  lessonId: string;
  taskNumber: 1 | 2 | 3 | 4 | 5;
  repetitionsCompleted: number;
  repetitionsRequired: number;
  currentSentenceIndex: number;
  sentencesCompleted: number;
  timeSpentSeconds: number;
  isCompleted: boolean;
  completedAt: Date | null;
  updatedAt: Date;
}

// ============================================
// RECORDINGS
// ============================================

export interface Recording {
  id: string;
  userId: string;
  lessonId: string;
  sentenceId: string | null;
  taskNumber: 2 | 5;
  storageKey: string;
  durationMs: number | null;
  fileSizeBytes: number | null;
  createdAt: Date;
}

// ============================================
// GAMIFICATION
// ============================================

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezesAvailable: number;
  freezeUsedDate: string | null;
  updatedAt: Date;
}

export type XpSource = 'lesson_complete' | 'task_complete' | 'streak_bonus' | 'achievement' | 'daily_goal';

export interface XpLog {
  id: string;
  userId: string;
  amount: number;
  source: XpSource;
  sourceId: string | null;
  createdAt: Date;
}

export interface AchievementDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  requirementType: string;
  requirementValue: number;
  xpReward: number;
  isActive: boolean;
  displayOrder: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  xpAwarded: number;
}

// ============================================
// LEADERBOARD
// ============================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// ============================================
// GAMIFICATION CONSTANTS
// ============================================

export const XP_PER_TASK: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 20, // Listen & Read
  2: 30, // Shadowing
  3: 25, // Scriptorium
  4: 25, // Translation Written
  5: 30, // Translation Verbal
};

export const XP_LESSON_BONUS = 50;

export const XP_PER_LEVEL = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500,
  10000, 13000, 16500, 20500, 25000, 30000, 36000, 43000, 51000, 60000,
];

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  2: 'Novice',
  3: 'Apprentice',
  4: 'Apprentice',
  5: 'Student',
  6: 'Student',
  7: 'Scholar',
  8: 'Scholar',
  9: 'Linguist',
  10: 'Linguist',
  11: 'Polyglot',
  15: 'Polyglot',
  16: 'Master',
  20: 'Master',
  21: 'Grandmaster',
  25: 'Grandmaster',
  26: 'Legend',
};

export const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];
