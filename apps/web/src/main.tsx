import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

const element = document.querySelector("#root")
if (!element) {
  throw new Error("Root element not found")
}

const root = createRoot(element)

root.render(
  <StrictMode>
    <h1>Hello, World!</h1>
  </StrictMode>,
)
