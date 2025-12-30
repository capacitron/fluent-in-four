import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { getLessonWithSentences } from '../services/languages';
import { useLessonStore } from '../stores/lessonStore';

// Task components (will be created next)
import { ListenReadTask } from '../components/tasks/ListenReadTask';
import { ShadowingTask } from '../components/tasks/ShadowingTask';
import { ScriptoriumTask } from '../components/tasks/ScriptoriumTask';
import { TranslationWriteTask } from '../components/tasks/TranslationWriteTask';
import { TranslationVerbalTask } from '../components/tasks/TranslationVerbalTask';

const TASK_NAMES: Record<number, string> = {
  1: 'Listen & Read',
  2: 'Shadowing',
  3: 'Scriptorium',
  4: 'Translation (Written)',
  5: 'Translation (Verbal)',
};

export function Task() {
  const { lessonId, taskNumber } = useParams<{ lessonId: string; taskNumber: string }>();
  const navigate = useNavigate();

  const currentLesson = useLessonStore((s) => s.currentLesson);
  const sentences = useLessonStore((s) => s.sentences);
  const setCurrentLesson = useLessonStore((s) => s.setCurrentLesson);
  const setSentences = useLessonStore((s) => s.setSentences);
  const reset = useLessonStore((s) => s.reset);

  const [loading, setLoading] = useState(!currentLesson || !sentences.length);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const taskNum = parseInt(taskNumber || '1', 10);
  const taskName = TASK_NAMES[taskNum] || 'Unknown Task';

  // Load lesson data if not already loaded
  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) return;

      // Already have the data
      if (currentLesson?.id === lessonId && sentences.length > 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getLessonWithSentences(lessonId);

        if (response.success && response.data) {
          setCurrentLesson(response.data.lesson);
          setSentences(response.data.sentences);
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        setError('Failed to load lesson');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId, currentLesson, sentences.length, setCurrentLesson, setSentences]);

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    reset();
    navigate(`/lesson/${lessonId}`);
  };

  const handleTaskComplete = () => {
    // Navigate to next task or back to lesson
    if (taskNum < 5) {
      navigate(`/lesson/${lessonId}/task/${taskNum + 1}`);
    } else {
      navigate(`/lesson/${lessonId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <p className="text-stone-600 dark:text-stone-400 mb-4">{error || 'Task not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate task component
  const renderTask = () => {
    const commonProps = {
      lesson: currentLesson,
      sentences,
      onComplete: handleTaskComplete,
      onExit: handleExit,
    };

    switch (taskNum) {
      case 1:
        return <ListenReadTask {...commonProps} />;
      case 2:
        return <ShadowingTask {...commonProps} />;
      case 3:
        return <ScriptoriumTask {...commonProps} />;
      case 4:
        return <TranslationWriteTask {...commonProps} />;
      case 5:
        return <TranslationVerbalTask {...commonProps} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-stone-600 dark:text-stone-400">Unknown task</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleExit}
              className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </button>

            <div className="text-center">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Task {taskNum} of 5
              </span>
              <h1 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                {taskName}
              </h1>
            </div>

            <button
              onClick={handleExit}
              className="p-2 -mr-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Task content */}
      <main className="flex-1 flex flex-col">
        {renderTask()}
      </main>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-2">
              Exit Task?
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              Your progress will be saved. You can continue later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
