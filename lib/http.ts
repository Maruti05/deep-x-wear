export type JSONValue = string | number | boolean | null | { [x: string]: JSONValue } | JSONValue[];

export class HTTPError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = "HTTPError";
    this.status = status;
    this.details = details;
  }
}

const defaultHeaders: HeadersInit = { Accept: "application/json" };

// Allow callers to control whether global loading events are emitted
type ExtendedInit = RequestInit & { emitGlobalEvents?: boolean };

async function handleResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const isJSON = contentType.includes("application/json");
  const body = isJSON ? await res.json().catch(() => ({})) : await res.text().catch(() => "");
  if (!res.ok) {
    const msg = (isJSON && (body as any)?.error) || `Request failed: ${res.status}`;
    throw new HTTPError(msg, res.status, body);
  }
  return body as any;
}

function dispatchStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("global-loading-start"));
  }
}
function dispatchEnd() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("global-loading-end"));
  }
}

export async function getJSON<T = any>(url: string, init: ExtendedInit = {}) {
  const headers: HeadersInit = { ...defaultHeaders, ...(init.headers || {}) };
  // Attach CSRF token header for idempotent GET when needed by API logic
  try {
    const token = (await import("js-cookie")).default.get("csrf_token");
    if (token && !("X-CSRF-Token" in headers)) {
      (headers as any)["X-CSRF-Token"] = token;
    }
  } catch {}

  if (init.emitGlobalEvents !== false) dispatchStart();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
      credentials: "same-origin",
      redirect: "error",
      ...init,
    });
    const data = await handleResponse(res);
    return data as T;
  } finally {
    if (init.emitGlobalEvents !== false) dispatchEnd();
  }
}

export async function postJSON<T = any>(url: string, body: JSONValue, init: ExtendedInit = {}) {
  if (init.emitGlobalEvents !== false) dispatchStart();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...defaultHeaders, "Content-Type": "application/json", ...(init.headers || {}) },
      body: JSON.stringify(body),
      cache: "no-store",
      credentials: "same-origin",
      redirect: "error",
      ...init,
    });
    const data = await handleResponse(res);
    return data as T;
  } finally {
    if (init.emitGlobalEvents !== false) dispatchEnd();
  }
}

export async function putJSON<T = any>(url: string, body: JSONValue, init: ExtendedInit = {}) {
  if (init.emitGlobalEvents !== false) dispatchStart();
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...defaultHeaders, "Content-Type": "application/json", ...(init.headers || {}) },
      body: JSON.stringify(body),
      cache: "no-store",
      credentials: "same-origin",
      redirect: "error",
      ...init,
    });
    const data = await handleResponse(res);
    return data as T;
  } finally {
    if (init.emitGlobalEvents !== false) dispatchEnd();
  }
}

export async function deleteJSON<T = any>(url: string, init: ExtendedInit = {}) {
  if (init.emitGlobalEvents !== false) dispatchStart();
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { ...defaultHeaders, ...(init.headers || {}) },
      cache: "no-store",
      credentials: "same-origin",
      redirect: "error",
      ...init,
    });
    const data = await handleResponse(res);
    return data as T;
  } finally {
    if (init.emitGlobalEvents !== false) dispatchEnd();
  }
}