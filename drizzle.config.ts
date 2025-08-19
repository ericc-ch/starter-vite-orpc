import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./packages/db/src/schema/*.sql.ts",
  out: "./migrations",
})
