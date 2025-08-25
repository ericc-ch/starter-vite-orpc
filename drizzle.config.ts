import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./apps/api/src/db/schema/*.sql.ts",
  out: "./migrations",
})
