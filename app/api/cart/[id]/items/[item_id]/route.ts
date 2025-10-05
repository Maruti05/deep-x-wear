import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { publish } from "@/lib/realtime/cartEvents";

export async function DELETE(_: Request, { params }: { params: { id: string; item_id: string } }) {
  try {
    const { id: cartId, item_id } = params;
    if (!cartId || !item_id) return NextResponse.json({ error: "cart id and item_id are required" }, { status: 400 });

    const deleted = await db.transaction(async (tx) => {
      const existing = await tx.select().from(cartItems).where(eq(cartItems.item_id, item_id));
      if (existing.length === 0) return null;
      await tx.delete(cartItems).where(eq(cartItems.item_id, item_id));
      return existing[0];
    });

    if (deleted) publish(cartId, { type: "removed", payload: { item_id } });

    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/cart/:id/items/:item_id error:", err?.message || err);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}