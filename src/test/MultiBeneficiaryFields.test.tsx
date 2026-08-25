import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "./utils"
import { MultiBeneficiaryFields } from "@/components/locks/MultiBeneficiaryFields"
import type { SplitBeneficiary } from "@/lib/split-lock"

const VALID_ADDR_A = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
const VALID_ADDR_B = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBWHF"

/** Two beneficiaries that sum to exactly 100% (10 000 bps). */
const validTwo: SplitBeneficiary[] = [
  { address: VALID_ADDR_A, shareBps: 5000 },
  { address: VALID_ADDR_B, shareBps: 5000 },
]

/** Two beneficiaries that do NOT sum to 100%. */
const invalidTwo: SplitBeneficiary[] = [
  { address: VALID_ADDR_A, shareBps: 3000 },
  { address: VALID_ADDR_B, shareBps: 3000 },
]

/** Single beneficiary (below minimum count of 2). */
const singleOne: SplitBeneficiary[] = [{ address: VALID_ADDR_A, shareBps: 10000 }]

describe("MultiBeneficiaryFields component", () => {
  it("renders one row per beneficiary", () => {
    render(<MultiBeneficiaryFields beneficiaries={validTwo} onChange={vi.fn()} />)
    const inputs = screen.getAllByPlaceholderText("G…")
    expect(inputs).toHaveLength(2)
  })

  it("shows the column labels on the first row", () => {
    render(<MultiBeneficiaryFields beneficiaries={validTwo} onChange={vi.fn()} />)
    expect(screen.getByText(/address/i)).toBeInTheDocument()
    expect(screen.getByText(/share/i)).toBeInTheDocument()
  })

  it("shows 100% total in success colour when bps sum equals 10 000", () => {
    render(<MultiBeneficiaryFields beneficiaries={validTwo} onChange={vi.fn()} />)
    const totalEl = screen.getByText("100%")
    expect(totalEl.className).toContain("text-success")
  })

  it("shows the invalid-total error when shares do not sum to 100%", () => {
    render(<MultiBeneficiaryFields beneficiaries={invalidTwo} onChange={vi.fn()} />)
    expect(screen.getByText(/shares must add up to 100%/i)).toBeInTheDocument()
  })

  it("shows the partial total percentage in destructive colour when invalid", () => {
    render(<MultiBeneficiaryFields beneficiaries={invalidTwo} onChange={vi.fn()} />)
    const totalEl = screen.getByText("60%")
    expect(totalEl.className).toContain("text-destructive")
  })

  it("shows the minimum-beneficiaries hint when there is only one entry", () => {
    render(<MultiBeneficiaryFields beneficiaries={singleOne} onChange={vi.fn()} />)
    expect(screen.getByText(/add at least 2 beneficiaries/i)).toBeInTheDocument()
  })

  it("calls onChange with a new empty entry when Add beneficiary is clicked", async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn<(next: SplitBeneficiary[]) => void>()

    render(<MultiBeneficiaryFields beneficiaries={validTwo} onChange={handleChange} />)

    const addBtn = screen.getByRole("button", { name: /add beneficiary/i })
    await user.click(addBtn)

    expect(handleChange).toHaveBeenCalledOnce()
    const updated: SplitBeneficiary[] = handleChange.mock.calls[0][0]
    expect(updated).toHaveLength(3)
    expect(updated[2]).toEqual({ address: "", shareBps: 0 })
  })

  it("calls onChange with the entry removed when Remove is clicked", async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn<(next: SplitBeneficiary[]) => void>()

    // Need ≥3 entries so the remove button is enabled (disabled when length <= 2)
    const threeEntries: SplitBeneficiary[] = [
      { address: VALID_ADDR_A, shareBps: 4000 },
      { address: VALID_ADDR_B, shareBps: 4000 },
      { address: "", shareBps: 2000 },
    ]

    render(<MultiBeneficiaryFields beneficiaries={threeEntries} onChange={handleChange} />)

    const removeButtons = screen.getAllByRole("button", { name: /remove/i })
    await user.click(removeButtons[0])

    expect(handleChange).toHaveBeenCalledOnce()
    const updated: SplitBeneficiary[] = handleChange.mock.calls[0][0]
    expect(updated).toHaveLength(2)
    // First entry (ADDR_A) should be gone
    expect(updated.find((b) => b.address === VALID_ADDR_A)).toBeUndefined()
  })

  it("disables all remove buttons when there are exactly 2 beneficiaries", () => {
    render(<MultiBeneficiaryFields beneficiaries={validTwo} onChange={vi.fn()} />)
    const removeButtons = screen.getAllByRole("button", { name: /remove/i })
    removeButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it("calls onChange with updated address when address input changes", () => {
    const handleChange = vi.fn<(next: SplitBeneficiary[]) => void>()
    render(<MultiBeneficiaryFields beneficiaries={validTwo} onChange={handleChange} />)

    const firstInput = screen.getAllByPlaceholderText("G…")[0]
    fireEvent.change(firstInput, { target: { value: "GNEWADDRESS" } })

    expect(handleChange).toHaveBeenCalledOnce()
    const updated: SplitBeneficiary[] = handleChange.mock.calls[0][0]
    expect(updated[0].address).toBe("GNEWADDRESS")
  })

  it("shows the max-beneficiaries hint and hides Add button when 10 entries exist", () => {
    const tenEntries: SplitBeneficiary[] = Array.from({ length: 10 }, (_, i) => ({
      address: `G${"A".repeat(54 - String(i).length)}${i}`,
      shareBps: 1000,
    }))

    render(<MultiBeneficiaryFields beneficiaries={tenEntries} onChange={vi.fn()} />)

    expect(screen.getByText(/maximum 10 beneficiaries/i)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /add beneficiary/i })).not.toBeInTheDocument()
  })
})
