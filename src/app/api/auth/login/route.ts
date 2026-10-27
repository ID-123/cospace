import { NextResponse } from 'next/server';
import { errorResponse, readCredentials } from '@/auth/http';
import { verifyPassword } from '@/auth/password';
import { createSession, setSessionCookies } from '@/auth/session';
import type { User } from '@/database/entities/user';
import { getEntityClass, getOrm } from '@/database/orm';

export async function POST(request: Request): Promise<NextResponse> {
  const credentials = await readCredentials(request);

  if (!credentials) {
    return errorResponse(400, 'INVALID_INPUT', 'Correo o contraseña inválidos.');
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const userEntity = getEntityClass<User>(em, 'User');
    const user = await em.findOne(userEntity, {
      email: credentials.email,
      isActive: true,
    });

    if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
      return errorResponse(401, 'INVALID_CREDENTIALS', 'Credenciales incorrectas.');
    }

    const tokens = await createSession(em, user);
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
    setSessionCookies(response, tokens);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo iniciar sesión.');
  }
}
