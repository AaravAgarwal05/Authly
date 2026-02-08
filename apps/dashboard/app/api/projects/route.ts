export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyDeveloperToken } from "@/lib/auth";

const AUTH_SERVER_URL =
  process.env.AUTHLY_SERVER_BASE_URL || "http://localhost:3000";

// Get all projects
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

    // Forward to auth server
    const res = await fetch(`${AUTH_SERVER_URL}/api/projects`, {
      headers: { cookie: `authly_dev_token=${token}` },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Get Projects Error]", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// Create project
export async function POST(req: Request) {
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

    const body = await req.json();

    // Forward to auth server
    const res = await fetch(`${AUTH_SERVER_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `authly_dev_token=${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Create Project Error]", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
