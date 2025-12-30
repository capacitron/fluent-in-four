import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Star,
  Flame,
  BookOpen,
  Trophy,
  Languages,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Header } from '../components/layout/Header';
import { BottomNavSpacer } from '../components/layout/BottomNav';
import { AnimatedProgress, StaggerContainer, StaggerItem } from '../components/ui';
import { getStreak, getAchievements, Achievement } from '../services/gamification';

// Level titles from the spec
const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  2: 'Beginner',
  3: 'Learner',
  4: 'Student',
  5: 'Apprentice',
  6: 'Practitioner',
  7: 'Intermediate',
  8: 'Skilled',
  9: 'Proficient',
  10: 'Advanced',
  11: 'Expert',
  12: 'Master',
  13: 'Scholar',
  14: 'Sage',
  15: 'Virtuoso',
  16: 'Champion',
  17: 'Elite',
  18: 'Grandmaster',
  19: 'Luminary',
  20: 'Legend',
};

// XP thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 5900, 7400, 9100, 11000,
  13200, 15600, 18100, 20800, 23700, 26800,
];

export function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [streakRes, achievementsRes] = await Promise.all([
          getStreak(),
          getAchievements(),
        ]);

        if (streakRes.success && streakRes.data) {
          setStreak(streakRes.data.currentStreak);
        }
        if (achievementsRes.success && achievementsRes.data) {
          setAchievements(
            achievementsRes.data.filter((a) => a.unlockedAt).slice(0, 4)
          );
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!user) {
    return null;
  }

  const level = user.level || 1;
  const totalXp = user.totalXp || 0;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpInLevel = totalXp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const levelProgress = (xpInLevel / xpNeeded) * 100;

  const initials = (user.displayName || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header title="Profile" showStats={false} />

      <main className="max-w-lg mx-auto px-4 py-6">
        <StaggerContainer className="space-y-6">
          {/* Profile Card */}
          <StaggerItem>
            <motion.div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {initials}
                      </span>
                    </div>
                  )}
                  <button
                    className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-600 shadow-sm"
                    aria-label="Edit profile"
                  >
                    <Edit2 className="w-3 h-3 text-stone-500" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 truncate">
                    {user.displayName || 'Language Learner'}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                      Level {level}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {LEVEL_TITLES[level] || 'Learner'}
                    </span>
                  </div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent-500" />
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                      {totalXp.toLocaleString()} XP
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {xpNeeded - xpInLevel} XP to Level {level + 1}
                  </span>
                </div>
                <AnimatedProgress value={levelProgress} color="accent" />
              </div>
            </motion.div>
          </StaggerItem>

          {/* Stats Grid */}
          <StaggerItem>
            <div className="grid grid-cols-2 gap-4">
              {/* Streak */}
              <div className="bg-white dark:bg-stone-900 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                  {loading ? '...' : streak}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Day Streak
                </p>
              </div>

              {/* Total XP */}
              <div className="bg-white dark:bg-stone-900 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                    <Star className="w-5 h-5 text-accent-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                  {totalXp.toLocaleString()}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Total XP
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Quick Links */}
          <StaggerItem>
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
              <button
                onClick={() => navigate('/achievements')}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Trophy className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-stone-900 dark:text-stone-50">
                      Achievements
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {achievements.length} unlocked
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </button>

              <div className="border-t border-stone-200 dark:border-stone-700" />

              <button
                onClick={() => navigate('/leaderboard')}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
                    <Languages className="w-5 h-5 text-secondary-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-stone-900 dark:text-stone-50">
                      Leaderboard
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      See your ranking
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </button>
            </div>
          </StaggerItem>

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <StaggerItem>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-50">
                    Recent Achievements
                  </h3>
                  <button
                    onClick={() => navigate('/achievements')}
                    className="text-sm text-primary-600 dark:text-primary-400"
                  >
                    See all
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.code}
                      className="aspect-square bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </main>

      <BottomNavSpacer />
    </div>
  );
}
