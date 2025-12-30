import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, SkipForward, Volume2, RotateCcw } from 'lucide-react';
import { useLessonStore, Sentence } from '../../stores/lessonStore';
import { SentenceDisplay } from '../lessons/SentenceDisplay';
import { MiniPlayer } from '../audio/AudioPlayer';
import { useAudio } from '../../hooks/useAudio';
import { useAudioStore } from '../../stores/audioStore';

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

export function ScriptoriumTask({ lesson, sentences, onComplete }: TaskProps) {
  const [completedSentences, setCompletedSentences] = useState<Set<string>>(new Set());
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const setCurrentSentenceIndex = useLessonStore((s) => s.setCurrentSentenceIndex);

  const inputRef = useRef<HTMLInputElement>(null);

  const currentSentence = sentences[currentIndex];
  const isTaskComplete = completedSentences.size >= sentences.length;

  // Audio for current sentence
  const languageCode = lesson.languageId.slice(0, 2);
  const audioSrc = `/audio/${languageCode}-lesson-${lesson.lessonNumber}-long.mp3`;

  const { toggle, seek } = useAudio(audioSrc);
  const isPlaying = useAudioStore((s) => s.isPlaying);

  // Play sentence audio
  const playSentenceAudio = useCallback(() => {
    if (currentSentence) {
      seek((currentSentence.audioStartMs ?? 0) / 1000);
      toggle();
    }
  }, [currentSentence, seek, toggle]);

  // Focus input on mount and sentence change
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  // Normalize text for comparison (remove extra spaces, lowercase)
  const normalizeText = (text: string) => {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const handleSubmit = () => {
    if (!currentSentence || !userInput.trim()) return;

    const normalized = normalizeText(userInput);
    const target = normalizeText(currentSentence.target);

    const correct = normalized === target;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setCompletedSentences((prev) => new Set([...prev, currentSentence.id]));
    }
  };

  const handleNext = () => {
    setUserInput('');
    setShowResult(false);

    if (currentIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    setCompletedSentences((prev) => new Set([...prev, currentSentence.id]));
    setShowSkipConfirm(false);
    handleNext();
  };

  const handleRetry = () => {
    setUserInput('');
    setShowResult(false);
    inputRef.current?.focus();
  };

  // Character-by-character feedback
  const renderInputFeedback = () => {
    if (!showResult || !currentSentence) return null;

    const target = currentSentence.target;
    const input = userInput;

    return (
      <div className="font-mono text-lg tracking-wide p-3 bg-stone-50 dark:bg-stone-800 rounded-lg mb-4">
        {input.split('').map((char, i) => {
          const targetChar = target[i] || '';
          const isMatch = char.toLowerCase() === targetChar.toLowerCase();

          return (
            <span
              key={i}
              className={isMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
            >
              {char}
            </span>
          );
        })}
        {input.length < target.length && (
          <span className="text-stone-300 dark:text-stone-600">
            {target.slice(input.length)}
          </span>
        )}
      </div>
    );
  };

  if (isTaskComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">
          Scriptorium Complete!
        </h2>

        <p className="text-stone-600 dark:text-stone-400 mb-8">
          You typed all {sentences.length} sentences correctly.
        </p>

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
              {completedSentences.size} completed
            </span>
          </div>

          <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${(completedSentences.size / sentences.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {/* Current sentence */}
          {currentSentence && (
            <SentenceDisplay
              sentence={currentSentence}
              showEnglish={true}
              showToggle={false}
              showIndex={false}
              size="lg"
              className="mb-6"
            />
          )}

          {/* Play audio button */}
          <div className="mb-6">
            <MiniPlayer onToggle={playSentenceAudio} className="max-w-xs mx-auto" />
          </div>

          {/* Character feedback when showing result */}
          {showResult && renderInputFeedback()}

          {/* Input field */}
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (showResult) {
                    isCorrect ? handleNext() : handleRetry();
                  } else {
                    handleSubmit();
                  }
                }
              }}
              disabled={showResult}
              placeholder="Type the sentence..."
              className="
                w-full px-4 py-3 text-lg rounded-xl
                bg-white dark:bg-stone-800
                border-2 border-stone-200 dark:border-stone-700
                focus:border-primary-500 focus:ring-0
                text-stone-900 dark:text-stone-50
                placeholder:text-stone-400
                disabled:opacity-60
                transition-colors
              "
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!showResult ? (
              <>
                <button
                  onClick={() => setShowSkipConfirm(true)}
                  className="px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Check
                </button>
              </>
            ) : isCorrect ? (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
              >
                {currentIndex < sentences.length - 1 ? 'Next Sentence' : 'Complete Task'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>

                <button
                  onClick={() => setShowSkipConfirm(true)}
                  className="px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Result message */}
          {showResult && (
            <p className={`text-center mt-4 font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? 'Correct!' : 'Not quite right. Try again or skip.'}
            </p>
          )}
        </div>
      </div>

      {/* Skip confirmation modal */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-2">
              Skip Sentence?
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              This sentence will be marked as complete. You can always practice again later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-2 rounded-lg bg-primary-500 text-white font-medium"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
