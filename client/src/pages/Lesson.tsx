import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Star, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import { getLessonWithSentences } from '../services/languages';
import { useLessonStore } from '../stores/lessonStore';

interface TaskInfo {
  number: number;
  name: string;
  description: string;
  icon: 'listen' | 'shadow' | 'write' | 'translate-write' | 'translate-speak';
}

const TASKS: TaskInfo[] = [
  {
    number: 1,
    name: 'Listen & Read',
    description: 'Listen to the audio while reading sentences',
    icon: 'listen',
  },
  {
    number: 2,
    name: 'Shadowing',
    description: 'Listen, pause, and repeat each sentence aloud',
    icon: 'shadow',
  },
  {
    number: 3,
    name: 'Scriptorium',
    description: 'Type each sentence while speaking aloud',
    icon: 'write',
  },
  {
    number: 4,
    name: 'Translation (Written)',
    description: 'See English, type the target language',
    icon: 'translate-write',
  },
  {
    number: 5,
    name: 'Translation (Verbal)',
    description: 'See English, speak the target language',
    icon: 'translate-speak',
  },
];

// Task icons
function TaskIcon({ type, className = '' }: { type: TaskInfo['icon']; className?: string }) {
  const baseClass = `${className}`;

  switch (type) {
    case 'listen':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6v12M8 9v6M16 9v6M4 11v2M20 11v2" strokeLinecap="round" />
        </svg>
      );
    case 'shadow':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 18.5a6 6 0 0 0 6-6v-3a6 6 0 0 0-12 0v3a6 6 0 0 0 6 6zM12 18.5v3M8 21.5h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'write':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'translate-write':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2v3M22 22l-5-10-5 10M14 18h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'translate-speak':
      return (
        <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6v12M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2v3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 10v4M22 12h-6" strokeLinecap="round" />
        </svg>
      );
  }
}

interface TaskProgress {
  taskNumber: number;
  isCompleted: boolean;
  percentComplete: number;
}

export function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const setCurrentLesson = useLessonStore((s) => s.setCurrentLesson);
  const setSentences = useLessonStore((s) => s.setSentences);

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock task progress (will be replaced with real data in Phase 5)
  const [taskProgress] = useState<TaskProgress[]>(
    TASKS.map((t) => ({
      taskNumber: t.number,
      isCompleted: false,
      percentComplete: 0,
    }))
  );

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) return;

      try {
        setLoading(true);
        const response = await getLessonWithSentences(lessonId);

        if (response.success && response.data) {
          setLesson(response.data.lesson);
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
  }, [lessonId, setCurrentLesson, setSentences]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <p className="text-stone-600 dark:text-stone-400 mb-4">{error || 'Lesson not found'}</p>
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

  const completedTasks = taskProgress.filter((t) => t.isCompleted).length;
  const overallProgress = (completedTasks / TASKS.length) * 100;

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

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-50 truncate">
                Lesson {lesson.lessonNumber}: {lesson.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lesson.estimatedMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {lesson.xpReward} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Overall Progress */}
        <div className="bg-white dark:bg-stone-800 rounded-xl p-4 mb-6 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Lesson Progress
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {completedTasks} of {TASKS.length} tasks
            </span>
          </div>
          <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {TASKS.map((task, index) => {
            const progress = taskProgress.find((p) => p.taskNumber === task.number);
            const isCompleted = progress?.isCompleted ?? false;
            const percentComplete = progress?.percentComplete ?? 0;
            const isLocked = index > 0 && !taskProgress[index - 1]?.isCompleted;
            const isActive = !isLocked && !isCompleted;

            return (
              <Link
                key={task.number}
                to={isLocked ? '#' : `/lesson/${lessonId}/task/${task.number}`}
                className={`
                  block bg-white dark:bg-stone-800 rounded-xl p-4
                  border transition-all
                  ${isLocked
                    ? 'border-stone-200 dark:border-stone-700 opacity-60 cursor-not-allowed'
                    : isCompleted
                      ? 'border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700'
                      : 'border-stone-200 dark:border-stone-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
                  }
                `}
                onClick={(e) => isLocked && e.preventDefault()}
              >
                <div className="flex items-center gap-4">
                  {/* Task Icon */}
                  <div
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : isLocked
                          ? 'bg-stone-100 dark:bg-stone-700'
                          : 'bg-primary-100 dark:bg-primary-900/30'
                      }
                    `}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-stone-400" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <TaskIcon
                        type={task.icon}
                        className="w-6 h-6 text-primary-600 dark:text-primary-400"
                      />
                    )}
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400">
                        Task {task.number}
                      </span>
                      {isCompleted && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-stone-900 dark:text-stone-50 mt-1">
                      {task.name}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
                      {task.description}
                    </p>

                    {/* Progress bar for in-progress tasks */}
                    {!isCompleted && !isLocked && percentComplete > 0 && (
                      <div className="mt-2 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${percentComplete}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action indicator */}
                  {isActive && (
                    <PlayCircle className="w-6 h-6 text-primary-500 flex-shrink-0" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info text */}
        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
          Complete tasks in order to unlock the next one
        </p>
      </main>
    </div>
  );
}
