import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getSupabaseSessionClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan las variables de entorno SUPABASE_URL / SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Se puede llamar desde un Server Component (sin permiso de escritura);
          // el proxy se encarga de refrescar la cookie en ese caso.
        }
      },
    },
  });
}
