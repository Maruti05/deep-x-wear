import crypto from "crypto";

const ENV = process.env.CASHFREE_ENV || process.env.NODE_ENV || "development";
const isProd = ENV === "production" || ENV === "prod";
const BASE_URL = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function headers(extra?: Record<string, string>) {
  return {
    "x-client-id": requiredEnv("CASHFREE_CLIENT_ID"),
    "x-client-secret": requiredEnv("CASHFREE_CLIENT_SECRET"),
    "x-api-version": "2022-09-01",
    "Content-Type": "application/json",
    ...(extra || {}),
  } as Record<string, string>;
}

async function cfFetch<T>(path: string, init: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      ...headers(init.headers as Record<string, string>),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText;
    const error = new Error(`Cashfree API error (${res.status}): ${message}`) as any;
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export type CreateOrderPayload = {
  order_id: string;
  order_amount: number;
  order_currency?: string; // defaults to INR
  customer_details: {
    customer_id: string;
    customer_email?: string;
    customer_phone?: string;
  };
};

export async function createOrder(payload: CreateOrderPayload) {
  return cfFetch<{
    order_id: string;
    order_status: string;
    payment_link?: string;
    payment_session_id?: string;
  }>("/orders", {
    method: "POST",
    body: JSON.stringify({
      order_currency: "INR",
      ...payload,
    }),
  });
}

export async function getOrder(orderId: string) {
  return cfFetch<{
    order_id: string;
    order_status: "ACTIVE" | "PAID" | string;
    payments?: any[];
    payment_session_id?: string;
  }>(`/orders/${orderId}`, { method: "GET" });
}

export async function refundOrder(orderId: string, amount: number, note?: string) {
  return cfFetch<{
    refund_id: string;
    refund_status: string;
  }>("/refunds", {
    method: "POST",
    body: JSON.stringify({
      refund_amount: amount,
      refund_note: note,
      order_id: orderId,
    }),
  });
}

// Webhook signature verification
// expectedSignature = Base64Encode(HMACSHA256($timestamp + $payload, $merchantSecretKey))
export function verifyWebhookSignature(signature: string | null, timestamp: string | null, rawBody: string): boolean {
  if (!signature || !timestamp) return false;
  const secret = requiredEnv("CASHFREE_CLIENT_SECRET");
  const signedPayload = `${timestamp}${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("base64");
  return expected === signature;
}

export const CashfreeAPI = {
  BASE_URL,
  createOrder,
  getOrder,
  refundOrder,
  verifyWebhookSignature,
};