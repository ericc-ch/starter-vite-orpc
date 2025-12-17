import type { JsonifiedClient } from "@orpc/openapi-client"

import { createORPCClient } from "@orpc/client"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import { contract, type RPCClient } from "rpc"

const link = new OpenAPILink(contract, {
  url: `${import.meta.env.VITE_API_URL}/rpc`,
})

export const rpc: JsonifiedClient<RPCClient> = createORPCClient(link)
