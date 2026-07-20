import { getSupabaseSessionClient } from "@/lib/supabase/server-session";

export type Lead = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export async function getLeadsForAdmin(): Promise<Lead[]> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getLeadsForAdmin error", error);
    return [];
  }

  return data ?? [];
}
