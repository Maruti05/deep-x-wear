// app/orders/page.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Order {
  id: string;
  date: string;
  items: string[];
  total: number;
}

export default function Page() {
  // Example: replace with real data from API
  const [orders] = useState<Order[]>([]);

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
                <Button onClick={() => window.location.href = "/"}>
                  Browse T-Shirts
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border border-border">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold">Order #{order.id}</p>
                      <span className="text-sm text-muted-foreground">{order.date}</span>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm sm:text-base mb-2">
                        {order.items.map((item, i) => (
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
