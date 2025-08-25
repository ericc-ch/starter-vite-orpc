import { oc } from "@orpc/contract"
import * as db from "api/db"
import { z } from "zod"

const get = oc
  .route({
    method: "GET",
  })
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .output(db.bookSelect)

const list = oc
  .route({
    method: "GET",
  })
  .input(z.object({}))
  .output(z.object({ data: z.array(db.bookSelect) }))

const add = oc
  .route({
    method: "POST",
  })
  .input(db.bookInsert)
  .output(db.bookSelect)

const update = oc
  .route({
    method: "PATCH",
  })
  .input(db.bookUpdate)
  .output(db.bookSelect)

const remove = oc
  .route({
    method: "DELETE",
  })
  .input(z.object({ id: z.number() }))
  .output(z.object({ id: z.number() }))

export const booksContract = oc.prefix("/books").router({
  get,
  list,
  add,
  update,
  remove,
})
