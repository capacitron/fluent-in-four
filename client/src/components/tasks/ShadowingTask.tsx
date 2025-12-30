import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, Play, RotateCcw, ChevronRight } from 'lucide-react';
import { useLessonStore, Sentence } from '../../stores/lessonStore';
import { useRecordingStore } from '../../stores/recordingStore';
import { SentenceDisplay } from '../lessons/SentenceDisplay';
import { VoiceRecorder } from '../audio/VoiceRecorder';
import { RecordingPlayback } from '../audio/RecordingPlayback';
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

const REPS_PER_SENTENCE = 5;

type Phase = 'ready' | 'playing' | 'countdown' | 'recording' | 'review';

export function ShadowingTask({ lesson, sentences, onComplete }: TaskProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [countdownValue, setCountdownValue] = useState(3);
  const [repsCompleted, setRepsCompleted] = useState<Map<string, number>>(new Map());
  const [currentRecording, setCurrentRecording] = useState<Blob | null>(null);

  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const setCurrentSentenceIndex = useLessonStore((s) => s.setCurrentSentenceIndex);
  const addRecording = useRecordingStore((s) => s.addRecording);
  const initRecordingStore = useRecordingStore((s) => s.initialize);

  const countdownRef = useRef<number | null>(null);

  const currentSentence = sentences[currentIndex];
  const currentReps = repsCompleted.get(currentSentence?.id || '') || 0;

  // Calculate total progress
  const totalRepsNeeded = sentences.length * REPS_PER_SENTENCE;
  const totalRepsCompleted = Array.from(repsCompleted.values()).reduce((a, b) => a + b, 0);
  const isTaskComplete = totalRepsCompleted >= totalRepsNeeded;

  // Audio setup
  const languageCode = lesson.languageId.slice(0, 2);
  const audioSrc = `/audio/${languageCode}-lesson-${lesson.lessonNumber}-long.mp3`;

  const handleAudioEnd = useCallback(() => {
    // Start countdown after audio ends
    setPhase('countdown');
    setCountdownValue(3);
  }, []);

  const { toggle, seek, pause } = useAudio(audioSrc, {
    onEnd: handleAudioEnd,
  });

  // Initialize recording store
  useEffect(() => {
    initRecordingStore();
  }, [initRecordingStore]);

  // Handle countdown
  useEffect(() => {
    if (phase === 'countdown') {
      if (countdownValue > 0) {
        countdownRef.current = window.setTimeout(() => {
          setCountdownValue(countdownValue - 1);
        }, 1000);
      } else {
        setPhase('recording');
      }
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [phase, countdownValue]);

  const playSentenceAudio = useCallback(() => {
    if (!currentSentence) return;

    setPhase('playing');
    seek(currentSentence.shadowingStartMs / 1000);
    toggle();
  }, [currentSentence, seek, toggle]);

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    setCurrentRecording(blob);
    setPhase('review');

    // Save recording
    if (currentSentence) {
      await addRecording({
        lessonId: lesson.id,
        sentenceId: currentSentence.id,
        sentenceNumber: currentSentence.sentenceNumber,
        taskNumber: 2,
        blob,
        duration: 0, // Could calculate from blob if needed
      });
    }
  }, [currentSentence, lesson.id, addRecording]);

  const handleNextRep = useCallback(() => {
    if (!currentSentence) return;

    const newReps = currentReps + 1;
    setRepsCompleted((prev) => new Map(prev).set(currentSentence.id, newReps));
    setCurrentRecording(null);

    if (newReps >= REPS_PER_SENTENCE) {
      // Move to next sentence
      if (currentIndex < sentences.length - 1) {
        setCurrentSentenceIndex(currentIndex + 1);
        setPhase('ready');
      }
    } else {
      setPhase('ready');
    }
  }, [currentSentence, currentReps, currentIndex, sentences.length, setCurrentSentenceIndex]);

  const handleCompare = useCallback(() => {
    // Play original, then recording
    playSentenceAudio();
  }, [playSentenceAudio]);

  const handleReset = () => {
    setPhase('ready');
    setCurrentRecording(null);
    pause();
  };

  if (isTaskComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">
          Shadowing Complete!
        </h2>

        <p className="text-stone-600 dark:text-stone-400 mb-8">
          You shadowed all {sentences.length} sentences {REPS_PER_SENTENCE} times each.
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
              Rep {currentReps + 1} of {REPS_PER_SENTENCE}
            </span>
          </div>

          {/* Rep dots for current sentence */}
          <div className="flex gap-1.5 mb-2">
            {Array.from({ length: REPS_PER_SENTENCE }).map((_, i) => (
              <div
                key={i}
                className={`
                  h-1.5 flex-1 rounded-full transition-colors
                  ${i < currentReps
                    ? 'bg-primary-500'
                    : 'bg-stone-200 dark:bg-stone-700'
                  }
                `}
              />
            ))}
          </div>

          {/* Overall progress */}
          <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(totalRepsCompleted / totalRepsNeeded) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Current sentence */}
          {currentSentence && (
            <SentenceDisplay
              sentence={currentSentence}
              showEnglish={phase !== 'playing'}
              showToggle={false}
              showIndex={false}
              size="lg"
              className="mb-8"
            />
          )}

          {/* Phase-specific UI */}
          {phase === 'ready' && (
            <button
              onClick={playSentenceAudio}
              className="
                w-full flex items-center justify-center gap-3
                px-6 py-4 rounded-xl
                bg-primary-500 text-white font-medium
                hover:bg-primary-600 active:scale-98
                transition-all shadow-lg
              "
            >
              <Play className="w-6 h-6" fill="white" />
              <span>Play & Shadow</span>
            </button>
          )}

          {phase === 'playing' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary-500 animate-pulse" />
              </div>
              <p className="text-stone-600 dark:text-stone-400">
                Listen carefully...
              </p>
            </div>
          )}

          {phase === 'countdown' && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-4xl font-bold text-red-500">
                  {countdownValue}
                </span>
              </div>
              <p className="text-stone-600 dark:text-stone-400">
                Get ready to speak...
              </p>
            </div>
          )}

          {phase === 'recording' && (
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              compact={false}
            />
          )}

          {phase === 'review' && currentRecording && (
            <div className="space-y-4">
              <RecordingPlayback
                recording={{
                  id: 'temp',
                  lessonId: lesson.id,
                  sentenceId: currentSentence?.id || '',
                  sentenceNumber: currentSentence?.sentenceNumber || 0,
                  taskNumber: 2,
                  blob: currentRecording,
                  duration: 0,
                  createdAt: Date.now(),
                }}
                onCompare={handleCompare}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>

                <button
                  onClick={handleNextRep}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  {currentReps + 1 >= REPS_PER_SENTENCE && currentIndex < sentences.length - 1
                    ? 'Next Sentence'
                    : currentReps + 1 >= REPS_PER_SENTENCE
                      ? 'Complete'
                      : 'Continue'
                  }
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
