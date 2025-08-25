import { betterAuth } from "better-auth"
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle"
import { env } from "cloudflare:workers"

import { db } from "../db/main"

export const getAuth = (db: DB) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      camelCase: true,
    }),
    secondaryStorage: {
      get: (key) => env.KV.get(key),
      set: (key, value, ttl) =>
        env.KV.put(
          key,
          value,
          ttl ?
            {
              expirationTtl: ttl,
            }
          : {},
        ),
      delete: (key) => env.KV.delete(key),
    },
  })

export const auth = getAuth(db)
