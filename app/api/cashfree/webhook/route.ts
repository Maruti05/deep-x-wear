import { db } from "@/lib/db";
import { orderPayments, orders, webhookLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers);
    console.log("Webhook received:", body.event || body.type);

    // Store raw event
    const [log] = await db.insert(webhookLogs).values({
      event_type: body.event || body.type,
      headers,
      payload: body,
    }).returning();

    // Get the order ID from the webhook payload
    const orderId = body.data?.order?.order_id;
    if (!orderId) {
      console.error("No order ID found in webhook payload");
      return NextResponse.json({ error: "No order ID found" }, { status: 400 });
    }

    // Find the payment record to get the associated order
    const [payment] = await db.select().from(orderPayments)
      .where(eq(orderPayments.payment_ref, orderId));
    
    if (!payment) {
      console.error(`No payment found for order reference: ${orderId}`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update based on payment event type
    if (body.type === "PAYMENT_SUCCESS" || body.event === "payment.success") {
      console.log(`Updating payment status for order: ${payment.order_id}`);
      
      // Update payment record
      await db.update(orderPayments).set({
        status: "success",
        verified: true,
        payload: body, // Store the latest payload
      }).where(eq(orderPayments.payment_ref, orderId));

      // Update order record
      await db.update(orders).set({
        payment_status: "paid",
        status: "confirmed",
        updated_at: new Date(),
      }).where(eq(orders.id, payment.order_id));
      
      console.log(`Payment and order status updated successfully for: ${payment.order_id}`);
    } else if (body.type === "PAYMENT_FAILED" || body.event === "payment.failed") {
      // Handle failed payments
      await db.update(orderPayments).set({
        status: "failed",
        payload: body,
      }).where(eq(orderPayments.payment_ref, orderId));

      await db.update(orders).set({
        payment_status: "failed",
        updated_at: new Date(),
      }).where(eq(orders.id, payment.order_id));
    }

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
