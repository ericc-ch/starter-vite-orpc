## Architecture

- Monorepo: apps/api (Hono + oRPC), apps/web (Vite + React), packages/rpc & packages/schema
- Shared contracts in packages/rpc, schemas in packages/schema
- Cloudflare Workers deployment via Alchemy

## Commands

- bun run dev - Start all services via Alchemy
- bun run deploy - Deploy to Cloudflare via Alchemy
- bun run typecheck - Run TypeScript checks
- bun run format - Format with Prettier
- bun run lint - Lint with oxlint
- bun run test - Run Vitest (in apps/api/, single: vitest path/to/file.test.ts)

Always run typecheck after making changes to ensure nothing breaks.

## Style

- No semicolons - Prettier enforces semi: false
- Strict TypeScript - strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes enabled
- ESM only - Use import/export, no CommonJS
- Imports order - External deps, workspace packages, relative imports; type imports use import type
- Naming - camelCase for variables/functions, PascalCase for types/components, kebab-case for files
- No index.ts - Use main.ts instead. Explicit names are easier to find in editor tabs and search results
- Error handling - Use ORPCError for RPC errors; check .at(0) results before returning

Commits use conventional format: type: description (all lowercase, concise, no body)
Break down large changes into multiple focused atomic commits.

## Context

- .context/ contains cloned git repos for reference
- Run bun scripts/context-pull.ts to clone/update repos
- Configure repos in scripts/context-pull.ts
