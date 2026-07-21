"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";
import type { UploadUrlResult } from "@/lib/upload-client";

export type CatalogFormState = {
  status: "idle" | "error";
  message?: string;
};

const BUCKET = "catalogs";
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"];

export async function createCatalogUploadUrlAction(
  fileName: string
): Promise<UploadUrlResult> {
  const { supabase } = await requireAdminSession();

  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { status: "error", message: "Tipo de archivo no admitido." };
  }

  const path = `${randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createCatalogUploadUrlAction error", error);
    return { status: "error", message: "No se pudo preparar la subida." };
  }

  return { status: "ok", path, token: data.token };
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

  const fileUrl = String(formData.get("file_url") ?? "").trim() || null;
  const filePath = String(formData.get("file_path") ?? "").trim() || null;
  const fileSizeRaw = String(formData.get("file_size") ?? "").trim();
  const fileSizeBytes = fileSizeRaw ? Number(fileSizeRaw) : null;
  const existingFilePath = String(formData.get("existing_file_path") ?? "").trim() || null;

  const coverUrl = String(formData.get("cover_url") ?? "").trim() || null;
  const coverPath = String(formData.get("cover_path") ?? "").trim() || null;
  const existingCoverPath = String(formData.get("existing_cover_path") ?? "").trim() || null;

  if (name.length < 2 || name.length > 200) {
    return { status: "error", message: "Escribe un nombre válido." };
  }
  if (!fileUrl || !filePath) {
    return { status: "error", message: "Sube el PDF del catálogo." };
  }

  if (existingFilePath && existingFilePath !== filePath) {
    await supabase.storage.from(BUCKET).remove([existingFilePath]);
  }
  if (existingCoverPath && existingCoverPath !== coverPath) {
    await supabase.storage.from(BUCKET).remove([existingCoverPath]);
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
