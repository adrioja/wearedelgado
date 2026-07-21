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
      <h1 className="mb-8 font-serif text-2xl">Editar proyecto</h1>
      <ProjectForm project={project} clients={clients} />
      <ProjectFinancePanel projectId={project.id} finance={finance} />
      <ProjectFilesPanel projectId={project.id} files={files} />
    </div>
  );
}
