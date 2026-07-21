"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ParallaxImage } from "./parallax-image";
import type { Catalog } from "@/lib/data/catalogs";

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CatalogCard({ catalog, index = 0 }: { catalog: Catalog; index?: number }) {
  const fileSize = formatFileSize(catalog.file_size_bytes);

  return (
    <a
      href={`/catalogos/${catalog.id}/descarga`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block cursor-pointer focus-visible:outline-none"
    >
      <motion.div
        className="relative mb-6 aspect-[3/4] w-full overflow-hidden rounded-sm bg-background-alt"
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        <span
          aria-hidden="true"
          className="absolute left-4 top-4 z-10 font-serif text-sm text-white/90 mix-blend-difference"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {catalog.cover_image_url ? (
          <motion.div
            variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            className="absolute inset-0"
          >
            <Image
              src={catalog.cover_image_url}
              alt={catalog.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </motion.div>
        ) : (
          <ParallaxImage label="PDF" className="h-full w-full" />
        )}

        <motion.div
          aria-hidden="true"
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-black/25"
        />

        <motion.div
          aria-hidden="true"
          variants={{
            rest: { opacity: 0, y: 8 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.25 }}
          className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-4 text-white"
        >
          <span className="text-sm font-medium tracking-wide">Descargar PDF</span>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path
              d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>

      <h3 className="font-serif text-xl transition-colors group-hover:text-accent-ink">
        {catalog.name}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-muted">
        {catalog.description || "Catálogo descargable"}
      </p>
      <span className="inline-flex items-center gap-2 text-sm text-accent-ink">
        Descargar PDF{fileSize ? ` · ${fileSize}` : ""}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-y-0.5"
        >
          <path
            d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}
