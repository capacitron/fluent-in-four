import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, ChevronRight, Award } from 'lucide-react';
import { Confetti } from '../ui/Confetti';

interface Achievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

interface CompletionCelebrationProps {
  visible: boolean;
  type: 'task' | 'lesson';
  taskNumber?: number;
  lessonTitle?: string;
  xpEarned: number;
  newLevel?: number;
  newStreak?: number;
  achievements?: Achievement[];
  onContinue: () => void;
}

export function CompletionCelebration({
  visible,
  type,
  taskNumber,
  lessonTitle,
  xpEarned,
  newLevel,
  newStreak,
  achievements = [],
  onContinue,
}: CompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      setStep(0);

      // Animate through steps
      const timers: NodeJS.Timeout[] = [];
      timers.push(setTimeout(() => setStep(1), 300));
      timers.push(setTimeout(() => setStep(2), 600));
      if (newLevel) timers.push(setTimeout(() => setStep(3), 900));
      if (newStreak) timers.push(setTimeout(() => setStep(4), 1200));
      if (achievements.length > 0) timers.push(setTimeout(() => setStep(5), 1500));

      // Stop confetti after a while
      timers.push(setTimeout(() => setShowConfetti(false), 4000));

      return () => timers.forEach(clearTimeout);
    }
  }, [visible, newLevel, newStreak, achievements.length]);

  const taskNames = [
    '',
    'Listen & Read',
    'Shadowing',
    'Scriptorium',
    'Translation Written',
    'Translation Verbal',
  ];

  return (
    <AnimatePresence>
      {visible && (
        <>
          <Confetti active={showConfetti} duration={4000} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onContinue()}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                >
                  <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-10 h-10" />
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  {type === 'lesson' ? 'Lesson Complete!' : 'Task Complete!'}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80"
                >
                  {type === 'lesson'
                    ? lessonTitle || 'Great job!'
                    : taskNumber
                    ? taskNames[taskNumber]
                    : 'Keep up the great work!'}
                </motion.p>
              </div>

              {/* Stats */}
              <div className="p-6 space-y-4">
                {/* XP Earned */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={step >= 1 ? { opacity: 1, x: 0 } : {}}
                  className="flex items-center justify-between p-4 bg-accent-50 dark:bg-accent-900/20 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/40 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    </div>
                    <span className="font-medium text-stone-900 dark:text-stone-50">
                      XP Earned
                    </span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={step >= 1 ? { scale: 1 } : {}}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className="text-2xl font-bold text-accent-600 dark:text-accent-400"
                  >
                    +{xpEarned}
                  </motion.span>
                </motion.div>

                {/* New Level */}
                {newLevel && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={step >= 3 ? { opacity: 1, x: 0 } : {}}
                    className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-medium text-stone-900 dark:text-stone-50">
                        Level Up!
                      </span>
                    </div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={step >= 3 ? { scale: 1 } : {}}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                    >
                      {newLevel}
                    </motion.span>
                  </motion.div>
                )}

                {/* Streak */}
                {newStreak && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={step >= 4 ? { opacity: 1, x: 0 } : {}}
                    className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="font-medium text-stone-900 dark:text-stone-50">
                        {newStreak === 1 ? 'Streak Started!' : 'Streak'}
                      </span>
                    </div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={step >= 4 ? { scale: 1 } : {}}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="text-2xl font-bold text-orange-500"
                    >
                      {newStreak} day{newStreak !== 1 ? 's' : ''}
                    </motion.span>
                  </motion.div>
                )}

                {/* Achievements */}
                {achievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={step >= 5 ? { opacity: 1, y: 0 } : {}}
                    className="space-y-2"
                  >
                    <p className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                      Achievements Unlocked
                    </p>
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.code}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={step >= 5 ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800"
                      >
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center text-lg">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-stone-900 dark:text-stone-50">
                            {achievement.name}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            +{achievement.xpReward} XP
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Continue Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={onContinue}
                  className="w-full mt-4 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mini celebration for task completion (non-blocking)
export function TaskCompleteMini({
  visible,
  xpEarned,
  onComplete,
}: {
  visible: boolean;
  xpEarned: number;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Star className="w-5 h-5" />
            </motion.div>
            <span className="font-semibold">+{xpEarned} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
