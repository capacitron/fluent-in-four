import { useCallback } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useAudioStore, PLAYBACK_RATES, PlaybackRate } from '../../stores/audioStore';

interface PlaybackControlsProps {
  className?: string;
  /** Compact mode for mobile */
  compact?: boolean;
}

export function PlaybackControls({ className = '', compact = false }: PlaybackControlsProps) {
  const playbackRate = useAudioStore((s) => s.playbackRate);
  const setPlaybackRate = useAudioStore((s) => s.setPlaybackRate);
  const volume = useAudioStore((s) => s.volume);
  const setVolume = useAudioStore((s) => s.setVolume);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <SpeedSelector
        value={playbackRate as PlaybackRate}
        onChange={setPlaybackRate}
        compact={compact}
      />
      <VolumeSlider
        value={volume}
        onChange={setVolume}
        compact={compact}
      />
    </div>
  );
}

// Speed selector component
interface SpeedSelectorProps {
  value: PlaybackRate;
  onChange: (rate: number) => void;
  compact?: boolean;
}

export function SpeedSelector({ value, onChange, compact = false }: SpeedSelectorProps) {
  const handleClick = useCallback(() => {
    // Cycle through rates on click
    const currentIndex = PLAYBACK_RATES.indexOf(value);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    onChange(PLAYBACK_RATES[nextIndex]);
  }, [value, onChange]);

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="
          px-2 py-1 rounded-md
          text-sm font-medium
          bg-stone-100 dark:bg-stone-800
          text-stone-700 dark:text-stone-300
          hover:bg-stone-200 dark:hover:bg-stone-700
          transition-colors
        "
      >
        {value}x
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-stone-500 dark:text-stone-400 mr-1">Speed</span>
      <div className="flex rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700">
        {PLAYBACK_RATES.map((rate) => (
          <button
            key={rate}
            onClick={() => onChange(rate)}
            className={`
              px-2 py-1 text-xs font-medium
              transition-colors
              ${rate === value
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
              }
            `}
          >
            {rate}x
          </button>
        ))}
      </div>
    </div>
  );
}

// Volume slider component
interface VolumeSliderProps {
  value: number;
  onChange: (volume: number) => void;
  compact?: boolean;
}

export function VolumeSlider({ value, onChange, compact = false }: VolumeSliderProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  }, [onChange]);

  const toggleMute = useCallback(() => {
    onChange(value === 0 ? 1 : 0);
  }, [value, onChange]);

  const VolumeIcon = value === 0 ? VolumeX : value < 0.5 ? Volume1 : Volume2;

  if (compact) {
    return (
      <button
        onClick={toggleMute}
        className="
          p-2 rounded-md
          bg-stone-100 dark:bg-stone-800
          text-stone-600 dark:text-stone-400
          hover:bg-stone-200 dark:hover:bg-stone-700
          transition-colors
        "
        aria-label={value === 0 ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        className="
          p-1.5 rounded-md
          text-stone-600 dark:text-stone-400
          hover:bg-stone-100 dark:hover:bg-stone-800
          transition-colors
        "
        aria-label={value === 0 ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="w-4 h-4" />
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={handleChange}
        className="
          w-20 h-1.5 rounded-full appearance-none cursor-pointer
          bg-stone-200 dark:bg-stone-700
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-primary-500
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-primary-500
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
        "
        aria-label="Volume"
      />

      <span className="text-xs text-stone-500 dark:text-stone-400 w-8 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
