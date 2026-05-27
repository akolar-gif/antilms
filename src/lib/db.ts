import { Pool } from "pg";

const globalForDb = globalThis as unknown as {
  dbPool: Pool | undefined;
};

export const pool = globalForDb.dbPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = pool;
}
