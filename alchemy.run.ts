import alchemy from "alchemy"
import {
  D1Database,
  KVNamespace,
  TanStackStart,
  Worker,
} from "alchemy/cloudflare"
import { Exec } from "alchemy/os"
import { config } from "dotenv"

config({ path: "./.env" })
config({ path: "./apps/api/.env" })
config({ path: "./apps/web/.env" })

const app = await alchemy("starter-web")

await Exec("db-generate", {
  command: "bun run db:generate",
})

const db = await D1Database("db", {
  name: `${app.name}-db-${app.stage}`,
  migrationsDir: "./migrations/",
})

const kv = await KVNamespace("kv", {
  title: `${app.name}-kv-${app.stage}`,
})

export const api = await Worker("api", {
  name: `${app.name}-worker-api-${app.stage}`,
  cwd: "./apps/api",
  entrypoint: "./src/main.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    KV: kv,
  },
  dev: {
    port: 7000,
  },
})

export const web = await TanStackStart("web", {
  name: `${app.name}-worker-web-${app.stage}`,
  cwd: "./apps/web/",
  entrypoint: "./.output/server/index.mjs",
  assets: "./.output/public/",
  compatibility: "node",
  bindings: {
    API: api,
  },
  dev: {
    command: "bun run dev",
  },
})

console.log(`Web -> ${web.url}`)
console.log(`API -> ${api.url}`)

await app.finalize()
