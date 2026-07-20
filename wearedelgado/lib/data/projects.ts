import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseSessionClient } from "@/lib/supabase/server-session";

export type Project = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

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

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getProjectById error", error);
    return null;
  }

  return data;
}
