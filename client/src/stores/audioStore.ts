import { create } from 'zustand';

interface AudioState {
  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isLoaded: boolean;

  // Time tracking
  currentTime: number;
  duration: number;

  // Settings
  playbackRate: number;
  volume: number;

  // Current audio source
  src: string | null;

  // A-B Loop
  loopA: number | null;
  loopB: number | null;
  isLooping: boolean;

  // Actions
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setSrc: (src: string | null) => void;
  setLoopA: (time: number | null) => void;
  setLoopB: (time: number | null) => void;
  setLooping: (looping: boolean) => void;
  clearLoop: () => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  isLoaded: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 1,
  src: null,
  loopA: null,
  loopB: null,
  isLooping: false,
};

export const useAudioStore = create<AudioState>((set) => ({
  ...initialState,

  setPlaying: (playing) => set({ isPlaying: playing, isPaused: !playing && playing !== undefined }),
  setPaused: (paused) => set({ isPaused: paused }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setSrc: (src) => set({ src, isLoaded: false, currentTime: 0, duration: 0 }),

  setLoopA: (time) => set({ loopA: time }),
  setLoopB: (time) => set({ loopB: time }),
  setLooping: (looping) => set({ isLooping: looping }),
  clearLoop: () => set({ loopA: null, loopB: null, isLooping: false }),

  reset: () => set(initialState),
}));

// Playback rate options
export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

// Selectors
export const selectIsLoopActive = (state: AudioState) =>
  state.loopA !== null && state.loopB !== null && state.isLooping;

export const selectLoopProgress = (state: AudioState) => {
  if (state.duration === 0) return { startPercent: 0, endPercent: 0 };
  return {
    startPercent: state.loopA !== null ? (state.loopA / state.duration) * 100 : 0,
    endPercent: state.loopB !== null ? (state.loopB / state.duration) * 100 : 100,
  };
};

// Format time as MM:SS
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
