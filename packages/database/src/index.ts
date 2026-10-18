import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { migrate } from './migrations.js';
import * as schema from './schema.js';

export * from './schema.js';
export { seedDatabase } from './seed.js';

export interface DatabaseContext {
  sqlite: Database.Database;
  db: ReturnType<typeof drizzle>;
}

export function openDatabase(filename = process.env.DATABASE_URL ?? './data/tech-library.db'): DatabaseContext {
  const absolute = filename === ':memory:' ? filename : resolve(filename);
  if (absolute !== ':memory:') mkdirSync(dirname(absolute), { recursive: true });
  const sqlite = new Database(absolute);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  migrate(sqlite);
  return { sqlite, db: drizzle(sqlite, { schema }) };
}
