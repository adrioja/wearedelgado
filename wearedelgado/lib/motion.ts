import type { Transition, Variants } from "framer-motion";

export const softSpring: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 20,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const heroFadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const viewportOnce = { once: true, amount: 0.4 };
