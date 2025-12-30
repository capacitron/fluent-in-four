// ============================================
// APP CONSTANTS
// ============================================

export const APP_NAME = 'Fluent in Four';
export const APP_DESCRIPTION = 'Learn Romance languages through immersive exercises';

// ============================================
// TASK CONFIGURATION
// ============================================

export const TASK_NAMES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Listen & Read',
  2: 'Shadowing',
  3: 'Scriptorium',
  4: 'Translation (Written)',
  5: 'Translation (Verbal)',
};

export const TASK_DESCRIPTIONS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Listen to the audio while reading sentences',
  2: 'Listen, pause, and repeat each sentence aloud',
  3: 'Type each sentence while speaking aloud',
  4: 'Translate from English to target language',
  5: 'Speak the translation aloud and record yourself',
};

export const DEFAULT_REPETITIONS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 5, // Listen through audio 5 times
  2: 5, // Repeat each sentence 5 times
  3: 1, // Type each sentence once
  4: 1, // Translate each sentence once
  5: 5, // 5 passes through all sentences
};

// ============================================
// AUDIO CONFIGURATION
// ============================================

export const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
export const DEFAULT_PLAYBACK_RATE = 1.0;
export const DEFAULT_VOLUME = 0.8;
export const MAX_RECORDING_DURATION_MS = 30000; // 30 seconds

// ============================================
// GAMIFICATION CONFIGURATION
// ============================================

export const DAILY_GOALS = [10, 20, 50, 100];
export const DEFAULT_DAILY_GOAL = 20;

// ============================================
// UI CONFIGURATION
// ============================================

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export const TOAST_DURATION = 4000;

// ============================================
// LANGUAGE FLAGS
// ============================================

export const LANGUAGE_FLAGS: Record<string, string> = {
  es: '🇪🇸',
  fr: '🇫🇷',
  it: '🇮🇹',
  pt: '🇧🇷',
};

export const LANGUAGE_NAMES: Record<string, { english: string; native: string }> = {
  es: { english: 'Spanish', native: 'Español' },
  fr: { english: 'French', native: 'Français' },
  it: { english: 'Italian', native: 'Italiano' },
  pt: { english: 'Portuguese', native: 'Português' },
};
