import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: Theme;
  soundEffects: boolean;
  dailyGoal: number;
  setTheme: (theme: Theme) => void;
  setSoundEffects: (enabled: boolean) => void;
  setDailyGoal: (goal: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      soundEffects: true,
      dailyGoal: 20,
      setTheme: (theme) => set({ theme }),
      setSoundEffects: (soundEffects) => set({ soundEffects }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
    }),
    {
      name: 'fluent-settings',
    }
  )
);
