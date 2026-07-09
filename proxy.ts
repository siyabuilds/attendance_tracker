import { NextRequest, NextResponse } from "next/server";

import { adminSessionCookieName, readAdminSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(adminSessionCookieName)?.value;
  const session = await readAdminSessionToken(token);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login") && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
