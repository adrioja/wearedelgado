import Link from "next/link";
import { getAllProjectsAdmin, type Project } from "@/lib/data/projects";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  deleteProjectAction,
  reorderProjectAction,
  toggleProjectPublishedAction,
} from "./actions";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl">Proyectos</h1>
        <Link
          href="/admin/projects/new"
          className="min-h-11 cursor-pointer items-center rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 inline-flex"
        >
          Nuevo proyecto
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No hay proyectos todavía."
          action={
            <Link
              href="/admin/projects/new"
              className="cursor-pointer text-sm font-medium text-accent-ink underline underline-offset-4"
            >
              Crear el primero
            </Link>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Orden</th>
                  <th className="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.id} className="border-b border-border last:border-0 hover:bg-background-alt">
                    <td className="px-5 py-4 font-medium">{project.name}</td>
                    <td className="px-5 py-4 text-muted">{project.category}</td>
                    <td className="px-5 py-4 text-muted">{project.linked_client?.name ?? "—"}</td>
                    <td className="px-5 py-4">
                      <PublishToggle project={project} />
                    </td>
                    <td className="px-5 py-4">
                      <ReorderButtons project={project} index={index} total={projects.length} />
                    </td>
                    <td className="px-5 py-4">
                      <ProjectRowActions project={project} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {projects.map((project, index) => (
              <li key={project.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted">{project.category}</p>
                  </div>
                  <PublishToggle project={project} />
                </div>
                <p className="text-sm text-muted">Cliente: {project.linked_client?.name ?? "—"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <ReorderButtons project={project} index={index} total={projects.length} />
                  <ProjectRowActions project={project} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function PublishToggle({ project }: { project: Project }) {
  return (
    <form action={toggleProjectPublishedAction}>
      <input type="hidden" name="id" value={project.id} />
      <input
        type="hidden"
        name="next_published"
        value={(!project.is_published).toString()}
      />
      <button
        type="submit"
        className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium ${
          project.is_published
            ? "bg-emerald-100 text-emerald-800"
            : "bg-background-alt text-muted"
        }`}
      >
        {project.is_published ? "Publicado" : "Oculto"}
      </button>
    </form>
  );
}

function ReorderButtons({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  return (
    <div className="flex gap-1">
      <form action={reorderProjectAction}>
        <input type="hidden" name="id" value={project.id} />
        <input type="hidden" name="direction" value="up" />
        <button
          type="submit"
          disabled={index === 0}
          aria-label="Subir"
          className="min-h-11 min-w-11 cursor-pointer rounded p-1 text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↑
        </button>
      </form>
      <form action={reorderProjectAction}>
        <input type="hidden" name="id" value={project.id} />
        <input type="hidden" name="direction" value="down" />
        <button
          type="submit"
          disabled={index === total - 1}
          aria-label="Bajar"
          className="min-h-11 min-w-11 cursor-pointer rounded p-1 text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↓
        </button>
      </form>
    </div>
  );
}

function ProjectRowActions({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-4">
      <Link
        href={`/admin/preview/projects/${project.id}`}
        target="_blank"
        className="cursor-pointer text-muted underline underline-offset-4 hover:text-foreground"
      >
        Vista previa
      </Link>
      <Link
        href={`/admin/projects/${project.id}/edit`}
        className="cursor-pointer text-accent-ink underline underline-offset-4"
      >
        Editar
      </Link>
      <form action={deleteProjectAction}>
        <input type="hidden" name="id" value={project.id} />
        <input type="hidden" name="image_path" value={project.image_path ?? ""} />
        <ConfirmSubmitButton
          confirmMessage={`¿Eliminar "${project.name}"? Esta acción no se puede deshacer.`}
          className="cursor-pointer text-red-700 underline underline-offset-4"
        >
          Eliminar
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
