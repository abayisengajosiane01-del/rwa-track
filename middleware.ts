import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PROTECTED_ROUTES = {
  "/admin": ["ADMIN"],
  "/hr": ["ADMIN", "HR"],
  "/employee": ["ADMIN", "HR", "EMPLOYEE"],
  "/dashboard": ["ADMIN", "HR", "EMPLOYEE"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires protection
  const protectedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
    pathname.startsWith(route),
  );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check role access
  const allowedRoles =
    PROTECTED_ROUTES[protectedRoute as keyof typeof PROTECTED_ROUTES];

  if (!allowedRoles.includes(payload.role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/hr/:path*",
    "/employee/:path*",
    "/dashboard/:path*",
  ],
};
