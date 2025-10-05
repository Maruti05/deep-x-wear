import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { publish } from "@/lib/realtime/cartEvents";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const cartId =await params.id;
    if (!cartId) return NextResponse.json({ error: "cart id is required" }, { status: 400 });

    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    const updated = await db.transaction(async (tx) => {
      const results: any[] = [];
      for (const input of items) {
        const productId = input.product_id;
        const quantity = Number(input.quantity);
        const size: string | undefined = input.size;
        const color: string | undefined = input.color;
        if (!productId || !quantity || quantity <= 0 || !size || !color) continue;
        const [product] = await tx.select().from(products).where(eq(products.id, productId));
        if (!product) continue;
        const priceNumber = Number(product.calculatedPrice ?? product.price);
        const price = String(priceNumber);

        const existing = await tx
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.cart_id, cartId),
              eq(cartItems.product_id, productId),
              eq(cartItems.size, size),
              eq(cartItems.color, color)
            )
          );

        if (existing.length > 0) {
          const [row] = existing;
          const updatedRow = await tx
            .update(cartItems)
            .set({ quantity, price })
            .where(eq(cartItems.item_id, row.item_id))
            .returning();
          results.push(updatedRow[0]);
        } else {
          const inserted = await tx
            .insert(cartItems)
            .values({ cart_id: cartId, product_id: productId, quantity, price, size, color })
            .returning();
          results.push(inserted[0]);
        }
      }
      return results;
    });

    publish(cartId, { type: "updated", payload: { items: updated } });

    return NextResponse.json({ items: updated }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/cart/:id/items error:", err?.message || err);
    return NextResponse.json({ error: "Failed to update cart items" }, { status: 500 });
  }
}