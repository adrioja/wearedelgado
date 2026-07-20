"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ParallaxImage } from "./parallax-image";
import type { Project } from "@/lib/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="group block cursor-pointer focus-visible:outline-none"
    >
      <motion.div
        className="relative mb-6 aspect-[3/4] w-full overflow-hidden rounded-sm bg-background-alt"
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        {project.image_url ? (
          <motion.div
            variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            className="absolute inset-0"
          >
            <Image
              src={project.image_url}
              alt={project.image_alt ?? project.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </motion.div>
        ) : (
          <ParallaxImage label={project.name} className="h-full w-full" />
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
          <span className="text-sm font-medium tracking-wide">Ver proyecto</span>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path
              d="M4 12h16m0 0-6-6m6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>

      <h3 className="font-serif text-xl transition-colors group-hover:text-accent-ink">
        {project.name}
      </h3>
      <p className="mb-4 text-sm text-muted">{project.category}</p>
      <span className="inline-flex items-center gap-2 text-sm text-accent-ink">
        Ver proyecto
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1"
        >
          <path
            d="M4 12h16m0 0-6-6m6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
