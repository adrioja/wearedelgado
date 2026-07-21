"use client";

import { useActionState, useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { ProjectGalleryManager } from "@/components/admin/project-gallery-manager";
import { createProjectImageUploadUrlAction, saveProjectAction, type ProjectFormState } from "./actions";
import type { ProjectWithImages } from "@/lib/data/projects";
import type { ClientOption } from "@/lib/data/clients";

const initialState: ProjectFormState = { status: "idle" };

export function ProjectForm({
  project,
  clients,
}: {
  project?: ProjectWithImages;
  clients: ClientOption[];
}) {
  const [state, formAction, isPending] = useActionState(
    saveProjectAction,
    initialState
  );
  const [imagePending, setImagePending] = useState(false);

  return (
    <>
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      {project && <input type="hidden" name="id" value={project.id} />}

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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="client" className="text-sm text-muted">
            Cliente mostrado en la web (opcional)
          </label>
          <input
            id="client"
            name="client"
            type="text"
            defaultValue={project?.client ?? ""}
            className="rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="year" className="text-sm text-muted">
            Año (opcional)
          </label>
          <input
            id="year"
            name="year"
            type="text"
            placeholder="2024"
            defaultValue={project?.year ?? ""}
            className="rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="client_id" className="text-sm text-muted">
          Cliente interno (opcional)
        </label>
        <select
          id="client_id"
          name="client_id"
          defaultValue={project?.client_id ?? ""}
          className="cursor-pointer rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
        >
          <option value="">Ninguno</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted">
          Asocia este proyecto a un cliente de tu cartera para llevar presupuesto y archivos internos.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="services" className="text-sm text-muted">
          Servicios (opcional)
        </label>
        <input
          id="services"
          name="services"
          type="text"
          placeholder="Branding, Diseño web, Fotografía"
          defaultValue={project?.services?.join(", ") ?? ""}
          className="rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
        />
        <p className="text-xs text-muted">Sepáralos con comas. Se mostrarán como etiquetas.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="highlight" className="text-sm text-muted">
          Resultado / resumen destacado (opcional)
        </label>
        <textarea
          id="highlight"
          name="highlight"
          rows={2}
          placeholder="Un titular corto: el reto o el resultado del proyecto."
          defaultValue={project?.highlight ?? ""}
          className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
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

      <ImageUploadField
        name="image"
        bucket="project-images"
        currentImageUrl={project?.image_url}
        currentImagePath={project?.image_path}
        getUploadUrl={createProjectImageUploadUrlAction}
        onPendingChange={setImagePending}
      />

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
        disabled={isPending || imagePending}
        className="min-h-11 w-fit cursor-pointer rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando…" : imagePending ? "Subiendo imagen…" : "Guardar proyecto"}
      </button>
    </form>

    {project && (
      <ProjectGalleryManager projectId={project.id} images={project.images} />
    )}
    </>
  );
}
