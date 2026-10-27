import { createHash, randomBytes } from 'node:crypto';
import type { EntityManager } from '@mikro-orm/core';
import type { NextResponse } from 'next/server';
import { connection } from 'next/server';
import { cookies } from 'next/headers';
import type { RefreshToken, User } from '@/database/entities/user';
import { getEntityClass } from '@/database/orm';
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_SECONDS,
  createAccessToken,
  REFRESH_COOKIE,
  verifyAccessToken,
} from '@/features/auth/token';
import type { SessionUser } from '@/features/auth/token';

export type { SessionUser } from '@/features/auth/token';
export const REFRESH_TOKEN_SECONDS = 7 * 24 * 60 * 60;

export async function getCurrentSession(): Promise<SessionUser | null> {
  await connection();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  return accessToken ? verifyAccessToken(accessToken) : null;
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
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
  const refreshToken = randomBytes(32).toString('base64url');
  const refreshTokenEntity = getEntityClass<RefreshToken>(em, 'RefreshToken');
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
  const sharedOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...sharedOptions,
    maxAge: ACCESS_TOKEN_SECONDS,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...sharedOptions,
    maxAge: REFRESH_TOKEN_SECONDS,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}
