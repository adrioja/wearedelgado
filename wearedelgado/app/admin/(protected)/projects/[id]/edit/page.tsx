import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/data/projects";
import { getClientsForSelect } from "@/lib/data/clients";
import { getProjectFinance } from "@/lib/data/project-finance";
import { getProjectFiles } from "@/lib/data/project-files";
import { ProjectForm } from "../../project-form";
import { ProjectFinancePanel } from "@/components/admin/project-finance-panel";
import { ProjectFilesPanel } from "@/components/admin/project-files-panel";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, clients, finance, files] = await Promise.all([
    getProjectById(id),
    getClientsForSelect(),
    getProjectFinance(id),
    getProjectFiles(id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl">Editar proyecto</h1>
        <Link
          href={`/admin/preview/projects/${project.id}`}
          target="_blank"
          className="min-h-11 inline-flex cursor-pointer items-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background-alt"
        >
          Vista previa
        </Link>
      </div>
      <ProjectForm project={project} clients={clients} />
      <ProjectFinancePanel projectId={project.id} finance={finance} />
      <ProjectFilesPanel projectId={project.id} files={files} />
    </div>
  );
}
