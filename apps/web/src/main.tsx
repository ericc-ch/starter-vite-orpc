import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { routeTree } from "./routeTree.gen"

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const element = document.querySelector("#root")
if (!element) {
  throw new Error("Root element not found")
}

const root = createRoot(element)

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
