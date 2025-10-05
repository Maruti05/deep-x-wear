type Writer = WritableStreamDefaultWriter<Uint8Array>;
const enc = new TextEncoder();

const hubs = new Map<string, Set<Writer>>();

export function subscribe(cartId: string, writer: Writer) {
  if (!hubs.has(cartId)) hubs.set(cartId, new Set());
  hubs.get(cartId)!.add(writer);
}

export function unsubscribe(cartId: string, writer: Writer) {
  const set = hubs.get(cartId);
  if (!set) return;
  set.delete(writer);
  if (set.size === 0) hubs.delete(cartId);
}

export function publish(cartId: string, event: { type: string; payload?: any }) {
  const set = hubs.get(cartId);
  if (!set || set.size === 0) return;
  const data = `event: ${event.type}\n` + `data: ${JSON.stringify(event.payload ?? {})}\n\n`;
  const chunk = enc.encode(data);
  for (const writer of set) {
    try {
      writer.write(chunk);
    } catch (_) {
      // ignore write errors
    }
  }
}