import { Eye, EyeOff } from 'lucide-react';
import { useLessonStore, selectCurrentSentence, selectProgress } from '../../stores/lessonStore';

interface SentenceDisplayProps {
  /** Override the current sentence from store */
  sentence?: {
    target: string;
    english: string;
    pronunciationHint?: string | null;
  };
  /** Override showing English */
  showEnglish?: boolean;
  /** Show the toggle button */
  showToggle?: boolean;
  /** Show sentence index indicator */
  showIndex?: boolean;
  /** Custom class for container */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    target: 'text-lg font-medium',
    english: 'text-sm',
    container: 'py-4 px-4',
  },
  md: {
    target: 'text-xl md:text-2xl font-medium',
    english: 'text-base',
    container: 'py-6 px-5',
  },
  lg: {
    target: 'text-2xl md:text-3xl font-medium leading-relaxed',
    english: 'text-lg',
    container: 'py-8 px-6',
  },
};

export function SentenceDisplay({
  sentence: sentenceProp,
  showEnglish: showEnglishProp,
  showToggle = true,
  showIndex = true,
  className = '',
  size = 'md',
}: SentenceDisplayProps) {
  const storeSentence = useLessonStore(selectCurrentSentence);
  const progress = useLessonStore(selectProgress);
  const storeShowEnglish = useLessonStore((s) => s.showEnglish);
  const toggleEnglish = useLessonStore((s) => s.toggleEnglish);

  // Use props if provided, otherwise use store
  const sentence = sentenceProp || storeSentence;
  const showEnglish = showEnglishProp !== undefined ? showEnglishProp : storeShowEnglish;

  const styles = sizeStyles[size];

  if (!sentence) {
    return (
      <div className={`bg-stone-100 dark:bg-stone-800 rounded-xl ${styles.container} ${className}`}>
        <p className="text-stone-500 dark:text-stone-400 text-center">
          No sentence selected
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-white dark:bg-stone-800
        rounded-xl shadow-sm
        border border-stone-200 dark:border-stone-700
        ${styles.container}
        ${className}
      `}
    >
      {/* Header with index and toggle */}
      {(showIndex || showToggle) && (
        <div className="flex items-center justify-between mb-4">
          {showIndex && progress.total > 0 && (
            <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
              {progress.current} of {progress.total}
            </span>
          )}
          {!showIndex && <span />}

          {showToggle && (
            <button
              onClick={toggleEnglish}
              className="
                flex items-center gap-1.5
                text-sm text-stone-600 dark:text-stone-400
                hover:text-primary-600 dark:hover:text-primary-400
                transition-colors
              "
              aria-label={showEnglish ? 'Hide English' : 'Show English'}
            >
              {showEnglish ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Hide English</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Show English</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Target language sentence */}
      <p
        className={`
          ${styles.target}
          text-stone-900 dark:text-stone-50
          leading-relaxed
          text-center
        `}
      >
        {sentence.target}
      </p>

      {/* English translation */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-out
          ${showEnglish ? 'max-h-24 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
        `}
      >
        <p
          className={`
            ${styles.english}
            text-stone-600 dark:text-stone-400
            text-center
          `}
        >
          {sentence.english}
        </p>
      </div>

      {/* Pronunciation hint */}
      {sentence.pronunciationHint && showEnglish && (
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
          <p className="text-xs text-stone-500 dark:text-stone-500 text-center italic">
            {sentence.pronunciationHint}
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version for lists
interface SentencePreviewProps {
  sentence: {
    sentenceNumber: number;
    target: string;
    english: string;
  };
  isActive?: boolean;
  onClick?: () => void;
}

export function SentencePreview({ sentence, isActive = false, onClick }: SentencePreviewProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg
        transition-all duration-200
        ${isActive
          ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500'
          : 'bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 border-l-4 border-transparent'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span
          className={`
            text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
            ${isActive
              ? 'bg-primary-500 text-white'
              : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
            }
          `}
        >
          {sentence.sentenceNumber}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`
              text-sm font-medium truncate
              ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-stone-800 dark:text-stone-200'}
            `}
          >
            {sentence.target}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500 truncate mt-0.5">
            {sentence.english}
          </p>
        </div>
      </div>
    </button>
  );
}
