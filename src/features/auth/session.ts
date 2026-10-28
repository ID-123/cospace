import { createHash, randomBytes } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import type { EntityManager } from "@mikro-orm/core";
import type { NextResponse } from "next/server";
import { connection } from "next/server";
import { cookies } from "next/headers";
import type { RefreshToken, User } from "@/database/entities/user";
import { getEntityClass } from "@/database/orm";
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_SECONDS,
  createAccessToken,
  REFRESH_COOKIE,
  REFRESH_TOKEN_SECONDS,
  verifyAccessToken,
} from "@/features/auth/token";
import type { SessionUser } from "@/features/auth/token";

export type { SessionUser } from "@/features/auth/token";

export async function getCurrentSession(): Promise<SessionUser | null> {
  await connection();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  return accessToken ? verifyAccessToken(accessToken) : null;
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_REFRESH_SECRET debe contener al menos 32 caracteres");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyRefreshToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret(), {
      algorithms: ["HS256"],
    });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function createSession(
  em: EntityManager,
  user: User,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await createAccessToken({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });
  const refreshToken = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setJti(randomBytes(16).toString("hex"))
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_SECONDS}s`)
    .sign(getRefreshSecret());
  const refreshTokenEntity = getEntityClass<RefreshToken>(em, "RefreshToken");
  const refreshTokenRecord = em.create(refreshTokenEntity, {
    tokenHash: hashRefreshToken(refreshToken),
    user,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000),
  });

  em.persist(refreshTokenRecord);
  await em.flush();

  return { accessToken, refreshToken };
}

export function setSessionCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
): void {
  setAccessCookie(response, tokens.accessToken);
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...sessionCookieOptions,
    maxAge: REFRESH_TOKEN_SECONDS,
  });
}

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAccessCookie(
  response: NextResponse,
  accessToken: string,
): void {
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    ...sessionCookieOptions,
    maxAge: ACCESS_TOKEN_SECONDS,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}
