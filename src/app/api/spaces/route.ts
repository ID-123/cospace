import { NextResponse } from 'next/server';
import { getOrm } from '@/database/orm';
import { Space } from '@/database/entities/space';

export async function GET(): Promise<NextResponse> {
  try {
    const orm = await getOrm();
    const em = orm.em.fork();
    const spaces = await em.find(Space, {});

    return NextResponse.json(spaces);
  } catch {
    return NextResponse.json(
      { error: 'No se pudieron consultar los espacios' },
      { status: 500 },
    );
  }
}