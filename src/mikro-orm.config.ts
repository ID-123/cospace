import { defineConfig } from "@mikro-orm/postgresql";
import { Space } from "./database/entities/space";
import "dotenv/config";

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [Space],
  migrations: {
    path: "database/migrations",
    pathTs: "database/migrations",
  },
  schema: "public",
  schemaGenerator: {
    ignoreSchema: ["auth", "storage", "realtime", "vault", "extensions"],
  },
});
