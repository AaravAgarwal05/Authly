import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVER_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVER_BASE_URL || "http://localhost:3000";

// PATCH /api/developer/password - Update developer password
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.text();

    const response = await fetch(`${AUTH_SERVER_URL}/api/developer/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `dev_token=${token}`,
      },
      body,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Password proxy error:", error);
    return NextResponse.json(
      { error: "Failed to forward request" },
      { status: 500 },
    );
  }
}
