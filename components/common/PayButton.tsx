"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";
// removed: import { supabase } from "@/lib/supabase-browser";

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

  const payableTotal = useMemo(() => {
    return cart
      .filter((_, i) => selectedItems[i])
      .reduce((acc, item) => acc + item.calculatedPrice * item.quantity, 0);
  }, [cart, selectedItems]);

  const handlePay = async () => {
    if (loading) return; // prevent double submission
    if (!authUser) {
      toast.error("Please sign in to proceed with payment.");
      return;
    }
    if (cart.length === 0 || payableTotal <= 0) {
      toast.error("Your cart is empty or total is invalid.");
      return;
    }
    setLoading(true);

    try {
      const selectedCartItems = cart.filter((_, i) => selectedItems[i]);
      const subtotal = selectedCartItems.reduce((acc, item) => acc + item.calculatedPrice * item.quantity, 0);

      // Create order via secure API
      const orderPayload = {
        userId: authUser.id,
        items: selectedCartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.calculatedPrice,
          snapshot: {
            name: item.name,
            price: item.price,
            discount: item.discount,
          },
        })),
        subtotal,
        tax: 0,
        shipping: 0,
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create order.");
      }
      const { order } = await orderRes.json();
      if (!order?.id) throw new Error("Order creation failed.");

      onOrderCreated?.(order);

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

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload?.error || "Failed to initialize payment");
      }

      const data = await res.json();

      if (data.payment_link) {
        window.location.href = data.payment_link;
        return;
      }

      if (data.payment_session_id && sdkLoaded) {
        const cashfree = (window as any).Cashfree({ mode: process.env.NODE_ENV === "production" ? "production" : "sandbox" });
        await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: `${window.location.origin}/api/payments/return?order_id=${order.id}`,
        });
      } else {
        throw new Error("Payment session not ready. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disabled = cart.length === 0 || !authUser?.isProfileCompleted || loading || payableTotal <= 0;

  return (
    <Button
      onClick={handlePay}
      disabled={disabled}
      aria-disabled={disabled}
      aria-busy={loading}
      variant="default"
      size="lg"
      className="w-full relative overflow-hidden shadow-md hover:shadow-lg transition-all hover:scale-[1.01] focus-visible:ring-[3px]"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2 7a3 3 0 013-3h14a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V7zm3-1a1 1 0 00-1 1v2h16V7a1 1 0 00-1-1H5zm15 6H4v5a1 1 0 001 1h14a1 1 0 001-1v-5z"></path>
          </svg>
          Pay ₹{payableTotal}
        </span>
      )}
    </Button>
  );
}
