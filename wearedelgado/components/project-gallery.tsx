"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

type GalleryImage = {
  url: string;
  alt: string;
};

export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
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
  }

  if (images.length === 0) return null;

  const current = images[index];
  const slideDistance = prefersReducedMotion ? 0 : 32;

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
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: dir * slideDistance }),
              center: { opacity: 1, x: 0 },
              exit: (dir: number) => ({ opacity: 0, x: dir * -slideDistance }),
            }}
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
              priority={index === 0}
              className="object-cover"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Imagen anterior"
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
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Imagen siguiente"
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
            </button>

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
              className={`relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-sm border transition-colors ${
                i === index
                  ? "border-accent-ink"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={image.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
