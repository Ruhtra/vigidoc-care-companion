import { type Variants } from "framer-motion";

/**
 * Reusable Framer Motion animation variants
 * following project rules for cohesive, organic animations.
 */

// --- Fade + Slide Up (general purpose) ---
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut", delay },
  }),
};

// --- Stagger container ---
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// --- Scale on hover (cards) ---
export const cardHover: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

// --- Stat counter pop ---
export const statPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

// --- Slide in from left/right ---
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

/* ==========================================================================
   AUTH PAGE VARIANTS
   Smooth, organic transitions for the authentication experience.
   ========================================================================== */

// --- Form flow slide (switching between login / register / forgot) ---
export const formSlideIn: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.97,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

// --- Staggered input field reveal ---
export const inputStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

export const inputReveal: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// --- Floating orb for branding panel background ---
export const floatingOrb: Variants = {
  animate: (i: number) => ({
    y: [0, -20, 10, -15, 0],
    x: [0, 15, -10, 20, 0],
    scale: [1, 1.05, 0.95, 1.03, 1],
    transition: {
      duration: 8 + i * 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  }),
};

// --- Pulse ring for custom loading spinner ---
export const pulseRing: Variants = {
  animate: {
    scale: [1, 1.4, 1],
    opacity: [0.6, 0, 0.6],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// --- Success checkmark draw ---
export const checkmarkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
};

// --- Soft scale-in (for success messages, modals) ---
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
