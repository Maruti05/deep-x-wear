// queries/users.ts
import { supabaseServer } from "../supabase-server";


export async function getUserById(userId: string) {
    const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function insertUser(user: {
    user_id: string;
  full_name?: string;
  phone_number?: string;
  role?:string;
  email?:string
}) {
    const supabase = await supabaseServer();

  const { data, error } = await supabase.from("users").insert(user).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(userId: string, updates: Record<string, any>) {
    const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
