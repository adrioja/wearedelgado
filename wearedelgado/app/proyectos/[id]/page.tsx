import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/project-detail-view";
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

  return (
    <ProjectDetailView
      project={project}
      settings={settings}
      socialLinks={socialLinks}
      nextProject={nextProject}
    />
  );
}
