import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cameraSpring } from '../utils/motion-tokens';

interface PaletteSwatchProps {
  hex: string;
  size?: 'sm' | 'md' | 'lg';
  showHexText?: boolean;
  className?: string;
}

export const PaletteSwatch: React.FC<PaletteSwatchProps> = ({
  hex,
  size = 'md',
  showHexText = false,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  }[size];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // Trigger haptic if available on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }

    // Copy to clipboard
    navigator.clipboard.writeText(hex).catch(() => {});

    // Ripple coordinate
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples(prev => [...prev.slice(-2), newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  return (
    <div className={`relative inline-flex items-center space-x-1.5 ${className}`}>
      <motion.button
        type="button"
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
        transition={cameraSpring.tactile}
        title={`Mã màu: ${hex} (Bấm để sao chép)`}
        style={{ backgroundColor: hex }}
        className={`${sizeClasses} rounded-full border border-slateInk/40 relative overflow-hidden shadow-xs hover:scale-110 cursor-pointer focus:outline-none focus:ring-1 focus:ring-terracotta transition-transform`}
      >
        {/* Ripple effect */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none bg-white/60 animate-ping"
            style={{
              width: 24,
              height: 24,
              left: ripple.x - 12,
              top: ripple.y - 12
            }}
          />
        ))}
      </motion.button>

      {showHexText && (
        <span className="font-mono-spec text-[10px] text-slateInk uppercase">
          {hex}
        </span>
      )}

      {/* Floating Copied Tooltip with 8px upward slide */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.85 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-1.5 py-0.5 bg-slateInk text-white font-mono-spec text-[9px] font-bold rounded-xs shadow-hard whitespace-nowrap"
          >
            Copied {hex}!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
