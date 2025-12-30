import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// SOUND SETTINGS STORE
// ============================================

interface SoundSettings {
  enabled: boolean;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useSoundSettings = create<SoundSettings>()(
  persist(
    (set) => ({
      enabled: true,
      volume: 0.5,
      setEnabled: (enabled) => set({ enabled }),
      setVolume: (volume) => set({ volume }),
    }),
    {
      name: 'fluent-sound-settings',
    }
  )
);

// ============================================
// SOUND DEFINITIONS
// ============================================

// Sound effects using Web Audio API (no external files needed)
type SoundType =
  | 'tap'
  | 'success'
  | 'error'
  | 'levelUp'
  | 'achievement'
  | 'streak'
  | 'taskComplete'
  | 'lessonComplete';

// Frequency and duration patterns for different sounds
const SOUND_PATTERNS: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  tap: {
    frequencies: [800],
    durations: [50],
    type: 'sine',
  },
  success: {
    frequencies: [523, 659, 784],
    durations: [100, 100, 150],
    type: 'sine',
  },
  error: {
    frequencies: [200, 150],
    durations: [150, 200],
    type: 'square',
  },
  levelUp: {
    frequencies: [392, 523, 659, 784, 1047],
    durations: [100, 100, 100, 100, 300],
    type: 'sine',
  },
  achievement: {
    frequencies: [523, 659, 784, 1047],
    durations: [100, 100, 100, 400],
    type: 'sine',
  },
  streak: {
    frequencies: [440, 554, 659],
    durations: [80, 80, 150],
    type: 'sine',
  },
  taskComplete: {
    frequencies: [523, 659, 784],
    durations: [80, 80, 200],
    type: 'sine',
  },
  lessonComplete: {
    frequencies: [392, 494, 587, 784, 988, 1175],
    durations: [100, 100, 100, 100, 100, 400],
    type: 'sine',
  },
};

// ============================================
// SOUND EFFECTS HOOK
// ============================================

export function useSoundEffects() {
  const { enabled, volume } = useSoundSettings();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Play a sound effect
  const playSound = useCallback(
    (type: SoundType) => {
      if (!enabled) return;

      const ctx = initAudioContext();
      if (!ctx) return;

      const pattern = SOUND_PATTERNS[type];
      let startTime = ctx.currentTime;

      pattern.frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = pattern.type;
        oscillator.frequency.value = freq;

        // Envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + pattern.durations[i] / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + pattern.durations[i] / 1000 + 0.01);

        startTime += pattern.durations[i] / 1000;
      });
    },
    [enabled, volume, initAudioContext]
  );

  // Convenience methods
  const tap = useCallback(() => playSound('tap'), [playSound]);
  const success = useCallback(() => playSound('success'), [playSound]);
  const error = useCallback(() => playSound('error'), [playSound]);
  const levelUp = useCallback(() => playSound('levelUp'), [playSound]);
  const achievement = useCallback(() => playSound('achievement'), [playSound]);
  const streak = useCallback(() => playSound('streak'), [playSound]);
  const taskComplete = useCallback(() => playSound('taskComplete'), [playSound]);
  const lessonComplete = useCallback(() => playSound('lessonComplete'), [playSound]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    tap,
    success,
    error,
    levelUp,
    achievement,
    streak,
    taskComplete,
    lessonComplete,
    enabled,
    volume,
  };
}

// ============================================
// HAPTIC FEEDBACK (for mobile)
// ============================================

export function useHaptic() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const tap = useCallback(() => vibrate(10), [vibrate]);
  const success = useCallback(() => vibrate([10, 50, 20]), [vibrate]);
  const error = useCallback(() => vibrate([50, 30, 50]), [vibrate]);

  return { vibrate, tap, success, error };
}

// ============================================
// COMBINED FEEDBACK HOOK
// ============================================

export function useFeedback() {
  const sound = useSoundEffects();
  const haptic = useHaptic();

  const tap = useCallback(() => {
    sound.tap();
    haptic.tap();
  }, [sound, haptic]);

  const success = useCallback(() => {
    sound.success();
    haptic.success();
  }, [sound, haptic]);

  const error = useCallback(() => {
    sound.error();
    haptic.error();
  }, [sound, haptic]);

  const taskComplete = useCallback(() => {
    sound.taskComplete();
    haptic.success();
  }, [sound, haptic]);

  const lessonComplete = useCallback(() => {
    sound.lessonComplete();
    haptic.success();
  }, [sound, haptic]);

  const levelUp = useCallback(() => {
    sound.levelUp();
    haptic.success();
  }, [sound, haptic]);

  const achievement = useCallback(() => {
    sound.achievement();
    haptic.success();
  }, [sound, haptic]);

  return {
    tap,
    success,
    error,
    taskComplete,
    lessonComplete,
    levelUp,
    achievement,
    sound,
    haptic,
  };
}
