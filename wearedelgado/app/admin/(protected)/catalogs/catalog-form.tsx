"use client";

import { useActionState, useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { saveCatalogAction, type CatalogFormState } from "./actions";
import type { Catalog } from "@/lib/data/catalogs";

const initialState: CatalogFormState = { status: "idle" };
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CatalogForm({ catalog }: { catalog?: Catalog }) {
  const [state, formAction, isPending] = useActionState(
    saveCatalogAction,
    initialState
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      {catalog && <input type="hidden" name="id" value={catalog.id} />}
      <input type="hidden" name="existing_file_url" value={catalog?.file_url ?? ""} />
      <input type="hidden" name="existing_file_path" value={catalog?.file_path ?? ""} />
      <input
        type="hidden"
        name="existing_file_size"
        value={catalog?.file_size_bytes ?? ""}
      />
      <input type="hidden" name="existing_cover_url" value={catalog?.cover_image_url ?? ""} />
      <input type="hidden" name="existing_cover_path" value={catalog?.cover_image_path ?? ""} />

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm text-muted">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={catalog?.name}
          placeholder="Catálogo 2025"
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
          rows={3}
          defaultValue={catalog?.description ?? ""}
          placeholder="Descubre más sobre nuestro producto y nuestra visión de hogar."
          className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="file" className="text-sm text-muted">
          Archivo PDF
        </label>

        {catalog?.file_url && !fileName && (
          <a
            href={catalog.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-ink underline underline-offset-4"
          >
            Ver PDF actual{" "}
            {catalog.file_size_bytes ? `(${formatBytes(catalog.file_size_bytes)})` : ""}
          </a>
        )}

        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              setFileName(null);
              setFileError(null);
              return;
            }
            if (file.type !== "application/pdf") {
              setFileError("El archivo debe ser un PDF.");
              event.target.value = "";
              setFileName(null);
              return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
              setFileError("El PDF no puede superar 50 MB.");
              event.target.value = "";
              setFileName(null);
              return;
            }
            setFileError(null);
            setFileName(`${file.name} (${formatBytes(file.size)})`);
          }}
          className="cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:text-foreground"
        />
        {fileName && <p className="text-xs text-muted">Nuevo archivo: {fileName}</p>}
        {fileError && <p className="text-sm text-red-700">{fileError}</p>}
        <p className="text-xs text-muted">Solo PDF. Máximo 50 MB.</p>
      </div>

      <ImageUploadField name="cover" currentImageUrl={catalog?.cover_image_url} />
      <p className="-mt-4 text-xs text-muted">
        Portada mostrada en la web. Si no subes ninguna, se usará un diseño genérico.
      </p>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={catalog?.is_published ?? true}
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
        className="min-h-11 w-fit cursor-pointer rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar catálogo"}
      </button>
    </form>
  );
}
