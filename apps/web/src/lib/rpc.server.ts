import type { JsonifiedClient } from "@orpc/openapi-client"

import { createORPCClient } from "@orpc/client"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import { env } from "cloudflare:workers"
import { contract, type RPCClient } from "rpc"

const link = new OpenAPILink(contract, {
  url: "http://localhost:3000/rpc",
  // eslint-disable-next-line @typescript-eslint/unbound-method
  fetch: env.API.fetch as unknown as typeof fetch,
})

export const rpcBFF: JsonifiedClient<RPCClient> = createORPCClient(link)
