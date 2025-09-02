const commands = [
  () => Bun.spawnSync(["bunx", "simple-git-hooks"]),
  // () => Bun.spawnSync(["bun", "run", "typegen"]),
]

for (const command of commands) {
  const { stdout } = command()
  process.stdout.write(stdout)
}

export {}
