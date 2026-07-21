import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLink } from "@/components/arrow-link";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NextProjectLink } from "@/components/next-project-link";
import { ProjectGallery } from "@/components/project-gallery";
import { Reveal } from "@/components/reveal";
import { getNextPublishedProject, getPublishedProjectDetail } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getSocialLinks } from "@/lib/data/social-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getPublishedProjectDetail(id);

  if (!project) {
    return { title: "Proyecto no encontrado — We Are Delgado" };
  }

  const description =
    project.highlight ??
    project.description ??
    `${project.name} — ${project.category}. Un proyecto de We Are Delgado.`;

  return {
    title: `${project.name} — We Are Delgado`,
    description,
    openGraph: {
      title: `${project.name} — We Are Delgado`,
      description,
      type: "article",
      images: project.image_url ? [project.image_url] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, settings, socialLinks] = await Promise.all([
    getPublishedProjectDetail(id),
    getSiteSettings(),
    getSocialLinks(),
  ]);

  if (!project) {
    notFound();
  }

  const nextProject = await getNextPublishedProject(project.id);

  const galleryImages = [
    project.image_url
      ? { url: project.image_url, alt: project.image_alt ?? project.name }
      : null,
    ...project.images.map((image) => ({
      url: image.url,
      alt: image.alt ?? project.name,
    })),
  ].filter((image): image is { url: string; alt: string } => image !== null);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative flex h-[70svh] min-h-[420px] w-full items-end overflow-hidden bg-foreground text-white">
          {project.image_url ? (
            <ViewTransition name={`project-image-${project.id}`}>
              <Image
                src={project.image_url}
                alt={project.image_alt ?? project.name}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </ViewTransition>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40"
          />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14 sm:px-10">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/80">
              {project.category}
            </p>
            <h1 className="text-balance font-serif text-4xl leading-[1.05] sm:text-6xl md:text-7xl">
              {project.name}
            </h1>
            {(project.client || project.year) && (
              <p className="mt-4 text-sm text-white/70">
                {[project.client, project.year].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </section>

        <div className="border-b border-border bg-background py-6">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
            <ArrowLink href="/#proyectos" className="text-sm">
              Volver a proyectos
            </ArrowLink>
          </div>
        </div>

        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto w-full max-w-3xl px-6 text-center sm:px-10">
            <Reveal>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-muted">
                Info
              </p>

              {project.highlight ? (
                <p className="text-pretty font-serif text-2xl leading-relaxed sm:text-4xl">
                  {project.highlight}
                </p>
              ) : project.description ? (
                <p className="text-pretty font-serif text-2xl leading-relaxed sm:text-4xl">
                  {project.description}
                </p>
              ) : (
                <p className="text-pretty font-serif text-2xl leading-relaxed sm:text-4xl">
                  {project.name}
                </p>
              )}

              {project.highlight && project.description && (
                <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted">
                  {project.description}
                </p>
              )}
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="mx-auto mt-14 flex flex-wrap items-start justify-center gap-x-10 gap-y-6 border-t border-border pt-10 text-sm">
                <div className="flex flex-col items-center gap-1.5">
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted">
                    Categoría
                  </dt>
                  <dd>{project.category}</dd>
                </div>
                {project.client && (
                  <div className="flex flex-col items-center gap-1.5">
                    <dt className="text-xs uppercase tracking-[0.2em] text-muted">
                      Cliente
                    </dt>
                    <dd>{project.client}</dd>
                  </div>
                )}
                {project.year && (
                  <div className="flex flex-col items-center gap-1.5">
                    <dt className="text-xs uppercase tracking-[0.2em] text-muted">
                      Año
                    </dt>
                    <dd>{project.year}</dd>
                  </div>
                )}
                {project.services.length > 0 && (
                  <div className="flex flex-col items-center gap-1.5">
                    <dt className="text-xs uppercase tracking-[0.2em] text-muted">
                      Servicios
                    </dt>
                    <dd className="flex flex-wrap justify-center gap-1.5">
                      {project.services.map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-border px-3 py-1 text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </Reveal>

            <Reveal delay={0.18} className="mt-10">
              <ArrowLink href="/#contacto">Hablemos de tu proyecto</ArrowLink>
            </Reveal>
          </div>
        </section>

        <section className="bg-background-alt py-20 sm:py-28">
          <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
            <Reveal className="mb-12 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-muted">
                Galería
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              {galleryImages.length > 0 ? (
                <ProjectGallery images={galleryImages} />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-sm bg-background text-sm text-muted">
                  Sin imágenes todavía
                </div>
              )}
            </Reveal>
          </div>
        </section>

        {nextProject && (
          <section className="border-t border-border bg-background py-20 sm:py-28">
            <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
              <Reveal>
                <NextProjectLink project={nextProject} />
              </Reveal>
            </div>
          </section>
        )}

        <ContactSection settings={settings} />
      </main>
      <Footer socialLinks={socialLinks} />
    </>
  );
}
