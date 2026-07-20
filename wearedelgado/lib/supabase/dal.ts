import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseSessionClient } from "@/lib/supabase/server-session";

export const requireAdminSession = cache(async () => {
  const supabase = await getSupabaseSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return { user, supabase };
});
