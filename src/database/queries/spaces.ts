import { cacheLife } from 'next/cache';
import { getOrm } from '@/database/orm';
import { Space } from '@/database/entities/space';

export async function getActiveSpaces() {
  'use cache';

  cacheLife('minutes');

  const orm = await getOrm();
  const spaces = await orm.em.fork().find(Space, { isActive: true });

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
  const space = await orm.em.fork().findOne(Space, {
    id,
    isActive: true,
  });

  if (!space) {
    return null;
  }

  return {
    id: space.id,
    name: space.name,
    description: space.description,
    capacity: space.capacity,
    pricePerHour: space.pricePerHour,
  };
}