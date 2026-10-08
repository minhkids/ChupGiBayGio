export type D1Env = { DB: D1Database };

/** Access the Worker-bound D1 database from the Hono request environment. */
export function getD1(env: D1Env): D1Database {
  return env.DB;
}

export function jsonText(value: unknown, fallback: unknown[] = []): string {
  return JSON.stringify(Array.isArray(value) ? value : fallback);
}
