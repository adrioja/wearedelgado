"use client";

import Image from "next/image";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  addProjectImagesAction,
  deleteProjectImageAction,
  reorderProjectImageAction,
  type GalleryFormState,
} from "@/app/admin/(protected)/projects/actions";
import type { ProjectImage } from "@/lib/data/projects";

const initialState: GalleryFormState = { status: "idle" };
const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type StagedFile = { file: File; previewUrl: string };

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

  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const browseInputRef = useRef<HTMLInputElement>(null);
  const submitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      staged.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!submitInputRef.current) return;
    const dataTransfer = new DataTransfer();
    staged.forEach((item) => dataTransfer.items.add(item.file));
    submitInputRef.current.files = dataTransfer.files;
  }, [staged]);

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const accepted: StagedFile[] = [];
    let error: string | null = null;

    for (const file of incoming) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        error = "Solo se admiten imágenes JPG, PNG o WEBP.";
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        error = "Cada imagen debe pesar menos de 20 MB.";
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    setDropError(error);
    if (accepted.length > 0) {
      setStaged((prev) => [...prev, ...accepted]);
    }
  }

  function removeStaged(index: number) {
    setStaged((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  }

  const totalSizeLabel = useMemo(() => {
    if (staged.length === 0) return null;
    const bytes = staged.reduce((sum, item) => sum + item.file.size, 0);
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [staged]);

  return (
    <div className="mt-10 flex max-w-2xl flex-col gap-4 border-t border-border pt-8">
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
        <input ref={submitInputRef} type="file" name="images" multiple hidden />
        <input
          ref={browseInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          hidden
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              addFiles(event.target.files);
            }
            event.target.value = "";
          }}
        />

        <div
          role="button"
          tabIndex={0}
          aria-label="Arrastra imágenes aquí o pulsa para seleccionarlas"
          onClick={() => browseInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              browseInputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink ${
            isDraggingOver
              ? "border-accent-ink bg-accent/10"
              : "border-border bg-background-alt hover:border-accent-ink/60"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-8 w-8 text-muted"
          >
            <path
              d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm font-medium text-foreground">
            Arrastra imágenes aquí o haz clic para seleccionarlas
          </p>
          <p className="text-xs text-muted">JPG, PNG o WEBP. Máximo 20 MB por imagen.</p>
        </div>

        {dropError && <p className="text-sm text-red-700">{dropError}</p>}

        {staged.length > 0 && (
          <div className="flex flex-col gap-3">
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {staged.map((item, index) => (
                <li
                  key={item.previewUrl}
                  className="group relative aspect-square overflow-hidden rounded-md border border-border bg-background-alt"
                >
                  <Image
                    src={item.previewUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="200px"
                  />
                  <button
                    type="button"
                    onClick={() => removeStaged(index)}
                    aria-label="Quitar imagen"
                    className="absolute right-1.5 top-1.5 cursor-pointer rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">
              {staged.length} {staged.length === 1 ? "imagen lista" : "imágenes listas"}{" "}
              para subir · {totalSizeLabel}
            </p>
          </div>
        )}

        <div aria-live="polite" className="min-h-6 text-sm">
          {state.status === "error" && (
            <p className="text-red-700">{state.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || staged.length === 0}
          className="min-h-11 w-fit cursor-pointer rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending
            ? "Subiendo…"
            : `Añadir ${staged.length > 0 ? staged.length : ""} a la galería`.trim()}
        </button>
      </form>
    </div>
  );
}
