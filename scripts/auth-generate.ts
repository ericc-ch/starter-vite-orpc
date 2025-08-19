const commands = [
  Bun.spawnSync(["bunx", "simple-git-hooks"]),
  Bun.spawnSync(["bun", "run", "typegen"]),
]

for (const { stdout } of commands) {
  process.stdout.write(stdout)
}

export {}
