"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";

export type CatalogFormState = {
  status: "idle" | "error";
  message?: string;
};

const BUCKET = "catalogs";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_COVER_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf"];
const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function saveCatalogAction(
  _prevState: CatalogFormState,
  formData: FormData
): Promise<CatalogFormState> {
  const { supabase } = await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const existingFileUrl = String(formData.get("existing_file_url") ?? "").trim();
  const existingFilePath = String(formData.get("existing_file_path") ?? "").trim();
  const existingFileSize = String(formData.get("existing_file_size") ?? "").trim();
  const existingCoverUrl = String(formData.get("existing_cover_url") ?? "").trim();
  const existingCoverPath = String(formData.get("existing_cover_path") ?? "").trim();
  const pdfFile = formData.get("file");
  const coverFile = formData.get("cover");

  if (name.length < 2 || name.length > 200) {
    return { status: "error", message: "Escribe un nombre válido." };
  }

  let fileUrl = existingFileUrl || null;
  let filePath = existingFilePath || null;
  let fileSizeBytes = existingFileSize ? Number(existingFileSize) : null;

  if (pdfFile instanceof File && pdfFile.size > 0) {
    if (!ALLOWED_FILE_TYPES.includes(pdfFile.type)) {
      return { status: "error", message: "El catálogo debe ser un archivo PDF." };
    }
    if (pdfFile.size > MAX_FILE_SIZE_BYTES) {
      return { status: "error", message: "El PDF no puede superar 50 MB." };
    }

    const path = `${randomUUID()}-${slugify(name)}.pdf`;
    const buffer = Buffer.from(await pdfFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: pdfFile.type });

    if (uploadError) {
      console.error("catalog file upload error", uploadError);
      return { status: "error", message: "No se pudo subir el PDF." };
    }

    const previousPath = filePath;
    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    fileUrl = publicUrlData.publicUrl;
    filePath = path;
    fileSizeBytes = pdfFile.size;

    if (previousPath) {
      await supabase.storage.from(BUCKET).remove([previousPath]);
    }
  }

  if (!id && !fileUrl) {
    return { status: "error", message: "Sube el PDF del catálogo." };
  }

  let coverUrl = existingCoverUrl || null;
  let coverPath = existingCoverPath || null;

  if (coverFile instanceof File && coverFile.size > 0) {
    if (!ALLOWED_COVER_TYPES.includes(coverFile.type)) {
      return { status: "error", message: "La portada debe ser JPG, PNG o WEBP." };
    }
    if (coverFile.size > MAX_COVER_SIZE_BYTES) {
      return { status: "error", message: "La portada no puede superar 20 MB." };
    }

    const ext = coverFile.type.split("/")[1] ?? "jpg";
    const path = `${randomUUID()}-${slugify(name)}-cover.${ext}`;
    const buffer = Buffer.from(await coverFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: coverFile.type });

    if (uploadError) {
      console.error("catalog cover upload error", uploadError);
      return { status: "error", message: "No se pudo subir la portada." };
    }

    const previousPath = coverPath;
    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    coverUrl = publicUrlData.publicUrl;
    coverPath = path;

    if (previousPath) {
      await supabase.storage.from(BUCKET).remove([previousPath]);
    }
  }

  if (id) {
    const { error } = await supabase
      .from("catalogs")
      .update({
        name,
        description: description || null,
        file_url: fileUrl,
        file_path: filePath,
        file_size_bytes: fileSizeBytes,
        cover_image_url: coverUrl,
        cover_image_path: coverPath,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("update catalog error", error);
      return { status: "error", message: "No se pudo guardar el catálogo." };
    }
  } else {
    const { data: maxOrderRow } = await supabase
      .from("catalogs")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrderRow?.sort_order ?? -1) + 1;

    const { error } = await supabase.from("catalogs").insert({
      name,
      description: description || null,
      file_url: fileUrl,
      file_path: filePath,
      file_size_bytes: fileSizeBytes,
      cover_image_url: coverUrl,
      cover_image_path: coverPath,
      is_published: isPublished,
      sort_order: nextOrder,
    });

    if (error) {
      console.error("create catalog error", error);
      return { status: "error", message: "No se pudo crear el catálogo." };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/catalogs");
  redirect("/admin/catalogs");
}

export async function deleteCatalogAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const filePath = String(formData.get("file_path") ?? "");
  const coverPath = String(formData.get("cover_path") ?? "");

  if (!id) return;

  await supabase.from("catalogs").delete().eq("id", id);

  const pathsToRemove = [filePath, coverPath].filter(Boolean);
  if (pathsToRemove.length > 0) {
    await supabase.storage.from(BUCKET).remove(pathsToRemove);
  }

  revalidatePath("/");
  revalidatePath("/admin/catalogs");
}

export async function toggleCatalogPublishedAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const nextPublished = formData.get("next_published") === "true";

  if (!id) return;

  await supabase
    .from("catalogs")
    .update({ is_published: nextPublished, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/catalogs");
}

export async function reorderCatalogAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  if (!id || (direction !== "up" && direction !== "down")) return;

  const { data: catalogs } = await supabase
    .from("catalogs")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!catalogs) return;

  const index = catalogs.findIndex((c) => c.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= catalogs.length) return;

  const current = catalogs[index];
  const swapWith = catalogs[swapIndex];

  await Promise.all([
    supabase
      .from("catalogs")
      .update({ sort_order: swapWith.sort_order })
      .eq("id", current.id),
    supabase
      .from("catalogs")
      .update({ sort_order: current.sort_order })
      .eq("id", swapWith.id),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/catalogs");
}
