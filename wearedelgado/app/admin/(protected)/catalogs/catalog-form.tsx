"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { uploadFileDirect } from "@/lib/upload-client";
import { createCatalogUploadUrlAction, saveCatalogAction, type CatalogFormState } from "./actions";
import type { Catalog } from "@/lib/data/catalogs";

const initialState: CatalogFormState = { status: "idle" };
const BUCKET = "catalogs";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_COVER_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

type FileMeta = { url: string; path: string; size: number; name: string };
type CoverMeta = { url: string; path: string };

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CatalogForm({ catalog }: { catalog?: Catalog }) {
  const [state, formAction, isPending] = useActionState(
    saveCatalogAction,
    initialState
  );

  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [filePending, setFilePending] = useState(false);

  const [coverMeta, setCoverMeta] = useState<CoverMeta | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    catalog?.cover_image_url ?? null
  );
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverPending, setCoverPending] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("El archivo debe ser un PDF.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("El PDF no puede superar 50 MB.");
      event.target.value = "";
      return;
    }

    setFileError(null);
    setFilePending(true);
    try {
      const target = await createCatalogUploadUrlAction(file.name);
      if (target.status === "error") {
        setFileError(target.message);
        return;
      }
      const url = await uploadFileDirect({ bucket: BUCKET, target, file });
      setFileMeta({ url, path: target.path, size: file.size, name: file.name });
    } catch (error) {
      console.error("catalog file upload error", error);
      setFileError("No se pudo subir el PDF.");
    } finally {
      setFilePending(false);
      event.target.value = "";
    }
  }

  async function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      setCoverError("La portada debe ser JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_COVER_SIZE_BYTES) {
      setCoverError("La portada no puede superar 20 MB.");
      event.target.value = "";
      return;
    }

    setCoverError(null);
    setCoverPending(true);
    const localPreview = URL.createObjectURL(file);
    setCoverPreview(localPreview);
    try {
      const target = await createCatalogUploadUrlAction(file.name);
      if (target.status === "error") {
        setCoverError(target.message);
        return;
      }
      const url = await uploadFileDirect({ bucket: BUCKET, target, file });
      setCoverMeta({ url, path: target.path });
    } catch (error) {
      console.error("catalog cover upload error", error);
      setCoverError("No se pudo subir la portada.");
    } finally {
      setCoverPending(false);
      event.target.value = "";
    }
  }

  const currentFileUrl = fileMeta?.url ?? catalog?.file_url ?? "";
  const currentFilePath = fileMeta?.path ?? catalog?.file_path ?? "";
  const currentFileSize = fileMeta?.size ?? catalog?.file_size_bytes ?? "";
  const currentCoverUrl = coverMeta?.url ?? catalog?.cover_image_url ?? "";
  const currentCoverPath = coverMeta?.path ?? catalog?.cover_image_path ?? "";

  const busy = isPending || filePending || coverPending;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      {catalog && <input type="hidden" name="id" value={catalog.id} />}
      <input type="hidden" name="existing_file_path" value={catalog?.file_path ?? ""} />
      <input type="hidden" name="file_url" value={currentFileUrl} />
      <input type="hidden" name="file_path" value={currentFilePath} />
      <input type="hidden" name="file_size" value={currentFileSize} />
      <input type="hidden" name="existing_cover_path" value={catalog?.cover_image_path ?? ""} />
      <input type="hidden" name="cover_url" value={currentCoverUrl} />
      <input type="hidden" name="cover_path" value={currentCoverPath} />

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

        {currentFileUrl && (
          <a
            href={currentFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-ink underline underline-offset-4"
          >
            {fileMeta ? "Ver PDF subido" : "Ver PDF actual"}{" "}
            {currentFileSize ? `(${formatBytes(Number(currentFileSize))})` : ""}
          </a>
        )}

        <input
          id="file"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={filePending}
          className="cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        />
        {filePending && <p className="text-xs text-muted">Subiendo PDF…</p>}
        {fileError && <p className="text-sm text-red-700">{fileError}</p>}
        <p className="text-xs text-muted">Solo PDF. Máximo 50 MB.</p>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="cover" className="text-sm text-muted">
          Portada (opcional)
        </label>

        {coverPreview && (
          <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-md border border-border bg-background-alt">
            <Image src={coverPreview} alt="Vista previa" fill className="object-cover" unoptimized />
          </div>
        )}

        <input
          id="cover"
          type="file"
          accept={ALLOWED_COVER_TYPES.join(",")}
          onChange={handleCoverChange}
          disabled={coverPending}
          className="cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        />
        {coverPending && <p className="text-xs text-muted">Subiendo portada…</p>}
        {coverError && <p className="text-sm text-red-700">{coverError}</p>}
        <p className="text-xs text-muted">
          JPG, PNG o WEBP. Máximo 20 MB. Si no subes ninguna, se usará un diseño genérico.
        </p>
      </div>

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
        disabled={busy}
        className="min-h-11 w-fit cursor-pointer rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando…" : busy ? "Subiendo archivos…" : "Guardar catálogo"}
      </button>
    </form>
  );
}
