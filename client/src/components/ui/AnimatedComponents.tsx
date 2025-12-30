import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';

// ============================================
// ANIMATED BUTTON
// ============================================

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const variants = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300',
      secondary:
        'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-50 hover:bg-stone-300 dark:hover:bg-stone-600',
      ghost:
        'bg-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={`
          rounded-lg font-medium transition-colors
          disabled:cursor-not-allowed disabled:opacity-50
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// ============================================
// ANIMATED CARD
// ============================================

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  hoverable?: boolean;
}

export function AnimatedCard({
  children,
  hoverable = true,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED PROGRESS BAR
// ============================================

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'green';
  showLabel?: boolean;
  animated?: boolean;
}

export function AnimatedProgress({
  value,
  max = 100,
  className = '',
  color = 'primary',
  showLabel = false,
  animated = true,
}: AnimatedProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500',
    green: 'bg-green-500',
  };

  return (
    <div className={`relative ${className}`}>
      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colors[color]} rounded-full`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-0 -top-6 text-sm text-stone-600 dark:text-stone-400"
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={value}
      >
        {prefix}
        <motion.span
          initial={{ scale: 1.2, color: '#e67040' }}
          animate={{ scale: 1, color: 'inherit' }}
          transition={{ duration: 0.3 }}
        >
          {value.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER CHILDREN
// ============================================

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PULSE ANIMATION (for attention)
// ============================================

export function PulseRing({
  active,
  color = 'primary',
  children,
}: {
  active: boolean;
  color?: 'primary' | 'secondary' | 'accent' | 'red';
  children: ReactNode;
}) {
  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500',
    red: 'bg-red-500',
  };

  return (
    <div className="relative inline-flex">
      {active && (
        <motion.span
          className={`absolute inset-0 rounded-full ${colors[color]} opacity-75`}
          animate={{
            scale: [1, 1.5],
            opacity: [0.75, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
      {children}
    </div>
  );
}

// ============================================
// SHAKE ANIMATION (for errors)
// ============================================

export function ShakeContainer({
  shake,
  children,
  className = '',
}: {
  shake: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={
        shake
          ? {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.4 },
            }
          : {}
      }
    >
      {children}
    </motion.div>
  );
}

// ============================================
// BOUNCE IN
// ============================================

export function BounceIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
