import * as auth from "./auth.sql"
import * as books from "./books.sql"

export const schema = {
  ...auth,
  ...books,
}

export * from "./books.sql"
