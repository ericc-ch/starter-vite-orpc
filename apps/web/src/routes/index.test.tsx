import { expect, test } from "vitest"
import { render } from "vitest-browser-react"

function Home() {
  return <button type="button">Add 1 to ?</button>
}

test("renders button", async () => {
  const { getByRole } = await render(<Home />)
  await expect.element(getByRole("button")).toHaveTextContent("Add 1 to ?")
})
