import { env } from "cloudflare:workers"
import { drizzle } from "drizzle-orm/d1"

import { schema } from "./schema/main"

export const db = drizzle(env.DB, {
  schema: schema,
})

export * from "./schema/main"
