// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authCookie = req.cookies.get("auth")?.value;

  if (!authCookie) {
    // Not logged in → redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { user } = JSON.parse(authCookie);

    // If not admin, block access
    if (req.nextUrl.pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // Apply only to admin routes
};
