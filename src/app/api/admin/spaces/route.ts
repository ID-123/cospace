import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/features/auth/http';
import { ACCESS_COOKIE, verifyAccessToken } from '@/features/auth/token';
import type { Space } from '@/database/entities/space';
import type { User } from '@/database/entities/user';
import { getEntityClass, getOrm } from '@/database/orm';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const session = token ? await verifyAccessToken(token) : null;
  if (!session) return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');

  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const userEntity = getEntityClass<User>(em, 'User');
    const user = await em.findOne(userEntity, {
      id: session.id,
      isActive: true,
    });
    if (!user) return errorResponse(401, 'UNAUTHENTICATED', 'Inicia sesión.');
    if (user.role !== 'admin') {
      return errorResponse(403, 'FORBIDDEN', 'Solo un administrador puede gestionar espacios.');
    }

    const spaceEntity = getEntityClass<Space>(em, 'Space');
    const spaces = await em.find(spaceEntity, {}, { orderBy: { name: 'ASC' } });

    return NextResponse.json(
      spaces.map((space) => ({
        id: space.id,
        name: space.name,
        description: space.description,
        type: space.type,
        capacity: space.capacity,
        pricePerHour: space.pricePerHour,
        isActive: space.isActive,
      })),
    );
  } catch (error) {
    console.error('Could not load spaces for admin:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'No se pudieron consultar los espacios.');
  }
}
