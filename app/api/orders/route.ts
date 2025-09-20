import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // use drizzle/prisma/supabase client
import { orders, orderItems } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, items, subtotal, tax, shipping } = body;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    const total = subtotal + tax + shipping;

    const [order] = await db
      .insert(orders)
      .values({
        user_id: userId,
        order_number: orderNumber,
        subtotal,
        tax,
        shipping,
        total,
      })
      .returning();

    for (const item of items) {
      await db.insert(orderItems).values({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        product_snapshot: item.snapshot,
      });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
