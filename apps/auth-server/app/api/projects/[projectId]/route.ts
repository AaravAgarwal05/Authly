export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { projects, projectAuthSettings } from "@/db/schema/project";
import { eq, and } from "drizzle-orm";
import { verifyDeveloperToken } from "@/lib/auth/jwt";

// Get a specific project with its auth settings
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

    // Fetch project and verify ownership
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

    // Fetch auth settings
    const [authSettings] = await db
      .select()
      .from(projectAuthSettings)
      .where(eq(projectAuthSettings.projectId, projectId))
      .limit(1);

    return NextResponse.json({
      project,
      authSettings: authSettings || null,
    });
  } catch (error) {
    console.error("[Get Project Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// Update project settings
export async function PATCH(
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
    const { name, allowedOrigins, isActive, authConfig } = body;

    // Update project if fields provided
    if (
      name !== undefined ||
      allowedOrigins !== undefined ||
      isActive !== undefined
    ) {
      const updates: any = { updatedAt: new Date() };
      if (name !== undefined) updates.name = name;
      if (allowedOrigins !== undefined) updates.allowedOrigins = allowedOrigins;
      if (isActive !== undefined) updates.isActive = isActive;

      await db.update(projects).set(updates).where(eq(projects.id, projectId));
    }

    // Update auth settings if provided
    if (authConfig) {
      const authUpdates: any = { updatedAt: new Date() };

      if (authConfig.enableEmailPassword !== undefined) {
        authUpdates.enableEmailPassword = authConfig.enableEmailPassword;
      }
      if (authConfig.enableGoogleOAuth !== undefined) {
        authUpdates.enableGoogleOAuth = authConfig.enableGoogleOAuth;
      }
      if (authConfig.enableGithubOAuth !== undefined) {
        authUpdates.enableGithubOAuth = authConfig.enableGithubOAuth;
      }
      if (authConfig.requireEmailVerification !== undefined) {
        authUpdates.requireEmailVerification =
          authConfig.requireEmailVerification;
      }
      if (authConfig.allowSignup !== undefined) {
        authUpdates.allowSignup = authConfig.allowSignup;
      }

      await db
        .update(projectAuthSettings)
        .set(authUpdates)
        .where(eq(projectAuthSettings.projectId, projectId));
    }

    // Fetch updated data
    const [updatedProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    const [updatedAuthSettings] = await db
      .select()
      .from(projectAuthSettings)
      .where(eq(projectAuthSettings.projectId, projectId))
      .limit(1);

    return NextResponse.json({
      message: "Project updated successfully",
      project: updatedProject,
      authSettings: updatedAuthSettings,
    });
  } catch (error) {
    console.error("[Update Project Error]", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}
