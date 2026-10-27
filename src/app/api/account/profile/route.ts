import { LockMode, UniqueConstraintViolationException } from '@mikro-orm/core';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/current-user';
import { errorResponse } from '@/features/auth/http';
import { createAccessToken } from '@/features/auth/token';
import { setAccessCookie } from '@/features/auth/session';
import { profileUpdateSchema } from '@/features/auth/validation';
import type { User } from '@/database/entities/user';
import { getEntityClass, getOrm } from '@/database/orm';

export async function PATCH(request: Request): Promise<NextResponse> {
  let user: User | null;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    console.error('Could not authenticate profile update:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo verificar la sesión.');
  }
  if (!user) return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_INPUT', 'Revisa los datos del perfil.');
  }

  const validation = profileUpdateSchema.safeParse(body);
  if (!validation.success) {
    return errorResponse(
      400,
      'INVALID_INPUT',
      validation.error.issues[0]?.message ?? 'Revisa los datos del perfil.',
    );
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const userEntity = getEntityClass<User>(em, 'User');
    const result = await em.transactional(async (transaction) => {
      const currentUser = await transaction.findOne(
        userEntity,
        { id: user.id, isActive: true },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );
      if (!currentUser) return { error: 'UNAUTHENTICATED' as const };

      const emailOwner = await transaction.findOne(userEntity, {
        email: validation.data.email,
      });
      if (emailOwner && emailOwner.id !== currentUser.id) {
        return { error: 'EMAIL_IN_USE' as const };
      }

      transaction.assign(currentUser, validation.data);
      await transaction.flush();
      const role = currentUser.role;
      if (role !== 'user' && role !== 'admin') {
        throw new Error('Stored user role is invalid');
      }

      return {
        user: currentUser,
        accessToken: await createAccessToken({
          id: currentUser.id,
          firstName: validation.data.firstName,
          lastName: validation.data.lastName,
          email: validation.data.email,
          role,
        }),
      };
    });

    if ('error' in result) {
      if (result.error === 'EMAIL_IN_USE') {
        return errorResponse(409, 'EMAIL_IN_USE', 'El correo ya está registrado.');
      }
      return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');
    }

    const response = NextResponse.json({
      user: {
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        phone: result.user.phone,
      },
    });
    setAccessCookie(response, result.accessToken);
    return response;
  } catch (error) {
    if (error instanceof UniqueConstraintViolationException) {
      return errorResponse(409, 'EMAIL_IN_USE', 'El correo ya está registrado.');
    }
    console.error('Could not update profile:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo actualizar el perfil.');
  }
}
