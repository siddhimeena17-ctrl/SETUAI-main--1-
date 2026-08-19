import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

const publicAdminRoutes = ["/admin/login", "/admin/setup", "/admin/2fa", "/admin/2fa/setup"];

function withAdminSecurityHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  return response;
}

function isPublicAdminRoute(pathname: string) {
  return publicAdminRoutes.includes(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isAdminApi && !isAdminPage) return NextResponse.next();

  if (isAdminPage && isPublicAdminRoute(pathname)) {
    return withAdminSecurityHeaders(NextResponse.next());
  }

  const session = verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    if (isAdminApi) {
      return withAdminSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withAdminSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return withAdminSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
