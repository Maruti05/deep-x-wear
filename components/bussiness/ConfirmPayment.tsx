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

  return (
    <>
      {/* <Dialog  defaultOpen={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex justify-center items-center p-6">Loading...</div>
          ) : (
            // <PayButton order={{ id: order.id, total: order.total }} />
          )}
        </DialogContent>
      </Dialog> */}
    </>
  );
}
