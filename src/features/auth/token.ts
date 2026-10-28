import { jwtVerify, SignJWT } from "jose";

export const ACCESS_COOKIE = "cospace_access";
export const REFRESH_COOKIE = "cospace_refresh";
export function tokenDurationSeconds(
  variable: "ACCESS_TOKEN_EXPIRES_IN" | "REFRESH_TOKEN_EXPIRES_IN",
  fallbackSeconds: number,
): number {
  const duration = process.env[variable]?.trim();
  if (!duration) return fallbackSeconds;

  const match = duration.match(/^([1-9]\d*)(s|m|h|d)$/);
  if (!match) {
    throw new Error(`${variable} debe usar un formato como 15m, 12h o 7d.`);
  }

  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return Number(match[1]) * multipliers[match[2] as keyof typeof multipliers];
}

export const ACCESS_TOKEN_SECONDS = tokenDurationSeconds(
  "ACCESS_TOKEN_EXPIRES_IN",
  15 * 60,
);
export const REFRESH_TOKEN_SECONDS = tokenDurationSeconds(
  "REFRESH_TOKEN_EXPIRES_IN",
  7 * 24 * 60 * 60,
);

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
};

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_ACCESS_SECRET must contain at least 32 characters");
  }

  return new TextEncoder().encode(secret);
}

export async function createAccessToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_SECONDS}s`)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret(), {
      algorithms: ["HS256"],
    });

    if (
      !payload.sub ||
      typeof payload.firstName !== "string" ||
      typeof payload.lastName !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "user" && payload.role !== "admin")
    ) {
      return null;
    }

    return {
      id: payload.sub,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
