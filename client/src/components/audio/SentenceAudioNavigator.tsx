import { useState } from 'react';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { useLessonStore } from '../../stores/lessonStore';

interface SentenceAudioNavigatorProps {
  onSeekToSentence: (index: number) => void;
  className?: string;
}

export function SentenceAudioNavigator({ onSeekToSentence, className = '' }: SentenceAudioNavigatorProps) {
  const sentences = useLessonStore((s) => s.sentences);
  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const [showList, setShowList] = useState(false);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sentences.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      onSeekToSentence(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      onSeekToSentence(currentIndex + 1);
    }
  };

  if (sentences.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            transition-all
            ${hasPrevious
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
            }
          `}
          aria-label="Previous sentence"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Sentence counter / Jump button */}
        <button
          onClick={() => setShowList(!showList)}
          className="
            flex items-center gap-2 px-3 py-2 rounded-lg
            bg-stone-100 dark:bg-stone-800
            text-stone-700 dark:text-stone-300
            hover:bg-stone-200 dark:hover:bg-stone-700
            transition-colors
          "
        >
          <List className="w-4 h-4" />
          <span className="text-sm font-medium">
            {currentIndex + 1} / {sentences.length}
          </span>
        </button>

        {/* Next button */}
        <button
          onClick={goToNext}
          disabled={!hasNext}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            transition-all
            ${hasNext
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
            }
          `}
          aria-label="Next sentence"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Sentence jump modal/dropdown */}
      {showList && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowList(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-72 max-h-80 overflow-y-auto bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700">
            <div className="sticky top-0 bg-white dark:bg-stone-800 px-3 py-2 border-b border-stone-100 dark:border-stone-700">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Jump to sentence
              </p>
            </div>

            <div className="p-2 space-y-1">
              {sentences.map((sentence, index) => (
                <button
                  key={sentence.id}
                  onClick={() => {
                    onSeekToSentence(index);
                    setShowList(false);
                  }}
                  className={`
                    w-full text-left p-2 rounded-lg
                    transition-colors
                    ${index === currentIndex
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-700'
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`
                        text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                        ${index === currentIndex
                          ? 'bg-primary-500 text-white'
                          : 'bg-stone-200 dark:bg-stone-600 text-stone-600 dark:text-stone-300'
                        }
                      `}
                    >
                      {index + 1}
                    </span>
                    <p
                      className={`
                        text-xs flex-1 line-clamp-2
                        ${index === currentIndex
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-stone-700 dark:text-stone-300'
                        }
                      `}
                    >
                      {sentence.target}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Compact navigation for mobile
interface CompactSentenceNavProps {
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export function CompactSentenceNav({ onPrevious, onNext, className = '' }: CompactSentenceNavProps) {
  const sentences = useLessonStore((s) => s.sentences);
  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sentences.length - 1;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={`
          p-2 rounded-full
          ${hasPrevious
            ? 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            : 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
          }
        `}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium text-stone-600 dark:text-stone-400 min-w-[60px] text-center">
        {currentIndex + 1} / {sentences.length}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`
          p-2 rounded-full
          ${hasNext
            ? 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            : 'text-stone-300 dark:text-stone-600 cursor-not-allowed'
          }
        `}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
