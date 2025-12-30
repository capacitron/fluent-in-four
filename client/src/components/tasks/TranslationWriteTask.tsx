import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Eye, ThumbsUp, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLessonStore, Sentence } from '../../stores/lessonStore';

interface TaskProps {
  lesson: {
    id: string;
    languageId: string;
    lessonNumber: number;
    title: string;
  };
  sentences: Sentence[];
  onComplete: () => void;
  onExit: () => void;
}

type AssessmentResult = 'correct' | 'needs-practice' | null;

interface SentenceProgress {
  revealed: boolean;
  assessment: AssessmentResult;
  userAnswer: string;
}

export function TranslationWriteTask({ lesson, sentences, onComplete }: TaskProps) {
  const [progress, setProgress] = useState<Map<string, SentenceProgress>>(new Map());
  const [userInput, setUserInput] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const setCurrentSentenceIndex = useLessonStore((s) => s.setCurrentSentenceIndex);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSentence = sentences[currentIndex];
  const currentProgress = progress.get(currentSentence?.id || '');

  // Count completed sentences
  const completedCount = Array.from(progress.values()).filter((p) => p.assessment !== null).length;
  const isTaskComplete = completedCount >= sentences.length;

  // Focus input on mount and sentence change
  useEffect(() => {
    if (!isRevealed) {
      inputRef.current?.focus();
    }
  }, [currentIndex, isRevealed]);

  // Reset state when changing sentences
  useEffect(() => {
    const existing = progress.get(currentSentence?.id || '');
    if (existing) {
      setUserInput(existing.userAnswer);
      setIsRevealed(existing.revealed);
    } else {
      setUserInput('');
      setIsRevealed(false);
    }
  }, [currentIndex, currentSentence?.id]);

  const handleReveal = () => {
    if (!currentSentence) return;

    setIsRevealed(true);
    setProgress((prev) => {
      const updated = new Map(prev);
      updated.set(currentSentence.id, {
        revealed: true,
        assessment: null,
        userAnswer: userInput,
      });
      return updated;
    });
  };

  const handleAssessment = (result: AssessmentResult) => {
    if (!currentSentence) return;

    setProgress((prev) => {
      const updated = new Map(prev);
      updated.set(currentSentence.id, {
        revealed: true,
        assessment: result,
        userAnswer: userInput,
      });
      return updated;
    });

    // Auto-advance to next sentence
    if (currentIndex < sentences.length - 1) {
      setTimeout(() => {
        setCurrentSentenceIndex(currentIndex + 1);
      }, 300);
    }
  };

  const goToNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentSentenceIndex(currentIndex - 1);
    }
  };

  if (isTaskComplete) {
    const correctCount = Array.from(progress.values()).filter((p) => p.assessment === 'correct').length;
    const needsPracticeCount = Array.from(progress.values()).filter((p) => p.assessment === 'needs-practice').length;

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">
          Written Translation Complete!
        </h2>

        <p className="text-stone-600 dark:text-stone-400 mb-4">
          You translated all {sentences.length} sentences.
        </p>

        <div className="flex gap-6 mb-8 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{correctCount}</div>
            <div className="text-stone-500">Got it</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{needsPracticeCount}</div>
            <div className="text-stone-500">Needs practice</div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Continue to Next Task
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress header */}
      <div className="px-4 py-3 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Sentence {currentIndex + 1} of {sentences.length}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {completedCount} completed
            </span>
          </div>

          <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${(completedCount / sentences.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {currentSentence && (
            <>
              {/* English sentence (prompt) */}
              <div className="bg-white dark:bg-stone-800 rounded-xl p-6 mb-6 border border-stone-200 dark:border-stone-700">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">
                  Translate to {lesson.languageId === 'spanish' ? 'Spanish' : lesson.languageId}:
                </p>
                <p className="text-xl font-medium text-stone-900 dark:text-stone-50">
                  {currentSentence.english}
                </p>
              </div>

              {/* Input area */}
              <div className="mb-4">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      handleReveal();
                    }
                  }}
                  disabled={isRevealed}
                  placeholder="Type your translation..."
                  rows={3}
                  className="
                    w-full px-4 py-3 text-lg rounded-xl
                    bg-white dark:bg-stone-800
                    border-2 border-stone-200 dark:border-stone-700
                    focus:border-primary-500 focus:ring-0
                    text-stone-900 dark:text-stone-50
                    placeholder:text-stone-400
                    disabled:opacity-60
                    transition-colors resize-none
                  "
                />
              </div>

              {/* Reveal button or correct answer */}
              {!isRevealed ? (
                <button
                  onClick={handleReveal}
                  className="
                    w-full flex items-center justify-center gap-2
                    px-4 py-3 rounded-xl
                    bg-primary-500 text-white font-medium
                    hover:bg-primary-600 transition-colors
                  "
                >
                  <Eye className="w-5 h-5" />
                  Reveal Answer
                </button>
              ) : (
                <>
                  {/* Correct answer */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                      Correct translation:
                    </p>
                    <p className="text-lg text-green-800 dark:text-green-200">
                      {currentSentence.target}
                    </p>
                  </div>

                  {/* Self-assessment buttons */}
                  {!currentProgress?.assessment && (
                    <div className="space-y-3">
                      <p className="text-center text-sm text-stone-600 dark:text-stone-400">
                        How did you do?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAssessment('needs-practice')}
                          className="
                            flex-1 flex items-center justify-center gap-2
                            px-4 py-3 rounded-xl
                            bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300
                            font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50
                            transition-colors
                          "
                        >
                          <RotateCcw className="w-4 h-4" />
                          Needs Practice
                        </button>

                        <button
                          onClick={() => handleAssessment('correct')}
                          className="
                            flex-1 flex items-center justify-center gap-2
                            px-4 py-3 rounded-xl
                            bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300
                            font-medium hover:bg-green-200 dark:hover:bg-green-900/50
                            transition-colors
                          "
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Got It!
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Already assessed - show navigation */}
                  {currentProgress?.assessment && (
                    <div className="flex gap-3">
                      <button
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                        className="
                          px-4 py-3 rounded-xl
                          bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300
                          font-medium disabled:opacity-50
                          hover:bg-stone-200 dark:hover:bg-stone-700
                          transition-colors
                        "
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={goToNext}
                        className="
                          flex-1 flex items-center justify-center gap-2
                          px-4 py-3 rounded-xl
                          bg-primary-500 text-white font-medium
                          hover:bg-primary-600 transition-colors
                        "
                      >
                        {currentIndex < sentences.length - 1 ? 'Next' : 'Finish'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-2xl mx-auto flex justify-center gap-1.5 flex-wrap">
          {sentences.slice(0, 20).map((sentence, i) => {
            const p = progress.get(sentence.id);
            return (
              <button
                key={sentence.id}
                onClick={() => setCurrentSentenceIndex(i)}
                className={`
                  w-2.5 h-2.5 rounded-full transition-colors
                  ${i === currentIndex
                    ? 'bg-primary-500 scale-125'
                    : p?.assessment === 'correct'
                      ? 'bg-green-500'
                      : p?.assessment === 'needs-practice'
                        ? 'bg-amber-500'
                        : 'bg-stone-300 dark:bg-stone-600'
                  }
                `}
              />
            );
          })}
          {sentences.length > 20 && (
            <span className="text-xs text-stone-400 ml-1">+{sentences.length - 20}</span>
          )}
        </div>
      </div>
    </div>
  );
}
