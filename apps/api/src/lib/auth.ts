import { betterAuth } from "better-auth"
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle"

export const createAuth = (db: DB) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      camelCase: true,
    }),
    secret: process.env.API_BETTER_AUTH_SECRET || "",
    baseURL: process.env.API_BETTER_AUTH_URL || "http://localhost:8787",
  })

// dummy auth because better-auth cli doesn't actually use tsconfig
// avoids resolving db and schema
export const auth = createAuth({} as DB)
