"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-browser";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  calculatedPrice: number;
  quantity: number;
  size?: string;
  color?: string;
  discount?: number;
  mainImageUrl?: string;
};

interface PayButtonProps {
  cart: CartItem[];
  selectedItems: boolean[];
  onOrderCreated?: (order: any) => void;
}

export default function PayButton({ cart, selectedItems, onOrderCreated }: PayButtonProps) {
  const { user: authUser } = useAuth();
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ((window as any).Cashfree) return setSdkLoaded(true);
    const s = document.createElement("script");
    s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    s.async = true;
    s.onload = () => setSdkLoaded(true);
    document.body.appendChild(s);
  }, []);

  const handlePay = async () => {
    if (!authUser || cart.length === 0) return;
    setLoading(true);

    try {
      // Step 1: Filter selected items
      const selectedCartItems = cart.filter((_, i) => selectedItems[i]);

      const subtotal = selectedCartItems.reduce(
        (acc, item) => acc + item.calculatedPrice * item.quantity,
        0
      );

      // Step 2: Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: authUser.id,
          order_number: `ORD-${Date.now()}`,
          subtotal,
          total: subtotal,
          status: "pending",
          payment_status: "pending",
          notes: null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 3: Add order items
      const orderItemsPayload = selectedCartItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.calculatedPrice,
        product_snapshot: {
          name: item.name,
          price: item.price,
          discount: item.discount,
        },
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) throw itemsError;

      // Optional: callback for parent
      if (onOrderCreated) onOrderCreated(order);

      // Step 4: Initialize Cashfree payment
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          userData: {
            id: authUser.id,
            email: authUser.email,
            phone: authUser.additionalData?.phone_number,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to initialize payment");

      const data = await res.json();

      if (data.payment_link) {
        window.location.href = data.payment_link;
        return;
      }

      if (data.payment_session_id && sdkLoaded) {
        const cashfree = (window as any).Cashfree({ mode: "sandbox" });
        await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: `${window.location.origin}/api/payments/return?order_id=${order.id}`,
        });
      } else {
        throw new Error("Payment session ID not received or SDK not loaded");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disabled =
    cart.length === 0 || !authUser?.isProfileCompleted || loading;

  return (
    <Button onClick={handlePay} disabled={disabled}>
      {loading ? "Processing..." : `Pay ₹${cart
        .filter((_, i) => selectedItems[i])
        .reduce((acc, item) => acc + item.calculatedPrice * item.quantity, 0)}`}
    </Button>
  );
}
