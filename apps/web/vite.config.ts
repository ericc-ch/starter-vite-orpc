import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import alchemy from "alchemy/cloudflare/vite"
import { defineConfig } from "vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    alchemy(),
  ],
})
