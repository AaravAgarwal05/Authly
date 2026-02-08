import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyDeveloperToken } from "./lib/auth";

const publicRoutes = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    const token = request.cookies.get("authly_dev_token")?.value;
    // Redirect to dashboard if already logged in
    if (token && verifyDeveloperToken(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  const token = request.cookies.get("authly_dev_token")?.value;

  if (!token || !verifyDeveloperToken(token)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (not protected here)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
