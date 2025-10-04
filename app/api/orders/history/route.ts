import { supabase } from "@/lib/supabase-browser";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }); // ✅ recent first

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const normalized = data?.map((o) => ({
    ...o,
    items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
  }));
  return NextResponse.json({ orders: normalized });
}
