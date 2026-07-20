"use server";

import { redirect } from "next/navigation";
import { getSupabaseSessionClient } from "@/lib/supabase/server-session";

export type LoginFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function signInAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Introduce email y contraseña." };
  }

  const supabase = await getSupabaseSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: "Credenciales incorrectas." };
  }

  redirect("/admin");
}
