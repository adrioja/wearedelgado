import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data/projects";
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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl">Proyectos</h1>
        <Link
          href="/admin/projects/new"
          className="cursor-pointer rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
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
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
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
                  <td className="px-5 py-4">
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
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <form action={reorderProjectAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={index === 0}
                          aria-label="Subir"
                          className="cursor-pointer rounded p-1 text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={reorderProjectAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={index === projects.length - 1}
                          aria-label="Bajar"
                          className="cursor-pointer rounded p-1 text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
