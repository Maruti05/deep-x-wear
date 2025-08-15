"use client";
import { ProductType } from "@/app/types/ProductType";
// -----------------------------------------------------------------------------
// useProducts.ts ✦ Client‑side data hook for fetching products from MySQL
// -----------------------------------------------------------------------------
// ⬢ Requires: `npm i swr` (or swap for TanStack Query)
// The hook calls the Next.js route handler at /api/products and returns
// loading, error, and refresh helpers so your ProductCard list can reactively
// update when items are added to the cart or inventory changes.
// -----------------------------------------------------------------------------

import useSWR from "swr";

/* -------------------------------------------------------------------------
 * 1 ▸ Product type — keep in sync with your Prisma `Product` model
 * ---------------------------------------------------------------------- */
/* -------------------------------------------------------------------------
 * 2 ▸ SWR fetcher util (tiny)
 * ---------------------------------------------------------------------- */
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
});

/* -------------------------------------------------------------------------
 * 3 ▸ useProducts Hook
 * ---------------------------------------------------------------------- */
export function useProducts() {
  const {
    data: products,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<ProductType[]>("/api/products", fetcher, {
    revalidateOnFocus: false, // tweak per UX needs
  });

  return {
    products: products ?? [],
    isLoading,
    isError: Boolean(error),
    refresh, // call to re‑fetch manually (e.g., after cart ops)
  } as const;
}