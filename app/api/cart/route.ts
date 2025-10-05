import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cart } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body?.userId;
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Simple select-or-insert without transaction; avoids transaction pool limitations
    const existing = await db.select().from(cart).where(eq(cart.user_id, userId));
    if (existing.length > 0) {
      return NextResponse.json({ cart: existing[0] }, { status: 200 });
    }

    const inserted = await db.insert(cart).values({ user_id: userId }).returning();
    return NextResponse.json({ cart: inserted[0] }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/cart error:", err?.message || err);
    return NextResponse.json({ error: "Failed to create cart" }, { status: 500 });
  }
}