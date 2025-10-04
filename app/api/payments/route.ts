import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderPayments, orders } from "@/lib/db/schema";
import { CashfreeAPI } from "@/lib/payments/cashfree";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { orderId, amount, userData } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing orderId or amount" }, { status: 400 });
    }

    // Validate order exists and amount matches
    const existingOrder = await db.select().from(orders).where(eq(orders.id, orderId));
    const order = existingOrder[0];
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const expectedAmount = Number(order.total);
    if (Number(amount) !== expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Idempotency: if a payment exists and not failed, return existing session
    const existing = await db.select().from(orderPayments).where(eq(orderPayments.order_id, orderId));
    const existingPayment = existing.find((p: any) => p.status !== "failed");

    if (existingPayment?.payment_ref) {
      const existingCFOrder = await CashfreeAPI.getOrder(existingPayment.payment_ref);
      if (existingCFOrder.payment_session_id || existingCFOrder.order_status === "PAID") {
        return NextResponse.json(existingCFOrder);
      }
    }

    const customerId = userData?.id || `user-${(Math.random() * 100000).toFixed(0)}`;
    const customerEmail = userData?.email || `user-${(Math.random() * 100000).toFixed(0)}@gmail.com`;
    const customerPhone = userData?.phone || "9999999999";

    const data = await CashfreeAPI.createOrder({
      order_id: orderId,
      order_amount: expectedAmount,
      customer_details: {
        customer_id: customerId,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
    });

    await db.insert(orderPayments).values({
      order_id: orderId,
      gateway: "cashfree",
      amount: String(expectedAmount),
      status: "pending",
      payment_ref: data.order_id,
      payload: data,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("/api/payments error:", err?.data || err?.message || err);
    const status = err?.status || 500;
    return NextResponse.json({ error: err?.data || err?.message || "Payment initialization failed" }, { status });
  }
}
