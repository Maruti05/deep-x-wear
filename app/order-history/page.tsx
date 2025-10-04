"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useGlobalLoading } from "@/components/common/LoadingProvider";

interface Order {
  id: string;
  created_at: string;
  items: string[];
  total: number;
  order_number: string;
  payment_status: string;
}

export default function Page() {
  const { show, hide } = useGlobalLoading();
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) return;
      show();
      try {
        const res = await fetch(`/api/orders/history?user_id=${user.id}`);
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (err) {
        console.error("fetchOrders error:", err);
      } finally {
        hide();
      }
    }
    fetchOrders();
  }, [user]);

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              Your Orders
            </CardTitle>
          </CardHeader>

          <CardContent>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No orders yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Looks like you haven’t bought anything yet. Start shopping now!
                </p>
                <Button onClick={() => (window.location.href = "/")}>
                  Browse T-Shirts
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border border-border">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">Order #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Status:{" "}
                          <span
                            className={
                              order.payment_status === "paid"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }
                          >
                            {order.payment_status}
                          </span>
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm sm:text-base mb-2">
                        {Array.isArray(order.items) &&
                          order.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                      </ul>
                      <p className="font-semibold">Total: ₹{order.total}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
