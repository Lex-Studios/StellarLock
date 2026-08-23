import { describe, it, expect, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CopyableAddress } from "@/components/discover/CopyableAddress"
import { shortAddress } from "@/lib/utils"

const ADDRESS = "GABCDEF1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEF"

function setupUser() {
  const user = userEvent.setup()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
  return { user, writeText }
}

describe("CopyableAddress", () => {
  it("renders the shortened form of the address", () => {
    render(<CopyableAddress address={ADDRESS} />)
    expect(screen.getByText(shortAddress(ADDRESS))).toBeInTheDocument()
  })

  it("renders a copy button labelled for accessibility", () => {
    render(<CopyableAddress address={ADDRESS} />)
    expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeInTheDocument()
  })

  it("copies the full (unshortened) address to the clipboard when the copy button is clicked", async () => {
    const { user, writeText } = setupUser()
    render(<CopyableAddress address={ADDRESS} />)

    await act(() => user.click(screen.getByRole("button", { name: "Copy to clipboard" })))

    expect(writeText).toHaveBeenCalledWith(ADDRESS)
  })

  it("switches the button label to 'Copied!' after a successful copy", async () => {
    const { user } = setupUser()
    render(<CopyableAddress address={ADDRESS} />)

    await act(() => user.click(screen.getByRole("button", { name: "Copy to clipboard" })))

    expect(screen.getByRole("button", { name: "Copied!" })).toBeInTheDocument()
  })

  it("applies a custom className to the outer wrapper", () => {
    const { container } = render(<CopyableAddress address={ADDRESS} className="my-wrapper" />)
    expect((container.firstChild as HTMLElement).className).toContain("my-wrapper")
  })

  it("renders an empty short address for an empty address string", () => {
    const { container } = render(<CopyableAddress address="" />)
    expect(container.querySelector(".font-mono")?.textContent).toBe("")
  })
})
