"use client";
import { ProductType } from "@/app/types/ProductType";
import useSWR from "swr";

// Small, hardened fetcher: no intermediate caching, send cookies
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const error = new Error(errData.error || `Request failed: ${res.status}`);
    (error as any).status = res.status;
    (error as any).details = errData;
    throw error;
  }
  return res.json();
};

export function useProducts() {
  const {
    data: products,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<ProductType[]>("/api/products", fetcher, {
    revalidateOnFocus: false, // avoid flicker on tab focus
    revalidateOnReconnect: true, // keep data fresh
    keepPreviousData: true, // smooth list updates during background revalidation
    dedupingInterval: 1000, // avoid redundant requests within a short window
    shouldRetryOnError: false,
  });

  return {
    products: products ?? [],
    isLoading,
    isError: Boolean(error),
    refresh, // manual refresh (e.g., after cart ops)
  } as const;
}