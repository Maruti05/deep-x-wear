"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
// import { useGlobalLoading } from "@/components/common/LoadingProvider";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getJSON } from "@/lib/http";
import { QUERY_KEYS } from "@/lib/query-keys";

// Types
interface OrderItemProduct {
  name?: string | null;
  image?: string | null;
}
interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: string | number;
  size?: string | null;
  color?: string | null;
  product?: OrderItemProduct;
}
interface Order {
  id: string;
  created_at: string;
  total: string | number;
  order_number: string;
  payment_status: "pending" | "paid" | "failed" | "refunded" | string;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned" | string;
  items: OrderItem[];
}
interface OrdersResponse {
  orders: Order[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
  error?: string;
}

// Status badge with extensible themes
function OrderStatusBadge({ status }: { status?: string }) {
  const variant = useMemo(() => {
    switch (status) {
      case "paid":
      case "confirmed":
      case "delivered":
        return "success" as const;
      case "shipped":
        return "secondary" as const;
      case "cancelled":
      case "returned":
      case "failed":
        return "destructive" as const;
      default:
        return "warning" as const;
    }
  }, [status]);
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
  return <Badge variant={variant}>{label}</Badge>;
}

// Single order item row
function OrderItemRow({ item }: { item: OrderItem }) {
  const priceNum = Number(item.price) || 0;
  const lineTotal = priceNum * item.quantity;
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.product?.image || "/placeholder.svg"}
            alt={item.product?.name || "Product image"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-sm font-medium">{item.product?.name || "Product"}</p>
          <p className="text-xs text-muted-foreground">
            {item.color ? `Color: ${item.color}` : null}
            {item.color && item.size ? " • " : null}
            {item.size ? `Size: ${item.size}` : null}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm">Qty: {item.quantity}</p>
        <p className="text-sm font-semibold">₹{lineTotal.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default function Page() {
  // const { show, hide } = useGlobalLoading();
  const { user } = useAuth();
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const { data, error, isLoading, isFetching } = useQuery<OrdersResponse>({
    queryKey: user?.id ? QUERY_KEYS.ordersHistory(user.id, page, pageSize) : ["orders-history-disabled"],
    queryFn: () => getJSON(`/api/orders/history?user_id=${user!.id}&page=${page}&page_size=${pageSize}`, { emitGlobalEvents: false }),
    enabled: Boolean(user?.id),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Global loader is managed centrally; no manual show/hide here
  // useEffect(() => {
  //   const shouldShow = (isLoading || isFetching) && (!data || !Array.isArray(data.orders) || data.orders.length === 0);
  //   if (shouldShow) show();
  //   else hide();
  // }, [isLoading, isFetching, data, show, hide]);

  const orders = data?.orders || [];
  const meta = data?.meta || { page, pageSize, total: 0, totalPages: 1 };

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              Your Orders
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <div role="alert" className="text-sm text-destructive mb-3">
                Failed to load orders. Please try again.
              </div>
            )}

            {!isLoading && orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No orders yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Looks like you haven’t bought anything yet. Start shopping now!
                </p>
                <Button onClick={() => (window.location.href = "/")}>Browse T-Shirts</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border border-border">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">Order #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          Status: <OrderStatusBadge status={order.payment_status || order.status} />
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y">
                        {Array.isArray(order.items) && order.items.map((item) => (
                          <OrderItemRow key={item.id} item={item} />
                        ))}
                      </div>
                      <p className="font-semibold mt-3">Total: ₹{Number(order.total).toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Page {meta.page} of {meta.totalPages} • {meta.total} orders
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1 || isLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={page >= meta.totalPages || isLoading}
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
