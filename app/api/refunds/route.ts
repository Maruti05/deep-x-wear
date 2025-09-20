import { db } from "@/lib/db";
import { orderPayments, refunds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { paymentId, amount, reason } = await req.json();
  const [payment] = await db.select().from(orderPayments).where(eq(orderPayments.id, paymentId));

  const res = await fetch(`https://sandbox.cashfree.com/pg/refunds`, {
    method: "POST",
    headers: {
      "x-client-id": process.env.CASHFREE_CLIENT_ID!,
      "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refund_amount: amount,
      refund_note: reason,
      order_id: payment.payment_ref,
    }),
  });

  const data = await res.json();

  await db.insert(refunds).values({
    payment_id: paymentId,
    amount,
    reason,
    refund_ref: data.refund_id,
    status: "pending",
  });

  return NextResponse.json(data);
}
