import { LockMode } from '@mikro-orm/core';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/current-user';
import { errorResponse } from '@/features/auth/http';
import { hashPassword, verifyPassword } from '@/features/auth/password';
import { createSession, setSessionCookies } from '@/features/auth/session';
import { passwordChangeSchema } from '@/features/auth/validation';
import type { RefreshToken, User } from '@/database/entities/user';
import { getEntityClass, getOrm } from '@/database/orm';

export async function PATCH(request: Request): Promise<NextResponse> {
  let user: User | null;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    console.error('Could not authenticate password update:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo verificar la sesión.');
  }
  if (!user) return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_INPUT', 'Revisa los datos de la contraseña.');
  }

  const validation = passwordChangeSchema.safeParse(body);
  if (!validation.success) {
    return errorResponse(
      400,
      'INVALID_INPUT',
      validation.error.issues[0]?.message ?? 'Revisa los datos de la contraseña.',
    );
  }
  if (!(await verifyPassword(validation.data.currentPassword, user.passwordHash))) {
    return errorResponse(400, 'INVALID_CURRENT_PASSWORD', 'La contraseña actual no es correcta.');
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const userEntity = getEntityClass<User>(em, 'User');
    const refreshTokenEntity = getEntityClass<RefreshToken>(em, 'RefreshToken');
    const tokens = await em.transactional(async (transaction) => {
      const currentUser = await transaction.findOne(
        userEntity,
        { id: user.id, isActive: true },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );
      if (!currentUser) return null;

      currentUser.passwordHash = await hashPassword(validation.data.newPassword);
      const activeRefreshTokens = await transaction.find(refreshTokenEntity, {
        user: currentUser,
        revokedAt: null,
      });
      const revokedAt = new Date();
      for (const token of activeRefreshTokens) {
        token.revokedAt = revokedAt;
      }
      await transaction.flush();
      return createSession(transaction, currentUser);
    });

    if (!tokens) return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');

    const response = NextResponse.json({ passwordUpdated: true });
    setSessionCookies(response, tokens);
    return response;
  } catch (error) {
    console.error('Could not update password:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo actualizar la contraseña.');
  }
}
