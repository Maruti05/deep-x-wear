// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 👇 This will load/refresh the session automatically
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session → redirect to login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Example role check (if you stored `role` in JWT or DB)
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const role = (session.user.user_metadata?.role ?? "user") as string;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"], // Only protect admin routes
};
