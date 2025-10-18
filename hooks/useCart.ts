"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJSON, putJSON, deleteJSON, postJSON } from "@/lib/http";
import { QUERY_KEYS } from "@/lib/query-keys";

export type CartItemInput = {
  product_id: string;
  quantity: number;
  size: string;
  color: string;
};

export function useCartQuery(cartId?: string) {
  const enabled = Boolean(cartId);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.cart(cartId || "unknown"),
    queryFn: () => getJSON(`/api/cart/${cartId}`, { emitGlobalEvents: false }),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    cart: data?.cart ?? null,
    items: data?.items ?? [],
    subtotal: data?.subtotal ?? "0",
    isLoading,
    isError: Boolean(error),
    refresh: async () => {
      const r = await refetch();
      return r.data ?? null;
    },
  } as const;
}

export function useUpdateCartItemsMutation(cartId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: CartItemInput[]) => {
      return putJSON(`/api/cart/${cartId}/items`, { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart(cartId) });
    },
  });
}

export function useDeleteCartItemMutation(cartId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      return deleteJSON(`/api/cart/${cartId}/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart(cartId) });
    },
  });
}

export function useEnsureCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      return postJSON(`/api/cart`, { userId });
    },
    onSuccess: (data) => {
      const cartId = data?.cart?.cart_id;
      if (typeof window !== "undefined" && cartId) {
        try { localStorage.setItem("cart_id", cartId); } catch {}
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart(cartId) });
      }
    },
  });
}