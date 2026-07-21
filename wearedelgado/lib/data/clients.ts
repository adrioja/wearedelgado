import { getSupabaseSessionClient } from "@/lib/supabase/server-session";

export type Client = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientOption = {
  id: string;
  name: string;
};

export async function getAllClientsAdmin(): Promise<Client[]> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("getAllClientsAdmin error", error);
    return [];
  }

  return data ?? [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getClientById error", error);
    return null;
  }

  return data;
}

export async function getClientsForSelect(): Promise<ClientOption[]> {
  const supabase = await getSupabaseSessionClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("getClientsForSelect error", error);
    return [];
  }

  return data ?? [];
}
