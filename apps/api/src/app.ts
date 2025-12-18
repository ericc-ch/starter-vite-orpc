import { Hono } from "hono"
import { cors } from "hono/cors"
import { createContext } from "./lib/orpc/context"
import type { Services } from "./lib/services"
import { procedures } from "./procedures/main"

export function createApp(services: Services) {
  const app = new Hono()

  app.use(
    cors({
      origin: process.env.API_CORS_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  )

  app.get("/", (c) => c.json({ status: "ok" }))

  app.on(["POST", "GET"], "/api/auth/*", (c) =>
    services.auth.handler(c.req.raw),
  )

  app.use("/rpc/*", async (c, next) => {
    const context = await createContext({
      services,
      hono: c,
    })

    const { matched, response } = await procedures.handle(c.req.raw, {
      prefix: "/rpc",
      context,
    })

    if (matched) return response
    return await next()
  })

  return app
}
