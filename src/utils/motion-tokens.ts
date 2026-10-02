import type { Transition, Variants } from 'framer-motion';

// Camera Mechanics & Tactile Physics Spring Configs
export const cameraSpring = {
  // Lực nảy dứt khoát, tự nhiên cho các nút bấm, modal, drawer
  tactile: {
    type: "spring" as const,
    stiffness: 400,
    damping: 28,
    mass: 0.8
  },
  // Chuyển động lướt êm dịu cho danh sách ảnh và slide
  smoothScroll: {
    type: "spring" as const,
    stiffness: 220,
    damping: 32
  },
  // Hiệu ứng mở màn trập / bung ảnh
  shutterReveal: {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1] as const // Custom cubic-bezier (snappy decelerate)
  }
} satisfies Record<string, Transition>;

// Variants cho danh sách bài đăng & grid địa điểm (Stagger effect)
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: cameraSpring.tactile
  }
};

// Shutter reveal modal animation
export const modalShutterVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.96,
    y: 12
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      ...cameraSpring.tactile,
      opacity: { duration: 0.25 }
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.97,
    y: 8,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  }
};

// Backdrop blur animation
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.25 }
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.2 }
  }
};
