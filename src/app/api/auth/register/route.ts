import { getEntityClass, getOrm } from '@/database/orm';
import type { User } from '@/database/entities/user';
import { hashPassword } from '@/auth/password';
import { createSession, setSessionCookies } from '@/auth/session';
import { registrationSchema } from '@/auth/validation';
import { errorResponse } from '@/auth/http';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_INPUT', 'Revisa los datos del formulario.');
  }

  const validation = registrationSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      400,
      'INVALID_INPUT',
      validation.error.issues[0]?.message ?? 'Revisa los datos del formulario.',
    );
  }

  const credentials = validation.data;

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const userEntity = getEntityClass<User>(em, 'User');
    const existingUser = await em.findOne(userEntity, {
      email: credentials.email,
    });

    if (existingUser) {
      return errorResponse(409, 'EMAIL_IN_USE', 'El correo ya está registrado.');
    }

    const user = em.create(userEntity, {
      email: credentials.email,
      passwordHash: await hashPassword(credentials.password),
      role: 'user',
      isActive: true,
    });

    em.persist(user);
    await em.flush();

    const tokens = await createSession(em, user);
    const response = NextResponse.json(
      {
        user: { id: user.id, email: user.email, role: user.role },
      },
      { status: 201 },
    );
    setSessionCookies(response, tokens);
    return response;
  } catch (error) {
    console.error('Registration failed:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo crear la cuenta.');
  }
}
