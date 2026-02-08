import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";

const JWT_SECRET = process.env.AUTHLY_JWT_SECRET as string;
const EXPIRES_IN =
  (process.env.AUTHLY_JWT_EXPIRES_IN as ms.StringValue) || "15m";

// Validate at startup
if (!JWT_SECRET) {
  throw new Error("AUTHLY_JWT_SECRET environment variable is required");
}

if (JWT_SECRET.length < 12) {
  throw new Error("AUTHLY_JWT_SECRET must be at least 12 characters");
}

const signOptions: SignOptions = {
  expiresIn: EXPIRES_IN,
  algorithm: "HS256",
};

export function signDeveloperToken(developerId: string): string {
  return jwt.sign(
    { sub: developerId, type: "developer", iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    signOptions,
  );
}

export function verifyDeveloperToken(token: string): {
  sub: string;
  type: "developer";
  iat: number;
  exp: number;
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as {
      sub: string;
      type: "developer";
      iat: number;
      exp: number;
    };
    if (decoded.type !== "developer") return null;
    return decoded;
  } catch {
    return null;
  }
}

// Parse expiry string to seconds for cookie maxAge
export function getTokenExpirySeconds(): number {
  const match = EXPIRES_IN.match(/^(\d+)(m|h|d)$/);
  if (!match) return 900; // default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      return 900;
  }
}
