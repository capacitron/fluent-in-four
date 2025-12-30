import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const labels = {
    light: 'Light mode',
    dark: 'Dark mode',
    system: 'System theme',
  };

  const Icon = icons[theme];

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      aria-label={labels[theme]}
      title={labels[theme]}
    >
      <Icon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
    </button>
  );
}
