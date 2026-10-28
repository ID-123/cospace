import type { EntityManager, EntityName } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/postgresql";
import config from "../mikro-orm.config";

export function getEntityClass<T extends object>(
  em: EntityManager,
  entityName: string,
): EntityName<T> {
  const metadata = [...em.getMetadata().getAll().values()].find(
    (entity) => entity.className === entityName,
  );

  if (!metadata) {
    throw new Error(
      `MikroORM metadata for entity "${entityName}" was not found`,
    );
  }

  return metadata.class;
}

const globalForMikroORM = globalThis as typeof globalThis & {
  mikroOrmPromise?: Promise<MikroORM>;
};

export async function getOrm(): Promise<MikroORM> {
  globalForMikroORM.mikroOrmPromise ??= MikroORM.init(config);

  return globalForMikroORM.mikroOrmPromise;
}
