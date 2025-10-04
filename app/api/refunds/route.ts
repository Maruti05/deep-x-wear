import { db } from "@/lib/db";
import { orderPayments, refunds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { CashfreeAPI } from "@/lib/payments/cashfree";

export async function POST(req: Request) {
  try {
    const { paymentId, amount, reason } = await req.json();
    if (!paymentId || !amount) {
      return NextResponse.json({ error: "Missing paymentId or amount" }, { status: 400 });
    }

    const [payment] = await db.select().from(orderPayments).where(eq(orderPayments.id, paymentId));
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (!payment.payment_ref) {
      return NextResponse.json({ error: "Payment reference not found" }, { status: 400 });
    }
    const data = await CashfreeAPI.refundOrder(payment.payment_ref, Number(amount), reason);

    await db.insert(refunds).values({
      payment_id: paymentId,
      amount,
      reason,
      refund_ref: data.refund_id,
      status: "pending",
      // store full payload for audit
      // @ts-ignore
      // drizzle jsonb will accept generic object
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("/api/refunds error:", err?.data || err?.message || err);
    const status = err?.status || 500;
    return NextResponse.json({ error: err?.data || err?.message || "Refund initiation failed" }, { status });
  }
}
