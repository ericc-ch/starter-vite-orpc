// dummy auth because better-auth cli doesn't actually use tsconfig

import { betterAuth } from "better-auth"
import { drizzleAdapter, type DB } from "better-auth/adapters/drizzle"

const fakeDB: DB = {}

export const auth = betterAuth({
  database: drizzleAdapter(fakeDB, {
    provider: "sqlite",
  }),
})
