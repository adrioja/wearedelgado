import { getSupabaseSessionClient } from "@/lib/supabase/server-session";
import type { LeadStatus } from "@/lib/leads";

export type { LeadStatus } from "@/lib/leads";
export { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/leads";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: LeadStatus;
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
