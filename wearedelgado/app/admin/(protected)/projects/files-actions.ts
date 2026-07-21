"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";

const BUCKET = "project-files";
const MAX_SIZE_BYTES = 15 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

export type FilesFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function uploadProjectFileAction(
  _prevState: FilesFormState,
  formData: FormData
): Promise<FilesFormState> {
  const { supabase, user } = await requireAdminSession();

  const projectId = String(formData.get("project_id") ?? "").trim();
  const file = formData.get("file");

  if (!projectId) {
    return { status: "error", message: "Proyecto no válido." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Selecciona un archivo." };
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return { status: "error", message: "Tipo de archivo no admitido." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { status: "error", message: "El archivo no puede superar 15 MB." };
  }

  const path = `${projectId}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type });

  if (uploadError) {
    console.error("project file upload error", uploadError);
    return { status: "error", message: "No se pudo subir el archivo." };
  }

  const { error: insertError } = await supabase.from("project_files").insert({
    project_id: projectId,
    name: file.name.slice(0, 255),
    path,
    size_bytes: file.size,
    mime_type: file.type,
    uploaded_by: user.id,
  });

  if (insertError) {
    console.error("project file insert error", insertError);
    await supabase.storage.from(BUCKET).remove([path]);
    return { status: "error", message: "No se pudo guardar el archivo." };
  }

  revalidatePath(`/admin/projects/${projectId}/edit`);
  redirect(`/admin/projects/${projectId}/edit`);
}

export async function deleteProjectFileAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const path = String(formData.get("path") ?? "");

  if (!id) return;

  await supabase.from("project_files").delete().eq("id", id);

  if (path) {
    await supabase.storage.from(BUCKET).remove([path]);
  }

  revalidatePath(`/admin/projects/${projectId}/edit`);
}

export async function downloadProjectFileAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const path = String(formData.get("path") ?? "");

  if (!path) return;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60);

  if (error || !data) {
    console.error("createSignedUrl error", error);
    return;
  }

  redirect(data.signedUrl);
}
