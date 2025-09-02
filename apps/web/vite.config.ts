import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import alchemy from "alchemy/cloudflare/tanstack-start"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
    alchemy(),
    tsconfigPaths(),
    tanstackStart({ customViteReactPlugin: true, target: "cloudflare-module" }),
    react(),
    tailwindcss(),
  ],
})
