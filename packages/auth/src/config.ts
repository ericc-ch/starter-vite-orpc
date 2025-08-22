// dummy auth because better-auth cli doesn't actually use tsconfig

import { betterAuth } from "better-auth"
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle"
import { env } from "cloudflare:workers"

const fakeDB: DB = {}

export const auth = betterAuth({
  database: drizzleAdapter(fakeDB, {
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
