import { api } from './api';

// XP Types
export interface XPInfo {
  level: number;
  title: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export interface XPLogEntry {
  id: string;
  amount: number;
  source: string;
  sourceId: string | null;
  totalAfter: number;
  createdAt: string;
}

// Streak Types
export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakAtRisk: boolean;
  hasPracticedToday: boolean;
}

// Achievement Types
export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  xpReward: number;
  icon: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementProgress {
  completedLessons: number;
  languagesStarted: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  userRank: {
    globalRank: number;
    totalUsers: number;
  } | null;
}

// Stats Types
export interface GamificationStats {
  xp: XPInfo;
  streak: StreakInfo;
  progress: AchievementProgress;
}

// XP API
export async function getXP() {
  return api.get<XPInfo>('/gamification/xp');
}

export async function getXPHistory(limit = 20) {
  return api.get<XPLogEntry[]>(`/gamification/xp/history?limit=${limit}`);
}

// Streak API
export async function getStreak() {
  return api.get<StreakInfo>('/gamification/streak');
}

// Achievement API
export async function getAchievements() {
  return api.get<Achievement[]>('/gamification/achievements');
}

export async function getAchievementProgress() {
  return api.get<AchievementProgress>('/gamification/achievements/progress');
}

export async function checkAchievements() {
  return api.post<{
    newlyUnlocked: Array<{ achievement: Achievement; xpAwarded: number }>;
  }>('/gamification/achievements/check');
}

// Leaderboard API
export async function getGlobalLeaderboard(limit = 10, offset = 0) {
  return api.get<LeaderboardData>(`/gamification/leaderboard?limit=${limit}&offset=${offset}`);
}

export async function getLanguageLeaderboard(language: string, limit = 10, offset = 0) {
  return api.get<LeaderboardData>(
    `/gamification/leaderboard/${language}?limit=${limit}&offset=${offset}`
  );
}

// Combined Stats
export async function getStats() {
  return api.get<GamificationStats>('/gamification/stats');
}
