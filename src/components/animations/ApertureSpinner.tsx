import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  size?: number;
  label?: string;
}

export const ApertureSpinner: React.FC<Props> = ({ size = 44, label = 'Đang đo sáng & tìm góc...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Vòng ngoài ống kính */}
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-800" />
        
        {/* Vòng lá khẩu xoay & co giãn */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full text-neutral-900 dark:text-neutral-100 fill-none stroke-current"
          strokeWidth="3.5"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        >
          {/* 6 cánh lá khẩu đan xen */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <motion.path
              key={i}
              d="M 50 12 L 82 68"
              transform={`rotate(${deg} 50 50)`}
              animate={{
                strokeDashoffset: [0, 15, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
          <circle cx="50" cy="50" r="10" className="fill-amber-500 stroke-none" />
        </motion.svg>
      </div>

      {label && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-xs font-mono tracking-wider text-neutral-500 uppercase"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};
