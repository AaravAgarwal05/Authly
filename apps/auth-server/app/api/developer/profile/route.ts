import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { developers } from "@/db/schema/developer";
import { eq } from "drizzle-orm";
import { verifyDeveloperToken } from "@/lib/auth/jwt";

export const runtime = "nodejs";

// GET /api/developer/profile - Get developer profile
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyDeveloperToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const [developer] = await db
      .select({
        id: developers.id,
        name: developers.name,
        email: developers.email,
        emailVerified: developers.emailVerified,
      })
      .from(developers)
      .where(eq(developers.id, payload.sub))
      .limit(1);

    if (!developer) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(developer);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PATCH /api/developer/profile - Update developer profile
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyDeveloperToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be less than 100 characters" },
        { status: 400 },
      );
    }

    const [updatedDeveloper] = await db
      .update(developers)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(developers.id, payload.sub))
      .returning({
        id: developers.id,
        name: developers.name,
        email: developers.email,
        emailVerified: developers.emailVerified,
      });

    if (!updatedDeveloper) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      developer: updatedDeveloper,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
