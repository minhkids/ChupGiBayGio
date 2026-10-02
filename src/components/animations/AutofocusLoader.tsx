import { motion } from 'framer-motion';

export const AutofocusLoader = () => {
  return (
    <div className="relative w-full h-44 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-700">
      {/* Vệt sáng shimmer lướt nhẹ */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Khung ngắm AF Reticle máy ảnh */}
      <motion.div
        className="relative w-16 h-16 flex items-center justify-center"
        animate={{ scale: [1.15, 0.95, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* 4 góc khung lấy nét */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500" />

        {/* Chấm đo nét ở tâm chuyển màu khi lock focus */}
        <motion.span
          className="w-1.5 h-1.5 rounded-full"
          animate={{ backgroundColor: ['#ef4444', '#10b981', '#ef4444'] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        
        <span className="absolute -bottom-5 text-[9px] font-mono tracking-widest text-neutral-400">
          AF-LOCK
        </span>
      </motion.div>
    </div>
  );
};
