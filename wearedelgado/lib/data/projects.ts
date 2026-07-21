import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseSessionClient } from "@/lib/supabase/server-session";

export type Project = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  client: string | null;
  year: string | null;
  services: string[];
  highlight: string | null;
  image_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  url: string;
  path: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
};

export type ProjectWithImages = Project & { images: ProjectImage[] };

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getPublishedProjects error", error);
    return [];
  }

  return data ?? [];
}

export async function getPublishedProjectDetail(
  id: string
): Promise<ProjectWithImages | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .eq("id", id)
    .eq("is_published", true)
    .order("sort_order", { referencedTable: "project_images", ascending: true })
    .maybeSingle();

  if (error) {
    console.error("getPublishedProjectDetail error", error);
    return null;
  }

  if (!data) return null;

  const { project_images, ...project } = data as Project & {
    project_images: ProjectImage[] | null;
  };

  return { ...project, images: project_images ?? [] };
}

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllProjectsAdmin error", error);
    return [];
  }

  return data ?? [];
}

export async function getProjectById(
  id: string
): Promise<ProjectWithImages | null> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .eq("id", id)
    .order("sort_order", { referencedTable: "project_images", ascending: true })
    .maybeSingle();

  if (error) {
    console.error("getProjectById error", error);
    return null;
  }

  if (!data) return null;

  const { project_images, ...project } = data as Project & {
    project_images: ProjectImage[] | null;
  };

  return { ...project, images: project_images ?? [] };
}
