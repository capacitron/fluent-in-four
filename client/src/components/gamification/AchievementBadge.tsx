import {
  Trophy,
  Star,
  Flame,
  Target,
  Book,
  Globe,
  Zap,
  Award,
  Medal,
  Crown,
  Lock,
} from 'lucide-react';
import { Achievement } from '../../services/gamification';

// Map achievement icons to Lucide icons
const ICON_MAP: Record<string, React.FC<any>> = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  target: Target,
  book: Book,
  globe: Globe,
  zap: Zap,
  award: Award,
  medal: Medal,
  crown: Crown,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showDate?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showName = true,
  showDate = false,
  onClick,
  className = '',
}: AchievementBadgeProps) {
  const Icon = ICON_MAP[achievement.icon] || Trophy;

  const sizes = {
    sm: {
      container: 'w-12',
      icon: 'w-6 h-6',
      badge: 'w-10 h-10',
      name: 'text-xs',
    },
    md: {
      container: 'w-20',
      icon: 'w-8 h-8',
      badge: 'w-14 h-14',
      name: 'text-sm',
    },
    lg: {
      container: 'w-28',
      icon: 'w-10 h-10',
      badge: 'w-20 h-20',
      name: 'text-base',
    },
  };

  const s = sizes[size];

  // Tier colors
  const tierColors = {
    1: 'from-amber-400 to-amber-600', // Bronze
    2: 'from-gray-300 to-gray-500',   // Silver
    3: 'from-yellow-400 to-yellow-600', // Gold
    4: 'from-purple-400 to-purple-600', // Platinum
  };

  const tierColor = tierColors[achievement.tier as keyof typeof tierColors] || tierColors[1];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        flex flex-col items-center text-center
        ${s.container}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
    >
      <div
        className={`
          ${s.badge}
          rounded-full
          flex items-center justify-center
          ${achievement.isUnlocked
            ? `bg-gradient-to-br ${tierColor} shadow-lg`
            : 'bg-stone-200 dark:bg-stone-700'
          }
          transition-transform
          ${onClick ? 'hover:scale-110' : ''}
        `}
      >
        {achievement.isUnlocked ? (
          <Icon className={`${s.icon} text-white`} />
        ) : (
          <Lock className={`${s.icon} text-stone-400 dark:text-stone-500`} />
        )}
      </div>

      {showName && (
        <span
          className={`
            ${s.name} mt-2 font-medium line-clamp-2
            ${achievement.isUnlocked
              ? 'text-stone-900 dark:text-stone-50'
              : 'text-stone-400 dark:text-stone-500'
            }
          `}
        >
          {achievement.name}
        </span>
      )}

      {showDate && achievement.isUnlocked && achievement.unlockedAt && (
        <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </span>
      )}
    </button>
  );
}

// Achievement card with full details
interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
  className?: string;
}

export function AchievementCard({ achievement, onClick, className = '' }: AchievementCardProps) {
  const Icon = ICON_MAP[achievement.icon] || Trophy;

  const tierColors = {
    1: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
    2: 'border-gray-400 bg-gray-50 dark:bg-gray-900/20',
    3: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    4: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
  };

  const tierColor = tierColors[achievement.tier as keyof typeof tierColors] || tierColors[1];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        w-full text-left p-4 rounded-xl
        border-2 transition-all
        ${achievement.isUnlocked
          ? tierColor
          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 opacity-60'
        }
        ${onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}
        ${className}
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
            ${achievement.isUnlocked
              ? 'bg-white dark:bg-stone-800'
              : 'bg-stone-200 dark:bg-stone-700'
            }
          `}
        >
          {achievement.isUnlocked ? (
            <Icon className="w-6 h-6 text-accent-500" />
          ) : (
            <Lock className="w-6 h-6 text-stone-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`
              font-semibold
              ${achievement.isUnlocked
                ? 'text-stone-900 dark:text-stone-50'
                : 'text-stone-500 dark:text-stone-400'
              }
            `}
          >
            {achievement.name}
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
            {achievement.description}
          </p>

          {achievement.isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-stone-500 dark:text-stone-500 mt-2">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}

          {achievement.xpReward > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3.5 h-3.5 text-accent-500" fill="currentColor" />
              <span className="text-xs font-medium text-accent-600 dark:text-accent-400">
                +{achievement.xpReward} XP
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// Achievement unlock celebration popup
interface AchievementUnlockPopupProps {
  achievement: Achievement;
  xpAwarded: number;
  onClose: () => void;
}

export function AchievementUnlockPopup({
  achievement,
  xpAwarded,
  onClose,
}: AchievementUnlockPopupProps) {
  const Icon = ICON_MAP[achievement.icon] || Trophy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl">
        {/* Badge animation */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 bg-accent-500 rounded-full animate-ping opacity-25" />
          <div className="relative w-full h-full bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center shadow-xl">
            <Icon className="w-14 h-14 text-white" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 mb-1">
          Achievement Unlocked!
        </h2>

        <h3 className="text-2xl font-bold text-accent-600 dark:text-accent-400 mb-2">
          {achievement.name}
        </h3>

        <p className="text-stone-600 dark:text-stone-400 mb-4">
          {achievement.description}
        </p>

        {xpAwarded > 0 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="w-5 h-5 text-accent-500" fill="currentColor" />
            <span className="text-lg font-bold text-accent-600 dark:text-accent-400">
              +{xpAwarded} XP
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
