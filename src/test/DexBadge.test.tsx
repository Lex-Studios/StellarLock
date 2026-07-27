import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { DexBadge } from "@/components/ui/DexBadge"

describe("DexBadge component", () => {
  it("renders the Aquarius label for dex='aquarius'", () => {
    render(<DexBadge dex="aquarius" />)
    expect(screen.getByText("Aquarius")).toBeInTheDocument()
  })

  it("renders the Soroswap label for dex='soroswap'", () => {
    render(<DexBadge dex="soroswap" />)
    expect(screen.getByText("Soroswap")).toBeInTheDocument()
  })

  it("applies the primary colour dot for Aquarius", () => {
    const { container } = render(<DexBadge dex="aquarius" />)
    // The colour indicator is a sibling <span> inside the badge
    const dot = container.querySelector("span[aria-hidden]")
    expect(dot).toBeInTheDocument()
    expect(dot?.className).toContain("bg-primary")
  })

  it("applies the warning colour dot for Soroswap", () => {
    const { container } = render(<DexBadge dex="soroswap" />)
    const dot = container.querySelector("span[aria-hidden]")
    expect(dot).toBeInTheDocument()
    expect(dot?.className).toContain("bg-warning")
  })

  it("passes an extra className down to the badge element", () => {
    const { container } = render(<DexBadge dex="aquarius" className="my-custom-class" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain("my-custom-class")
  })

  it("renders as an inline span element", () => {
    const { container } = render(<DexBadge dex="soroswap" />)
    expect(container.querySelector("span")).toBeInTheDocument()
  })
})
