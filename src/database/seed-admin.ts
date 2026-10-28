import "dotenv/config";
import { MikroORM } from "@mikro-orm/postgresql";
import config from "../mikro-orm.config";
import { hashPassword } from "../features/auth/password";
import { User } from "./entities/user";
import { Space } from "./entities/space";

const sampleSpaces = [
  {
    name: "Escritorio Aurora",
    legacyName: "Escritorio flexible",
    description:
      "Puesto individual junto a ventanales, con silla ergonómica y conexión eléctrica.",
    type: "desk" as const,
    capacity: 1,
    pricePerHour: 12000,
  },
  {
    name: "Escritorio Terraza",
    description:
      "Estación de trabajo individual en una zona abierta con luz natural.",
    type: "desk" as const,
    capacity: 1,
    pricePerHour: 15000,
  },
  {
    name: "Escritorio Central",
    legacyName: "Escritorio de prueba",
    description:
      "Puesto individual cerca de las áreas comunes, con mesa amplia y acceso a tomas eléctricas.",
    type: "desk" as const,
    capacity: 1,
    pricePerHour: 11000,
  },
  {
    name: "Sala Nube",
    legacyName: "Sala de reuniones",
    description:
      "Sala privada para equipos pequeños, con pantalla y pizarra para reuniones.",
    type: "meeting_room" as const,
    capacity: 8,
    pricePerHour: 50000,
  },
  {
    name: "Sala Horizonte",
    description:
      "Sala amplia para talleres y reuniones de equipo con pantalla de presentación.",
    type: "meeting_room" as const,
    capacity: 12,
    pricePerHour: 75000,
  },
  {
    name: "Cabina Órbita",
    legacyName: "Cabina de concentración",
    description:
      "Cabina insonorizada para videollamadas, entrevistas y trabajo que requiere privacidad.",
    type: "booth" as const,
    capacity: 1,
    pricePerHour: 18000,
  },
  {
    name: "Cabina Silencio",
    description:
      "Espacio individual aislado del ruido común, ideal para llamadas y concentración.",
    type: "booth" as const,
    capacity: 1,
    pricePerHour: 16000,
  },
];

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("ADMIN_PASSWORD must not exceed 72 bytes");
  }

  const orm = await MikroORM.init(config);
  const firstName = process.env.ADMIN_FIRST_NAME?.trim() || "Administrador";
  const lastName = process.env.ADMIN_LAST_NAME?.trim() || "CoSpace";
  const phone = process.env.ADMIN_PHONE?.trim() || "0000000000";

  try {
    const em = orm.em.fork();
    const existingUser = await em.findOne(User, { email });

    if (existingUser) {
      if (existingUser.role !== "admin") {
        throw new Error(
          `The account "${email}" already exists and is not an administrator`,
        );
      }

      let profileUpdated = false;
      if (!existingUser.firstName) {
        existingUser.firstName = firstName;
        profileUpdated = true;
      }
      if (!existingUser.lastName) {
        existingUser.lastName = lastName;
        profileUpdated = true;
      }
      if (!existingUser.phone) {
        existingUser.phone = phone;
        profileUpdated = true;
      }
      if (profileUpdated) await em.flush();

      console.info(
        `Administrator "${email}" already exists${profileUpdated ? "; profile completed." : "; no changes made."}`,
      );
    } else {
      const admin = em.create(User, {
        firstName,
        lastName,
        phone,
        email,
        passwordHash: await hashPassword(password),
        role: "admin",
        isActive: true,
      });

      em.persist(admin);
      await em.flush();
      console.info(`Administrator "${email}" created.`);
    }

    let spacesCreated = 0;
    let spacesUpdated = 0;
    for (const sampleSpace of sampleSpaces) {
      const { legacyName, ...spaceDetails } = sampleSpace;
      let existingSpace = await em.findOne(Space, { name: spaceDetails.name });
      if (!existingSpace && legacyName) {
        existingSpace = await em.findOne(Space, { name: legacyName });
      }

      if (existingSpace) {
        if (existingSpace.name !== spaceDetails.name) {
          existingSpace.name = spaceDetails.name;
          existingSpace.description = spaceDetails.description;
          existingSpace.type = spaceDetails.type;
          existingSpace.capacity = spaceDetails.capacity;
          existingSpace.pricePerHour = spaceDetails.pricePerHour;
          spacesUpdated += 1;
        }
        continue;
      }

      em.persist(
        em.create(Space, {
          ...spaceDetails,
          isActive: true,
        }),
      );
      spacesCreated += 1;
    }
    if (spacesCreated > 0 || spacesUpdated > 0) await em.flush();
    console.info(
      `${spacesCreated} sample space(s) created; ${spacesUpdated} legacy sample space(s) updated.`,
    );
  } finally {
    await orm.close(true);
  }
}

void seedAdmin().catch((error: unknown) => {
  console.error("Could not seed the administrator:", error);
  process.exitCode = 1;
});
