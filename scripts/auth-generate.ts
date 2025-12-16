#!/usr/bin/env bun

const { stdout } = Bun.spawnSync([
  "bunx",
  "@better-auth/cli",
  "generate",
  "--yes",
  "--config",
  "./apps/api/src/auth/config.ts",
  "--output",
  "./packages/schema/src/auth.sql.ts",
])

process.stdout.write(stdout)

export {}
