import { useCallback } from 'react';
import { useAudioStore } from '../stores/audioStore';

export function useABLoop() {
  const loopA = useAudioStore((s) => s.loopA);
  const loopB = useAudioStore((s) => s.loopB);
  const isLooping = useAudioStore((s) => s.isLooping);
  const currentTime = useAudioStore((s) => s.currentTime);
  const setLoopA = useAudioStore((s) => s.setLoopA);
  const setLoopB = useAudioStore((s) => s.setLoopB);
  const setLooping = useAudioStore((s) => s.setLooping);
  const clearLoop = useAudioStore((s) => s.clearLoop);

  // Set A point to current position
  const setA = useCallback(() => {
    setLoopA(currentTime);
    // If B is set and A is now after B, clear B
    if (loopB !== null && currentTime >= loopB) {
      setLoopB(null);
    }
  }, [currentTime, loopB, setLoopA, setLoopB]);

  // Set B point to current position
  const setB = useCallback(() => {
    // Only set B if A is set and current time is after A
    if (loopA !== null && currentTime > loopA) {
      setLoopB(currentTime);
      setLooping(true);
    }
  }, [currentTime, loopA, setLoopB, setLooping]);

  // Toggle loop on/off
  const toggleLoop = useCallback(() => {
    if (loopA !== null && loopB !== null) {
      setLooping(!isLooping);
    }
  }, [loopA, loopB, isLooping, setLooping]);

  // Check if loop is ready (both points set)
  const isReady = loopA !== null && loopB !== null;

  // Check if loop is active
  const isActive = isReady && isLooping;

  // Can set A (always)
  const canSetA = true;

  // Can set B (only if A is set and current time is after A)
  const canSetB = loopA !== null && currentTime > loopA;

  return {
    loopA,
    loopB,
    isLooping,
    isReady,
    isActive,
    canSetA,
    canSetB,
    setA,
    setB,
    toggleLoop,
    clearLoop,
  };
}
