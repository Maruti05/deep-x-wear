import { NextResponse } from "next/server";
import { getProducts } from "@/lib/queries/products";

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

/**
 * GET /api/products
 * -----------------
 * Returns the latest products sorted by `created_at` DESC.
 */
export async function GET() {
  const rows = await getProducts({
    limit: 50, // Adjust the limit as needed
  });
  const res = NextResponse.json(rows);
  res.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  return res;
}
