import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"
import { drizzle } from "drizzle-orm/d1"
import { schema } from "schema"

// Generic DB type - works with any SQLite dialect (D1, bun:sqlite, better-sqlite3)
export type DB = BaseSQLiteDatabase<"sync" | "async", unknown, typeof schema>

export function createDB(d1: D1Database): DB {
  return drizzle(d1, { schema })
}
