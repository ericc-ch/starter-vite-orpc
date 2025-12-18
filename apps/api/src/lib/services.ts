import type { DB } from "./db"
import { createAuth } from "./auth"

export type Services = {
  db: DB
  auth: ReturnType<typeof createAuth>
}

export function createServices(db: DB): Services {
  return {
    db,
    auth: createAuth(db),
  }
}
