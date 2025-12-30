import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { useAudioStore, selectIsLoopActive } from '../stores/audioStore';
import { useLessonStore } from '../stores/lessonStore';

interface UseAudioOptions {
  onEnd?: () => void;
  onLoad?: () => void;
  autoplay?: boolean;
}

export function useAudio(src: string | null, options: UseAudioOptions = {}) {
  const { onEnd, onLoad, autoplay = false } = options;
  const howlRef = useRef<Howl | null>(null);
  const animationRef = useRef<number | null>(null);

  // Store state
  const {
    isPlaying,
    playbackRate,
    volume,
    loopA,
    loopB,
    setPlaying,
    setPaused,
    setLoading,
    setLoaded,
    setCurrentTime,
    setDuration,
    setSrc,
  } = useAudioStore();

  const isLoopActive = useAudioStore(selectIsLoopActive);

  // Cleanup animation frame
  const stopTimeUpdate = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Update current time continuously while playing
  const startTimeUpdate = useCallback(() => {
    const update = () => {
      if (howlRef.current && howlRef.current.playing()) {
        const currentTime = howlRef.current.seek() as number;
        setCurrentTime(currentTime);

        // Handle A-B loop
        if (isLoopActive && loopB !== null && currentTime >= loopB) {
          howlRef.current.seek(loopA || 0);
        }

        animationRef.current = requestAnimationFrame(update);
      }
    };
    animationRef.current = requestAnimationFrame(update);
  }, [setCurrentTime, isLoopActive, loopA, loopB]);

  // Initialize Howl when src changes
  useEffect(() => {
    if (!src) {
      howlRef.current?.unload();
      howlRef.current = null;
      return;
    }

    setSrc(src);
    setLoading(true);

    const howl = new Howl({
      src: [src],
      html5: true, // Enable streaming for large files
      preload: true,
      volume: volume,
      rate: playbackRate,
      onload: () => {
        setLoading(false);
        setLoaded(true);
        setDuration(howl.duration());
        onLoad?.();
        if (autoplay) {
          howl.play();
          setPlaying(true);
          startTimeUpdate();
        }
      },
      onplay: () => {
        setPlaying(true);
        setPaused(false);
        startTimeUpdate();
      },
      onpause: () => {
        setPlaying(false);
        setPaused(true);
        stopTimeUpdate();
      },
      onstop: () => {
        setPlaying(false);
        setPaused(false);
        setCurrentTime(0);
        stopTimeUpdate();
      },
      onend: () => {
        // If looping, restart from A or beginning
        if (isLoopActive) {
          howl.seek(loopA || 0);
          howl.play();
        } else {
          setPlaying(false);
          setCurrentTime(howl.duration());
          stopTimeUpdate();
          onEnd?.();
        }
      },
      onloaderror: (_, error) => {
        console.error('Audio load error:', error);
        setLoading(false);
        setLoaded(false);
      },
      onplayerror: (_, error) => {
        console.error('Audio play error:', error);
        setPlaying(false);
      },
    });

    howlRef.current = howl;

    return () => {
      stopTimeUpdate();
      howl.unload();
    };
  }, [src]); // Only reinitialize on src change

  // Update volume when it changes
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
  }, [volume]);

  // Update playback rate when it changes
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.rate(playbackRate);
    }
  }, [playbackRate]);

  // Play
  const play = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.play();
    }
  }, []);

  // Pause
  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (howlRef.current) {
      if (howlRef.current.playing()) {
        howlRef.current.pause();
      } else {
        howlRef.current.play();
      }
    }
  }, []);

  // Stop
  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
    }
  }, []);

  // Seek to position (in seconds)
  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  // Seek to percentage (0-100)
  const seekPercent = useCallback((percent: number) => {
    if (howlRef.current) {
      const duration = howlRef.current.duration();
      const time = (percent / 100) * duration;
      howlRef.current.seek(time);
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  return {
    play,
    pause,
    toggle,
    stop,
    seek,
    seekPercent,
    isPlaying,
    howl: howlRef.current,
  };
}

// Hook for sentence-synced playback
export function useSentenceAudio(src: string | null) {
  const sentences = useLessonStore((s) => s.sentences);
  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const setCurrentSentenceIndex = useLessonStore((s) => s.setCurrentSentenceIndex);
  const currentTime = useAudioStore((s) => s.currentTime);

  const audio = useAudio(src);

  // Seek to a specific sentence
  const seekToSentence = useCallback((index: number) => {
    if (index >= 0 && index < sentences.length) {
      const sentence = sentences[index];
      const startTime = sentence.audioStartMs / 1000;
      audio.seek(startTime);
      setCurrentSentenceIndex(index);
    }
  }, [sentences, audio, setCurrentSentenceIndex]);

  // Go to previous sentence
  const previousSentence = useCallback(() => {
    if (currentIndex > 0) {
      seekToSentence(currentIndex - 1);
    }
  }, [currentIndex, seekToSentence]);

  // Go to next sentence
  const nextSentence = useCallback(() => {
    if (currentIndex < sentences.length - 1) {
      seekToSentence(currentIndex + 1);
    }
  }, [currentIndex, sentences.length, seekToSentence]);

  // Update current sentence based on audio position
  useEffect(() => {
    if (sentences.length === 0) return;

    const currentTimeMs = currentTime * 1000;

    // Find which sentence we're in
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (currentTimeMs >= sentence.audioStartMs && currentTimeMs < sentence.audioEndMs) {
        if (i !== currentIndex) {
          setCurrentSentenceIndex(i);
        }
        break;
      }
    }
  }, [currentTime, sentences, currentIndex, setCurrentSentenceIndex]);

  return {
    ...audio,
    seekToSentence,
    previousSentence,
    nextSentence,
  };
}
