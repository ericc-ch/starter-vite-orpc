import { betterAuth } from "better-auth"
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle"
import { env } from "cloudflare:workers"

import { db } from "../lib/db"

export const getAuth = (db: DB) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      camelCase: true,
    }),
    secret: process.env.API_BETTER_AUTH_SECRET || "",
    baseURL: process.env.API_BETTER_AUTH_URL || "http://localhost:8787",
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
