import { create } from 'zustand';

export interface Sentence {
  id: string;
  lessonId: string;
  sentenceNumber: number;
  english: string;
  target: string;
  audioStartMs: number;
  audioEndMs: number;
  shadowingStartMs: number;
  shadowingEndMs: number;
  pronunciationHint?: string | null;
}

export interface Lesson {
  id: string;
  languageId: string;
  lessonNumber: number;
  title: string;
  description?: string | null;
  sentenceCount: number;
  estimatedMinutes: number;
  xpReward: number;
  isLocked: boolean;
  createdAt: string;
}

interface LessonState {
  // Current lesson data
  currentLesson: Lesson | null;
  sentences: Sentence[];

  // Navigation state
  currentSentenceIndex: number;

  // UI state
  showEnglish: boolean;

  // Actions
  setCurrentLesson: (lesson: Lesson) => void;
  setSentences: (sentences: Sentence[]) => void;
  setCurrentSentenceIndex: (index: number) => void;
  goToNextSentence: () => void;
  goToPreviousSentence: () => void;
  toggleEnglish: () => void;
  setShowEnglish: (show: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentLesson: null,
  sentences: [],
  currentSentenceIndex: 0,
  showEnglish: true,
};

export const useLessonStore = create<LessonState>((set, get) => ({
  ...initialState,

  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

  setSentences: (sentences) => set({
    sentences: sentences.sort((a, b) => a.sentenceNumber - b.sentenceNumber)
  }),

  setCurrentSentenceIndex: (index) => {
    const { sentences } = get();
    if (index >= 0 && index < sentences.length) {
      set({ currentSentenceIndex: index });
    }
  },

  goToNextSentence: () => {
    const { currentSentenceIndex, sentences } = get();
    if (currentSentenceIndex < sentences.length - 1) {
      set({ currentSentenceIndex: currentSentenceIndex + 1 });
    }
  },

  goToPreviousSentence: () => {
    const { currentSentenceIndex } = get();
    if (currentSentenceIndex > 0) {
      set({ currentSentenceIndex: currentSentenceIndex - 1 });
    }
  },

  toggleEnglish: () => set((state) => ({ showEnglish: !state.showEnglish })),

  setShowEnglish: (show) => set({ showEnglish: show }),

  reset: () => set(initialState),
}));

// Selectors
export const selectCurrentSentence = (state: LessonState) =>
  state.sentences[state.currentSentenceIndex] || null;

export const selectProgress = (state: LessonState) => ({
  current: state.currentSentenceIndex + 1,
  total: state.sentences.length,
  percentage: state.sentences.length > 0
    ? Math.round(((state.currentSentenceIndex + 1) / state.sentences.length) * 100)
    : 0,
});
