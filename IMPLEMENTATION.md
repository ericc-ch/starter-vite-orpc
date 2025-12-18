# Implementation Plan: Login Page + Books CRUD Demo

## 1. Dependencies

### Root `package.json` - Add to catalogs

```json
"catalogs": {
  "tanstack-query": {
    "@tanstack/react-query": "^5.80.7"
  },
  "orpc": {
    // ... existing entries
    "@orpc/tanstack-query": "^1.12.3"
  }
}
```

### `apps/web/package.json` - Add dependencies

```json
"dependencies": {
  "@tanstack/react-query": "catalog:tanstack-query",
  "@orpc/tanstack-query": "catalog:orpc",
  "better-auth": "catalog:better-auth"
}
```

Then run `bun install`.

---

## 2. Backend: Enable Email/Password Auth

### `apps/api/src/auth/main.ts`

Add `emailAndPassword` option to `betterAuth()`:

```ts
export const getAuth = (db: DB) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      camelCase: true,
    }),
    emailAndPassword: {
      // ADD THIS
      enabled: true,
    },
    secret: process.env.API_BETTER_AUTH_SECRET || "",
    baseURL: process.env.API_BETTER_AUTH_URL || "http://localhost:8787",
    // ... rest unchanged
  })
```

---

## 3. Frontend: Auth Client

### Create `apps/web/src/lib/auth.ts`

```ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
})
```

---

## 4. Frontend: oRPC + TanStack Query Setup

### Modify `apps/web/src/lib/rpc.ts`

```ts
import type { JsonifiedClient } from "@orpc/openapi-client"

import { createORPCClient } from "@orpc/client"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { contract, type RPCClient } from "rpc"

const link = new OpenAPILink(contract, {
  url: `${import.meta.env.VITE_API_URL}/rpc`,
})

export const rpc: JsonifiedClient<RPCClient> = createORPCClient(link)

export const orpc = createTanstackQueryUtils(rpc)
```

---

## 5. Frontend: Query Client Provider

### Modify `apps/web/src/main.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

const rootElement = document.getElementById("root")

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
```

---

## 6. Frontend: Login Page

### Create `apps/web/src/routes/login.tsx`

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { authClient } from "../lib/auth"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
    })

    if (error) {
      // If signup fails (user exists), try sign in
      const signInResult = await authClient.signIn.email({
        email,
        password,
      })

      if (signInResult.error) {
        alert(signInResult.error.message)
        return
      }
    }

    navigate({ to: "/" })
  }

  return (
    <div>
      <h1>Login / Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name (for signup):
            <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input type="email" name="email" required />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input type="password" name="password" required minLength={8} />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
```

---

## 7. Frontend: Protected Index with Books CRUD

### Modify `apps/web/src/routes/index.tsx`

