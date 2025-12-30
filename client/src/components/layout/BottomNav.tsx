import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Languages, User, Settings, Trophy } from 'lucide-react';

interface NavItem {
  to: string;
  icon: typeof Home;
  label: string;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  { to: '/languages', icon: Home, label: 'Home', matchPaths: ['/languages', '/lessons'] },
  { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  // Don't show on certain pages
  const hiddenPaths = ['/auth', '/', '/admin'];
  const shouldHide = hiddenPaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith('/admin')
  );

  // Don't show during tasks
  if (location.pathname.includes('/task/')) {
    return null;
  }

  if (shouldHide) {
    return null;
  }

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => location.pathname.startsWith(path));
    }
    return location.pathname === item.to;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center justify-center w-16 h-full touch-manipulation"
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-500 rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: active ? 1.1 : 1,
                  y: active ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Icon
                  className={`w-6 h-6 ${
                    active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                />
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs mt-1 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// Spacer to prevent content from being hidden behind bottom nav
export function BottomNavSpacer() {
  return <div className="h-20 safe-area-bottom" />;
}
