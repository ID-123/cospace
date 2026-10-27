import { jwtVerify, SignJWT } from 'jose';

export const ACCESS_COOKIE = 'cospace_access';
export const REFRESH_COOKIE = 'cospace_refresh';
export const ACCESS_TOKEN_SECONDS = 15 * 60;

export type SessionUser = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must contain at least 32 characters');
  }

  return new TextEncoder().encode(secret);
}

export async function createAccessToken(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
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
      algorithms: ['HS256'],
    });

    if (
      !payload.sub ||
      typeof payload.email !== 'string' ||
      (payload.role !== 'user' && payload.role !== 'admin')
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
