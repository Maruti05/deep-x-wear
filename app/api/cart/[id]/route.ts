import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cart, cartItems, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const cartId = id;
    if (!cartId) {
      return NextResponse.json({ error: "cart id is required" }, { status: 400 });
    }

    const [c] = await db.select().from(cart).where(eq(cart.cart_id, cartId));
    if (!c) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    const items = await db
      .select({
        item_id: cartItems.item_id,
        product_id: cartItems.product_id,
        quantity: cartItems.quantity,
        price: cartItems.price,
        size: cartItems.size,
        color: cartItems.color,
        added_at: cartItems.added_at,
        name: products.name,
        mainImageUrl: products.mainImageUrl,
        discount: products.discount,
        calculatedPrice: products.calculatedPrice,
        stockQuantity: products.stockQuantity,
      })
      .from(cartItems)
      .leftJoin(products, eq(products.id, cartItems.product_id))
      .where(eq(cartItems.cart_id, cartId));

    const subtotal = items.reduce((acc, it) => acc + Number(it.price) * it.quantity, 0);

    return NextResponse.json({ cart: c, items, subtotal: String(subtotal) }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/cart/:id error:", err?.message || err);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}