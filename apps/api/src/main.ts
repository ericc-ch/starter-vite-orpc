import { env } from "cloudflare:workers"
import { createApp } from "./app"
import { createDB } from "./lib/db"
import { createServices } from "./lib/services"

export default createApp(createServices(createDB(env.DB)))
