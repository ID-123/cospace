import { defineConfig } from '@mikro-orm/postgresql';
import { Space } from './database/entities/space';
import { Reservation } from './database/entities/reservation';
import { RefreshToken, User } from './database/entities/user';
import 'dotenv/config';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [Space, User, RefreshToken, Reservation],
  migrations: {
    path: 'src/database/migrations',
    pathTs: 'src/database/migrations',
  },
  schema: 'public',
  schemaGenerator: {
    ignoreSchema: ['auth', 'storage', 'realtime', 'vault', 'extensions'],
  },
});