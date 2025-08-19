import * as sqlite from "drizzle-orm/sqlite-core"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"

export const books = sqlite.sqliteTable("books", {
  id: sqlite.integer().primaryKey({ autoIncrement: true }),
  title: sqlite.text().notNull(),
  author: sqlite.text().notNull(),
})

export const bookInsert = createInsertSchema(books)
export const bookSelect = createSelectSchema(books)
export const bookUpdate = createUpdateSchema(books)
