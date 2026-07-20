"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";

export type ProjectFormState = {
  status: "idle" | "error";
  message?: string;
};

const BUCKET = "project-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

export async function saveProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const { supabase } = await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const existingImageUrl = String(formData.get("existing_image_url") ?? "").trim();
  const existingImagePath = String(formData.get("existing_image_path") ?? "").trim();
  const imageFile = formData.get("image");

  if (name.length < 2 || name.length > 200) {
    return { status: "error", message: "Escribe un nombre válido." };
  }
  if (category.length < 2 || category.length > 200) {
    return { status: "error", message: "Escribe una categoría válida." };
  }

  let imageUrl = existingImageUrl || null;
  let imagePath = existingImagePath || null;

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return { status: "error", message: "Formato de imagen no admitido." };
    }
    if (imageFile.size > MAX_SIZE_BYTES) {
      return { status: "error", message: "La imagen no puede superar 5 MB." };
    }

    const ext = imageFile.type.split("/")[1] ?? "jpg";
    const path = `${randomUUID()}-${slugify(name)}.${ext}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: imageFile.type });

    if (uploadError) {
      console.error("project image upload error", uploadError);
      return { status: "error", message: "No se pudo subir la imagen." };
    }

    const previousPath = imagePath;
    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    imageUrl = publicUrlData.publicUrl;
    imagePath = path;

    if (previousPath) {
      await supabase.storage.from(BUCKET).remove([previousPath]);
    }
  }

  if (id) {
    const { error } = await supabase
      .from("projects")
      .update({
        name,
        category,
        description: description || null,
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

    const { error } = await supabase.from("projects").insert({
      name,
      category,
      description: description || null,
      image_url: imageUrl,
      image_path: imagePath,
      image_alt: name,
      is_published: isPublished,
      sort_order: nextOrder,
    });

    if (error) {
      console.error("create project error", error);
      return { status: "error", message: "No se pudo crear el proyecto." };
    }
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

  await supabase.from("projects").delete().eq("id", id);

  if (imagePath) {
    await supabase.storage.from(BUCKET).remove([imagePath]);
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
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
