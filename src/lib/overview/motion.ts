export const overviewStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const overviewFadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const overviewCardHover = {
  rest: { y: 0, boxShadow: "0 1px 2px rgb(0 0 0 / 0.04)" },
  hover: {
    y: -2,
    boxShadow: "0 8px 24px rgb(0 0 0 / 0.06)",
    transition: { duration: 0.2 },
  },
};
