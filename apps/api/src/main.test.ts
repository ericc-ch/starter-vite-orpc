import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { schema } from "schema"
import { describe, expect, it } from "vitest"
import { createApp } from "./app"
import type { DB } from "./lib/db"
import { createServices } from "./lib/services"

const db: DB = drizzle(new Database(":memory:"), { schema })
const app = createApp(createServices(db))

describe("api", () => {
  it("returns ok on /", async () => {
    const res = await app.request("/")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: "ok" })
  })
})
