import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { getAchievements, Achievement } from '../services/gamification';
import { AchievementBadge, AchievementCard } from '../components/gamification';

export function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getAchievements();
        if (response.success && response.data) {
          setAchievements(response.data);
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const unlocked = achievements.filter((a) => a.isUnlocked);
  const locked = achievements.filter((a) => !a.isUnlocked);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </button>

            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-accent-500" />
              <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                Achievements
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="bg-white dark:bg-stone-800 rounded-xl p-4 mb-6 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Unlocked</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                {unlocked.length} / {achievements.length}
              </p>
            </div>
            <div className="w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-stone-200 dark:text-stone-700"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(unlocked.length / achievements.length) * 100}, 100`}
                  className="text-accent-500"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Unlocked Achievements */}
        {unlocked.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-4">
              Unlocked ({unlocked.length})
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {unlocked.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="md"
                  showName={true}
                  onClick={() => setSelectedAchievement(achievement)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Locked Achievements */}
        {locked.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-4">
              Locked ({locked.length})
            </h2>
            <div className="space-y-3">
              {locked.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => setSelectedAchievement(achievement)}
                />
              ))}
            </div>
          </section>
        )}

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <p className="text-stone-600 dark:text-stone-400">
              No achievements available yet.
            </p>
          </div>
        )}
      </main>

      {/* Achievement detail modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AchievementCard achievement={selectedAchievement} />
            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-full mt-4 px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
