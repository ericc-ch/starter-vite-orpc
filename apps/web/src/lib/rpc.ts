import type { JsonifiedClient } from "@orpc/openapi-client"

import { createORPCClient } from "@orpc/client"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import { contract, type RPCClient } from "rpc"

const link = new OpenAPILink(contract, {
  url: "http://localhost:3000/rpc",
})

export const client: JsonifiedClient<RPCClient> = createORPCClient(link)
