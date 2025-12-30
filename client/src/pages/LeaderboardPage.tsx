import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import {
  getGlobalLeaderboard,
  getLanguageLeaderboard,
  LeaderboardData,
} from '../services/gamification';
import { getLanguages } from '../services/languages';
import { Leaderboard, LeaderboardTabs } from '../components/gamification';

interface Language {
  code: string;
  name: string;
}

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('global');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load languages
  useEffect(() => {
    async function loadLanguages() {
      try {
        const langs = await getLanguages();
        setLanguages(langs.map((l) => ({ code: l.code, name: l.name })));
      } catch (error) {
        console.error('Failed to load languages:', error);
      }
    }
    loadLanguages();
  }, []);

  // Load leaderboard data when tab changes
  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const response =
          activeTab === 'global'
            ? await getGlobalLeaderboard(20)
            : await getLanguageLeaderboard(activeTab, 20);

        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </button>

            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-accent-500" />
              <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                Leaderboard
              </h1>
            </div>
          </div>

          {/* Tab switcher */}
          <LeaderboardTabs
            activeTab={activeTab}
            languages={languages}
            onChange={setActiveTab}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* User's rank banner */}
        {data?.userRank && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Your Rank
                </p>
                <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                  #{data.userRank.globalRank}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Total Players
                </p>
                <p className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                  {data.userRank.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {data && (
          <Leaderboard
            data={data}
            loading={loading}
            className="border border-stone-200 dark:border-stone-700"
          />
        )}

        {!data && !loading && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <p className="text-stone-600 dark:text-stone-400">
              No leaderboard data available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
