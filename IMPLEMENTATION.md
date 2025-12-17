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

- [ ] Add catalogs to root `package.json`
- [ ] Add dependencies to `apps/web/package.json`
- [ ] Run `bun install`
- [ ] Enable `emailAndPassword` in `apps/api/src/auth/main.ts`
- [ ] Create `apps/web/src/lib/auth.ts`
- [ ] Modify `apps/web/src/lib/rpc.ts` - add `orpc` export
- [ ] Modify `apps/web/src/main.tsx` - add `QueryClientProvider`
- [ ] Create `apps/web/src/routes/login.tsx`
- [ ] Modify `apps/web/src/routes/index.tsx` - protected route with CRUD
- [ ] Create `apps/web/.env` from `.env.example`
- [ ] Run `bun run dev` and test
