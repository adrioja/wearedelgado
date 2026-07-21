"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";
import type { UploadUrlResult } from "@/lib/upload-client";

export type ProjectFormState = {
  status: "idle" | "error";
  message?: string;
};

const BUCKET = "project-images";
const FILES_BUCKET = "project-files";
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export async function createProjectImageUploadUrlAction(
  fileName: string,
  pathPrefix?: string
): Promise<UploadUrlResult> {
  const { supabase } = await requireAdminSession();

  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { status: "error", message: "Formato de imagen no admitido." };
  }

  const path = pathPrefix ? `${pathPrefix}/${randomUUID()}.${ext}` : `${randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createProjectImageUploadUrlAction error", error);
    return { status: "error", message: "No se pudo preparar la subida." };
  }

  return { status: "ok", path, token: data.token };
}

export async function saveProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const { supabase } = await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const client = String(formData.get("client") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "").trim() || null;
  const year = String(formData.get("year") ?? "").trim();
  const highlight = String(formData.get("highlight") ?? "").trim();
  const services = String(formData.get("services") ?? "")
    .split(",")
    .map((service) => service.trim())
    .filter(Boolean);
  const isPublished = formData.get("is_published") === "on";
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const imagePath = String(formData.get("image_path") ?? "").trim() || null;
  const existingImagePath = String(formData.get("existing_image_path") ?? "").trim() || null;

  if (name.length < 2 || name.length > 200) {
    return { status: "error", message: "Escribe un nombre válido." };
  }
  if (category.length < 2 || category.length > 200) {
    return { status: "error", message: "Escribe una categoría válida." };
  }

  if (existingImagePath && existingImagePath !== imagePath) {
    await supabase.storage.from(BUCKET).remove([existingImagePath]);
  }

  if (id) {
    const { error } = await supabase
      .from("projects")
      .update({
        name,
        category,
        description: description || null,
        client: client || null,
        client_id: clientId,
        year: year || null,
        services,
        highlight: highlight || null,
        image_url: imageUrl,
        image_path: imagePath,
        image_alt: name,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("update project error", error);
      return { status: "error", message: "No se pudo guardar el proyecto." };
    }
  } else {
    const { data: maxOrderRow } = await supabase
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrderRow?.sort_order ?? -1) + 1;

    const { data: created, error } = await supabase
      .from("projects")
      .insert({
        name,
        category,
        description: description || null,
        client: client || null,
        client_id: clientId,
        year: year || null,
        services,
        highlight: highlight || null,
        image_url: imageUrl,
        image_path: imagePath,
        image_alt: name,
        is_published: isPublished,
        sort_order: nextOrder,
      })
      .select("id")
      .single();

    if (error || !created) {
      console.error("create project error", error);
      return { status: "error", message: "No se pudo crear el proyecto." };
    }

    revalidatePath("/");
    revalidatePath("/admin/projects");
    redirect(`/admin/projects/${created.id}/edit`);
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function deleteProjectAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const imagePath = String(formData.get("image_path") ?? "");

  if (!id) return;

  const [{ data: galleryImages }, { data: internalFiles }] = await Promise.all([
    supabase.from("project_images").select("path").eq("project_id", id),
    supabase.from("project_files").select("path").eq("project_id", id),
  ]);

  await supabase.from("projects").delete().eq("id", id);

  const pathsToRemove = [
    imagePath,
    ...(galleryImages ?? []).map((image) => image.path),
  ].filter(Boolean);

  if (pathsToRemove.length > 0) {
    await supabase.storage.from(BUCKET).remove(pathsToRemove);
  }

  const filePathsToRemove = (internalFiles ?? []).map((file) => file.path).filter(Boolean);

  if (filePathsToRemove.length > 0) {
    await supabase.storage.from(FILES_BUCKET).remove(filePathsToRemove);
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export type GalleryFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function addProjectImagesAction(
  _prevState: GalleryFormState,
  formData: FormData
): Promise<GalleryFormState> {
  const { supabase } = await requireAdminSession();

  const projectId = String(formData.get("project_id") ?? "").trim();
  const imagesRaw = String(formData.get("images_json") ?? "").trim();

  if (!projectId) {
    return { status: "error", message: "Proyecto no válido." };
  }

  let images: { path: string; url: string }[] = [];
  try {
    images = imagesRaw ? JSON.parse(imagesRaw) : [];
  } catch {
    images = [];
  }

  if (images.length === 0) {
    return { status: "error", message: "Selecciona al menos una imagen." };
  }

  const { data: maxOrderRow } = await supabase
    .from("project_images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextOrder = (maxOrderRow?.sort_order ?? -1) + 1;

  const rows = images.map((image) => ({
    project_id: projectId,
    url: image.url,
    path: image.path,
    sort_order: nextOrder++,
  }));

  const { error: insertError } = await supabase.from("project_images").insert(rows);

  if (insertError) {
    console.error("gallery image insert error", insertError);
    return { status: "error", message: "No se pudieron guardar las imágenes." };
  }

  revalidatePath("/");
  revalidatePath(`/proyectos/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/edit`);
  redirect(`/admin/projects/${projectId}/edit`);
}

export async function deleteProjectImageAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const path = String(formData.get("path") ?? "");

  if (!id) return;

  await supabase.from("project_images").delete().eq("id", id);

  if (path) {
    await supabase.storage.from(BUCKET).remove([path]);
  }

  revalidatePath("/");
  revalidatePath(`/proyectos/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/edit`);
}

export async function reorderProjectImageAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  if (!id || !projectId || (direction !== "up" && direction !== "down")) return;

  const { data: images } = await supabase
    .from("project_images")
    .select("id, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (!images) return;

  const index = images.findIndex((image) => image.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= images.length) return;

  const current = images[index];
  const swapWith = images[swapIndex];

  await Promise.all([
    supabase
      .from("project_images")
      .update({ sort_order: swapWith.sort_order })
      .eq("id", current.id),
    supabase
      .from("project_images")
      .update({ sort_order: current.sort_order })
      .eq("id", swapWith.id),
  ]);

  revalidatePath("/");
  revalidatePath(`/proyectos/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/edit`);
}

export async function toggleProjectPublishedAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const nextPublished = formData.get("next_published") === "true";

  if (!id) return;

  await supabase
    .from("projects")
    .update({ is_published: nextPublished, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function reorderProjectAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  if (!id || (direction !== "up" && direction !== "down")) return;

  const { data: projects } = await supabase
    .from("projects")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!projects) return;

  const index = projects.findIndex((p) => p.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= projects.length) return;

  const current = projects[index];
  const swapWith = projects[swapIndex];

  await Promise.all([
    supabase
      .from("projects")
      .update({ sort_order: swapWith.sort_order })
      .eq("id", current.id),
    supabase
      .from("projects")
      .update({ sort_order: current.sort_order })
      .eq("id", swapWith.id),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/projects");
}
