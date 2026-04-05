import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right';

interface FadeInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
}

const directionOffsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
};

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.4,
  className,
}: FadeInProps) {
  const offset = directionOffsets[direction];

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
