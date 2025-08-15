import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";
import { getProducts } from "@/lib/queries/products";

/**
 * GET /api/products
 * -----------------
 * Returns the latest products sorted by `created_at` DESC.
 */
export async function GET() {
 const rows = await getProducts({
   limit: 50, // Adjust the limit as needed
 });
  return NextResponse.json(rows);
}

/*
 * ➜ Extend with POST/PUT/DELETE as needed, e.g.:
 *
 * export async function POST(req: Request) {
 *   const body = await req.json();
 *   // validate with zod, then insert via Drizzle
 *   const [inserted] = await db.insert(products).values({...body}).returning();
 *   return NextResponse.json(inserted, { status: 201 });
 * }
 */
