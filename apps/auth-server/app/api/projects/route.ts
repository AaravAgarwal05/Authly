export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import {
  projects,
  projectAuthSettings,
  projectKeys,
} from "@/db/schema/project";
import { eq, and, desc } from "drizzle-orm";
import { verifyDeveloperToken } from "@/lib/auth/jwt";
import { generateApiKey } from "@/lib/auth/api-keys";

// Get all projects for the authenticated developer
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyDeveloperToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch all projects owned by this developer
    const developerProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerDeveloperId, decoded.sub))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json({ projects: developerProjects });
  } catch (error) {
    console.error("[Get Projects Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

// Create a new project
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authly_dev_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyDeveloperToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, authConfig } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Validate slug format (lowercase alphanumeric with hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          error:
            "Invalid slug format. Use lowercase letters, numbers, and hyphens only.",
        },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (existingProject.length > 0) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 },
      );
    }

    // Create the project
    const [newProject] = await db
      .insert(projects)
      .values({
        name,
        slug,
        ownerDeveloperId: decoded.sub,
        allowedOrigins: [],
        isActive: true,
      })
      .returning();

    // Create default auth settings
    const authSettings = {
      projectId: newProject.id,
      enableEmailPassword: authConfig?.enableEmailPassword ?? true,
      enableGoogleOAuth: authConfig?.enableGoogleOAuth ?? false,
      enableGithubOAuth: authConfig?.enableGithubOAuth ?? false,
      enableMicrosoftOAuth: false,
      enableAppleOAuth: false,
      requireEmailVerification: true,
      allowSignup: true,
      accessTokenTTLMinutes: 15,
      refreshTokenTTLDays: 7,
      minPasswordLength: 8,
      requireUppercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
    };

    await db.insert(projectAuthSettings).values(authSettings);

    // Auto-generate development API keys
    const publishableKey = await generateApiKey("publishable", "dev");
    const secretKey = await generateApiKey("secret", "dev");

    await db.insert(projectKeys).values([
      {
        projectId: newProject.id,
        type: "publishable",
        keyHash: publishableKey.keyHash,
        keyPrefix: publishableKey.keyPrefix,
        name: "Development Publishable Key",
        revoked: false,
      },
      {
        projectId: newProject.id,
        type: "secret",
        keyHash: secretKey.keyHash,
        keyPrefix: secretKey.keyPrefix,
        name: "Development Secret Key",
        revoked: false,
      },
    ]);

    return NextResponse.json(
      {
        message: "Project created successfully",
        project: newProject,
        authSettings,
        keys: {
          publishable: publishableKey.key,
          secret: secretKey.key,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Create Project Error]", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
