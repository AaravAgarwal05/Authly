export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { developers } from "@/db/schema/developer";
import { developerSignupSchema } from "@/lib/validators/developer-auth";
import { hashPassword } from "@/lib/auth/password";
import { signDeveloperToken, getTokenExpirySeconds } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";

// Constants
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
    const parsed = developerSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    // Check for existing user
    const existing = await db
      .select({ id: developers.id })
      .from(developers)
      .where(eq(developers.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Hash password and create developer
    const passwordHash = await hashPassword(password);

    const [developer] = await db
      .insert(developers)
      .values({
        email,
        passwordHash,
        emailVerified: false,
      })
      .returning({
        id: developers.id,
        email: developers.email,
        emailVerified: developers.emailVerified,
      });

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
      // Reminder to verify email
      message: "Account created. Please verify your email.",
    });

    res.cookies.set("authly_dev_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });

    // TODO: Send verification email here
    // await sendVerificationEmail(developer.id, developer.email);

    return res;
  } catch (error) {
    console.error("[Developer Signup Error]", error);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }
}
