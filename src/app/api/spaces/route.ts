import { NextResponse } from 'next/server';
import { getEntityClass, getOrm } from '@/database/orm';
import type { Space } from '@/database/entities/space';

export async function GET(): Promise<NextResponse> {
  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const spaceEntity = getEntityClass<Space>(em, 'Space');
    const spaces = await em.find<Space>(spaceEntity, {});

    return NextResponse.json(spaces);
  } catch {
    return NextResponse.json(
      { error: 'No se pudieron consultar los espacios' },
      { status: 500 },
    );
  }
}