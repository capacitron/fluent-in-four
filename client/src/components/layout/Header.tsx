import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  showStats?: boolean;
  transparent?: boolean;
  children?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  backTo,
  showStats = true,
  transparent = false,
  children,
}: HeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 safe-area-top ${
        transparent
          ? 'bg-transparent'
          : 'bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800'
      }`}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors touch-manipulation"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </button>
          )}

          {title && (
            <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-50 truncate">
              {title}
            </h1>
          )}

          {children}
        </div>

        {/* Right section - Stats */}
        {showStats && user && (
          <div className="flex items-center gap-3">
            {/* Streak */}
            <StreakMini />
            {/* XP */}
            <XPMini xp={user.totalXp} level={user.level} />
          </div>
        )}
      </div>
    </header>
  );
}

// Mini streak counter for header
function StreakMini() {
  // In a real app, this would come from a store or API
  // For now, we'll show a placeholder
  const streak = 0; // TODO: Get from gamification store

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full">
      <Flame
        className={`w-4 h-4 ${
          streak > 0 ? 'text-orange-500' : 'text-stone-400 dark:text-stone-600'
        }`}
      />
      <span
        className={`text-sm font-medium ${
          streak > 0
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-stone-500 dark:text-stone-500'
        }`}
      >
        {streak}
      </span>
    </div>
  );
}

// Mini XP/Level indicator for header
function XPMini({ xp, level }: { xp: number; level: number }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-accent-50 dark:bg-accent-900/20 rounded-full">
      <Star className="w-4 h-4 text-accent-500" />
      <span className="text-sm font-medium text-accent-600 dark:text-accent-400">
        {level}
      </span>
    </div>
  );
}

// Simplified header for task pages
export function TaskHeader({
  taskNumber,
  taskName,
  onClose,
}: {
  taskNumber: number;
  taskName: string;
  onClose: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors touch-manipulation"
          aria-label="Close task"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
        </button>

        <div className="text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">
            Task {taskNumber}
          </p>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
            {taskName}
          </p>
        </div>

        {/* Spacer for symmetry */}
        <div className="w-9" />
      </div>
    </header>
  );
}

// Page wrapper with header
export function PageWithHeader({
  title,
  showBack = false,
  backTo,
  showStats = true,
  children,
}: {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  showStats?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header
        title={title}
        showBack={showBack}
        backTo={backTo}
        showStats={showStats}
      />
      <main className="pb-20">{children}</main>
    </div>
  );
}
