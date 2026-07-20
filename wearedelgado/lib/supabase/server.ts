import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan las variables de entorno SUPABASE_URL / SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
