import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isTrainerRoute = pathname.startsWith("/trainer");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isTrainerRoute || isAdminRoute) {
    const sessionCookie = request.cookies.get("user_session")?.value;

    let user = null;
    if (sessionCookie) {
      user = await verifySession(sessionCookie);
    }

    // Redirect to login if not authenticated
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admins have access to everything, trainers only to trainer routes
    if (isAdminRoute && user.role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=admin-only", request.url));
    }

    if (isTrainerRoute && user.role !== "trainer" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=trainer-only", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/trainer/:path*", "/admin/:path*"],
};
