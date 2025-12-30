import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { getLanguages, Language } from '../services/languages';
import { useAuthStore } from '../stores/authStore';

export function LanguageSelect() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const data = await getLanguages();
        setLanguages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load languages');
      } finally {
        setLoading(false);
      }
    }

    fetchLanguages();
  }, []);

  const handleLanguageClick = (code: string) => {
    navigate(`/lessons/${code}`);
  };

  // Mock progress data - will be replaced with real data later
  const getLanguageProgress = (_code: string) => {
    return {
      started: false,
      lessonsCompleted: 0,
      totalLessons: 1,
      percentage: 0,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </Link>
            <h1 className="text-lg font-display font-semibold text-stone-900 dark:text-stone-50">
              Choose a Language
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {user && (
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            Hi {user.displayName || 'there'}! What would you like to learn today?
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((language, index) => {
            const progress = getLanguageProgress(language.code);

            return (
              <motion.div
                key={language.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant="interactive"
                  className="p-5"
                  onClick={() => handleLanguageClick(language.code)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{language.flag}</span>
                      <div>
                        <h2 className="font-semibold text-lg text-stone-900 dark:text-stone-50">
                          {language.name}
                        </h2>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {language.nativeName}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                  </div>

                  {progress.started && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {progress.lessonsCompleted}/{progress.totalLessons} lessons
                        </span>
                      </div>
                      <Progress value={progress.percentage} size="sm" />
                    </div>
                  )}

                  {!progress.started && (
                    <div className="mt-4">
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                        Start learning →
                      </span>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
