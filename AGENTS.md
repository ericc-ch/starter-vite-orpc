# AGENTS.md

## Build & Commands

- **Dev**: `bun run dev` - Start all services via Alchemy
- **Build**: `bun run build` - Build all packages (Turborepo)
- **Typecheck**: `bun run typecheck` - Run TypeScript checks
- **Format**: `bun run format` - Format with Prettier
- **Test**: `bun run test` in `apps/api/` - Run Vitest (single test: `vitest path/to/file.test.ts`)

## Code Style

- **No semicolons** - Prettier enforces `semi: false`
- **Strict TypeScript** - `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` enabled
- **ESM only** - Use `import`/`export`, no CommonJS
- **Imports order** - External deps → workspace packages → relative imports; type imports use `import type`
- **Naming** - camelCase for variables/functions, PascalCase for types/components, kebab-case for files
- **Error handling** - Use `ORPCError` for RPC errors; check `.at(0)` results before returning

## Commits

- **Conventional commits** - Use format: `type: description`
- **All lowercase** - Both type and description
- **Concise** - No commit body, single line only
- **Atomic** - Break down large changes into multiple focused commits

## Architecture

- Monorepo: `apps/api` (Hono + oRPC), `apps/web` (Vite + React), `packages/rpc` & `packages/schema`
- Shared contracts in `packages/rpc`, schemas in `packages/schema`
- Cloudflare Workers deployment via Alchemy

## Context

- `.context/` contains cloned git repos for reference
- Run `bun scripts/context-pull.ts` to clone/update repos
- Configure repos in `scripts/context-pull.ts`s
