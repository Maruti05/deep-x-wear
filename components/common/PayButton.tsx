"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";

export default function PayButton({ order }: { order: { id: string; total: number } }) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if ((window as any).Cashfree) return setSdkLoaded(true);
    const s = document.createElement("script");
    s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    s.async = true;
    s.onload = () => setSdkLoaded(true);
    document.body.appendChild(s);
  }, []);

  async function handlePay() {
    try {
      // Get user data from the auth context
      const userData = {
        id: user?.id || undefined,
        email: user?.email || undefined,
        phone: user?.additionalData?.phone_number || undefined
      };

      const res = await fetch("api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: order.id, 
          amount: order.total,
          userData: userData
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Payment initialization failed: ${errorText}`);
      }
      
      const data = await res.json();

      if (data.payment_link) {
        window.location.href = data.payment_link;
        return;
      }

      if (data.payment_session_id && sdkLoaded) {
        // Use sandbox mode for testing
        const cashfree = (window as any).Cashfree({ mode: "sandbox" });
        await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: `${window.location.origin}/api/payments/return?order_id=${order.id}`,
        });
      } else {
        throw new Error("Payment session ID not received or SDK not loaded");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  }

  return <Button onClick={handlePay}>Pay ₹{order.total}</Button>;
}
