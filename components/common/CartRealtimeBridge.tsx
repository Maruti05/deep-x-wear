"use client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import { getJSON } from "@/lib/http";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";

export function CartRealtimeBridge() {
  const { setCart } = useCart();
  const esRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const cartId = typeof window !== "undefined" ? localStorage.getItem("cart_id") : null;
    if (!cartId) return;

    const mapItems = (items: any[]) =>
      items.map((it) => ({
        backendItemId: it.item_id,
        productId: it.product_id,
        name: it.name,
        price: String(it.price),
        mainImageUrl: it.mainImageUrl,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        discount: it.discount,
        calculatedPrice: Number(it.calculatedPrice ?? it.price),
        stockQuantity: Number(it.stockQuantity ?? 0),
      }));

    const fetchCart = async () => {
      try {
        const data = await getJSON(`/api/cart/${cartId}`, { emitGlobalEvents: false });
        if (Array.isArray(data.items)) {
          setCart(mapItems(data.items));
          // keep react-query cache in sync too
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart(cartId) });
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Initial fetch once on mount
    fetchCart();

    // Establish a single SSE connection
    const es = new EventSource(`/api/cart/${cartId}/stream`);
    esRef.current = es;

    es.addEventListener("updated", () => {
      fetchCart();
    });
    es.addEventListener("removed", () => {
      toast.info("Item removed from cart");
      fetchCart();
    });
    es.onerror = () => {
      // Close on error to avoid spinning reconnections; bridge will re-establish only if remounted
      try { es.close(); } catch {}
    };

    return () => {
      try { es.close(); } catch {}
      esRef.current = null;
    };
    // Intentionally run only once on mount to avoid repeated fetches/subscriptions when cart state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}