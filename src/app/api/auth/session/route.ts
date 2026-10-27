import { NextResponse } from 'next/server';
import { errorResponse } from '@/auth/http';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, verifyAccessToken } from '@/auth/token';

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const user = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!user) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');
  }

  return NextResponse.json({ user });
}