```tsx
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { authClient } from "../lib/auth"
import { orpc } from "../lib/rpc"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: session, isPending: sessionLoading } = authClient.useSession()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")

  // Redirect to login if not authenticated
  if (!sessionLoading && !session?.user) {
    navigate({ to: "/login" })
    return null
  }

  const booksQuery = useQuery(orpc.books.list.queryOptions({ input: {} }))

  const addMutation = useMutation({
    ...orpc.books.add.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.books.list.key() })
    },
  })

  const updateMutation = useMutation({
    ...orpc.books.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.books.list.key() })
      setEditingId(null)
    },
  })

  const removeMutation = useMutation({
    ...orpc.books.remove.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.books.list.key() })
    },
  })

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    addMutation.mutate({ title })
    e.currentTarget.reset()
  }

  async function handleLogout() {
    await authClient.signOut()
    navigate({ to: "/login" })
  }

  if (sessionLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Books</h1>
      <p>Logged in as: {session?.user?.email}</p>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>

      <h2>Add Book</h2>
      <form onSubmit={handleAdd}>
        <input type="text" name="title" placeholder="Book title" required />
        <button type="submit" disabled={addMutation.isPending}>
          Add
        </button>
      </form>

      <h2>Book List</h2>
      {booksQuery.isLoading && <p>Loading books...</p>}
      {booksQuery.error && <p>Error: {booksQuery.error.message}</p>}
      {booksQuery.data && (
        <ul>
          {booksQuery.data.data.map((book) => (
            <li key={book.id}>
              {editingId === book.id ?
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateMutation.mutate({ id: book.id, title: editTitle })
                    }
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </>
              : <>
                  {book.title}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(book.id)
                      setEditTitle(book.title)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate({ id: book.id })}
                    disabled={removeMutation.isPending}
                  >
                    Delete
                  </button>
                </>
              }
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## 8. Environment

### Ensure `apps/web/.env` exists (copy from `.env.example`)

```
VITE_API_URL=http://localhost:3000
```

---

## Summary Checklist

- [x] ~~Add catalogs to root `package.json`~~
- [ ] Add dependencies to `apps/web/package.json` _(partial: missing `better-auth`)_
- [x] ~~Run `bun install`~~
- [ ] Enable `emailAndPassword` in `apps/api/src/auth/main.ts`
- [ ] Create `apps/web/src/lib/auth.ts`
- [ ] Modify `apps/web/src/lib/rpc.ts` - add `orpc` export
- [ ] Modify `apps/web/src/main.tsx` - add `QueryClientProvider`
- [ ] Create `apps/web/src/routes/login.tsx`
- [ ] Modify `apps/web/src/routes/index.tsx` - protected route with CRUD
- [x] ~~Create `apps/web/.env` from `.env.example`~~ _(.env.example exists)_
- [ ] Run `bun run dev` and test

---

# Testing Setup: App Factory Pattern + Vitest

## Overview

Refactor `apps/api` to use an **App Factory pattern** for testability. This removes the `cloudflare:workers` import from module-level code, making the app testable in Node.js without module aliasing.

### Pattern

```
┌─────────────────────────────────────────────────────────┐
│ app.ts                                                  │
│   createApp(env) → Hono app                             │
│   - Creates db, auth from env                           │
│   - Wires up routes, middleware                         │
│   - Pure function, no side effects                      │
├─────────────────────────────────────────────────────────┤
│ main.ts                                                 │
│   import { env } from "cloudflare:workers"              │
│   export default createApp(env)                         │
│   - Production entrypoint only                          │
├─────────────────────────────────────────────────────────┤
│ app.test.ts                                             │
│   createApp(mockEnv)                                    │
│   - Tests via app.request()                             │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Refactor: `apps/api/src/lib/db.ts`

Change from singleton to factory function:

**Before:**

```ts
import { env } from "cloudflare:workers"
import { drizzle } from "drizzle-orm/d1"
import { schema } from "schema"

export const db = drizzle(env.DB, { schema })
```

**After:**

```ts
import { drizzle } from "drizzle-orm/d1"
import { schema } from "schema"

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema })
}

export type Database = ReturnType<typeof createDb>
```

---

## 2. Refactor: `apps/api/src/auth/main.ts`

Remove the singleton export, keep only the factory:

**Before:**

```ts
import { db } from "../lib/db"

export const getAuth = (db: DB) => betterAuth({ ... })
export const auth = getAuth(db)
```

**After:**

```ts
export const getAuth = (db: DB) => betterAuth({ ... })

export type Auth = ReturnType<typeof getAuth>
```

---

## 3. Refactor: `apps/api/src/context.ts`

Accept db and auth as parameters:

**Before:**

```ts
import { auth } from "./auth/main"

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })
  return { session }
}
```

**After:**

```ts
import type { Auth } from "./auth/main"
import type { Database } from "./lib/db"

export type CreateContextOptions = {
  db: Database
  auth: Auth
  honoCtx: HonoContext
}

export async function createContext({
  db,
  auth,
  honoCtx,
}: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: honoCtx.req.raw.headers,
  })
  return { session, db, auth }
}

export type Context = Awaited<ReturnType<typeof createContext>>
```

---

## 4. Refactor: `apps/api/src/rpc/books.ts`

Access db from context instead of importing singleton:

**Before:**

```ts
import { db } from "../lib/db"

export const handlers = os.router({
  list: os.list.handler(async () => {
    const data = await db.select().from(books)
    return { data }
  }),
})
```

**After:**

```ts
// No db import

export const handlers = os.router({
  list: os.list.handler(async ({ context }) => {
    const data = await context.db.select().from(books)
    return { data }
  }),
})
```

Apply the same pattern to all handlers: `add`, `get`, `update`, `remove`.

---

## 5. Create: `apps/api/src/app.ts`

New file — the app factory:

