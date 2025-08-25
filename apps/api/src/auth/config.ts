// dummy auth because better-auth cli doesn't actually use tsconfig

import { type DB } from "better-auth/adapters/drizzle"

import { getAuth } from "./main"

export const auth = getAuth({} as DB)
