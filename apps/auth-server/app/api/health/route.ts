export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Test database connectivity
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({
      status: "ok",
      service: "authly-auth-server",
      database: "connected",
    });
  } catch (error) {
    console.error("[Health Check Error]", error);
    return NextResponse.json(
      {
        status: "error",
        service: "authly-auth-server",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
