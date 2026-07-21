import { getSupabaseSessionClient } from "@/lib/supabase/server-session";
import type { ProjectFinance } from "@/lib/finance";

export type { ProjectFinance } from "@/lib/finance";

export async function getProjectFinance(
  projectId: string
): Promise<ProjectFinance | null> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("project_finance")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    console.error("getProjectFinance error", error);
    return null;
  }

  return data;
}
