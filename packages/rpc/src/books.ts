import { oc } from "@orpc/contract"
import * as schema from "schema"
import { z } from "zod"

const add = oc
  .route({
    method: "POST",
  })
  .input(schema.bookInsert)
  .output(schema.bookSelect)

const list = oc
  .route({
    method: "GET",
  })
  .input(z.object({}))
  .output(z.object({ data: z.array(schema.bookSelect) }))

const get = oc
  .route({
    path: "/{id}",
    method: "GET",
  })
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .output(schema.bookSelect)

const update = oc
  .route({
    path: "/{id}",
    method: "PATCH",
  })
  .input(
    z.object({
      ...schema.bookUpdate.shape,
      id: z.number(),
    }),
  )
  .output(schema.bookSelect)

const remove = oc
  .route({
    path: "/{id}",
    method: "DELETE",
  })
  .input(z.object({ id: z.number() }))
  .output(schema.bookSelect)

export const books = oc.prefix("/books").router({
  get,
  list,
  add,
  update,
  remove,
})
