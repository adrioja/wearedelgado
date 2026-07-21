import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("file_url")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (!catalog) {
    return NextResponse.json({ error: "Catálogo no encontrado" }, { status: 404 });
  }

  const { error } = await supabase.rpc("increment_catalog_downloads", {
    catalog_id: id,
  });

  if (error) {
    console.error("increment_catalog_downloads error", error);
  }

  return NextResponse.redirect(catalog.file_url);
}
