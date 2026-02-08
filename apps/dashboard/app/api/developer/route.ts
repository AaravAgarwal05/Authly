export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyDeveloperToken } from "@/lib/auth";

const AUTH_SERVER_URL =
  process.env.AUTHLY_SERVER_BASE_URL || "http://localhost:3000";

// Get developer info
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyDeveloperToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Forward to auth server to get full developer info
    const res = await fetch(`${AUTH_SERVER_URL}/api/developer/me`, {
      headers: { cookie: `authly_dev_token=${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch developer info" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Get Developer Error]", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
