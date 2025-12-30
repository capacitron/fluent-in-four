import { useEffect } from 'react';
import { Mic, Square, Pause, Play, AlertCircle } from 'lucide-react';
import { useRecorder, formatDuration } from '../../hooks/useRecorder';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  className?: string;
  /** Compact mode for inline display */
  compact?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, className = '', compact = false }: VoiceRecorderProps) {
  const {
    state,
    duration,
    audioLevel,
    permissionDenied,
    start,
    stop,
    pause,
    resume,
    requestPermission,
    reset,
  } = useRecorder({
    onComplete: onRecordingComplete,
  });

  // Request permission on mount
  useEffect(() => {
    if (state === 'idle' && !permissionDenied) {
      requestPermission();
    }
  }, []);

  // Permission denied view
  if (permissionDenied) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Microphone Access Denied
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          Please allow microphone access to record your voice.
        </p>
        <button
          onClick={requestPermission}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Requesting permission view
  if (state === 'requesting') {
    return (
      <div className={`text-center p-4 ${className}`}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mb-3 animate-pulse">
          <Mic className="w-6 h-6 text-stone-400" />
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Requesting microphone access...
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {state === 'idle' || state === 'ready' || state === 'stopped' ? (
          <button
            onClick={start}
            className="
              w-10 h-10 rounded-full flex items-center justify-center
              bg-red-500 hover:bg-red-600 active:scale-95
              transition-all
            "
            aria-label="Start recording"
          >
            <Mic className="w-5 h-5 text-white" />
          </button>
        ) : (
          <>
            <button
              onClick={stop}
              className="
                w-10 h-10 rounded-full flex items-center justify-center
                bg-red-500 hover:bg-red-600 active:scale-95
                transition-all animate-pulse
              "
              aria-label="Stop recording"
            >
              <Square className="w-4 h-4 text-white" fill="white" />
            </button>

            <AudioLevelIndicator level={audioLevel} compact />

            <span className="text-sm font-mono text-stone-600 dark:text-stone-400">
              {formatDuration(duration)}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4 ${className}`}>
      {/* Recording visualization */}
      <div className="flex items-center justify-center mb-4">
        {state === 'recording' || state === 'paused' ? (
          <AudioLevelIndicator level={state === 'paused' ? 0 : audioLevel} />
        ) : (
          <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
            <Mic className="w-8 h-8 text-stone-400" />
          </div>
        )}
      </div>

      {/* Duration display */}
      {(state === 'recording' || state === 'paused') && (
        <div className="text-center mb-4">
          <span className="text-2xl font-mono font-medium text-stone-800 dark:text-stone-200">
            {formatDuration(duration)}
          </span>
          {state === 'paused' && (
            <span className="ml-2 text-sm text-stone-500">Paused</span>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {state === 'idle' || state === 'ready' || state === 'stopped' ? (
          <button
            onClick={start}
            className="
              flex items-center gap-2 px-6 py-3 rounded-full
              bg-red-500 hover:bg-red-600 active:scale-95
              text-white font-medium
              transition-all shadow-lg
            "
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <>
            {/* Pause/Resume button */}
            <button
              onClick={state === 'paused' ? resume : pause}
              className="
                w-12 h-12 rounded-full flex items-center justify-center
                bg-stone-100 dark:bg-stone-700
                text-stone-700 dark:text-stone-300
                hover:bg-stone-200 dark:hover:bg-stone-600
                transition-colors
              "
              aria-label={state === 'paused' ? 'Resume' : 'Pause'}
            >
              {state === 'paused' ? (
                <Play className="w-5 h-5 ml-0.5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
            </button>

            {/* Stop button */}
            <button
              onClick={stop}
              className="
                w-14 h-14 rounded-full flex items-center justify-center
                bg-red-500 hover:bg-red-600 active:scale-95
                transition-all shadow-lg
                animate-pulse
              "
              aria-label="Stop recording"
            >
              <Square className="w-6 h-6 text-white" fill="white" />
            </button>
          </>
        )}
      </div>

      {/* Reset button when stopped */}
      {state === 'stopped' && (
        <button
          onClick={reset}
          className="
            w-full mt-3 text-sm text-stone-500 dark:text-stone-400
            hover:text-stone-700 dark:hover:text-stone-300
          "
        >
          Record again
        </button>
      )}
    </div>
  );
}

// Audio level visualization
interface AudioLevelIndicatorProps {
  level: number;
  compact?: boolean;
}

function AudioLevelIndicator({ level, compact = false }: AudioLevelIndicatorProps) {
  const bars = compact ? 5 : 7;
  const baseHeight = compact ? 16 : 32;
  const maxHeight = compact ? 24 : 48;

  return (
    <div className={`flex items-center justify-center gap-1 ${compact ? 'h-6' : 'h-16'}`}>
      {Array.from({ length: bars }).map((_, i) => {
        // Create wave effect
        const position = i / (bars - 1); // 0 to 1
        const distance = Math.abs(position - 0.5) * 2; // 0 at center, 1 at edges
        const heightMultiplier = 1 - distance * 0.5; // Taller in center

        const height = baseHeight + (maxHeight - baseHeight) * level * heightMultiplier;

        return (
          <div
            key={i}
            className="bg-red-500 rounded-full transition-all duration-75"
            style={{
              width: compact ? 3 : 4,
              height: `${height}px`,
            }}
          />
        );
      })}
    </div>
  );
}
