"use client";

import Image from "next/image";
import { useState } from "react";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploadField({
  name,
  currentImageUrl,
}: {
  name: string;
  currentImageUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
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
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-3">
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
        name={name}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleChange}
        className="cursor-pointer text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:text-foreground"
      />

      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-muted">JPG, PNG o WEBP. Máximo 20 MB.</p>
    </div>
  );
}
