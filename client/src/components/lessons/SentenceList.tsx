import { useEffect, useRef } from 'react';
import { useLessonStore, Sentence } from '../../stores/lessonStore';
import { SentencePreview } from './SentenceDisplay';

interface SentenceListProps {
  /** Auto-scroll to active sentence */
  autoScroll?: boolean;
  /** Maximum height of the list */
  maxHeight?: string;
  /** Custom class */
  className?: string;
  /** Callback when sentence is clicked */
  onSentenceClick?: (index: number, sentence: Sentence) => void;
}

export function SentenceList({
  autoScroll = true,
  maxHeight = '400px',
  className = '',
  onSentenceClick,
}: SentenceListProps) {
  const sentences = useLessonStore((s) => s.sentences);
  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const setCurrentSentenceIndex = useLessonStore((s) => s.setCurrentSentenceIndex);

  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active sentence
  useEffect(() => {
    if (autoScroll && activeRef.current && listRef.current) {
      const list = listRef.current;
      const active = activeRef.current;

      const listRect = list.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();

      // Check if active element is not fully visible
      if (activeRect.top < listRect.top || activeRect.bottom > listRect.bottom) {
        active.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentIndex, autoScroll]);

  const handleClick = (index: number, sentence: Sentence) => {
    setCurrentSentenceIndex(index);
    onSentenceClick?.(index, sentence);
  };

  if (sentences.length === 0) {
    return (
      <div
        className={`
          flex items-center justify-center
          bg-stone-50 dark:bg-stone-800/50
          rounded-xl p-8
          ${className}
        `}
        style={{ maxHeight }}
      >
        <p className="text-stone-500 dark:text-stone-400 text-center">
          No sentences loaded
        </p>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={`
        overflow-y-auto
        bg-white dark:bg-stone-900
        rounded-xl
        border border-stone-200 dark:border-stone-700
        ${className}
      `}
      style={{ maxHeight }}
    >
      <div className="p-2 space-y-1">
        {sentences.map((sentence, index) => (
          <div
            key={sentence.id}
            ref={index === currentIndex ? activeRef : undefined}
          >
            <SentencePreview
              sentence={sentence}
              isActive={index === currentIndex}
              onClick={() => handleClick(index, sentence)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact sentence navigator for mobile
interface SentenceNavigatorProps {
  className?: string;
}

export function SentenceNavigator({ className = '' }: SentenceNavigatorProps) {
  const sentences = useLessonStore((s) => s.sentences);
  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const goToPrevious = useLessonStore((s) => s.goToPreviousSentence);
  const goToNext = useLessonStore((s) => s.goToNextSentence);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sentences.length - 1;

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <button
        onClick={goToPrevious}
        disabled={!hasPrevious}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          font-medium text-sm
          transition-all
          ${hasPrevious
            ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
        {currentIndex + 1} / {sentences.length}
      </span>

      <button
        onClick={goToNext}
        disabled={!hasNext}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          font-medium text-sm
          transition-all
          ${hasNext
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
          }
        `}
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// Progress bar for sentence completion
interface SentenceProgressBarProps {
  className?: string;
}

export function SentenceProgressBar({ className = '' }: SentenceProgressBarProps) {
  const sentences = useLessonStore((s) => s.sentences);
  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);

  const percentage = sentences.length > 0
    ? ((currentIndex + 1) / sentences.length) * 100
    : 0;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>Progress</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
