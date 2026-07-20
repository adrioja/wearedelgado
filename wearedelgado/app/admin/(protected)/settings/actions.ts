"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";
import { SOCIAL_ICON_KEYS, type SocialIconKey } from "@/lib/data/social-links";

export type SettingsFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function updateSiteSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const { supabase } = await requireAdminSession();

  const contact_intro = String(formData.get("contact_intro") ?? "").trim();
  const contact_email = String(formData.get("contact_email") ?? "").trim();
  const contact_phone = String(formData.get("contact_phone") ?? "").trim();
  const schedule_text = String(formData.get("schedule_text") ?? "").trim();
  const address_text = String(formData.get("address_text") ?? "").trim();
  const address_map_url = String(formData.get("address_map_url") ?? "").trim();

  const { error } = await supabase
    .from("site_settings")
    .update({
      contact_intro: contact_intro || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      schedule_text: schedule_text || null,
      address_text: address_text || null,
      address_map_url: address_map_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("updateSiteSettingsAction error", error);
    return { status: "error", message: "No se pudieron guardar los ajustes." };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { status: "success", message: "Ajustes guardados." };
}

function isValidIconKey(value: string): value is SocialIconKey {
  return (SOCIAL_ICON_KEYS as readonly string[]).includes(value);
}

export async function createSocialLinkAction(formData: FormData) {
  const { supabase } = await requireAdminSession();

  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const iconKey = String(formData.get("icon_key") ?? "");

  if (!label || !url || !isValidIconKey(iconKey)) return;

  const { data: maxOrderRow } = await supabase
    .from("social_links")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("social_links").insert({
    label,
    url,
    icon_key: iconKey,
    sort_order: (maxOrderRow?.sort_order ?? -1) + 1,
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function updateSocialLinkAction(formData: FormData) {
  const { supabase } = await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const iconKey = String(formData.get("icon_key") ?? "");

  if (!id || !label || !url || !isValidIconKey(iconKey)) return;

  await supabase
    .from("social_links")
    .update({ label, url, icon_key: iconKey })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function deleteSocialLinkAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await supabase.from("social_links").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function reorderSocialLinkAction(
  id: string,
  direction: "up" | "down"
) {
  const { supabase } = await requireAdminSession();

  if (!id || (direction !== "up" && direction !== "down")) return;

  const { data: links } = await supabase
    .from("social_links")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!links) return;

  const index = links.findIndex((l) => l.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= links.length) return;

  const current = links[index];
  const swapWith = links[swapIndex];

  await Promise.all([
    supabase
      .from("social_links")
      .update({ sort_order: swapWith.sort_order })
      .eq("id", current.id),
    supabase
      .from("social_links")
      .update({ sort_order: current.sort_order })
      .eq("id", swapWith.id),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/settings");
}
