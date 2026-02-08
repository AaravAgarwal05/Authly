export const runtime = "nodejs";

import { NextResponse } from "next/server";

const AUTH_SERVER_URL =
  process.env.AUTHLY_SERVER_BASE_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    // Get cookie to forward to auth server
    const cookie = req.headers.get("cookie");

    // Forward to auth server
    const res = await fetch(`${AUTH_SERVER_URL}/api/developer/logout`, {
      method: "POST",
      headers: cookie ? { cookie } : {},
    });

    const data = await res.json();

    // Get the cookie from auth server response (should clear it)
    const authCookie = res.headers.get("set-cookie");

    const response = NextResponse.json(data);

    // Set the same cookie in dashboard
    if (authCookie) {
      response.headers.set("set-cookie", authCookie);
    }

    return response;
  } catch (error) {
    console.error("[Dashboard Logout Error]", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
