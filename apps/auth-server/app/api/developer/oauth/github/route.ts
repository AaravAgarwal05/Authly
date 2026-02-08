export const runtime = "nodejs";

import { NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_BASE_URL || "http://localhost:3001";

export async function GET() {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured" },
      { status: 500 },
    );
  }

  const redirectUri = `${DASHBOARD_URL}/api/oauth/github/callback`;
  const scope = "read:user user:email";
  const state = crypto.randomUUID();

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
