import { defineConfig } from '@mikro-orm/postgresql';
import { Space } from './database/entities/space';
import { RefreshToken, User } from './database/entities/user';
import 'dotenv/config';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [Space, User, RefreshToken],
  migrations: {
    path: 'database/migrations',
    pathTs: 'database/migrations',
  },
  schema: 'public',
  schemaGenerator: {
    ignoreSchema: ['auth', 'storage', 'realtime', 'vault', 'extensions'],
  },
});