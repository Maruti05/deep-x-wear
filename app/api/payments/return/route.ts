import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderPayments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CashfreeAPI } from "@/lib/payments/cashfree";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.redirect(new URL(`/payment/failure?error=Missing+order+ID`, req.url));
    }

    const data = await CashfreeAPI.getOrder(orderId);

    if (data.order_status === "PAID") {
      // Update DB to reflect success
      const [payment] = await db.select().from(orderPayments).where(eq(orderPayments.payment_ref, orderId));
      if (payment) {
        await db.update(orderPayments).set({ status: "success", verified: true }).where(eq(orderPayments.id, payment.id));
        await db.update(orders).set({ payment_status: "paid", status: "confirmed", updated_at: new Date() }).where(eq(orders.id, payment.order_id));
      }
      return NextResponse.redirect(new URL(`/payment/success?order_id=${orderId}`, req.url));
    } else {
      const errorMessage = data.order_status === "ACTIVE" ? "Payment+pending" : "Payment+failed";
      return NextResponse.redirect(new URL(`/payment/failure?order_id=${orderId}&error=${errorMessage}`, req.url));
    }
  } catch (err: any) {
    console.error("Payment return handler error:", err);
    return NextResponse.redirect(new URL(`/payment/failure?error=Something+went+wrong`, req.url));
  }
}
