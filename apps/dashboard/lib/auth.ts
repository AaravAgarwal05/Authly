import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTHLY_JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("AUTHLY_JWT_SECRET environment variable is required");
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

export interface Developer {
  id: string;
  email: string;
  emailVerified: boolean;
}
