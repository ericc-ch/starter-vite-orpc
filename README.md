# Vite + oRPC Starter Template

A modern full-stack starter template using Vite, oRPC, React, Hono, Better Auth, Drizzle ORM, and Cloudflare Workers.

## Stack

- **Frontend**: React 19, Vite, TanStack Router, Tailwind CSS
- **Backend**: Hono, oRPC, Cloudflare Workers
- **Database**: Drizzle ORM (with D1 support)
- **Auth**: Better Auth
- **Monorepo**: Turborepo with Bun workspaces
- **Deployment**: Alchemy (Cloudflare)

## Project Structure

```
starter-vite-orpc/
├── apps/
│   ├── api/              # Cloudflare Workers API
│   │   └── src/
│   │       ├── auth/     # Better Auth configuration
│   │       ├── rpc/      # RPC route handlers
│   │       ├── lib/      # Shared utilities (db, rpc helpers)
│   │       ├── context.ts # Request context setup
│   │       └── main.ts   # Hono app entry point
│   └── web/              # React frontend
│       └── src/
│           ├── routes/   # TanStack Router routes
│           ├── lib/      # RPC client setup
│           └── main.tsx  # React app entry point
├── packages/
│   ├── rpc/              # Shared RPC contracts
│   └── schema/           # Shared database schemas
└── scripts/              # Build and generation scripts
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3.2 or higher
- [Cloudflare account](https://dash.cloudflare.com) (for deployment)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd starter-vite-orpc
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
# Copy the example env file for the API
cp apps/api/.env.example apps/api/.env

# Edit the values as needed
# API_BETTER_AUTH_SECRET - Generate a random secret
# API_CORS_ORIGIN - Set to your frontend URL (default: http://localhost:5173)
# API_BETTER_AUTH_URL - Set to your API URL (default: http://localhost:8787)
```

4. Generate database schema:

```bash
bun run db:generate
```

5. Generate auth schema:

```bash
bun run auth:generate
```

### Development

Start the development servers:

```bash
bun run dev
```

This will start:

- API server at `http://localhost:8787`
- Web app at `http://localhost:5173`

### Build

Build all packages and apps:

```bash
bun run build
```

### Deployment

Deploy to Cloudflare:

```bash
bun run deploy
```

## Available Scripts

- `bun run dev` - Start development servers
- `bun run build` - Build all packages
- `bun run start` - Start production servers
- `bun run typecheck` - Run TypeScript type checking
- `bun run format` - Format code with Prettier
- `bun run db:generate` - Generate database migrations
- `bun run auth:generate` - Generate auth schema
- `bun run deploy` - Deploy to Cloudflare

## Features

### Current Features

- ✅ Type-safe RPC with oRPC
- ✅ Authentication with Better Auth
- ✅ Database ORM with Drizzle
- ✅ Modern React with TanStack Router
- ✅ Cloudflare Workers deployment
- ✅ Monorepo setup with Turborepo
- ✅ CRUD operations example (Books API)
- ✅ Shared contracts between frontend and backend

### Example: Books API

The starter includes a complete CRUD example for managing books:

```typescript
// Frontend usage
import { rpc } from "./lib/rpc"

// List all books
const books = await rpc.books.list.query()

// Get a single book
const book = await rpc.books.get.query({ id: "123" })

// Add a new book (requires auth)
const newBook = await rpc.books.add.mutate({
  title: "My Book",
  author: "John Doe",
})

// Update a book
const updated = await rpc.books.update.mutate({
  id: "123",
  title: "Updated Title",
})

// Remove a book
await rpc.books.remove.mutate({ id: "123" })
```

## Development Status & Roadmap

### 🚧 Missing Critical Components

- [ ] **Documentation**
  - [ ] API documentation (Swagger/OpenAPI UI)
  - [ ] Inline code documentation (JSDoc comments)
  - [ ] Architecture decision records
  - [ ] Deployment guide with environment-specific configs
  - [ ] Troubleshooting guide

