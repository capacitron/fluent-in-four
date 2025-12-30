import { Flame, AlertTriangle } from 'lucide-react';
import { StreakInfo } from '../../services/gamification';

interface StreakCounterProps {
  streak: StreakInfo;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showReminder?: boolean;
}

export function StreakCounter({
  streak,
  className = '',
  size = 'md',
  showReminder = true,
}: StreakCounterProps) {
  const sizes = {
    sm: {
      container: 'gap-1',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    md: {
      container: 'gap-2',
      icon: 'w-6 h-6',
      text: 'text-xl',
    },
    lg: {
      container: 'gap-3',
      icon: 'w-10 h-10',
      text: 'text-3xl',
    },
  };

  const s = sizes[size];
  const isActive = streak.currentStreak > 0;
  const isMilestone = [7, 14, 30, 60, 100, 365].includes(streak.currentStreak);

  return (
    <div className={className}>
      <div className={`flex items-center ${s.container}`}>
        <div
          className={`
            ${s.icon}
            ${isActive
              ? isMilestone
                ? 'text-orange-500 animate-pulse'
                : 'text-orange-500'
              : 'text-stone-400'
            }
          `}
        >
          <Flame
            className="w-full h-full"
            fill={isActive ? 'currentColor' : 'none'}
          />
        </div>

        <span
          className={`
            ${s.text} font-bold
            ${isActive ? 'text-orange-500' : 'text-stone-400'}
          `}
        >
          {streak.currentStreak}
        </span>

        {size !== 'sm' && (
          <span className="text-sm text-stone-500 dark:text-stone-400">
            day{streak.currentStreak !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Streak at risk warning */}
      {showReminder && streak.streakAtRisk && !streak.hasPracticedToday && (
        <StreakReminder className="mt-2" />
      )}
    </div>
  );
}

// Full streak card
interface StreakCardProps {
  streak: StreakInfo;
  className?: string;
}

export function StreakCard({ streak, className = '' }: StreakCardProps) {
  return (
    <div
      className={`
        bg-gradient-to-br from-orange-50 to-amber-50
        dark:from-orange-900/20 dark:to-amber-900/20
        rounded-xl p-4
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">
            Current Streak
          </p>
          <StreakCounter streak={streak} size="lg" showReminder={false} />
        </div>

        <div className="text-right">
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">
            Longest Streak
          </p>
          <p className="text-2xl font-bold text-stone-700 dark:text-stone-300">
            {streak.longestStreak}
          </p>
        </div>
      </div>

      {streak.hasPracticedToday && (
        <div className="mt-3 pt-3 border-t border-orange-100 dark:border-orange-800/30">
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            You've practiced today!
          </p>
        </div>
      )}

      {streak.streakAtRisk && !streak.hasPracticedToday && (
        <StreakReminder className="mt-3" compact />
      )}
    </div>
  );
}

// Streak reminder component
interface StreakReminderProps {
  className?: string;
  compact?: boolean;
}

export function StreakReminder({ className = '', compact = false }: StreakReminderProps) {
  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-2 text-amber-600 dark:text-amber-400
          ${className}
        `}
      >
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">Practice today to keep your streak!</span>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-amber-50 dark:bg-amber-900/20
        border border-amber-200 dark:border-amber-800
        rounded-lg p-3
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Streak at risk!
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
            Complete any task today to keep your streak alive.
          </p>
        </div>
      </div>
    </div>
  );
}

// Milestone celebration
interface StreakMilestoneProps {
  days: number;
  onClose: () => void;
}

export function StreakMilestone({ days, onClose }: StreakMilestoneProps) {
  const milestoneText: Record<number, string> = {
    7: 'One week!',
    14: 'Two weeks!',
    30: 'One month!',
    60: 'Two months!',
    100: '100 days!',
    365: 'One year!',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-25" />
          <div className="relative w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <Flame className="w-12 h-12 text-white" fill="white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">
          {milestoneText[days] || `${days} Day Streak!`}
        </h2>

        <p className="text-stone-600 dark:text-stone-400 mb-6">
          Amazing dedication! Keep up the great work.
        </p>

        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
