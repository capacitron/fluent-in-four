import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Eye, ThumbsUp, RotateCcw, ChevronRight, Mic } from 'lucide-react';
import { useLessonStore, Sentence } from '../../stores/lessonStore';
import { useRecordingStore } from '../../stores/recordingStore';
import { VoiceRecorder } from '../audio/VoiceRecorder';
import { RecordingPlayback } from '../audio/RecordingPlayback';

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
type Phase = 'prompt' | 'recording' | 'review' | 'revealed';

const PASSES_REQUIRED = 5;

export function TranslationVerbalTask({ lesson, sentences, onComplete }: TaskProps) {
  const [currentPass, setCurrentPass] = useState(1);
  const [phase, setPhase] = useState<Phase>('prompt');
  const [currentRecording, setCurrentRecording] = useState<Blob | null>(null);
  const [assessments, setAssessments] = useState<Map<string, AssessmentResult[]>>(new Map());

  const currentIndex = useLessonStore((s) => s.currentSentenceIndex);
  const setCurrentSentenceIndex = useLessonStore((s) => s.setCurrentSentenceIndex);
  const addRecording = useRecordingStore((s) => s.addRecording);
  const initRecordingStore = useRecordingStore((s) => s.initialize);

  const currentSentence = sentences[currentIndex];

  // Calculate progress
  const totalSentencesThisPass = Array.from(assessments.values()).filter(
    (a) => a.length >= currentPass
  ).length;
  const isPassComplete = totalSentencesThisPass >= sentences.length;
  const isTaskComplete = currentPass > PASSES_REQUIRED || (currentPass === PASSES_REQUIRED && isPassComplete);

  // Initialize recording store
  useEffect(() => {
    initRecordingStore();
  }, [initRecordingStore]);

  // Reset phase when changing sentences
  useEffect(() => {
    setPhase('prompt');
    setCurrentRecording(null);
  }, [currentIndex, currentPass]);

  const handleStartRecording = () => {
    setPhase('recording');
  };

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    setCurrentRecording(blob);
    setPhase('review');

    // Save recording
    if (currentSentence) {
      await addRecording({
        lessonId: lesson.id,
        sentenceId: currentSentence.id,
        sentenceNumber: currentSentence.sentenceNumber,
        taskNumber: 5,
        blob,
        duration: 0,
      });
    }
  }, [currentSentence, lesson.id, addRecording]);

  const handleReveal = () => {
    setPhase('revealed');
  };

  const handleAssessment = (result: AssessmentResult) => {
    if (!currentSentence) return;

    setAssessments((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(currentSentence.id) || [];
      updated.set(currentSentence.id, [...existing, result]);
      return updated;
    });

    // Move to next sentence or next pass
    if (currentIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentIndex + 1);
    } else if (currentPass < PASSES_REQUIRED) {
      // Start next pass
      setCurrentPass(currentPass + 1);
      setCurrentSentenceIndex(0);
    }
  };

  if (isTaskComplete) {
    const allAssessments = Array.from(assessments.values()).flat();
    const correctCount = allAssessments.filter((a) => a === 'correct').length;
    const needsPracticeCount = allAssessments.filter((a) => a === 'needs-practice').length;

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">
          Verbal Translation Complete!
        </h2>

        <p className="text-stone-600 dark:text-stone-400 mb-4">
          You completed {PASSES_REQUIRED} passes through all {sentences.length} sentences.
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
          Complete Lesson
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
              Pass {currentPass} of {PASSES_REQUIRED}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              Sentence {currentIndex + 1} of {sentences.length}
            </span>
          </div>

          {/* Pass progress dots */}
          <div className="flex gap-1.5 mb-2">
            {Array.from({ length: PASSES_REQUIRED }).map((_, i) => (
              <div
                key={i}
                className={`
                  h-1.5 flex-1 rounded-full transition-colors
                  ${i < currentPass - 1
                    ? 'bg-green-500'
                    : i === currentPass - 1
                      ? 'bg-primary-500'
                      : 'bg-stone-200 dark:bg-stone-700'
                  }
                `}
              />
            ))}
          </div>

          {/* Sentence progress */}
          <div className="h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {currentSentence && (
            <>
              {/* English sentence (prompt) */}
              <div className="bg-white dark:bg-stone-800 rounded-xl p-6 mb-6 border border-stone-200 dark:border-stone-700 text-center">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">
                  Say in {lesson.languageId === 'spanish' ? 'Spanish' : lesson.languageId}:
                </p>
                <p className="text-2xl font-medium text-stone-900 dark:text-stone-50">
                  {currentSentence.english}
                </p>
              </div>

              {/* Phase-specific UI */}
              {phase === 'prompt' && (
                <button
                  onClick={handleStartRecording}
                  className="
                    w-full flex items-center justify-center gap-3
                    px-6 py-4 rounded-xl
                    bg-red-500 text-white font-medium
                    hover:bg-red-600 active:scale-98
                    transition-all shadow-lg
                  "
                >
                  <Mic className="w-6 h-6" />
                  <span>Record Translation</span>
                </button>
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
                      sentenceId: currentSentence.id,
                      sentenceNumber: currentSentence.sentenceNumber,
                      taskNumber: 5,
                      blob: currentRecording,
                      duration: 0,
                      createdAt: Date.now(),
                    }}
                  />

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
                    Reveal Correct Answer
                  </button>
                </div>
              )}

              {phase === 'revealed' && (
                <div className="space-y-4">
                  {/* Correct answer */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 text-center">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                      Correct translation:
                    </p>
                    <p className="text-lg text-green-800 dark:text-green-200">
                      {currentSentence.target}
                    </p>
                  </div>

                  {/* Recording playback */}
                  {currentRecording && (
                    <RecordingPlayback
                      recording={{
                        id: 'temp',
                        lessonId: lesson.id,
                        sentenceId: currentSentence.id,
                        sentenceNumber: currentSentence.sentenceNumber,
                        taskNumber: 5,
                        blob: currentRecording,
                        duration: 0,
                        createdAt: Date.now(),
                      }}
                      compact
                    />
                  )}

                  {/* Self-assessment */}
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
