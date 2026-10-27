import { cookies } from 'next/headers';
import { ACCESS_COOKIE, verifyAccessToken } from '@/auth/token';
import type { User } from '@/database/entities/user';
import { getEntityClass, getOrm } from '@/database/orm';

export async function getAuthenticatedUser(): Promise<User | null> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  const session = accessToken ? await verifyAccessToken(accessToken) : null;
  if (!session) return null;

  const orm = await getOrm();
  const em = orm.em.fork();
  const userEntity = getEntityClass<User>(em, 'User');

  return em.findOne(userEntity, { id: session.id, isActive: true });
}
