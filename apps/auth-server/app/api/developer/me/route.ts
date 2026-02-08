export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/db";
import { developers } from "@/db/schema/developer";
import { verifyDeveloperToken } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // Get token from cookie
    const cookie = req.headers.get("cookie");
    const tokenMatch = cookie?.match(/authly_dev_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decoded = verifyDeveloperToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch developer
    const [developer] = await db
      .select({
        id: developers.id,
        name: developers.name,
        email: developers.email,
        emailVerified: developers.emailVerified,
        createdAt: developers.createdAt,
      })
      .from(developers)
      .where(eq(developers.id, decoded.sub))
      .limit(1);

    if (!developer) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 },
      );
    }

    // Generate name from email if not set
    const displayName = developer.name || developer.email.split("@")[0];

    // Generate Gravatar URL
    const emailHash = await generateEmailHash(developer.email);
    const avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=200`;

    return NextResponse.json({
      developer: {
        id: developer.id,
        email: developer.email,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        emailVerified: developer.emailVerified,
        avatarUrl,
        createdAt: developer.createdAt,
      },
    });
  } catch (error) {
    console.error("[Get Developer Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch developer" },
      { status: 500 },
    );
  }
}

async function generateEmailHash(email: string): Promise<string> {
  const trimmed = email.trim().toLowerCase();
  return createHash("md5").update(trimmed).digest("hex");
}
