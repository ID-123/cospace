import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { errorResponse } from '@/auth/http';
import { createAccessToken, REFRESH_COOKIE } from '@/auth/token';
import {
  clearSessionCookies,
  hashRefreshToken,
  REFRESH_TOKEN_SECONDS,
  setSessionCookies,
} from '@/auth/session';
import type { RefreshToken } from '@/database/entities/user';
import { getEntityClass, getOrm } from '@/database/orm';

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    const response = errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');
    clearSessionCookies(response);
    return response;
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const refreshTokenEntity = getEntityClass<RefreshToken>(em, 'RefreshToken');
    const tokenRecord = await em.findOne(
      refreshTokenEntity,
      { tokenHash: hashRefreshToken(refreshToken) },
      { populate: ['user'] },
    );

    if (
      !tokenRecord ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt <= new Date() ||
      !tokenRecord.user.isActive
    ) {
      if (tokenRecord && !tokenRecord.revokedAt) {
        tokenRecord.revokedAt = new Date();
        await em.flush();
      }

      const response = errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');
      clearSessionCookies(response);
      return response;
    }

    tokenRecord.expiresAt = new Date(Date.now() + REFRESH_TOKEN_SECONDS * 1000);
    const accessToken = await createAccessToken(tokenRecord.user);
    await em.flush();
    const response = NextResponse.json({ refreshed: true });
    setSessionCookies(response, { accessToken, refreshToken });
    return response;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo renovar la sesión.');
  }
}
