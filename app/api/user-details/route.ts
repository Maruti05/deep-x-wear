// app/api/user-details/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getUserById, insertUser, updateUser } from "@/lib/queries/user";
import { supabaseServer } from "@/lib/supabase-server";

async function getSessionUser() {
    const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized");
  return user;
}

// GET → fetch user
export async function GET() {
  try {
    const user = await getSessionUser();
    const details = await getUserById(user.id);
    return NextResponse.json(details);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

// POST → insert new user row
export async function POST(req: Request) {
    try {
      const body = await req.json();
  
      let userId: string | undefined;
  
      try {
        const sessionUser = await getSessionUser();
        userId = sessionUser?.id;
      } catch {
        // no session → first signup
      }
  
      if (!userId && !body.user_id) {
        throw new Error("No session or user_id provided");
      }
  
      const details = await insertUser({
        user_id: userId ?? body.user_id, // 👈 fallback
        ...body,
      });
  
      return NextResponse.json(details);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }
  

// PUT → update user row
export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const details = await updateUser(user.id, body);
    return NextResponse.json(details);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
