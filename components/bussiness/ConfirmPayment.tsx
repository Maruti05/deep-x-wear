"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PayButton from "../common/PayButton";

type Order = {
  id: string;
  total: number;
};

export default function ConfirmPayment({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, amount: order.total }),
    });
     console.log("data", res);
    if (!res.ok) {
      const errorText = await res.text(); // fallback
      throw new Error(`API error: ${res.status} - ${errorText}`);
    }
    const data = await res.json();
    setLoading(false);
  
   
   // redirect to Cashfree Checkout page
    if (data.payment_link) {
      window.location.href = data.payment_link;
    } else {
      console.error("No payment_link in response", data);
    }
  }

  return (
    <>
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex justify-center items-center p-6">Loading...</div>
          ) : (
            <PayButton order={{ id: order.id, total: order.total }} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
