export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", service: "authly-auth-server" });
}
