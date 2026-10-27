import { MikroORM } from "@mikro-orm/postgresql";
import config from "../mikro-orm.config";
import { Space } from "./entities/space";

async function testSpace(): Promise<void> {
  const orm = await MikroORM.init(config);

  try {
    const em = orm.em.fork();

    const space = em.create(Space, {
      name: "Escritorio de prueba",
      description: "Espacio creado para comprobar la conexión.",
      type: "desk",
      capacity: 1,
      pricePerHour: 10000,
      isActive: true,
      createdAt: new Date(),
    });

    em.persist(space);
    await em.flush();

    const spaces = await em.find(Space, {});

    em.remove(space);
    await em.flush();

    console.log("Espacios registrados:", spaces);
  } finally {
    await orm.close(true);
  }
}

void testSpace();
