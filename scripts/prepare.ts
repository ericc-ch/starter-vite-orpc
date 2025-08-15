const result = await Promise.all([
  Bun.spawnSync(["bunx", "simple-git-hooks"]),
  Bun.spawnSync(["bun", "run", "typegen"]),
])

for (const { stdout } of result) {
  process.stdout.write(stdout)
}

export {}
