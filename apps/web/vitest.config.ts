import { defineProject } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"
import react from "@vitejs/plugin-react"

export default defineProject({
  plugins: [react()],
  test: {
    name: "web",
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
})
