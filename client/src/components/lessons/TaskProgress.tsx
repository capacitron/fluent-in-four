import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface TaskProgressProps {
  completed: boolean[];
  size?: 'sm' | 'md';
  showLabels?: boolean;
}

const TASK_LABELS = ['Listen', 'Shadow', 'Write', 'Translate', 'Speak'];

export function TaskProgress({
  completed,
  size = 'md',
  showLabels = false,
}: TaskProgressProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
  };

  const iconSize = {
    sm: 10,
    md: 14,
  };

  return (
    <div className="flex items-center gap-1.5">
      {completed.map((isComplete, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <motion.div
            className={`
              ${sizeClasses[size]}
              rounded-full
              flex items-center justify-center
              transition-colors
              ${
                isComplete
                  ? 'bg-green-500 text-white'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
              }
            `}
            initial={false}
            animate={
              isComplete
                ? { scale: [1, 1.2, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.3 }}
          >
            {isComplete && (
              <Check
                size={iconSize[size]}
                strokeWidth={3}
              />
            )}
          </motion.div>
          {showLabels && (
            <span className="text-[10px] text-stone-500 dark:text-stone-400">
              {TASK_LABELS[index]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Compact inline version showing as dots
interface TaskDotsProps {
  completed: boolean[];
}

export function TaskDots({ completed }: TaskDotsProps) {
  return (
    <div className="flex items-center gap-1">
      {completed.map((isComplete, index) => (
        <div
          key={index}
          className={`
            w-2 h-2 rounded-full transition-colors
            ${
              isComplete
                ? 'bg-green-500'
                : 'bg-stone-300 dark:bg-stone-600'
            }
          `}
        />
      ))}
    </div>
  );
}
