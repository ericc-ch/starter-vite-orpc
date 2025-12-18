import type { Context as HonoContext } from "hono"
import type { Services } from "../services"

export type CreateContextOptions = {
  services: Services
  hono: HonoContext
}

export async function createContext(options: CreateContextOptions) {
  const session = await options.services.auth.api.getSession({
    headers: options.hono.req.raw.headers,
  })

  return {
    session,
    hono: options.hono,
    ...options.services,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
