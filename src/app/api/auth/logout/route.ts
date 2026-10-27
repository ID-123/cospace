import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { REFRESH_COOKIE } from '@/auth/token';
import { clearSessionCookies, hashRefreshToken } from '@/auth/session';
import type { RefreshToken } from '@/database/entities/user';
import { getEntityClass, getOrm } from '@/database/orm';

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      const orm = await getOrm();
      const em = orm.em.fork();
      const refreshTokenEntity = getEntityClass<RefreshToken>(em, 'RefreshToken');
      const tokenRecord = await em.findOne(refreshTokenEntity, {
        tokenHash: hashRefreshToken(refreshToken),
      });

      if (tokenRecord && !tokenRecord.revokedAt) {
        tokenRecord.revokedAt = new Date();
        await em.flush();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      const response = NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'No se pudo cerrar sesión.' } },
        { status: 500 },
      );
      clearSessionCookies(response);
      return response;
    }
  }

  const response = NextResponse.json({ loggedOut: true });
  clearSessionCookies(response);
  return response;
}
