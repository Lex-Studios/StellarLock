import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LockBadge } from "@/components/explorer/LockBadge"
import { formatUsd } from "@/lib/utils"
import type { TokenLockSummary } from "@/types/lock"

const baseSummary: TokenLockSummary = {
  token: {
    address: "CTOKEN1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    symbol: "STLK",
    name: "StellarLock Token",
    decimals: 7,
  },
  totalLocked: 100000,
  totalUsdValue: 5000,
  activeLocks: 3,
  nextUnlockAt: null,
  locks: [],
}

function setupUser() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
  return { user, writeText }
}

describe("LockBadge Component", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders the locked summary with plural lock count and formatted USD value", () => {
    render(<LockBadge summary={baseSummary} />)

    expect(screen.getByText("Locked on StellarLock")).toBeInTheDocument()
    expect(screen.getByText(`3 active locks · ${formatUsd(5000)} secured`)).toBeInTheDocument()
  })

  it("uses singular 'lock' when there is exactly one active lock", () => {
    render(<LockBadge summary={{ ...baseSummary, activeLocks: 1 }} />)

    expect(screen.getByText(`1 active lock · ${formatUsd(5000)} secured`)).toBeInTheDocument()
  })

  it("copies the share URL containing the token address when 'Copy share link' is clicked", async () => {
    const { user, writeText } = setupUser()
    render(<LockBadge summary={baseSummary} />)

    await act(() => user.click(screen.getByRole("button", { name: /copy share link/i })))

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(`/explore/${baseSummary.token.address}`))
  })

  it("copies markdown containing the shields.io badge URL encoded with the token symbol when 'Copy README badge' is clicked", async () => {
    const { user, writeText } = setupUser()
    render(<LockBadge summary={baseSummary} />)

    await act(() => user.click(screen.getByRole("button", { name: /copy readme badge/i })))

    const copiedMarkdown = writeText.mock.calls[0][0] as string
    expect(copiedMarkdown).toContain("[![Locked on StellarLock]")
    expect(copiedMarkdown).toContain("https://img.shields.io/badge/")
    expect(copiedMarkdown).toContain(encodeURIComponent(baseSummary.token.symbol))
    expect(copiedMarkdown).toContain(`/explore/${baseSummary.token.address}`)
  })

  it("reverts the copy button back to its default icon after the confirmation timeout", async () => {
    const { user } = setupUser()
    render(<LockBadge summary={baseSummary} />)

    const button = screen.getByRole("button", { name: /copy share link/i })
    await act(() => user.click(button))

    expect(button.querySelector("svg.text-success")).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1800)
    })

    expect(button.querySelector("svg.text-success")).not.toBeInTheDocument()
  })
})