```ts
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { implement } from "@orpc/server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { contract } from "rpc"

import { getAuth, type Auth } from "./auth/main"
import { createContext, type Context } from "./context"
import { createDb, type Database } from "./lib/db"
import * as booksRPC from "./rpc/books"

export type Env = {
  DB: D1Database
}

export function createApp(env: Env) {
  const db = createDb(env.DB)
  const auth = getAuth(db)

  const os = implement(contract).$context<Context>()
  const rpc = new OpenAPIHandler(
    os.router({
      books: booksRPC.handlers,
    }),
  )

  const app = new Hono()

  app.use(
    cors({
      origin: process.env.API_CORS_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  )

  app.get("/", (c) => c.json({ status: "ok" }))

  app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

  app.use("/rpc/*", async (c, next) => {
    const context = await createContext({ db, auth, honoCtx: c })
    const { matched, response } = await rpc.handle(c.req.raw, {
      prefix: "/rpc",
      context,
    })

    if (matched) {
      return response
    }

    return await next()
  })

  return app
}
```

---

## 6. Refactor: `apps/api/src/main.ts`

Slim down to just the production entrypoint:

**Before:** (full app code)

**After:**

```ts
import { env } from "cloudflare:workers"
import { createApp } from "./app"

export default createApp(env)
```

---

## 7. Create: `apps/api/src/test/mocks.ts`

Simple stubs for testing:

```ts
export function createMockDB(): D1Database {
  return {
    prepare: () => {
      throw new Error("MockDB: not implemented")
    },
    dump: () => {
      throw new Error("MockDB: not implemented")
    },
    batch: () => {
      throw new Error("MockDB: not implemented")
    },
    exec: () => {
      throw new Error("MockDB: not implemented")
    },
  } as unknown as D1Database
}
```

---

## 8. Create: `apps/api/src/app.test.ts`

Integration test using app factory:

```ts
import { describe, expect, it } from "vitest"
import { createApp } from "./app"
import { createMockDB } from "./test/mocks"

describe("api", () => {
  const app = createApp({ DB: createMockDB() })

  it("returns ok on /", async () => {
    const res = await app.request("/")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: "ok" })
  })
})
```

---

## 9. Update: `apps/api/vitest.config.ts`

Remove the `cloudflare:workers` alias (no longer needed):

**Before:**

```ts
import { defineProject } from "vitest/config"

export default defineProject({
  resolve: {
    alias: {
      "cloudflare:workers": new URL(
        "./src/test/cloudflare-mock.ts",
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    environment: "node",
    name: "api",
  },
})
```

**After:**

```ts
import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    environment: "node",
    name: "api",
  },
})
```

---

## 10. Delete: Old Mock File

Remove `apps/api/src/test/cloudflare-mock.ts` (replaced by `mocks.ts`).

---

## 11. Delete: Old Test File

Remove `apps/api/src/main.test.ts` (replaced by `app.test.ts`).

---

## 12. Verify: `apps/api/src/lib/rpc.ts`

The `requireAuth` middleware references `Context` type. After refactoring `context.ts`, verify that `requireAuth` still works correctly — it should, since `session` remains in the context.

---

## Testing Checklist

- [x] ~~Refactor `apps/api/src/lib/db.ts` — export `createDb()` factory~~
- [x] ~~Refactor `apps/api/src/auth/main.ts` — remove singleton, export types~~ _(at `lib/auth.ts`)_
- [x] ~~Refactor `apps/api/src/context.ts` — accept db/auth as params~~ _(at `lib/orpc/context.ts`)_
- [x] ~~Refactor `apps/api/src/rpc/books.ts` — use `context.db` instead of import~~ _(at `procedures/books.ts`)_
- [x] ~~Create `apps/api/src/app.ts` — app factory~~
- [x] ~~Refactor `apps/api/src/main.ts` — slim production entrypoint~~
- [ ] Create `apps/api/src/test/mocks.ts` — mock DB stub
- [ ] Create `apps/api/src/app.test.ts` — integration test
- [x] ~~Update `apps/api/vitest.config.ts` — remove alias~~
- [x] ~~Delete `apps/api/src/test/cloudflare-mock.ts`~~
- [ ] Delete `apps/api/src/main.test.ts` _(still exists, uses old pattern)_
- [x] ~~Verify `apps/api/src/lib/rpc.ts` — `requireAuth` still works~~ _(at `lib/orpc/middleware.ts`)_
- [ ] Run `bun run test --project api` to verify

---

## Future: oRPC Unit Tests

For unit testing individual RPC handlers without HTTP:

```ts
// rpc/books.test.ts
import { call } from "@orpc/server"
import { handlers } from "./books"

describe("books.list", () => {
  it("returns books", async () => {
    const result = await call(handlers.list, {}, {
      context: {
        session: null,
        db: mockDb,  // with in-memory data
        auth: mockAuth,
      },
    })
    expect(result.data).toEqual([...])
  })
})
```

This requires a more sophisticated mock DB (e.g., in-memory SQLite). Add when needed.
