// app/api/user-details/route.ts
import { NextResponse } from "next/server";
import { getUserById, insertUser, updateUser } from "@/lib/queries/user";
import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

// Simple in-memory rate limiting (per process). Consider moving to Redis for production scale.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // max requests per window
const rateMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

// CSRF verification using double-submit token
function verifyCsrf(request: Request) {
  const csrfHeader = request.headers.get("x-csrf-token") || request.headers.get("X-CSRF-Token");
  // Next.js does not expose cookies directly here; we parse from header
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  const csrfCookie = match ? decodeURIComponent(match[1]) : "";
  return Boolean(csrfHeader && csrfCookie && csrfHeader === csrfCookie);
}

async function getSessionUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// Schemas
const insertSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone_number: z.string().optional(),
  user_id: z.string().uuid().optional(),
  user_address: z.string().optional(),
  city: z.string().optional(),
  state_name: z.string().optional(),
  pin_code: z.number().int().min(100000).max(999999).optional(),
  country: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

const updateSchema = insertSchema.partial();

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

// GET → fetch user
export async function GET(req: Request) {
  try {
    const ip = (req as any).ip || "unknown";
    if (!rateLimit(`user-details:${ip}:GET`)) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    const user = await getSessionUser();
    const details = await getUserById(user.id);
    return NextResponse.json(details);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

// POST → insert new user row
export async function POST(req: Request) {
  try {
    const ip = (req as any).ip || "unknown";
    if (!rateLimit(`user-details:${ip}:POST`)) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    if (!verifyCsrf(req)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const json = await req.json();
    const body = insertSchema.parse(json);

    let userId: string | undefined;
    try {
      const sessionUser = await getSessionUser();
      userId = sessionUser?.id;
    } catch {
      // no session → first signup
    }

    if (!userId && !body.user_id) {
      throw new Error("No session or user_id provided");
    }

    const details = await insertUser({
      user_id: userId ?? body.user_id!, // fallback
      ...body,
    });

    return NextResponse.json(details);
  } catch (err: any) {
    const status = err instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// PUT → update user row
export async function PUT(req: Request) {
  try {
    const ip = (req as any).ip || "unknown";
    if (!rateLimit(`user-details:${ip}:PUT`)) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    if (!verifyCsrf(req)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const user = await getSessionUser();
    const json = await req.json();
    const body = updateSchema.parse(json);
    const details = await updateUser(user.id, body);
    return NextResponse.json(details);
  } catch (err: any) {
    const status = err instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
