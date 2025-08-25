import { oc } from "@orpc/contract"
import * as db from "api/db"
import { z } from "zod"

const add = oc
  .route({
    method: "POST",
  })
  .input(db.bookInsert)
  .output(db.bookSelect)

const list = oc
  .route({
    method: "GET",
  })
  .input(z.object({}))
  .output(z.object({ data: z.array(db.bookSelect) }))

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
  .output(db.bookSelect)

const update = oc
  .route({
    path: "/{id}",
    method: "PATCH",
  })
  .input(
    z.object({
      ...db.bookUpdate.shape,
      id: z.number(),
    }),
  )
  .output(db.bookSelect)

const remove = oc
  .route({
    path: "/{id}",
    method: "DELETE",
  })
  .input(z.object({ id: z.number() }))
  .output(db.bookSelect)

export const books = oc.prefix("/books").router({
  get,
  list,
  add,
  update,
  remove,
})
