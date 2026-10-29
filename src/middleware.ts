import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard", "/transactions", "/categories",
  "/profile", "/budgets", "/recurring", "/admin", "/analytics",
];

// In-memory rate limit store (resets on cold start — good enough for Edge)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);

  // Rate limit auth endpoints: 10 requests per minute per IP
  if (pathname === "/api/auth/callback/credentials" || pathname === "/api/auth/register") {
    const allowed = checkRateLimit(`auth:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen bir dakika bekleyin." },
        { status: 429 }
      );
    }
  }

  // Rate limit AI endpoints: 20 requests per minute per IP
  if (pathname === "/api/ai-chat" || pathname === "/api/insights") {
    const allowed = checkRateLimit(`ai:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen bekleyin." },
        { status: 429 }
      );
    }
  }

  // Protect app routes
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtected) {
    const token =
      req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/categories/:path*",
    "/profile/:path*",
    "/budgets/:path*",
    "/recurring/:path*",
    "/admin/:path*",
    "/analytics/:path*",
    "/api/auth/callback/credentials",
    "/api/auth/register",
    "/api/ai-chat",
    "/api/insights",
  ],
};
