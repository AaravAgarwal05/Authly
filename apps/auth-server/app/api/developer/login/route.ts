export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { developers } from "@/db/schema/developer";
import { developerLoginSchema } from "@/lib/validators/developer-auth";
import { verifyPassword } from "@/lib/auth/password";
import { signDeveloperToken, getTokenExpirySeconds } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";

// Constants
const INVALID_CREDENTIALS_ERROR = { error: "Invalid credentials" };
const GENERIC_ERROR = { error: "An error occurred. Please try again." };

export async function POST(req: Request) {
  try {
    // Safe JSON parsing
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate input
    const parsed = developerLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    // Fetch developer
    const [developer] = await db
      .select({
        id: developers.id,
        email: developers.email,
        passwordHash: developers.passwordHash,
        emailVerified: developers.emailVerified,
      })
      .from(developers)
      .where(eq(developers.email, email))
      .limit(1);

    // Constant-time-ish response for non-existent users
    // Still verify against a dummy hash to prevent timing attacks
    if (!developer || !developer.passwordHash) {
      // Perform dummy hash comparison to normalize timing
      await verifyPassword(
        password,
        "$2a$12$000000000000000000000uGQM6dz8dN8s3VkPz0p5h0gzOkj8kxK6",
      );
      return NextResponse.json(INVALID_CREDENTIALS_ERROR, { status: 401 });
    }

    // Verify password
    const valid = await verifyPassword(password, developer.passwordHash);
    if (!valid) {
      return NextResponse.json(INVALID_CREDENTIALS_ERROR, { status: 401 });
    }

    // Check email verification (optional: uncomment if you want to enforce)
    // if (!developer.emailVerified) {
    //   return NextResponse.json(
    //     { error: "Please verify your email before logging in" },
    //     { status: 403 },
    //   );
    // }

    // Generate token and set cookie
    const token = signDeveloperToken(developer.id);
    const maxAge = getTokenExpirySeconds();

    const res = NextResponse.json({
      success: true,
      developer: {
        id: developer.id,
        email: developer.email,
        emailVerified: developer.emailVerified,
      },
    });

    res.cookies.set("authly_dev_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });

    return res;
  } catch (error) {
    console.error("[Developer Login Error]", error);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }
}
