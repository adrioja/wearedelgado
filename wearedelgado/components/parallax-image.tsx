"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ParallaxImage({
  className = "",
  label,
}: {
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = prefersReducedMotion ? [0, 0] : [-40, 40];
  const y = useTransform(scrollYProgress, [0, 1], range);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-[10%] -bottom-[10%] flex items-center justify-center bg-gradient-to-br from-background-alt to-border"
      >
        <span className="font-serif text-sm tracking-[0.2em] text-muted uppercase">
          {label}
        </span>
      </motion.div>
    </div>
  );
}
