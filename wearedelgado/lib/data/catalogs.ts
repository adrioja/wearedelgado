import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseSessionClient } from "@/lib/supabase/server-session";

export type Catalog = {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_path: string;
  file_size_bytes: number | null;
  cover_image_url: string | null;
  cover_image_path: string | null;
  sort_order: number;
  is_published: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
};

export async function getPublishedCatalogs(): Promise<Catalog[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("catalogs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getPublishedCatalogs error", error);
    return [];
  }

  return data ?? [];
}

export async function getAllCatalogsAdmin(): Promise<Catalog[]> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("catalogs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllCatalogsAdmin error", error);
    return [];
  }

  return data ?? [];
}

export async function getCatalogById(id: string): Promise<Catalog | null> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("catalogs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getCatalogById error", error);
    return null;
  }

  return data;
}
