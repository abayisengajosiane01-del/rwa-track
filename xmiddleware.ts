import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  exp?: number;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const pathname = req.nextUrl.pathname;

  // Role-based route protection
  const roleRoutes: Record<string, string[]> = {
    "/admin": ["ADMIN"],
    "/hr": ["HR", "ADMIN"],
    "/employee": ["EMPLOYEE", "HR", "ADMIN"],
  };

  const protectedRoutes = Object.keys(roleRoutes);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Auth pages that logged-in users shouldn't access
  const authPages = ["/login", "/register"];
  const isAuthPage = authPages.includes(pathname);

  // Public routes that don't need authentication
  const publicRoutes = ["/", "/about", "/contact"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Handle auth pages - redirect logged-in users to their dashboard
  if (isAuthPage && token) {
    try {
      const decoded = jwt.decode(token) as TokenPayload;

      // Check if token is expired
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        // Token expired, allow access to auth pages
        return NextResponse.next();
      }

      // Token valid, redirect to appropriate dashboard
      const role = decoded?.role;
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else if (role === "HR") {
        return NextResponse.redirect(new URL("/hr", req.url));
      } else if (role === "EMPLOYEE") {
        return NextResponse.redirect(new URL("/employee", req.url));
      }
    } catch (error) {
      // Invalid token, allow access to auth pages
      return NextResponse.next();
    }
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute) {
    // No token, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = jwt.decode(token) as TokenPayload;

      // Check if token is expired
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        loginUrl.searchParams.set("reason", "expired");
        return NextResponse.redirect(loginUrl);
      }

      // Verify token with backend
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
      try {
        jwt.verify(token, JWT_SECRET);
      } catch (error) {
        // Invalid token
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        loginUrl.searchParams.set("reason", "invalid");
        return NextResponse.redirect(loginUrl);
      }

      const userRole = decoded?.role;

      // Find required roles for current route
      const requiredRoles = Object.entries(roleRoutes).find(([route]) =>
        pathname.startsWith(route),
      )?.[1];

      // Check if user has required role
      if (!userRole || !requiredRoles?.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "error");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/hr/:path*",
    "/employee/:path*",
    "/login",
    "/register",
  ],
};
