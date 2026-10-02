import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isSaved?: boolean;
  onToggle?: (saved: boolean) => void;
  className?: string;
}

export const AnimatedBookmark: React.FC<Props> = ({ 
  isSaved: externalSaved, 
  onToggle,
  className = ''
}) => {
  const [internalSaved, setInternalSaved] = useState(false);
  const isSaved = externalSaved !== undefined ? externalSaved : internalSaved;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isSaved;
    if (externalSaved === undefined) {
      setInternalSaved(nextState);
    }
    if (onToggle) onToggle(nextState);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.8 }}
      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
        isSaved 
          ? 'bg-amber-500 text-white shadow-md' 
          : 'bg-white/80 dark:bg-black/60 hover:bg-white text-neutral-700 dark:text-neutral-200'
      } ${className}`}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="w-4 h-4 fill-current stroke-current"
        strokeWidth="1.5"
        animate={{
          scale: isSaved ? [1, 1.35, 1] : 1,
          rotate: isSaved ? [0, -12, 12, 0] : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </motion.svg>
    </motion.button>
  );
};
