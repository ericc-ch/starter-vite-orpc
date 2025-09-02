import { implement, ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { contract } from "rpc"
import { books } from "schema"

import type { Context } from "../context"

import { db } from "../lib/db"
import { requireAuth } from "../lib/rpc"

const os = implement(contract.books).$context<Context>()

export const handlers = os.router({
  add: os.add.use(requireAuth).handler(async ({ input }) => {
    const data = await db.insert(books).values(input).returning()
    const book = data.at(0)

    if (!book) {
      throw new ORPCError("NOT_FOUND")
    }

    return book
  }),
  list: os.list.handler(async () => {
    const data = await db.select().from(books)
    return { data }
  }),
  get: os.get.handler(async ({ input }) => {
    const data = await db
      .select()
      .from(books)
      .where(eq(books.id, input.id))
      .limit(1)
    const book = data.at(0)

    if (!book) {
      throw new ORPCError("NOT_FOUND")
    }
    return book
  }),
  update: os.update.handler(async ({ input }) => {
    const data = await db
      .update(books)
      .set(input)
      .where(eq(books.id, input.id))
      .returning()
      .limit(1)
    const book = data.at(0)

    if (!book) {
      throw new ORPCError("NOT_FOUND")
    }

    return book
  }),
  remove: os.remove.handler(async ({ input }) => {
    const data = await db
      .delete(books)
      .where(eq(books.id, input.id))
      .returning()
      .limit(1)
    const book = data.at(0)

    if (!book) {
      throw new ORPCError("NOT_FOUND")
    }
    return book
  }),
})
