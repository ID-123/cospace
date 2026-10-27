import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config';

const globalForMikroORM = globalThis as typeof globalThis & {
  mikroOrmPromise?: Promise<MikroORM>;
};

export async function getOrm(): Promise<MikroORM> {
  globalForMikroORM.mikroOrmPromise ??= MikroORM.init(config);

  return globalForMikroORM.mikroOrmPromise;
}