import { Star } from 'lucide-react';
import { XPInfo } from '../../services/gamification';

interface XPBarProps {
  xp: XPInfo;
  className?: string;
  showLevel?: boolean;
  showXP?: boolean;
  compact?: boolean;
}

export function XPBar({
  xp,
  className = '',
  showLevel = true,
  showXP = true,
  compact = false,
}: XPBarProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-accent-500" fill="currentColor" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {xp.level}
          </span>
        </div>
        <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${xp.progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showLevel && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent-500" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                Level {xp.level}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {xp.title}
              </p>
            </div>
          </div>
        )}

        {showXP && (
          <div className="text-right">
            <p className="text-lg font-bold text-accent-600 dark:text-accent-400">
              {xp.currentXp.toLocaleString()} XP
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {xp.xpForNextLevel - xp.currentXp} to next level
            </p>
          </div>
        )}
      </div>

      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full transition-all duration-500"
          style={{ width: `${xp.progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between mt-1 text-xs text-stone-500 dark:text-stone-400">
        <span>{xp.xpForCurrentLevel.toLocaleString()}</span>
        <span>{xp.xpForNextLevel.toLocaleString()}</span>
      </div>
    </div>
  );
}

// Level indicator badge
interface LevelIndicatorProps {
  level: number;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelIndicator({
  level,
  title,
  size = 'md',
  className = '',
}: LevelIndicatorProps) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`
          ${sizes[size]}
          rounded-full bg-gradient-to-br from-accent-400 to-accent-600
          flex items-center justify-center font-bold text-white
          shadow-lg
        `}
      >
        {level}
      </div>
      {title && (
        <span className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {title}
        </span>
      )}
    </div>
  );
}

// XP Gain popup/toast
interface XPGainPopupProps {
  amount: number;
  source?: string;
  onClose: () => void;
}

export function XPGainPopup({ amount, source, onClose }: XPGainPopupProps) {
  // Auto-dismiss after 3 seconds
  setTimeout(onClose, 3000);

  return (
    <div
      className="
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        bg-accent-500 text-white
        px-6 py-3 rounded-full
        shadow-lg
        animate-bounce-in
      "
    >
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5" fill="currentColor" />
        <span className="font-bold text-lg">+{amount} XP</span>
        {source && (
          <span className="text-sm opacity-80">• {source}</span>
        )}
      </div>
    </div>
  );
}
