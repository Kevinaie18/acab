import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Turso en production, SQLite local en dev
const client = createClient({
  url: process.env.DATABASE_URL || "file:./data/local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export * from "./schema";
