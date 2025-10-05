import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { supabaseServer } from "@/lib/supabase-server";

// Simple in-memory rate limiting per IP
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120; // more generous for paginated history
const rateMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

// GET /api/orders/history?user_id=<uuid>&page=<number>&page_size=<number>
// Returns paginated orders for a user including joined order items and product details
export async function GET(req: Request) {
  try {
    const ip = (req as any).ip || "unknown";
    if (!rateLimit(`orders-history:${ip}:GET`)) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const url = new URL(req.url);
    const requestedUserId = url.searchParams.get("user_id");
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("page_size") || 10)));

    if (!requestedUserId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    // Ensure caller is authenticated and requesting their own data
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.id !== requestedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.user_id, requestedUserId));

    const total = Number(count || 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const offset = (page - 1) * pageSize;

    const baseOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.user_id, requestedUserId))
      .orderBy(desc(orders.created_at))
      .limit(pageSize)
      .offset(offset);

    const orderIds = baseOrders.map((o) => o.id);

    const itemRows = await db
      .select({
        order_id: orderItems.order_id,
        id: orderItems.id,
        product_id: orderItems.product_id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        size: orderItems.size,
        color: orderItems.color,
        productName: products.name,
        productImage: products.mainImageUrl,
        productSnapshot: orderItems.product_snapshot,
      })
      .from(orderItems)
      .leftJoin(products, eq(products.id, orderItems.product_id))
      .where(inArray(orderItems.order_id, orderIds));

    const itemsByOrder: Record<string, any[]> = {};
    for (const row of itemRows) {
      const arr = itemsByOrder[row.order_id] || (itemsByOrder[row.order_id] = []);
      const snap = (row.productSnapshot as { name?: string | null; image?: string | null } | null);
      arr.push({
        id: row.id,
        product_id: row.product_id,
        quantity: row.quantity,
        price: String(row.price),
        size: row.size,
        color: row.color,
        product: {
          name: snap?.name ?? row.productName,
          image: snap?.image ?? row.productImage,
        },
      });
    }

    const ordersWithItems = baseOrders.map((o) => ({
      ...o,
      subtotal: o.subtotal ? String(o.subtotal) : o.subtotal,
      tax: o.tax ? String(o.tax) : o.tax,
      shipping: o.shipping ? String(o.shipping) : o.shipping,
      total: o.total ? String(o.total) : o.total,
      items: itemsByOrder[o.id] || [],
    }));

    const response = NextResponse.json(
      {
        orders: ordersWithItems,
        meta: { page, pageSize, total, totalPages },
      },
      { status: 200 }
    );
    response.headers.set("Cache-Control", "private, max-age=30");
    return response;
  } catch (err: any) {
    console.error("GET /api/orders/history error:", err?.message || err);
    return NextResponse.json({ error: "Failed to fetch orders history" }, { status: 500 });
  }
}
