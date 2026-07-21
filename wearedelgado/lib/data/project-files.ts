import { getSupabaseSessionClient } from "@/lib/supabase/server-session";

export type ProjectFile = {
  id: string;
  project_id: string;
  name: string;
  path: string;
  size_bytes: number;
  mime_type: string;
  uploaded_by: string | null;
  created_at: string;
};

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProjectFiles error", error);
    return [];
  }

  return data ?? [];
}
