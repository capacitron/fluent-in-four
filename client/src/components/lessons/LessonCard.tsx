import { motion } from 'framer-motion';
import { Clock, Lock, Star, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { TaskDots } from './TaskProgress';
import type { Lesson } from '../../services/languages';

interface LessonProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  tasksCompleted: boolean[];
  timeSpentMinutes: number;
  xpEarned: number;
}

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  onClick?: () => void;
}

export function LessonCard({ lesson, progress, onClick }: LessonCardProps) {
  const isLocked = lesson.isLocked;
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';

  const tasksCompleted = progress?.tasksCompleted || [false, false, false, false, false];
  const completedCount = tasksCompleted.filter(Boolean).length;
  const progressPercentage = (completedCount / 5) * 100;

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
    >
      <Card
        variant={isLocked ? 'default' : 'interactive'}
        className={`p-4 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={!isLocked ? onClick : undefined}
      >
        <div className="flex items-start gap-4">
          {/* Lesson Number Badge */}
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg
              ${
                isCompleted
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : isInProgress
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
              }
            `}
          >
            {isLocked ? (
              <Lock className="w-5 h-5" />
            ) : (
              lesson.lessonNumber
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-50 truncate">
                  {lesson.title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                  {lesson.sentenceCount} sentences
                </p>
              </div>
              {!isLocked && (
                <ChevronRight className="w-5 h-5 text-stone-400 dark:text-stone-500 flex-shrink-0" />
              )}
            </div>

            {/* Task Progress */}
            <div className="mt-3 flex items-center gap-3">
              <TaskDots completed={tasksCompleted} />
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {completedCount}/5 tasks
              </span>
            </div>

            {/* Progress Bar (if in progress) */}
            {isInProgress && (
              <div className="mt-3">
                <Progress value={progressPercentage} size="sm" />
              </div>
            )}

            {/* Stats Row */}
            <div className="mt-3 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
              {progress && progress.timeSpentMinutes > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{progress.timeSpentMinutes}m</span>
                </div>
              )}
              {progress && progress.xpEarned > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-accent-500" />
                  <span>{progress.xpEarned} XP</span>
                </div>
              )}
              {!progress && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{lesson.estimatedMinutes}m</span>
                </div>
              )}
              {!progress && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-accent-500" />
                  <span>{lesson.xpReward} XP</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
