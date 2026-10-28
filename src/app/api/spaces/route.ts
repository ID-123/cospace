import { NextResponse } from 'next/server';
import { errorResponse, readValidatedBody, requireAdmin } from '@/features/auth/http';
import { spaceInputSchema } from '@/features/spaces/validation';
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
  const access = await requireAdmin('Solo un administrador puede crear espacios.');
  if ('response' in access) return access.response;

  const input = await readValidatedBody(
    request,
    spaceInputSchema,
    'Revisa los datos del espacio.',
  );
  if ('response' in input) return input.response;

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const spaceEntity = getEntityClass<Space>(em, 'Space');
    const space = em.create(spaceEntity, { ...input.data, isActive: true });
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