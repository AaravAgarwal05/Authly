export const runtime = "nodejs";

import { NextResponse } from "next/server";

const AUTH_SERVER_URL =
  process.env.AUTHLY_SERVER_BASE_URL || "http://localhost:3000";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${error}`, url.origin),
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=no_code", url.origin));
    }

    // Forward to auth server callback with code and state
    // Use redirect: 'manual' to prevent automatic redirects
    const callbackUrl = `${AUTH_SERVER_URL}/api/developer/oauth/callback?code=${code}&state=${state || ""}&provider=github`;
    console.log("[GitHub OAuth] Calling auth server:", callbackUrl);

    const res = await fetch(callbackUrl, {
      redirect: "manual",
    });

    console.log("[GitHub OAuth] Auth server response status:", res.status);
    console.log(
      "[GitHub OAuth] Auth server response headers:",
      Object.fromEntries(res.headers.entries()),
    );

    // Auth server returns a redirect response with Set-Cookie header
    // We need to extract the cookie and redirect URL
    const setCookie = res.headers.get("set-cookie");
    const location = res.headers.get("location");

    console.log("[GitHub OAuth] Set-Cookie header:", setCookie);
    console.log("[GitHub OAuth] Location header:", location);

    if (!setCookie || !location) {
      console.error("[GitHub OAuth] Missing cookie or location");
      return NextResponse.redirect(
        new URL("/login?error=callback_failed", url.origin),
      );
    }

    // Create redirect response to dashboard
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", url.origin),
    );

    // Parse and set the auth cookie
    const cookieParts = setCookie.split(";");
    const [cookieNameValue] = cookieParts;

    // Split only on first '=' to preserve JWT token (which may contain '=' in base64)
    const firstEqualIndex = cookieNameValue.indexOf("=");
    const name = cookieNameValue.substring(0, firstEqualIndex).trim();
    const value = cookieNameValue.substring(firstEqualIndex + 1).trim();

    console.log("[GitHub OAuth] Cookie name:", name);
    console.log("[GitHub OAuth] Cookie value:", value);

    // Return HTML with meta refresh redirect
    // The Set-Cookie header will be set by the Response
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=/dashboard">
          <title>Redirecting...</title>
        </head>
        <body>
          <p>Logging you in...</p>
        </body>
      </html>
    `;

    console.log(
      "[GitHub OAuth] Returning HTML with meta refresh and Set-Cookie header",
    );
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Set-Cookie": setCookie,
      },
    });
  } catch (error) {
    console.error("[Dashboard GitHub OAuth Callback Error]", error);
    const url = new URL(req.url);
    return NextResponse.redirect(
      new URL("/login?error=callback_error", url.origin),
    );
  }
}
