import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLink } from "@/components/arrow-link";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProjectGallery } from "@/components/project-gallery";
import { Reveal } from "@/components/reveal";
import { getPublishedProjectDetail } from "@/lib/data/projects";
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
          </div>
        </section>

        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
            <Reveal className="mb-12">
              <ArrowLink href="/#proyectos" className="text-sm">
                Volver a proyectos
              </ArrowLink>
            </Reveal>

            <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-16">
              <div className="md:sticky md:top-32 md:self-start">
                <Reveal>
                  <p className="mb-4 text-xs uppercase tracking-[0.35em] text-muted">
                    Info
                  </p>

                  {project.highlight ? (
                    <p className="text-pretty border-l-2 border-accent pl-5 font-serif text-2xl leading-relaxed sm:text-3xl">
                      {project.highlight}
                    </p>
                  ) : project.description ? (
                    <p className="text-pretty font-serif text-2xl leading-relaxed sm:text-3xl">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-pretty text-lg leading-relaxed text-muted">
                      {project.category}
                    </p>
                  )}

                  {project.highlight && project.description && (
                    <p className="mt-6 text-pretty leading-relaxed text-muted">
                      {project.description}
                    </p>
                  )}
                </Reveal>

                <Reveal delay={0.1}>
                  <dl className="mt-10 flex flex-col gap-4 border-t border-border pt-8 text-sm">
                    <div className="flex justify-between gap-6">
                      <dt className="text-muted">Categoría</dt>
                      <dd className="text-right">{project.category}</dd>
                    </div>
                    {project.client && (
                      <div className="flex justify-between gap-6">
                        <dt className="text-muted">Cliente</dt>
                        <dd className="text-right">{project.client}</dd>
                      </div>
                    )}
                    {project.year && (
                      <div className="flex justify-between gap-6">
                        <dt className="text-muted">Año</dt>
                        <dd className="text-right">{project.year}</dd>
                      </div>
                    )}
                  </dl>
                </Reveal>

                {project.services.length > 0 && (
                  <Reveal delay={0.16}>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {project.services.map((service) => (
                        <li
                          key={service}
                          className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                        >
                          {service}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}

                <Reveal delay={0.22} className="mt-10">
                  <ArrowLink href="/#contacto">Hablemos de tu proyecto</ArrowLink>
                </Reveal>
              </div>

              <Reveal delay={0.08}>
                {galleryImages.length > 0 ? (
                  <ProjectGallery images={galleryImages} />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-sm bg-background-alt text-sm text-muted">
                    Sin imágenes todavía
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        <ContactSection settings={settings} />
      </main>
      <Footer socialLinks={socialLinks} />
    </>
  );
}
