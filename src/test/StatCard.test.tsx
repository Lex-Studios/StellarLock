import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatCard } from "@/components/ui/StatCard"

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Total Locked" value="$1,234" />)

    expect(screen.getByText("Total Locked")).toBeInTheDocument()
    expect(screen.getByText("$1,234")).toBeInTheDocument()
  })

  it("renders an icon when provided", () => {
    render(
      <StatCard
        label="Active Locks"
        value={12}
        icon={<span data-testid="stat-icon">*</span>}
      />,
    )

    expect(screen.getByTestId("stat-icon")).toBeInTheDocument()
  })

  it("omits the icon slot when no icon is provided", () => {
    render(<StatCard label="Active Locks" value={12} />)

    expect(screen.queryByTestId("stat-icon")).not.toBeInTheDocument()
  })

  it("renders a hint when provided", () => {
    render(<StatCard label="Active Locks" value={12} hint="Updated 2m ago" />)

    expect(screen.getByText("Updated 2m ago")).toBeInTheDocument()
  })

  it("omits the hint when not provided", () => {
    render(<StatCard label="Active Locks" value={12} />)

    expect(screen.queryByText("Updated 2m ago")).not.toBeInTheDocument()
  })

  it("supports a loading placeholder in place of a resolved value", () => {
    render(
      <StatCard
        label="Total Locked"
        value={<span data-testid="stat-loading">Loading…</span>}
      />,
    )

    expect(screen.getByTestId("stat-loading")).toBeInTheDocument()
  })
})
