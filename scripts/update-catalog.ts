import packageJSON from "../package.json" with { type: "json" }

async function getLatestVersion(packageName: string): Promise<string> {
  const response = await fetch(
    `https://registry.npmjs.org/${packageName}/latest`,
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch ${packageName}: ${response.statusText}`)
  }
  const data = (await response.json()) as { version: string }
  return data.version
}

async function main() {
  const updatedPackageJSON = { ...packageJSON }
  let hasUpdates = false

  for (const [catalogName, packages] of Object.entries(packageJSON.catalogs)) {
    console.log(`\n📦 Catalog: ${catalogName}`)
    console.log("─".repeat(50))

    for (const [packageName, currentVersion] of Object.entries(packages)) {
      try {
        const latestVersion = await getLatestVersion(packageName)
        const cleanCurrentVersion = currentVersion.replace(/^\^/, "")
        const status = cleanCurrentVersion === latestVersion ? "✅" : "🔄"

        console.log(`${status} ${packageName}`)
        console.log(`   Current: ${currentVersion}`)
        console.log(`   Latest:  ${latestVersion}`)

        if (cleanCurrentVersion !== latestVersion) {
          ;(
            updatedPackageJSON.catalogs as Record<
              string,
              Record<string, string>
            >
          )[catalogName][packageName] = `^${latestVersion}`
          hasUpdates = true
        }
      } catch (error) {
        console.log(`❌ ${packageName}`)
        console.log(`   Current: ${currentVersion}`)
        console.log(
          `   Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }
  }

  if (hasUpdates) {
    await Bun.write("package.json", JSON.stringify(updatedPackageJSON, null, 2))
    console.log("\n✅ Package.json updated with latest versions")
  } else {
    console.log("\n✅ All packages are up to date")
  }
}

main().catch(console.error)
