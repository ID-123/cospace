import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/auth/current-user';
import { errorResponse } from '@/auth/http';
import { spaceInputSchema } from '@/auth/space-validation';
import { getEntityClass, getOrm } from '@/database/orm';
import type { Space } from '@/database/entities/space';

export async function GET(): Promise<NextResponse> {
  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const spaceEntity = getEntityClass<Space>(em, 'Space');
    const spaces = await em.find<Space>(spaceEntity, { isActive: true });

    return NextResponse.json(spaces);
  } catch (error) {
    console.error('Could not load active spaces:', error);
    return errorResponse(
      500,
      'INTERNAL_ERROR',
      'No se pudieron consultar los espacios.',
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let user: Awaited<ReturnType<typeof getAuthenticatedUser>>;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    console.error('Could not authenticate space creation:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo verificar la sesión.');
  }
  if (!user) return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');
  if (user.role !== 'admin') {
    return errorResponse(403, 'FORBIDDEN', 'Solo un administrador puede crear espacios.');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_INPUT', 'Revisa los datos del espacio.');
  }

  const validation = spaceInputSchema.safeParse(body);
  if (!validation.success) {
    return errorResponse(
      400,
      'INVALID_INPUT',
      validation.error.issues[0]?.message ?? 'Revisa los datos del espacio.',
    );
  }

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const spaceEntity = getEntityClass<Space>(em, 'Space');
    const space = em.create(spaceEntity, { ...validation.data, isActive: true });
    em.persist(space);
    await em.flush();

    return NextResponse.json(
      {
        id: space.id,
        name: space.name,
        description: space.description,
        type: space.type,
        capacity: space.capacity,
        pricePerHour: space.pricePerHour,
        isActive: space.isActive,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Could not create space:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudo crear el espacio.');
  }
}