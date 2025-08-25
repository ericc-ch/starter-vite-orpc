const { stdout } = Bun.spawnSync([
  "bunx",
  "@better-auth/cli",
  "generate",
  "--yes",
  "--config",
  "./apps/api/src/auth/config.ts",
  "--output",
  "./apps/api/src/db/schema/auth.sql.ts",
])

process.stdout.write(stdout)

export {}
