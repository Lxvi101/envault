import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlidePanelProps {
  children: ReactNode;
  isOpen: boolean;
  panelKey?: string;
  className?: string;
  width?: string;
}

const panelVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function SlidePanel({
  children,
  isOpen,
  panelKey,
  className,
  width = '400px',
}: SlidePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/20 z-40"
          />
          <motion.div
            key={panelKey}
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width }}
            className={`absolute right-0 top-0 bottom-0 z-50 bg-vault-surface border-l border-vault-border shadow-2xl overflow-y-auto ${className ?? ''}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
