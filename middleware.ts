import { NextRequest, NextResponse } from "next/server";
import { decodeSessionToken } from "@/lib/session-token";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/logout", "/_next", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));
  const token = req.cookies.get("session_token")?.value;
  const hasSession = !!token && !!decodeSessionToken(token);

  if (!isPublic && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"]
};
