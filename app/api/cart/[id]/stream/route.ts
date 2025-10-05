import { NextResponse } from "next/server";
import { subscribe, unsubscribe } from "@/lib/realtime/cartEvents";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const cartId =await params.id;
  if (!cartId) return NextResponse.json({ error: "cart id is required" }, { status: 400 });

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  subscribe(cartId, writer);

  const encoder = new TextEncoder();
  writer.write(encoder.encode(`: connected\n\n`));

  // Keep the connection alive to prevent periodic reconnection (which triggers client refetches)
  const keepalive = setInterval(() => {
    try { writer.write(encoder.encode(`: keepalive\n\n`)); } catch {}
  }, 25000); // every 25s

  // Unsubscribe when client disconnects
  req.signal.addEventListener("abort", () => {
    try { unsubscribe(cartId, writer); } catch {}
    try { clearInterval(keepalive); } catch {}
    try { writer.close(); } catch {}
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}