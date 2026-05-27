import { LearningStore } from "./types";
import { JsonStore } from "./json-store";
import { PostgresStore } from "./postgres-store";

const globalForStore = globalThis as unknown as {
  store: LearningStore | undefined;
};

const getStore = (): LearningStore => {
  if (process.env.DATABASE_URL) {
    return new PostgresStore();
  }
  return new JsonStore();
};

export const store = globalForStore.store ?? getStore();

if (process.env.NODE_ENV !== "production") globalForStore.store = store;
