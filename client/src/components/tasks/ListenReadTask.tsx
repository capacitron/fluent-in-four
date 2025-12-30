import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, RotateCcw, Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { useAudioStore } from '../../stores/audioStore';
import { useLessonStore, Sentence } from '../../stores/lessonStore';
import { AudioPlayer } from '../audio/AudioPlayer';
import { PlaybackControls } from '../audio/PlaybackControls';
import { SentencePreview } from '../lessons/SentenceDisplay';

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

const REQUIRED_LISTENS = 5;

export function ListenReadTask({ lesson, sentences, onComplete }: TaskProps) {
  const [listenCount, setListenCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [autoLoop, setAutoLoop] = useState(false);

  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const setCurrentSentenceIndex = useLessonStore((s) => s.setCurrentSentenceIndex);
  const currentTime = useAudioStore((s) => s.currentTime);

  // Construct audio URL (short audio for Listen & Read)
  // In production, this would come from the lesson data
  const languageCode = lesson.languageId.slice(0, 2); // Simplified
  const audioSrc = `/audio/${languageCode}-lesson-${lesson.lessonNumber}-short.mp3`;

  const handleAudioEnd = useCallback(() => {
    const newCount = listenCount + 1;
    setListenCount(newCount);

    if (newCount >= REQUIRED_LISTENS) {
      setIsCompleted(true);
    } else if (autoLoop) {
      // Will restart via the audio hook
    }
  }, [listenCount, autoLoop]);

  const { toggle, seekPercent, isPlaying } = useAudio(audioSrc, {
    onEnd: handleAudioEnd,
  });

  // Update current sentence based on audio position
  useEffect(() => {
    if (sentences.length === 0) return;

    const currentTimeMs = currentTime * 1000;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (currentTimeMs >= sentence.audioStartMs && currentTimeMs < sentence.audioEndMs) {
        if (i !== currentIndex) {
          setCurrentSentenceIndex(i);
        }
        break;
      }
    }
  }, [currentTime, sentences, currentIndex, setCurrentSentenceIndex]);

  const handleSentenceClick = (index: number) => {
    const sentence = sentences[index];
    if (sentence) {
      const seekTime = sentence.audioStartMs / 1000;
      const duration = useAudioStore.getState().duration;
      if (duration > 0) {
        const percent = (seekTime / duration) * 100;
        seekPercent(percent);
      }
      setCurrentSentenceIndex(index);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">
          Task Complete!
        </h2>

        <p className="text-stone-600 dark:text-stone-400 mb-8">
          You listened through all {sentences.length} sentences {REQUIRED_LISTENS} times.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onComplete}
            className="w-full px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            Continue to Next Task
          </button>

          <button
            onClick={() => {
              setListenCount(0);
              setIsCompleted(false);
            }}
            className="w-full px-6 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress header */}
      <div className="px-4 py-3 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Listen {listenCount + 1} of {REQUIRED_LISTENS}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-stone-500 dark:text-stone-400">Auto-loop</span>
              <input
                type="checkbox"
                checked={autoLoop}
                onChange={(e) => setAutoLoop(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-primary-500 focus:ring-primary-500"
              />
            </label>
          </div>

          {/* Listen progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: REQUIRED_LISTENS }).map((_, i) => (
              <div
                key={i}
                className={`
                  h-1.5 flex-1 rounded-full transition-colors
                  ${i < listenCount
                    ? 'bg-primary-500'
                    : i === listenCount && isPlaying
                      ? 'bg-primary-300 dark:bg-primary-700'
                      : 'bg-stone-200 dark:bg-stone-700'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sentence list */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-2">
          {sentences.map((sentence, index) => (
            <SentencePreview
              key={sentence.id}
              sentence={sentence}
              isActive={index === currentIndex}
              onClick={() => handleSentenceClick(index)}
            />
          ))}
        </div>
      </div>

      {/* Audio player */}
      <div className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-2xl mx-auto">
          <AudioPlayer onToggle={toggle} onSeek={seekPercent} />
          <div className="px-4 pb-4">
            <PlaybackControls compact />
          </div>
        </div>
      </div>
    </div>
  );
}
