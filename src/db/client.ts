import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  return drizzle(sql, { schema });
}

type DbClient = ReturnType<typeof createDb>;

// Lazily create the connection on first use rather than at import time, so
// `next build` (which imports route modules to collect page data) doesn't need
// DATABASE_URL — the secret only exists at runtime on the worker.
let _db: DbClient | undefined;

function getDb(): DbClient {
  if (!_db) _db = createDb();
  return _db;
}

export const db = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export type Db = DbClient;
