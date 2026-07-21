"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ParallaxImage } from "./parallax-image";
import type { Project } from "@/lib/data/projects";

export function NextProjectLink({ project }: { project: Project }) {
  return (
    <Link
      href={`/proyectos/${project.id}`}
      className="group grid cursor-pointer items-center gap-8 focus-visible:outline-none sm:grid-cols-[1fr_auto]"
    >
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-muted">
          Siguiente proyecto
        </p>
        <h2 className="text-balance font-serif text-3xl leading-snug transition-colors group-hover:text-accent-ink sm:text-5xl">
          {project.name}
        </h2>
        <p className="mt-3 text-sm text-muted">{project.category}</p>
      </div>

      <motion.div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-background-alt sm:w-56"
        whileHover="hover"
        initial="rest"
        animate="rest"
      >
        {project.image_url ? (
          <motion.div
            variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            className="absolute inset-0"
          >
            <Image
              src={project.image_url}
              alt={project.image_alt ?? project.name}
              fill
              className="object-cover"
              sizes="224px"
            />
          </motion.div>
        ) : (
          <ParallaxImage label={project.name} className="h-full w-full" />
        )}
      </motion.div>
    </Link>
  );
}
