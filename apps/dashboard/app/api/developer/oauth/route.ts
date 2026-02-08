import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVER_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVER_BASE_URL || "http://localhost:3000";

// GET /api/developer/oauth - Get connected OAuth accounts
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${AUTH_SERVER_URL}/api/developer/oauth`, {
      method: "GET",
      headers: {
        Cookie: `dev_token=${token}`,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("OAuth accounts proxy error:", error);
    return NextResponse.json(
      { error: "Failed to forward request" },
      { status: 500 },
    );
  }
}

// DELETE /api/developer/oauth?id=<accountId> - Disconnect OAuth account
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const accountId = url.searchParams.get("id");

    const response = await fetch(
      `${AUTH_SERVER_URL}/api/developer/oauth?id=${accountId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: `dev_token=${token}`,
        },
      },
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("OAuth disconnect proxy error:", error);
    return NextResponse.json(
      { error: "Failed to forward request" },
      { status: 500 },
    );
  }
}
