export const runtime = "nodejs";

import { NextResponse } from "next/server";

const AUTH_SERVER_URL =
  process.env.AUTHLY_SERVER_BASE_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Forward to auth server
    const res = await fetch(`${AUTH_SERVER_URL}/api/developer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Get the cookie from auth server response
    const authCookie = res.headers.get("set-cookie");

    const response = NextResponse.json(data);

    // Set the same cookie in dashboard
    if (authCookie) {
      response.headers.set("set-cookie", authCookie);
    }

    return response;
  } catch (error) {
    console.error("[Dashboard Login Error]", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
