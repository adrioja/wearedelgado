"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, fadeUpReduced, softSpring, viewportOnce } from "@/lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? fadeUpReduced : fadeUp;
  const transition = prefersReducedMotion
    ? { duration: 0.3, delay }
    : { ...softSpring, delay };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
