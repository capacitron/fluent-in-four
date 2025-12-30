import { useCallback, useRef } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useAudioStore, formatTime, selectLoopProgress, selectIsLoopActive } from '../../stores/audioStore';

interface AudioPlayerProps {
  onToggle: () => void;
  onSeek: (percent: number) => void;
  className?: string;
  /** Show as fixed bottom bar */
  fixed?: boolean;
}

export function AudioPlayer({ onToggle, onSeek, className = '', fixed = false }: AudioPlayerProps) {
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const isLoading = useAudioStore((s) => s.isLoading);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const loopProgress = useAudioStore(selectLoopProgress);
  const isLoopActive = useAudioStore(selectIsLoopActive);

  const progressRef = useRef<HTMLDivElement>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, percent)));
  }, [onSeek]);

  const containerClasses = fixed
    ? 'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 shadow-lg'
    : 'bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`${fixed ? 'max-w-2xl mx-auto' : ''} p-4`}>
        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative h-2 bg-stone-200 dark:bg-stone-700 rounded-full cursor-pointer mb-4 group"
        >
          {/* Loop region indicator */}
          {isLoopActive && (
            <div
              className="absolute h-full bg-accent-200 dark:bg-accent-800 rounded-full opacity-50"
              style={{
                left: `${loopProgress.startPercent}%`,
                width: `${loopProgress.endPercent - loopProgress.startPercent}%`,
              }}
            />
          )}

          {/* Progress fill */}
          <div
            className="absolute h-full bg-primary-500 rounded-full transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Seek handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />

          {/* Loop markers */}
          {isLoopActive && (
            <>
              <div
                className="absolute top-0 w-0.5 h-full bg-accent-500"
                style={{ left: `${loopProgress.startPercent}%` }}
              />
              <div
                className="absolute top-0 w-0.5 h-full bg-accent-500"
                style={{ left: `${loopProgress.endPercent}%` }}
              />
            </>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Time display */}
          <span className="text-sm font-mono text-stone-600 dark:text-stone-400 w-20">
            {formatTime(currentTime)}
          </span>

          {/* Play/Pause button */}
          <button
            onClick={onToggle}
            disabled={isLoading}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isLoading
                ? 'bg-stone-200 dark:bg-stone-700 cursor-wait'
                : 'bg-primary-500 hover:bg-primary-600 active:scale-95 shadow-lg hover:shadow-xl'
              }
            `}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-stone-500 dark:text-stone-400 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-white" fill="white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            )}
          </button>

          {/* Duration */}
          <span className="text-sm font-mono text-stone-600 dark:text-stone-400 w-20 text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact mini player for embedding in other views
interface MiniPlayerProps {
  onToggle: () => void;
  className?: string;
}

export function MiniPlayer({ onToggle, className = '' }: MiniPlayerProps) {
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const isLoading = useAudioStore((s) => s.isLoading);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${isLoading
            ? 'bg-stone-200 dark:bg-stone-700'
            : 'bg-primary-500 hover:bg-primary-600 active:scale-95'
          }
        `}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-stone-500 dark:text-stone-400 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 text-white" fill="white" />
        ) : (
          <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <span className="text-xs font-mono text-stone-500 dark:text-stone-400 flex-shrink-0">
        {formatTime(currentTime)}
      </span>
    </div>
  );
}