- [ ] **Testing Infrastructure**
  - [ ] Unit tests for API handlers
  - [ ] Integration tests for RPC endpoints
  - [ ] Frontend component tests
  - [ ] E2E tests
  - [ ] Test utilities and mock data
  - [ ] Vitest configuration (already in package.json but not set up)

- [ ] **Code Quality Tools**
  - [ ] ESLint configuration
  - [ ] Pre-commit hooks (Husky + lint-staged)
  - [ ] EditorConfig file
  - [ ] Commit message linting

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions workflow for tests
  - [ ] Automated linting and type checking
  - [ ] Build verification
  - [ ] Deployment automation
  - [ ] Preview deployments for PRs

- [ ] **Environment Configuration**
  - [ ] Root `.env.example` file
  - [ ] Web app `.env.example` for API URLs
  - [ ] Environment validation with Zod
  - [ ] Separate configs for dev/staging/production

- [ ] **Security**
  - [ ] Rate limiting setup
  - [ ] CSRF protection
  - [ ] Security headers configuration (helmet)
  - [ ] Input sanitization utilities
  - [ ] SQL injection prevention examples
  - [ ] XSS protection examples

- [ ] **Authentication UI**
  - [ ] Sign-in/Sign-up components
  - [ ] Auth state management
  - [ ] Protected route examples
  - [ ] User profile management
  - [ ] Password reset flow

- [ ] **Error Handling & Logging**
  - [ ] Centralized error handling
  - [ ] Logging infrastructure (Pino/Winston)
  - [ ] Error boundaries in React
  - [ ] User-friendly error messages
  - [ ] Error tracking integration (Sentry)

### 🔧 Improvements Needed

- [ ] **Database**
  - [ ] Migration strategy documentation
  - [ ] Database seeding scripts
  - [ ] More example tables/relationships
  - [ ] Connection pooling configuration
  - [ ] Database backup strategy

- [ ] **Books API Improvements** (`apps/api/src/rpc/books.ts`)
  - [ ] Add pagination to list endpoint (currently returns all)
  - [ ] Add filtering capabilities
  - [ ] Add sorting options
  - [ ] Require auth for update handler (line 41)
  - [ ] Require auth for remove handler (line 56)
  - [ ] Add validation for required fields
  - [ ] Better error messages

- [ ] **Frontend Improvements**
  - [ ] Complete the example page (`apps/web/src/routes/index.tsx`)
  - [ ] Add loading states
  - [ ] Add error states
  - [ ] Form validation examples
  - [ ] Optimistic updates
  - [ ] Real-world UI components

- [ ] **Type Safety**
  - [ ] Use environment variables for RPC URL (`apps/web/src/lib/rpc.ts:8`)
  - [ ] Runtime environment validation
  - [ ] Better type exports for shared types
  - [ ] Discriminated unions for API responses

- [ ] **Performance**
  - [ ] Caching strategy (React Query)
  - [ ] Request/response compression
  - [ ] Bundle size optimization
  - [ ] Code splitting examples
  - [ ] Image optimization setup

- [ ] **Developer Experience**
  - [ ] Docker setup for local development
  - [ ] Database GUI recommendation (Drizzle Studio)
  - [ ] VS Code recommended extensions
  - [ ] Debug configurations
  - [ ] Hot module replacement optimization

- [ ] **Monitoring & Observability**
  - [ ] Detailed health check endpoints
  - [ ] Metrics collection
  - [ ] Performance monitoring
  - [ ] Application insights
  - [ ] Uptime monitoring

### 🎯 Quick Wins (Start Here)

These are high-impact, low-effort improvements to tackle first:

1. [ ] Add auth guards to update/remove book handlers
2. [ ] Build a real example page using the books API
3. [ ] Add pagination to books list
4. [ ] Use environment variables for RPC URL
5. [ ] Add basic ESLint configuration
6. [ ] Create database seed scripts
7. [ ] Set up one example test
8. [ ] Add basic CI workflow
9. [ ] Create root `.env.example`
10. [ ] Add JSDoc comments to main functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
