#!/usr/bin/env bun

const commands = [
  () => Bun.spawnSync(["bun", "run", "auth:generate"]),
  () => Bun.spawnSync(["bunx", "drizzle-kit", "generate"]),
]

for (const command of commands) {
  const { stdout } = command()
  process.stdout.write(stdout)
}
