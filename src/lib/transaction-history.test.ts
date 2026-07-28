import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  addTransaction,
  getTransactions,
  clearTransactions,
  refreshPendingStatuses,
  stellarExpertLink,
} from "@/lib/transaction-history"

describe("transaction-history", () => {
  beforeEach(() => {
    clearTransactions()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ successful: true }),
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("records a transaction as pending", () => {
    addTransaction("abc123", "create_lock", { lockId: "1", amount: "100" })

    const records = getTransactions()
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({ hash: "abc123", type: "create_lock", status: "pending" })
  })

  it("orders transactions newest first", () => {
    addTransaction("older", "withdraw")
    addTransaction("newer", "extend")

    expect(getTransactions().map((r) => r.hash)).toEqual(["newer", "older"])
  })

  it("updates status to success once Horizon confirms the transaction", async () => {
    addTransaction("abc123", "withdraw")

    const updated = await refreshPendingStatuses()
    expect(updated[0].status).toBe("success")
  })

  it("marks the transaction failed when Horizon reports it unsuccessful", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ successful: false }),
      }),
    )

    addTransaction("abc123", "withdraw")

    const updated = await refreshPendingStatuses()
    expect(updated[0].status).toBe("failed")
  })

  it("clearTransactions empties the store", () => {
    addTransaction("abc123", "withdraw")
    clearTransactions()
    expect(getTransactions()).toHaveLength(0)
  })

  // ── #326: additional coverage ──────────────────────────────────────────────

  it("prunes records older than 90 days when loading", () => {
    // Manually insert an old record into localStorage
    const ninetyOneDaysAgo = Date.now() - 91 * 24 * 60 * 60 * 1000
    const oldRecord = {
      hash: "old-tx",
      type: "withdraw",
      status: "pending",
      timestamp: ninetyOneDaysAgo,
      network: "testnet",
    }
    localStorage.setItem(
      "stellarlock:tx_history",
      JSON.stringify([oldRecord]),
    )

    const records = getTransactions()
    expect(records).toHaveLength(0)
  })

  it("retains records that are exactly within the 90-day window", () => {
    const eightyNineDaysAgo = Date.now() - 89 * 24 * 60 * 60 * 1000
    const recentRecord = {
      hash: "recent-tx",
      type: "create_lock",
      status: "success",
      timestamp: eightyNineDaysAgo,
      network: "testnet",
    }
    localStorage.setItem(
      "stellarlock:tx_history",
      JSON.stringify([recentRecord]),
    )

    const records = getTransactions()
    expect(records).toHaveLength(1)
    expect(records[0].hash).toBe("recent-tx")
  })

  it("keeps status as pending when Horizon returns 404 (transaction not yet indexed)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      }),
    )

    addTransaction("unconfirmed-tx", "withdraw")
    const updated = await refreshPendingStatuses()

    expect(updated[0].status).toBe("pending")
  })

  it("keeps status as pending when Horizon returns a non-OK response other than 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    )

    addTransaction("error-tx", "extend")
    const updated = await refreshPendingStatuses()

    expect(updated[0].status).toBe("pending")
  })

  it("skips polling when there are no pending transactions and returns existing records unchanged", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    // Add a non-pending transaction directly via localStorage
    const successRecord = {
      hash: "done-tx",
      type: "withdraw",
      status: "success",
      timestamp: Date.now(),
      network: "testnet",
    }
    localStorage.setItem("stellarlock:tx_history", JSON.stringify([successRecord]))

    const updated = await refreshPendingStatuses()

    // No fetch calls should be made for already-resolved transactions
    expect(fetchMock).not.toHaveBeenCalled()
    expect(updated[0].status).toBe("success")
  })

  // ── stellarExpertLink ──────────────────────────────────────────────────────

  describe("stellarExpertLink", () => {
    it("generates a testnet explorer URL for a testnet hash", () => {
      const link = stellarExpertLink("abc123", "testnet")
      expect(link).toBe("https://stellar.expert/explorer/testnet/tx/abc123")
    })

    it("generates a mainnet (public) explorer URL for a mainnet hash", () => {
      const link = stellarExpertLink("xyz789", "mainnet")
      expect(link).toBe("https://stellar.expert/explorer/public/tx/xyz789")
    })

    it("treats any non-mainnet network as testnet", () => {
      const link = stellarExpertLink("hash42", "staging")
      expect(link).toBe("https://stellar.expert/explorer/testnet/tx/hash42")
    })
  })
})
