import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "huellitas_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "huellitas-felices-secure-jwt-secret-key-2026-production-ready"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      // Clients should not access internal clinic dashboard
      if (role === "client") {
        return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
      }

      // Propagate user metadata downstream
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", String(payload.id || ""));
      requestHeaders.set("x-user-role", role || "");
      requestHeaders.set("x-user-email", (payload.email as string) || "");
      requestHeaders.set("x-user-name", (payload.name as string) || "");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // If already logged in and navigates to /login, redirect to /dashboard
  if (pathname === "/login") {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // Token invalid, allow login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
