import 'dotenv/config';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config';
import { hashPassword } from '../auth/password';
import { User } from './entities/user';

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

  try {
    const em = orm.em.fork();
    const existingUser = await em.findOne(User, { email });

    if (existingUser) {
      if (existingUser.role !== 'admin') {
        throw new Error(
          `The account "${email}" already exists and is not an administrator`,
        );
      }

      console.info(`Administrator "${email}" already exists; no changes made.`);
      return;
    }

    const admin = em.create(User, {
      email,
      passwordHash: await hashPassword(password),
      role: 'admin',
      isActive: true,
    });

    em.persist(admin);
    await em.flush();
    console.info(`Administrator "${email}" created.`);
  } finally {
    await orm.close(true);
  }
}

void seedAdmin().catch((error: unknown) => {
  console.error('Could not seed the administrator:', error);
  process.exitCode = 1;
});
