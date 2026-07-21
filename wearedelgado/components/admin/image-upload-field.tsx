"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadFileDirect, type UploadUrlResult } from "@/lib/upload-client";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploadField({
  name,
  bucket,
  currentImageUrl,
  currentImagePath,
  getUploadUrl,
  onPendingChange,
}: {
  name: string;
  bucket: string;
  currentImageUrl?: string | null;
  currentImagePath?: string | null;
  getUploadUrl: (fileName: string) => Promise<UploadUrlResult>;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [meta, setMeta] = useState<{ url: string; path: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato no admitido. Usa JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("La imagen no puede superar 20 MB.");
      event.target.value = "";
      return;
    }

    setError(null);
    setPending(true);
    onPendingChange?.(true);
    setPreview(URL.createObjectURL(file));

    try {
      const target = await getUploadUrl(file.name);
      if (target.status === "error") {
        setError(target.message);
        return;
      }
      const url = await uploadFileDirect({ bucket, target, file });
      setMeta({ url, path: target.path });
    } catch (uploadError) {
      console.error("image upload error", uploadError);
      setError("No se pudo subir la imagen.");
    } finally {
      setPending(false);
      onPendingChange?.(false);
      event.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={`existing_${name}_path`} value={currentImagePath ?? ""} />
      <input type="hidden" name={`${name}_url`} value={meta?.url ?? currentImageUrl ?? ""} />
      <input type="hidden" name={`${name}_path`} value={meta?.path ?? currentImagePath ?? ""} />

      <label htmlFor={name} className="text-sm text-muted">
        Imagen
      </label>

      {preview && (
        <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-md border border-border bg-background-alt">
          <Image src={preview} alt="Vista previa" fill className="object-cover" unoptimized />
        </div>
      )}

      <input
        id={name}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleChange}
        disabled={pending}
        className="cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
      />

      {pending && <p className="text-xs text-muted">Subiendo…</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-muted">JPG, PNG o WEBP. Máximo 20 MB.</p>
    </div>
  );
}
