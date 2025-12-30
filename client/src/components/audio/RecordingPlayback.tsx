import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Trash2, RotateCcw } from 'lucide-react';
import { StoredRecording, createRecordingURL, revokeRecordingURL } from '../../stores/recordingStore';
import { formatTime } from '../../stores/audioStore';

interface RecordingPlaybackProps {
  recording: StoredRecording;
  onDelete?: () => void;
  /** Compare with original audio */
  onCompare?: () => void;
  className?: string;
  compact?: boolean;
}

export function RecordingPlayback({
  recording,
  onDelete,
  onCompare,
  className = '',
  compact = false,
}: RecordingPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recording.duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const animationRef = useRef<number | null>(null);

  // Create object URL on mount
  useEffect(() => {
    urlRef.current = createRecordingURL(recording);
    const audio = new Audio(urlRef.current);

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audioRef.current = audio;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audio.pause();
      if (urlRef.current) {
        revokeRecordingURL(urlRef.current);
      }
    };
  }, [recording]);

  // Update time while playing
  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!audioRef.current.paused) {
        animationRef.current = requestAnimationFrame(updateTime);
      }
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play();
      updateTime();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, updateTime]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const recordingDate = new Date(recording.createdAt);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={togglePlay}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            transition-colors
            ${isPlaying
              ? 'bg-primary-500 text-white'
              : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
            }
          `}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" fill="currentColor" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
          )}
        </button>

        <div className="flex-1 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="text-xs text-stone-500 dark:text-stone-400 flex-shrink-0">
          {formatTime(duration)}
        </span>

        {onDelete && (
          <button
            onClick={onDelete}
            className="
              p-1.5 rounded
              text-stone-400 hover:text-red-500
              transition-colors
            "
            aria-label="Delete recording"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-stone-500 dark:text-stone-400">
          Recorded {recordingDate.toLocaleDateString()} at{' '}
          {recordingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {onDelete && (
          <button
            onClick={onDelete}
            className="
              p-1 rounded
              text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors
            "
            aria-label="Delete recording"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Player */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            transition-all
            ${isPlaying
              ? 'bg-primary-500 text-white'
              : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
            }
          `}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" fill="currentColor" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
          )}
        </button>

        <div className="flex-1">
          {/* Progress bar */}
          <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Time */}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Compare button */}
      {onCompare && (
        <button
          onClick={onCompare}
          className="
            w-full mt-3 flex items-center justify-center gap-2
            py-2 rounded-lg
            bg-stone-100 dark:bg-stone-700
            text-stone-700 dark:text-stone-300
            hover:bg-stone-200 dark:hover:bg-stone-600
            text-sm font-medium
            transition-colors
          "
        >
          <RotateCcw className="w-4 h-4" />
          Compare with Original
        </button>
      )}
    </div>
  );
}

// List of recordings for a sentence
interface RecordingListProps {
  recordings: StoredRecording[];
  onDelete: (id: string) => void;
  onCompare?: (recording: StoredRecording) => void;
  className?: string;
}

export function RecordingList({ recordings, onDelete, onCompare, className = '' }: RecordingListProps) {
  if (recordings.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          No recordings yet. Record yourself to track your progress!
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {recordings.map((recording) => (
        <RecordingPlayback
          key={recording.id}
          recording={recording}
          onDelete={() => onDelete(recording.id)}
          onCompare={onCompare ? () => onCompare(recording) : undefined}
          compact
        />
      ))}
    </div>
  );
}
