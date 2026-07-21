"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads";

export async function updateLeadStatusAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;

  if (!id || !LEAD_STATUSES.includes(status)) return;

  await supabase.from("leads").update({ status }).eq("id", id);

  revalidatePath("/admin/messages");
}
