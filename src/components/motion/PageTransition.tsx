import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from './variants';

interface PageTransitionProps {
  children: ReactNode;
  transitionKey: string;
  className?: string;
}

export function PageTransition({ children, transitionKey, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
