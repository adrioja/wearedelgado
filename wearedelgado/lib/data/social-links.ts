import { getSupabaseServerClient } from "@/lib/supabase/server";

export const SOCIAL_ICON_KEYS = [
  "instagram",
  "linkedin",
  "behance",
  "dribbble",
  "x",
  "youtube",
  "tiktok",
  "pinterest",
  "website",
] as const;

export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number];

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon_key: SocialIconKey;
  sort_order: number;
  created_at: string;
};

export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getSocialLinks error", error);
    return [];
  }

  return data ?? [];
}
