import { connection } from 'next/server';
import { z } from 'zod';
import { getEntityClass, getOrm } from '@/database/orm';
import type { Space } from '@/database/entities/space';

export async function getActiveSpaces() {
  await connection();
  const orm = await getOrm();
  const em = orm.em.fork();
  const spaceEntity = getEntityClass<Space>(em, 'Space');
  const spaces = await em.find<Space>(spaceEntity, { isActive: true });

  return spaces.map((space) => ({
    id: space.id,
    name: space.name,
    description: space.description,
    type: space.type,
    capacity: space.capacity,
    pricePerHour: space.pricePerHour,
  }));
}

export async function getActiveSpaceById(id: string) {
  await connection();
  if (!z.uuid().safeParse(id).success) return null;

  const orm = await getOrm();
  const em = orm.em.fork();
  const spaceEntity = getEntityClass<Space>(em, 'Space');
  const space = await em.findOne<Space>(spaceEntity, {
    id,
    isActive: true,
  });

  if (!space) return null;

  return {
    id: space.id,
    name: space.name,
    description: space.description,
    type: space.type,
    capacity: space.capacity,
    pricePerHour: space.pricePerHour,
  };
}