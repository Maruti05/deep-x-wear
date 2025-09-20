import { supabase } from "@/lib/supabase-browser";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { orderId, amount, userData } = await req.json();
  
  // Get user data from the request payload
  const customerId = userData?.id || `user-${(Math.random()*100000).toFixed(0)}`;
  const customerEmail = userData?.email || `user-${(Math.random()*100000).toFixed(0)}@gmail.com`;
  const customerPhone = userData?.phone || "9999999999";

  // 🔹 Call Cashfree (Sandbox mode for testing)
  const cashfreeUrl = "https://sandbox.cashfree.com/pg/orders";
  const res = await fetch(cashfreeUrl, {
    method: "POST",
    headers: {
      "x-client-id": process.env.CASHFREE_CLIENT_ID!,
      "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
      "x-api-version": "2022-09-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customerId,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
    }),
  });
 console.log("cashfree response", res);
  const data = await res.json();
  console.log("cashfree response", data);

  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: res.status });
  }

  // 🔹 Save payment initiation in Supabase
  const { error } = await supabase.from("order_payments").insert({
    order_id: orderId,
    gateway: "cashfree",
    amount,
    status: "pending",
    payment_ref: data.order_id, // cashfree's order id
    payload: data,              // full JSON response
  });

  if (error) {
    console.error("DB insert error:", error);
    return NextResponse.json({ error: "Failed to save payment" }, { status: 500 });
  }

  // 🔹 Return response to frontend
  return NextResponse.json(data);
}
