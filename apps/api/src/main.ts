import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { implement, ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { contract } from "rpc"

import { books, db } from "./db/main"

const os = implement(contract)

const app = new Hono()

const handler = new OpenAPIHandler(
  os.router({
    books: {
      add: os.books.add.handler(async ({ input }) => {
        const data = await db.insert(books).values(input).returning()
        const book = data.at(0)

        if (!book) {
          throw new ORPCError("NOT_FOUND")
        }

        return book
      }),
      list: os.books.list.handler(async () => {
        const data = await db.select().from(books)
        return { data }
      }),
      get: os.books.get.handler(async ({ input }) => {
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
      update: os.books.update.handler(async ({ input }) => {
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
      remove: os.books.remove.handler(async ({ input }) => {
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
    },
  }),
)

app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: {}, // Provide initial context if needed
  })

  if (matched) {
    return c.newResponse(response.body, response)
  }

  await next()
})

export default app
