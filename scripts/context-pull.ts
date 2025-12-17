#!/usr/bin/env bun

import path from "node:path"
import fs from "node:fs"

const rootDir = path.join(import.meta.dir, "..")
const contextRoot = path.join(rootDir, ".context")

if (!fs.existsSync(contextRoot)) {
  fs.mkdirSync(contextRoot)
}

export const repos = [
  {
    name: "better-auth",
    remote: "https://github.com/better-auth/better-auth.git",
    branch: "main",
  },
  {
    name: "drizzle-orm",
    remote: "https://github.com/drizzle-team/drizzle-orm.git",
    branch: "main",
  },
  {
    name: "alchemy",
    remote: "https://github.com/alchemy-run/alchemy.git",
    branch: "main",
  },
]

for (const repo of repos) {
  const repoDir = path.join(contextRoot, repo.name)

  if (!fs.existsSync(repoDir)) {
    console.log(`Cloning ${repo.name}...`)
    await Bun.$`git clone --depth 1 --branch ${repo.branch} ${repo.remote} ${repoDir}`
  } else {
    console.log(`Pulling ${repo.name}...`)
    await Bun.$`git pull`.cwd(repoDir)
  }
}

console.log("Done!")
