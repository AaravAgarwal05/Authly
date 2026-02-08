import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVER_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVER_BASE_URL || "http://localhost:3000";

// GET /api/developer/profile - Get developer profile
// PATCH /api/developer/profile - Update developer profile
export async function GET(request: NextRequest) {
  return forwardRequest(request, "GET");
}

export async function PATCH(request: NextRequest) {
  return forwardRequest(request, "PATCH");
}

async function forwardRequest(request: NextRequest, method: string) {
  try {
    const token = request.cookies.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = method === "PATCH" ? await request.text() : undefined;

    const response = await fetch(`${AUTH_SERVER_URL}/api/developer/profile`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: `dev_token=${token}`,
      },
      body,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Profile proxy error:", error);
    return NextResponse.json(
      { error: "Failed to forward request" },
      { status: 500 },
    );
  }
}
