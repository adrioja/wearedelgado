"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type GalleryImage = {
  url: string;
  alt: string;
};

export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex === index) return;
      setDirection(nextIndex > index ? 1 : -1);
      setIndex(((nextIndex % images.length) + images.length) % images.length);
    },
    [index, images.length]
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") goPrev();
    if (event.key === "ArrowRight") goNext();
    if (event.key === "Enter") setIsLightboxOpen(true);
  }

  useEffect(() => {
    if (!isLightboxOpen) return;

    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isLightboxOpen, goPrev, goNext]);

  if (images.length === 0) return null;

  const current = images[index];
  const slideDistance = prefersReducedMotion ? 0 : 32;

  const stageVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * slideDistance }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -slideDistance }),
  };

  return (
    <div
      role="group"
      aria-roledescription="carrusel"
      aria-label="Galería del proyecto"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-background-alt sm:aspect-[4/3]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="absolute inset-0 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Ver imagen a pantalla completa"
              className="group absolute inset-0 cursor-zoom-in"
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                animate={{ scale: prefersReducedMotion ? 1 : 1.06 }}
                transition={{ duration: 6, ease: "easeOut" }}
              >
                <Image
                  src={current.url}
                  alt={current.alt}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              </motion.div>
              <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path
                    d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4m11-5v4a1 1 0 0 1-1 1h-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Ampliar
              </span>
            </button>
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <motion.button
              type="button"
              onClick={goPrev}
              aria-label="Imagen anterior"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-foreground transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M15 5 8 12l7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
            <motion.button
              type="button"
              onClick={goNext}
              aria-label="Imagen siguiente"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-foreground transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="m9 5 7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>

            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs tracking-wide text-white">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.url + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === index}
              className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-sm border border-border"
            >
              <Image
                src={image.url}
                alt=""
                fill
                className={`object-cover transition-opacity ${
                  i === index ? "opacity-100" : "opacity-60 hover:opacity-90"
                }`}
                sizes="64px"
              />
              {i === index && (
                <motion.span
                  layoutId="active-thumb-ring"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="pointer-events-none absolute inset-0 rounded-sm ring-2 ring-accent-ink"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${current.alt} — imagen ${index + 1} de ${images.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-10"
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsLightboxOpen(false);
            }}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:top-6"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="relative h-full w-full max-w-6xl">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={index}
                  custom={direction}
                  variants={stageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 220, damping: 28 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.url}
                    alt={current.alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <>
                <motion.button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Imagen anterior"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                    <path
                      d="M15 5 8 12l7 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goNext();
                  }}
                  aria-label="Imagen siguiente"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                    <path
                      d="m9 5 7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-wide text-white">
                  {index + 1} / {images.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
