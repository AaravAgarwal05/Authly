export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { projects, projectKeys } from "@/db/schema/project";
import { eq, and, desc } from "drizzle-orm";
import { verifyDeveloperToken } from "@/lib/auth/jwt";
import { generateApiKey, maskApiKey } from "@/lib/auth/api-keys";

// Get all keys for a project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyDeveloperToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify project ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.ownerDeveloperId, decoded.sub),
        ),
      )
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch all keys for this project
    const keys = await db
      .select()
      .from(projectKeys)
      .where(eq(projectKeys.projectId, projectId))
      .orderBy(desc(projectKeys.createdAt));

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("[Get Keys Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch keys" },
      { status: 500 },
    );
  }
}

// Create a new API key
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyDeveloperToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify project ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.ownerDeveloperId, decoded.sub),
        ),
      )
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, name, environment = "dev" } = body;

    // Validate type
    if (!type || !["publishable", "secret"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid key type. Must be 'publishable' or 'secret'" },
        { status: 400 },
      );
    }

    // Generate the API key
    const { key, keyHash, keyPrefix } = await generateApiKey(
      type as "publishable" | "secret",
      environment as "dev" | "prod",
    );

    // Store the key in database
    const [newKey] = await db
      .insert(projectKeys)
      .values({
        projectId,
        type: type as "publishable" | "secret",
        keyHash,
        keyPrefix,
        name: name || null,
        revoked: false,
      })
      .returning();

    // Return the full key (only time it's shown) and key info
    return NextResponse.json(
      {
        message: "API key created successfully",
        key, // Full key - only shown once!
        keyInfo: {
          ...newKey,
          maskedKey: maskApiKey(key),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Create Key Error]", error);
    return NextResponse.json(
      { error: "Failed to create key" },
      { status: 500 },
    );
  }
}
