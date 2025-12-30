import { Repeat, X, Flag } from 'lucide-react';
import { useABLoop } from '../../hooks/useABLoop';
import { formatTime } from '../../stores/audioStore';

interface ABLoopControlProps {
  className?: string;
  /** Compact mode for inline display */
  compact?: boolean;
}

export function ABLoopControl({ className = '', compact = false }: ABLoopControlProps) {
  const {
    loopA,
    loopB,
    isActive,
    canSetA,
    canSetB,
    setA,
    setB,
    toggleLoop,
    clearLoop,
  } = useABLoop();

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <button
          onClick={setA}
          disabled={!canSetA}
          className={`
            px-2 py-1 rounded text-xs font-medium
            transition-colors
            ${loopA !== null
              ? 'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }
          `}
          title="Set loop start (A)"
        >
          A
        </button>

        <button
          onClick={setB}
          disabled={!canSetB}
          className={`
            px-2 py-1 rounded text-xs font-medium
            transition-colors
            ${loopB !== null
              ? 'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300'
              : canSetB
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
            }
          `}
          title="Set loop end (B)"
        >
          B
        </button>

        {(loopA !== null || loopB !== null) && (
          <button
            onClick={clearLoop}
            className="
              p-1 rounded
              bg-stone-100 dark:bg-stone-800
              text-stone-500 dark:text-stone-400
              hover:bg-red-100 dark:hover:bg-red-900
              hover:text-red-600 dark:hover:text-red-400
              transition-colors
            "
            title="Clear loop"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-3 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Repeat className={`w-4 h-4 ${isActive ? 'text-secondary-500' : 'text-stone-400'}`} />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            A-B Loop
          </span>
        </div>

        {isActive && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300">
            Active
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Set A button */}
        <button
          onClick={setA}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg
            font-medium text-sm
            transition-all
            ${loopA !== null
              ? 'bg-secondary-500 text-white'
              : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
            }
          `}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>A</span>
          {loopA !== null && (
            <span className="text-xs opacity-80">{formatTime(loopA)}</span>
          )}
        </button>

        {/* Set B button */}
        <button
          onClick={setB}
          disabled={!canSetB}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg
            font-medium text-sm
            transition-all
            ${loopB !== null
              ? 'bg-secondary-500 text-white'
              : canSetB
                ? 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed'
            }
          `}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>B</span>
          {loopB !== null && (
            <span className="text-xs opacity-80">{formatTime(loopB)}</span>
          )}
        </button>

        {/* Clear button */}
        {(loopA !== null || loopB !== null) && (
          <button
            onClick={clearLoop}
            className="
              p-2 rounded-lg
              bg-stone-100 dark:bg-stone-700
              text-stone-500 dark:text-stone-400
              hover:bg-red-100 dark:hover:bg-red-900
              hover:text-red-600 dark:hover:text-red-400
              transition-colors
            "
            title="Clear loop"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loop status */}
      {loopA !== null && loopB !== null && (
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Loop: {formatTime(loopA)} → {formatTime(loopB)}</span>
            <button
              onClick={toggleLoop}
              className={`
                px-2 py-1 rounded
                transition-colors
                ${isActive
                  ? 'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300'
                  : 'bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600'
                }
              `}
            >
              {isActive ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
