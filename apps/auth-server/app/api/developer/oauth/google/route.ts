export const runtime = "nodejs";

import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_BASE_URL || "http://localhost:3001";

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 500 },
    );
  }

  const redirectUri = `${DASHBOARD_URL}/api/oauth/google/callback`;
  const scope = "openid email profile";
  const state = crypto.randomUUID();

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
