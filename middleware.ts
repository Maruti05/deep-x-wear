// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // Enforce HTTPS in production when behind a proxy
  const proto = req.headers.get("x-forwarded-proto");
  if (process.env.NODE_ENV === "production" && proto && proto !== "https") {
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 301 });
  }

  const res = NextResponse.next();

  // Issue CSRF token cookie (double-submit token) for all routes if missing
  const csrfCookie = req.cookies.get("csrf_token")?.value;
  if (!csrfCookie) {
    const token = crypto.randomUUID();
    res.cookies.set("csrf_token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
  }

  // Admin guard: only for /admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = (session.user.user_metadata?.role ?? "user") as string;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/(.*)"], // Run middleware for all routes (admin guard applies only to /admin/*)
};
