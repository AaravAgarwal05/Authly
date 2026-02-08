export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { developers, developerOAuthAccounts } from "@/db/schema/developer";
import { signDeveloperToken, getTokenExpirySeconds } from "@/lib/auth/jwt";
import { eq, and } from "drizzle-orm";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;
const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_BASE_URL || "http://localhost:3001";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture: string;
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUserInfo {
  id: number;
  login: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface OAuthResult {
  email: string;
  emailVerified: boolean;
  providerUserId: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const providerParam = url.searchParams.get("provider");

    if (error) {
      return NextResponse.redirect(`${DASHBOARD_URL}/login?error=${error}`);
    }

    if (!code) {
      return NextResponse.redirect(`${DASHBOARD_URL}/login?error=no_code`);
    }

    // Determine provider based on parameter or try both
    let provider: "google" | "github" | null = null;
    let email: string | null = null;
    let emailVerified = false;
    let providerUserId: string | null = null;

    // Use provider parameter if provided
    if (
      providerParam === "google" &&
      GOOGLE_CLIENT_ID &&
      GOOGLE_CLIENT_SECRET
    ) {
      try {
        const googleResult = await handleGoogleOAuth(code);
        if (googleResult) {
          provider = "google";
          email = googleResult.email;
          emailVerified = googleResult.emailVerified;
          providerUserId = googleResult.providerUserId;
        }
      } catch (err) {
        console.error("Google OAuth error:", err);
      }
    } else if (
      providerParam === "github" &&
      GITHUB_CLIENT_ID &&
      GITHUB_CLIENT_SECRET
    ) {
      try {
        const githubResult = await handleGitHubOAuth(code);
        if (githubResult) {
          provider = "github";
          email = githubResult.email;
          emailVerified = githubResult.emailVerified;
          providerUserId = githubResult.providerUserId;
        }
      } catch (err) {
        console.error("GitHub OAuth error:", err);
      }
    } else {
      // Fallback: Try Google first, then GitHub
      if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
        try {
          const googleResult = await handleGoogleOAuth(code);
          if (googleResult) {
            provider = "google";
            email = googleResult.email;
            emailVerified = googleResult.emailVerified;
            providerUserId = googleResult.providerUserId;
          }
        } catch (err) {
          console.log("Not a Google OAuth flow, trying GitHub...");
        }
      }

      if (!provider && GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
        try {
          const githubResult = await handleGitHubOAuth(code);
          if (githubResult) {
            provider = "github";
            email = githubResult.email;
            emailVerified = githubResult.emailVerified;
            providerUserId = githubResult.providerUserId;
          }
        } catch (err) {
          console.log("Not a GitHub OAuth flow either");
        }
      }
    }

    if (!email || !providerUserId || !provider) {
      return NextResponse.redirect(`${DASHBOARD_URL}/login?error=oauth_failed`);
    }

    // Check if developer exists
    const [existingDeveloper] = await db
      .select()
      .from(developers)
      .where(eq(developers.email, email))
      .limit(1);

    let developerId: string;

    if (existingDeveloper) {
      // Login existing developer
      developerId = existingDeveloper.id;

      // Update email verification if OAuth email is verified
      if (emailVerified && !existingDeveloper.emailVerified) {
        await db
          .update(developers)
          .set({ emailVerified: true })
          .where(eq(developers.id, developerId));
      }
    } else {
      // Create new developer
      const [newDeveloper] = await db
        .insert(developers)
        .values({
          email,
          emailVerified,
          passwordHash: null, // OAuth users don't have passwords
        })
        .returning({ id: developers.id });

      developerId = newDeveloper.id;
    }

    // Save or update OAuth account
    const [existingOAuthAccount] = await db
      .select()
      .from(developerOAuthAccounts)
      .where(
        and(
          eq(developerOAuthAccounts.developerId, developerId),
          eq(developerOAuthAccounts.provider, provider),
        ),
      )
      .limit(1);

    if (!existingOAuthAccount) {
      await db.insert(developerOAuthAccounts).values({
        developerId,
        provider,
        providerUserId,
        providerEmail: email,
      });
    }

    // Generate JWT token
    const token = signDeveloperToken(developerId);
    const maxAge = getTokenExpirySeconds();

    const response = NextResponse.redirect(`${DASHBOARD_URL}/dashboard`);

    response.cookies.set("authly_dev_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from strict to lax for OAuth redirects
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("[OAuth Callback Error]", error);
    return NextResponse.redirect(`${DASHBOARD_URL}/login?error=callback_error`);
  }
}

async function handleGoogleOAuth(code: string): Promise<OAuthResult | null> {
  const redirectUri = `${DASHBOARD_URL}/api/oauth/google/callback`;

  // Exchange code for token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to exchange Google code for token");
  }

  const tokenData: GoogleTokenResponse = await tokenResponse.json();

  // Get user info
  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );

  if (!userResponse.ok) {
    throw new Error("Failed to get Google user info");
  }

  const userData: GoogleUserInfo = await userResponse.json();

  return {
    email: userData.email,
    emailVerified: userData.verified_email,
    providerUserId: userData.id,
  };
}

async function handleGitHubOAuth(code: string): Promise<OAuthResult | null> {
  const redirectUri = `${DASHBOARD_URL}/api/oauth/github/callback`;

  // Exchange code for token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: GITHUB_CLIENT_ID!,
        client_secret: GITHUB_CLIENT_SECRET!,
        redirect_uri: redirectUri,
      }),
    },
  );

  if (!tokenResponse.ok) {
    throw new Error("Failed to exchange GitHub code for token");
  }

  const tokenData: GitHubTokenResponse = await tokenResponse.json();

  // Get user info
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!userResponse.ok) {
    throw new Error("Failed to get GitHub user info");
  }

  const userData: GitHubUserInfo = await userResponse.json();

  // Get primary email if not in user data
  let email = userData.email;
  let emailVerified = false;

  if (!email) {
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (emailResponse.ok) {
      const emails: GitHubEmail[] = await emailResponse.json();
      const primaryEmail = emails.find((e) => e.primary);
      if (primaryEmail) {
        email = primaryEmail.email;
        emailVerified = primaryEmail.verified;
      }
    }
  }

  if (!email) {
    throw new Error("No email found in GitHub account");
  }

  return {
    email,
    emailVerified,
    providerUserId: userData.id.toString(),
  };
}
