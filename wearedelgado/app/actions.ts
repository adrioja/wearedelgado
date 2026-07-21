"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\s-]{6,30}$/;

export async function submitContactAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: campo oculto que un humano nunca rellena.
  if (String(formData.get("company") ?? "").length > 0) {
    return { status: "success" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2 || name.length > 200) {
    return { status: "error", message: "Escribe un nombre válido." };
  }
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return { status: "error", message: "Escribe un email válido." };
  }
  if (!PHONE_RE.test(phone)) {
    return { status: "error", message: "Escribe un teléfono válido." };
  }
  if (message.length < 10 || message.length > 4000) {
    return {
      status: "error",
      message: "Cuéntanos un poco más (mínimo 10 caracteres).",
    };
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("leads")
      .insert({ name, email, phone, message });

    if (error) {
      console.error("Supabase insert error", error);
      return {
        status: "error",
        message: "No hemos podido enviar tu mensaje. Inténtalo de nuevo.",
      };
    }

    return { status: "success", message: "Gracias, te responderemos pronto." };
  } catch (error) {
    console.error("Contact action error", error);
    return {
      status: "error",
      message: "No hemos podido enviar tu mensaje. Inténtalo de nuevo.",
    };
  }
}
