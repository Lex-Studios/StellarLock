import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getLock,
  getLocksByCreator,
  getLocksByBeneficiary,
  getLockCountByCreator,
  getLockCountByBeneficiary,
  getLockCountByToken,
  getLocksByToken,
  createTokenLock,
  withdrawLock,
  transferBeneficiary,
  extendLock,
} from "@/lib/token-locker"
import { xdr } from "@stellar/stellar-sdk"

const TOKEN_LOCKER_ADDR = "CBMOCKTOKENLOCKERCONTRACTADDRESS1234567890123456789"
const VALID_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
const VALID_BENEFICIARY = "GD6ROJBYLKQMOW3E7N4M2YBPUHMZD7PL65VRHRMO24BOVSBV5H3BQRSL"
const VALID_TOKEN = "CBFCKEOQRQIXKLGU4QBUQVOINOKFBOXJ37LXEKLKNUO6TW4FNGDU26AW"

const { simulateCall, submitCallWithHash, getOnChainTokenMeta } = vi.hoisted(() => ({
  simulateCall: vi.fn(),
  submitCallWithHash: vi.fn(),
  getOnChainTokenMeta: vi.fn(),
}))

vi.mock("@/lib/stellar", () => ({
  CONTRACTS: { tokenLocker: "CBMOCKTOKENLOCKERCONTRACTADDRESS1234567890123456789" },
  simulateCall,
  submitCallWithHash,
}))

vi.mock("@/lib/token-metadata", () => ({
  getOnChainTokenMeta,
}))

// A raw lock as returned by scValToNative from the contract's `get_lock` etc —
// numeric/timestamp fields come back as bigint, extended_count as a plain number.
function rawLock(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 42n,
    token: VALID_TOKEN,
    creator: VALID_ADDRESS,
    beneficiary: VALID_BENEFICIARY,
    amount: 250_0000000n, // 250 tokens at 7 decimals
    withdrawn: false,
    created_at: 1_700_000_000n,
    unlock_at: 9_999_999_999n, // far future
    extended_count: 0,
    vesting: null,
    metadata: { description: "", project_url: "", logo_url: "" },
    ...overrides,
  }
}

