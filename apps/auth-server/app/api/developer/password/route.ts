import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { developers } from "@/db/schema/developer";
import { eq } from "drizzle-orm";
import { verifyDeveloperToken } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

// PATCH /api/developer/password - Update password
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
    const { currentPassword, newPassword } = body;

    // Validation
    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Fetch current developer
    const [developer] = await db
      .select()
      .from(developers)
      .where(eq(developers.id, payload.sub))
      .limit(1);

    if (!developer) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 },
      );
    }

    // If developer has a password (not OAuth-only), verify current password
    if (developer.passwordHash) {
      if (!currentPassword || typeof currentPassword !== "string") {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 },
        );
      }

      const isValidPassword = await verifyPassword(
        currentPassword,
        developer.passwordHash,
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(developers)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(developers.id, payload.sub));

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }
}
