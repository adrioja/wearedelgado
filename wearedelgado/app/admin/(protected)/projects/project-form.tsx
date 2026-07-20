"use client";

import { useActionState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { ProjectGalleryManager } from "@/components/admin/project-gallery-manager";
import { saveProjectAction, type ProjectFormState } from "./actions";
import type { ProjectWithImages } from "@/lib/data/projects";

const initialState: ProjectFormState = { status: "idle" };

export function ProjectForm({ project }: { project?: ProjectWithImages }) {
  const [state, formAction, isPending] = useActionState(
    saveProjectAction,
    initialState
  );

  return (
    <>
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="existing_image_url" value={project?.image_url ?? ""} />
      <input type="hidden" name="existing_image_path" value={project?.image_path ?? ""} />

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm text-muted">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={project?.name}
          className="rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm text-muted">
          Categoría
        </label>
        <input
          id="category"
          name="category"
          type="text"
          required
          defaultValue={project?.category}
          placeholder="Branding · Hostelería"
          className="rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm text-muted">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={project?.description ?? ""}
          className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
        />
      </div>

      <ImageUploadField name="image" currentImageUrl={project?.image_url} />

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={project?.is_published ?? true}
          className="h-4 w-4 rounded border-border"
        />
        Publicado en la landing
      </label>

      <div aria-live="polite" className="min-h-6 text-sm">
        {state.status === "error" && (
          <p className="text-red-700">{state.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-fit cursor-pointer rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar proyecto"}
      </button>
    </form>

    {project && (
      <ProjectGalleryManager projectId={project.id} images={project.images} />
    )}
    </>
  );
}
