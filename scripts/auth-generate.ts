const command = Bun.spawnSync([
  "bunx",
  "@better-auth/cli",
  "generate",
  "--yes",
  "--config",
  "./packages/auth/src/config.ts",
  "--output",
  "./packages/db/src/schema/auth.sql.ts",
])

const { stdout } = command

process.stdout.write(stdout)

export {}
