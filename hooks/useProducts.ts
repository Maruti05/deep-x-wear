"use client";
import { ProductType } from "@/app/types/ProductType";
import { useQuery } from "@tanstack/react-query";
import { getJSON } from "@/lib/http";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useProducts() {
  const { data, error, isLoading, refetch } = useQuery<ProductType[]>({
    queryKey: QUERY_KEYS.products(),
    queryFn: () => getJSON<ProductType[]>("/api/products", { emitGlobalEvents: false }),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    products: data ?? [],
    isLoading,
    isError: Boolean(error),
    // Keep the same name as SWR's mutate for backward compat: manual refresh
    refresh: async () => {
      const r = await refetch();
      return r.data ?? [];
    },
  } as const;
}