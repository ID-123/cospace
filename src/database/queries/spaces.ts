import { cacheLife } from 'next/cache';
import { getEntityClass, getOrm } from '@/database/orm';
import type { Space } from '@/database/entities/space';

export async function getActiveSpaces() {
  'use cache';
  cacheLife('minutes');

  const orm = await getOrm();
  const em = orm.em.fork();
  const spaceEntity = getEntityClass<Space>(em, 'Space');
  const spaces = await em.find<Space>(spaceEntity, { isActive: true });

  return spaces.map((space) => ({
    id: space.id,
    name: space.name,
    description: space.description,
    capacity: space.capacity,
    pricePerHour: space.pricePerHour,
  }));
}

export async function getActiveSpaceById(id: string) {
  'use cache';
  cacheLife('minutes');

  const orm = await getOrm();
  const em = orm.em.fork();
  const spaceEntity = getEntityClass<Space>(em, 'Space');
  const space = await em.findOne<Space>(spaceEntity, {
    id: id as `${string}-${string}-${string}-${string}-${string}`,
    isActive: true,
  });

  if (!space) return null;

  return {
    id: space.id,
    name: space.name,
    description: space.description,
    capacity: space.capacity,
    pricePerHour: space.pricePerHour,
  };
}