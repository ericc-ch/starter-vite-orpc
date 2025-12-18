import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { implement } from "@orpc/server"
import { contract } from "rpc"
import type { Context } from "../lib/orpc/context"
import { bookProcedures } from "./books"

const os = implement(contract).$context<Context>()

export const procedures = new OpenAPIHandler(
  os.router({
    books: bookProcedures,
  }),
)
