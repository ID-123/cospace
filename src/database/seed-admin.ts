import 'dotenv/config';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config';
import { hashPassword } from '../features/auth/password';
import { User } from './entities/user';
import { Space } from './entities/space';

const sampleSpaces = [
  {
    name: 'Escritorio flexible',
    description: 'Un espacio individual y cómodo para concentrarte.',
    type: 'desk' as const,
    capacity: 1,
    pricePerHour: 10000,
  },
  {
    name: 'Sala de reuniones',
    description: 'Sala privada equipada para reuniones de equipo.',
    type: 'meeting_room' as const,
    capacity: 8,
    pricePerHour: 50000,
  },
  {
    name: 'Cabina de concentración',
    description: 'Un espacio privado para llamadas y trabajo enfocado.',
    type: 'booth' as const,
    capacity: 1,
    pricePerHour: 15000,
  },
];

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('ADMIN_EMAIL must be a valid email address');
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must contain at least 8 characters');
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('ADMIN_PASSWORD must not exceed 72 bytes');
  }

  const orm = await MikroORM.init(config);
  const firstName = process.env.ADMIN_FIRST_NAME?.trim() || 'Administrador';
  const lastName = process.env.ADMIN_LAST_NAME?.trim() || 'CoSpace';
  const phone = process.env.ADMIN_PHONE?.trim() || '0000000000';

  try {
    const em = orm.em.fork();
    const existingUser = await em.findOne(User, { email });

    if (existingUser) {
      if (existingUser.role !== 'admin') {
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
        `Administrator "${email}" already exists${profileUpdated ? '; profile completed.' : '; no changes made.'}`,
      );
    } else {
      const admin = em.create(User, {
        firstName,
        lastName,
        phone,
        email,
        passwordHash: await hashPassword(password),
        role: 'admin',
        isActive: true,
      });

      em.persist(admin);
      await em.flush();
      console.info(`Administrator "${email}" created.`);
    }

    let spacesCreated = 0;
    for (const sampleSpace of sampleSpaces) {
      const existingSpace = await em.findOne(Space, { name: sampleSpace.name });
      if (existingSpace) continue;

      em.persist(
        em.create(Space, {
          ...sampleSpace,
          isActive: true,
        }),
      );
      spacesCreated += 1;
    }
    if (spacesCreated > 0) await em.flush();
    console.info(`${spacesCreated} sample space(s) created.`);
  } finally {
    await orm.close(true);
  }
}

void seedAdmin().catch((error: unknown) => {
  console.error('Could not seed the administrator:', error);
  process.exitCode = 1;
});
