import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      // Redirect to failure page with error message
      return NextResponse.redirect(new URL(`/payment/failure?error=Missing+order+ID`, req.url));
    }

    const res = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2022-09-01",
      },
    });

    if (!res.ok) {
      // Handle API error
      const errorData = await res.json();
      console.error("Payment verification error:", errorData);
      return NextResponse.redirect(new URL(`/payment/failure?order_id=${orderId}&error=Payment+verification+failed`, req.url));
    }

    const data = await res.json();
    
    // Check payment status
    if (data.order_status === "PAID") {
      // Payment successful - redirect to success page
      return NextResponse.redirect(new URL(`/payment/success?order_id=${orderId}`, req.url));
    } else {
      // Payment failed or pending - redirect to failure page
      const errorMessage = data.order_status === "ACTIVE" ? "Payment+pending" : "Payment+failed";
      return NextResponse.redirect(new URL(`/payment/failure?order_id=${orderId}&error=${errorMessage}`, req.url));
    }
  } catch (err: any) {
    console.error("Payment return handler error:", err);
    // Redirect to failure page with generic error
    return NextResponse.redirect(new URL(`/payment/failure?error=Something+went+wrong`, req.url));
  }
}
