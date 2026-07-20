import { getSupabaseServerClient } from "@/lib/supabase/server";

export type SiteSettings = {
  id: number;
  contact_intro: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  schedule_text: string | null;
  address_text: string | null;
  address_map_url: string | null;
  updated_at: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("getSiteSettings error", error);
    return null;
  }

  return data;
}
