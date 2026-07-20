import { ProjectCard } from "./project-card";
import { Reveal } from "./reveal";
import { getPublishedProjects } from "@/lib/data/projects";

export async function ProjectsSection() {
  const projects = await getPublishedProjects();

  if (projects.length === 0) {
    return null;
  }

  return (
    <section
      id="proyectos"
      className="flex min-h-screen items-center bg-background py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        <Reveal className="mb-16 max-w-2xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-muted">
            Proyectos
          </p>
          <h2 className="text-balance font-serif text-3xl leading-snug sm:text-4xl md:text-5xl">
            Trabajo seleccionado
          </h2>
        </Reveal>

        <div className="grid gap-16 md:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
