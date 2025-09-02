import { ORPCError, os } from "@orpc/server"

import type { Context } from "../context"

export const orpc = os.$context<Context>()

export const requireAuth = orpc.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({
    context: {
      session: context.session,
    },
  })
})
