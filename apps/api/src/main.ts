import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { implement } from "@orpc/server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { contract } from "rpc"

import { auth } from "./auth/main"
import { createContext, type Context } from "./context"
import * as booksRPC from "./rpc/books"

const os = implement(contract).$context<Context>()
const rpc = new OpenAPIHandler(
  os.router({
    books: booksRPC.handlers,
  }),
)

const app = new Hono()

app.use(
  cors({
    origin: process.env.API_CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
)

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c })
  const { matched, response } = await rpc.handle(c.req.raw, {
    prefix: "/rpc",
    context,
  })

  if (matched) {
    return response
  }

  return await next()
})

export default app
