"use client";

import Image from "next/image";
import { useActionState } from "react";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  addProjectImagesAction,
  deleteProjectImageAction,
  reorderProjectImageAction,
  type GalleryFormState,
} from "@/app/admin/(protected)/projects/actions";
import type { ProjectImage } from "@/lib/data/projects";

const initialState: GalleryFormState = { status: "idle" };

export function ProjectGalleryManager({
  projectId,
  images,
}: {
  projectId: string;
  images: ProjectImage[];
}) {
  const [state, formAction, isPending] = useActionState(
    addProjectImagesAction,
    initialState
  );

  return (
    <div className="mt-10 flex max-w-xl flex-col gap-4 border-t border-border pt-8">
      <div>
        <h2 className="font-serif text-lg">Galería</h2>
        <p className="text-sm text-muted">
          Añade varias fotos del proyecto. Se mostrarán en la página de detalle,
          además de la imagen de portada.
        </p>
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-background-alt"
            >
              <Image
                src={image.url}
                alt={image.alt ?? ""}
                fill
                className="object-cover"
                sizes="200px"
              />
              <div className="absolute inset-0 flex flex-col items-end justify-between bg-black/0 p-1.5 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                <form action={deleteProjectImageAction}>
                  <input type="hidden" name="id" value={image.id} />
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="path" value={image.path} />
                  <ConfirmSubmitButton
                    confirmMessage="¿Eliminar esta imagen de la galería?"
                    className="cursor-pointer rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-red-700"
                  >
                    Eliminar
                  </ConfirmSubmitButton>
                </form>

                <div className="flex gap-1">
                  <form action={reorderProjectImageAction}>
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="Mover antes"
                      className="cursor-pointer rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ←
                    </button>
                  </form>
                  <form action={reorderProjectImageAction}>
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === images.length - 1}
                      aria-label="Mover después"
                      className="cursor-pointer rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      →
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="project_id" value={projectId} />
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:text-foreground"
        />
        <p className="text-xs text-muted">JPG, PNG o WEBP. Máximo 5 MB por imagen.</p>

        <div aria-live="polite" className="min-h-6 text-sm">
          {state.status === "error" && (
            <p className="text-red-700">{state.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 w-fit cursor-pointer rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Subiendo…" : "Añadir a la galería"}
        </button>
      </form>
    </div>
  );
}
