export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyDeveloperToken } from "@/lib/auth";

const AUTH_SERVER_URL =
  process.env.AUTHLY_SERVER_BASE_URL || "http://localhost:3000";

// Get project keys
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyDeveloperToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const res = await fetch(
      `${AUTH_SERVER_URL}/api/projects/${projectId}/keys`,
      {
        headers: { cookie: `authly_dev_token=${token}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Get Project Keys Error]", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

// Create new API key
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
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

    const res = await fetch(
      `${AUTH_SERVER_URL}/api/projects/${projectId}/keys`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `authly_dev_token=${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(error, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Create Project Key Error]", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