describe("token-locker", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getOnChainTokenMeta.mockResolvedValue({ symbol: "TOK", name: "Token", decimals: 7 })
  })

  // ── Read methods ────────────────────────────────────────────────────────────

  describe("getLock", () => {
    it("returns null when the contract has no lock with that id", async () => {
      simulateCall.mockResolvedValue(null)
      const result = await getLock("42")
      expect(result).toBeNull()
      expect(getOnChainTokenMeta).not.toHaveBeenCalled()
    })

    it("calls simulateCall with the token locker contract and get_lock method", async () => {
      simulateCall.mockResolvedValue(rawLock())
      await getLock("42")
      expect(simulateCall).toHaveBeenCalledTimes(1)
      expect(simulateCall.mock.calls[0][0]).toBe(TOKEN_LOCKER_ADDR)
      expect(simulateCall.mock.calls[0][1]).toBe("get_lock")
    })

    it("maps a raw lock into the Lock shape, converting stroops and unix-second timestamps", async () => {
      simulateCall.mockResolvedValue(rawLock())
      const lock = await getLock("42")

      expect(lock).not.toBeNull()
      expect(lock!.id).toBe("42")
      expect(lock!.kind).toBe("token")
      expect(lock!.amount).toBe(250) // 250_0000000n / 1e7
      expect(lock!.createdAt).toBe(1_700_000_000_000) // seconds -> ms
      expect(lock!.token).toEqual({ address: VALID_TOKEN, symbol: "TOK", name: "Token", decimals: 7 })
      expect(lock!.vesting).toBeUndefined()
    })

    it("derives status: withdrawn takes priority over the unlock timestamp", async () => {
      simulateCall.mockResolvedValue(rawLock({ withdrawn: true, unlock_at: 0n }))
      const lock = await getLock("42")
      expect(lock!.status).toBe("withdrawn")
    })

    it("derives status: unlockable once unlock_at has passed", async () => {
      simulateCall.mockResolvedValue(rawLock({ withdrawn: false, unlock_at: 1n })) // 1970, long past
      const lock = await getLock("42")
      expect(lock!.status).toBe("unlockable")
    })

    it("derives status: locked while unlock_at is still in the future", async () => {
      simulateCall.mockResolvedValue(rawLock({ withdrawn: false, unlock_at: 9_999_999_999n }))
      const lock = await getLock("42")
      expect(lock!.status).toBe("locked")
    })

    it("treats a vesting sentinel of start=0/end=0 as no vesting", async () => {
      simulateCall.mockResolvedValue(rawLock({ vesting: { start: 0n, end: 0n, released: 0n } }))
      const lock = await getLock("42")
      expect(lock!.vesting).toBeUndefined()
    })

    it("parses a real vesting schedule when present", async () => {
      simulateCall.mockResolvedValue(
        rawLock({ vesting: { start: 1_700_000_000n, end: 1_800_000_000n, released: 10_0000000n } }),
      )
      const lock = await getLock("42")
      expect(lock!.vesting).toEqual({
        start: 1_700_000_000_000,
        end: 1_800_000_000_000,
        released: 10,
      })
    })

    it("omits metadata when all fields are empty strings", async () => {
      simulateCall.mockResolvedValue(rawLock({ metadata: { description: "", project_url: "", logo_url: "" } }))
      const lock = await getLock("42")
      expect(lock!.metadata).toBeUndefined()
    })

    it("includes metadata when at least one field is set", async () => {
      simulateCall.mockResolvedValue(
        rawLock({ metadata: { description: "vesting for team", project_url: "", logo_url: "" } }),
      )
      const lock = await getLock("42")
      expect(lock!.metadata).toEqual({ description: "vesting for team", projectUrl: "", logoUrl: "" })
    })
  })

  describe("getLocksByCreator / getLocksByBeneficiary", () => {
    it("passes address and pagination args through and enriches results with token metadata", async () => {
      simulateCall.mockResolvedValue([rawLock({ id: 1n }), rawLock({ id: 2n })])
      const locks = await getLocksByCreator(VALID_ADDRESS, 10, 20)

      expect(simulateCall.mock.calls[0][1]).toBe("get_locks_by_creator")
      expect(locks).toHaveLength(2)
      expect(locks.map((l) => l.id)).toEqual(["1", "2"])
      expect(getOnChainTokenMeta).toHaveBeenCalledTimes(1) // dedup'd by token address
    })

    it("returns an empty array when the contract returns null", async () => {
      simulateCall.mockResolvedValue(null)
      const locks = await getLocksByBeneficiary(VALID_BENEFICIARY)
      expect(locks).toEqual([])
    })
  })

  describe("count methods", () => {
    it.each([
      ["getLockCountByCreator", getLockCountByCreator, "get_lock_count_by_creator"],
      ["getLockCountByBeneficiary", getLockCountByBeneficiary, "get_lock_count_by_beneficiary"],
      ["getLockCountByToken", getLockCountByToken, "get_lock_count_by_token"],
    ] as const)("%s calls the matching contract method and coerces to a number", async (_name, fn, method) => {
      simulateCall.mockResolvedValue(7)
      const count = await fn(VALID_ADDRESS)
      expect(count).toBe(7)
      expect(simulateCall.mock.calls[0][1]).toBe(method)
    })

    it("defaults to 0 when the contract returns nothing", async () => {
      simulateCall.mockResolvedValue(undefined)
      expect(await getLockCountByCreator(VALID_ADDRESS)).toBe(0)
    })
  })

  describe("getLocksByToken", () => {
    it("returns null when the token has no locks", async () => {
      simulateCall.mockResolvedValue([])
      const summary = await getLocksByToken(VALID_TOKEN)
      expect(summary).toBeNull()
    })

    it("aggregates totalLocked and nextUnlockAt across active locks, excluding withdrawn ones", async () => {
      simulateCall.mockResolvedValue([
        rawLock({ id: 1n, amount: 100_0000000n, unlock_at: 2_000_000_000n, withdrawn: false }),
        rawLock({ id: 2n, amount: 200_0000000n, unlock_at: 1_900_000_000n, withdrawn: false }),
        rawLock({ id: 3n, amount: 999_0000000n, unlock_at: 1_000_000_000n, withdrawn: true }),
      ])
      const summary = await getLocksByToken(VALID_TOKEN)

      expect(summary).not.toBeNull()
      expect(summary!.activeLocks).toBe(2) // withdrawn lock excluded
      expect(summary!.totalLocked).toBe(300) // 100 + 200, withdrawn excluded
      expect(summary!.nextUnlockAt).toBe(1_900_000_000_000) // soonest of the two locked ones, in ms
      expect(summary!.locks).toHaveLength(3)
    })

    it("sets nextUnlockAt to null when every remaining lock is already unlockable", async () => {
      simulateCall.mockResolvedValue([rawLock({ id: 1n, unlock_at: 1n, withdrawn: false })])
      const summary = await getLocksByToken(VALID_TOKEN)
      expect(summary!.nextUnlockAt).toBeNull()
    })
  })

  // ── Write methods ───────────────────────────────────────────────────────────

  describe("createTokenLock", () => {
    it("submits create_lock with the source, token, amount (in stroops), beneficiary and unlock args", async () => {
      submitCallWithHash.mockResolvedValue({ result: 42n, txHash: "hash-1" })
      const signTx = vi.fn().mockResolvedValue({ signedTxXdr: "AAAA" })

      const result = await createTokenLock(
        {
          tokenAddress: VALID_TOKEN,
          amount: 250,
          beneficiary: VALID_BENEFICIARY,
          unlockAt: 9_999_999_999,
        },
        VALID_ADDRESS,
        signTx,
      )

      expect(result).toEqual({ id: "42", txHash: "hash-1" })
      expect(submitCallWithHash.mock.calls[0][0]).toBe(TOKEN_LOCKER_ADDR)
      expect(submitCallWithHash.mock.calls[0][1]).toBe("create_lock")
      expect(submitCallWithHash.mock.calls[0][3]).toBe(VALID_ADDRESS)
      expect(submitCallWithHash.mock.calls[0][4]).toBe(signTx)
    })

    it("sends Option::None (scvVoid) for vesting when none is provided", async () => {
      submitCallWithHash.mockResolvedValue({ result: 1n, txHash: "hash" })
      await createTokenLock(
        { tokenAddress: VALID_TOKEN, amount: 1, beneficiary: VALID_BENEFICIARY, unlockAt: 9_999_999_999 },
        VALID_ADDRESS,
        vi.fn().mockResolvedValue({ signedTxXdr: "AAAA" }),
      )
      const scArgs = submitCallWithHash.mock.calls[0][2] as xdr.ScVal[]
      const vestingArg = scArgs[5]
      expect(vestingArg.switch().name).toBe("scvVoid")
    })

    it("sends Option::Some(vesting map) when a vesting window is provided", async () => {
      submitCallWithHash.mockResolvedValue({ result: 1n, txHash: "hash" })
      await createTokenLock(
        {
          tokenAddress: VALID_TOKEN,
          amount: 1,
          beneficiary: VALID_BENEFICIARY,
          unlockAt: 9_999_999_999,
          vesting: { start: 1_700_000_000, end: 1_800_000_000 },
        },
        VALID_ADDRESS,
        vi.fn().mockResolvedValue({ signedTxXdr: "AAAA" }),
      )
      const scArgs = submitCallWithHash.mock.calls[0][2] as xdr.ScVal[]
      const vestingArg = scArgs[5]
      expect(vestingArg.switch().name).toBe("scvMap")
    })
  })

  describe("withdrawLock / transferBeneficiary / extendLock", () => {
    it("withdrawLock calls the withdraw method with just the lock id", async () => {
      submitCallWithHash.mockResolvedValue({ result: undefined, txHash: "hash-w" })
      const result = await withdrawLock("42", VALID_ADDRESS, vi.fn().mockResolvedValue({ signedTxXdr: "AAAA" }))
      expect(result).toEqual({ txHash: "hash-w" })
      expect(submitCallWithHash.mock.calls[0][1]).toBe("withdraw")
      expect(submitCallWithHash.mock.calls[0][2]).toHaveLength(1)
    })

    it("transferBeneficiary calls transfer_beneficiary with the lock id and new beneficiary", async () => {
      submitCallWithHash.mockResolvedValue({ result: undefined, txHash: "hash-t" })
      const result = await transferBeneficiary(
        "42",
        VALID_BENEFICIARY,
        VALID_ADDRESS,
        vi.fn().mockResolvedValue({ signedTxXdr: "AAAA" }),
      )
      expect(result).toEqual({ txHash: "hash-t" })
      expect(submitCallWithHash.mock.calls[0][1]).toBe("transfer_beneficiary")
      expect(submitCallWithHash.mock.calls[0][2]).toHaveLength(2)
    })

    it("extendLock calls extend with the lock id and the new unlock timestamp", async () => {
      submitCallWithHash.mockResolvedValue({ result: undefined, txHash: "hash-e" })
      const result = await extendLock(
        "42",
        9_999_999_999,
        VALID_ADDRESS,
        vi.fn().mockResolvedValue({ signedTxXdr: "AAAA" }),
      )
      expect(result).toEqual({ txHash: "hash-e" })
      expect(submitCallWithHash.mock.calls[0][1]).toBe("extend")
      expect(submitCallWithHash.mock.calls[0][2]).toHaveLength(2)
    })
  })
})
