import type { ContractRouterClient } from "@orpc/contract"

import * as books from "./books"

export const contract = {
  ...books,
}

export type RPCClient = ContractRouterClient<typeof contract>
