"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { heroFadeUp, softSpring } from "@/lib/motion";
import { ArrowLink } from "./arrow-link";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section
      id="top"
      className="relative flex h-[100svh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-foreground text-white"
    >
      {!videoFailed && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={!prefersReducedMotion}
          muted
          loop
          playsInline
          poster="/video/hero-poster.jpg"
          onError={() => setVideoFailed(true)}
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
      )}

      {videoFailed && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <motion.p
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate="visible"
          variants={heroFadeUp}
          transition={softSpring}
          className="mb-6 text-xs uppercase tracking-[0.35em] text-white/80"
        >
          Estudio de diseño y marca
        </motion.p>

        <motion.h1
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate="visible"
          variants={heroFadeUp}
          transition={{ ...softSpring, delay: 0.1 }}
          className="text-balance font-serif text-4xl leading-tight sm:text-6xl md:text-7xl"
        >
          Diseñamos marcas que permanecen
        </motion.h1>

        <motion.p
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate="visible"
          variants={heroFadeUp}
          transition={{ ...softSpring, delay: 0.2 }}
          className="mt-6 max-w-xl text-balance text-base text-white/80 sm:text-lg"
        >
          Branding, diseño web y dirección de arte para marcas con vocación de
          futuro.
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate="visible"
          variants={heroFadeUp}
          transition={{ ...softSpring, delay: 0.3 }}
          className="mt-10"
        >
          <ArrowLink href="#estudio" className="text-white">
            Descubre el estudio
          </ArrowLink>
        </motion.div>
      </div>

      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <span className="block h-10 w-px animate-pulse bg-white/60 motion-reduce:animate-none" />
      </motion.div>
    </section>
  );
}
