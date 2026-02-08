import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { developerOAuthAccounts } from "@/db/schema/developer";
import { eq } from "drizzle-orm";
import { verifyDeveloperToken } from "@/lib/auth/jwt";

export const runtime = "nodejs";

// GET /api/developer/oauth - Get connected OAuth accounts
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

    const oauthAccounts = await db
      .select({
        id: developerOAuthAccounts.id,
        provider: developerOAuthAccounts.provider,
        providerEmail: developerOAuthAccounts.providerEmail,
        createdAt: developerOAuthAccounts.createdAt,
      })
      .from(developerOAuthAccounts)
      .where(eq(developerOAuthAccounts.developerId, payload.sub));

    return NextResponse.json({
      accounts: oauthAccounts,
    });
  } catch (error) {
    console.error("OAuth accounts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch OAuth accounts" },
      { status: 500 },
    );
  }
}

// DELETE /api/developer/oauth/:id - Disconnect OAuth account
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyDeveloperToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const url = new URL(request.url);
    const accountId = url.searchParams.get("id");

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    // Verify the account belongs to this developer
    const [account] = await db
      .select()
      .from(developerOAuthAccounts)
      .where(eq(developerOAuthAccounts.id, accountId))
      .limit(1);

    if (!account) {
      return NextResponse.json(
        { error: "OAuth account not found" },
        { status: 404 },
      );
    }

    if (account.developerId !== payload.sub) {
      return NextResponse.json(
        { error: "Unauthorized to disconnect this account" },
        { status: 403 },
      );
    }

    // Delete the OAuth account
    await db
      .delete(developerOAuthAccounts)
      .where(eq(developerOAuthAccounts.id, accountId));

    return NextResponse.json({
      success: true,
      message: "OAuth account disconnected successfully",
    });
  } catch (error) {
    console.error("OAuth disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect OAuth account" },
      { status: 500 },
    );
  }
}
