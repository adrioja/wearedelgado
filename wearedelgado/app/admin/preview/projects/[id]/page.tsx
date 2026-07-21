import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase/dal";
import { ProjectDetailView } from "@/components/project-detail-view";
import { getNextPublishedProject, getProjectById } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getSocialLinks } from "@/lib/data/social-links";

export default async function ProjectPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();

  const { id } = await params;
  const [project, settings, socialLinks] = await Promise.all([
    getProjectById(id),
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
      previewHref={`/admin/projects/${project.id}/edit`}
    />
  );
}
