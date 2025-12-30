// Re-export theme functionality from settingsStore for backwards compatibility
import { useSettingsStore } from './settingsStore';

export type Theme = 'light' | 'dark' | 'system';

export const useThemeStore = () => {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return { theme, setTheme };
};
