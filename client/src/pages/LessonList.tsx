import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { LessonCard } from '../components/lessons/LessonCard';
import { getLanguage, getLessons, Language, Lesson } from '../services/languages';

export function LessonList() {
  const { languageCode } = useParams<{ languageCode: string }>();
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!languageCode) return;

      try {
        const [langData, lessonsData] = await Promise.all([
          getLanguage(languageCode),
          getLessons(languageCode),
        ]);
        setLanguage(langData);
        setLessons(lessonsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [languageCode]);

  const handleLessonClick = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !language) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Language not found'}</p>
          <Link
            to="/languages"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg inline-block"
          >
            Back to Languages
          </Link>
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
              to="/languages"
              className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{language.flag}</span>
              <h1 className="text-lg font-display font-semibold text-stone-900 dark:text-stone-50">
                {language.name}
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-display font-semibold text-stone-900 dark:text-stone-50">
            Lessons
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Complete each lesson to master {language.name}
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 dark:text-stone-400">
              No lessons available yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LessonCard
                  lesson={lesson}
                  onClick={() => handleLessonClick(lesson.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
