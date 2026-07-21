import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type SignedUploadTarget = {
  path: string;
  token: string;
};

export type UploadUrlResult =
  | ({ status: "ok" } & SignedUploadTarget)
  | { status: "error"; message: string };

/**
 * Sube el archivo directamente desde el navegador al Storage de Supabase
 * usando una signed upload URL ya generada en el servidor. Evita que el
 * archivo pase por el body de una Server Action, que en la mayoría de
 * hostings serverless (Vercel incluido) tiene un límite de unos pocos MB
 * independiente de cualquier configuración de Next.js.
 */
export async function uploadFileDirect({
  bucket,
  target,
  file,
}: {
  bucket: string;
  target: SignedUploadTarget;
  file: File;
}): Promise<string> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(target.path, target.token, file, {
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(target.path);
  return data.publicUrl;
}

/** Extrae un mensaje legible de cualquier error lanzado durante la subida. */
export function describeUploadError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Error desconocido al subir el archivo.";
}
