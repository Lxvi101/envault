import { type ReactNode, Children } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listContainerVariants, listItemVariants } from './variants';

interface ListAnimationProps {
  children: ReactNode;
  listKey?: string;
  className?: string;
}

export function ListAnimation({ children, listKey, className }: ListAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={listKey}
        variants={listContainerVariants}
        initial="initial"
        animate="animate"
        className={className}
      >
        {Children.map(children, (child, index) => (
          <motion.div key={index} variants={listItemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
