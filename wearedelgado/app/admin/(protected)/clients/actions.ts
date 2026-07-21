"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase/dal";

export type ClientFormState = {
  status: "idle" | "error";
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function saveClientAction(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const { supabase } = await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const contactPerson = String(formData.get("contact_person") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const taxId = String(formData.get("tax_id") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (name.length < 2 || name.length > 200) {
    return { status: "error", message: "Escribe un nombre válido." };
  }
  if (email && (!EMAIL_RE.test(email) || email.length > 320)) {
    return { status: "error", message: "Escribe un email válido." };
  }

  const payload = {
    name,
    contact_person: contactPerson || null,
    email: email || null,
    phone: phone || null,
    tax_id: taxId || null,
    address: address || null,
    notes: notes || null,
    is_active: isActive,
  };

  if (id) {
    const { error } = await supabase
      .from("clients")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("update client error", error);
      return { status: "error", message: "No se pudo guardar el cliente." };
    }
  } else {
    const { error } = await supabase.from("clients").insert(payload);

    if (error) {
      console.error("create client error", error);
      return { status: "error", message: "No se pudo crear el cliente." };
    }
  }

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export async function deleteClientAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await supabase.from("clients").delete().eq("id", id);

  revalidatePath("/admin/clients");
  revalidatePath("/admin/projects");
}

export async function toggleClientActiveAction(formData: FormData) {
  const { supabase } = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const nextActive = formData.get("next_active") === "true";

  if (!id) return;

  await supabase
    .from("clients")
    .update({ is_active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/clients");
}
