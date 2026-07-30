/**
 * Unit tests for src/hooks/useOptimisticLock.ts — #252
 *
 * Covers:
 *  - Returns the source lock untouched when nothing is in flight
 *  - applyOptimistic overlays a withdraw (status) and an extend (unlockAt, extendedCount)
 *  - revertOptimistic restores the pre-transaction values (rollback on failure)
 *  - confirmOptimistic drops the overlay so authoritative chain data renders
 *  - A refetch landing mid-flight is not clobbered by the local overlay
 *  - Tolerates a null lock
 */
import { renderHook, act } from "@testing-library/react"
import { describe, expect,it } from "vitest"

import { useOptimisticLock } from "@/hooks/useOptimisticLock"
import type { Lock } from "@/types/lock"

const UNLOCK_AT = Date.parse("2027-01-01T00:00:00Z")

function makeLock(overrides: Partial<Lock> = {}): Lock {
  return {
    id: "42",
    kind: "token",
    status: "unlockable",
    token: {
      address: "CTOKEN000000000000000000000000000000000000000000000000000",
      symbol: "XLM",
      name: "Stellar Lumens",
      decimals: 7,
    },
    creator: "GCREATOR0000000000000000000000000000000000000000000000000",
    beneficiary: "GBENEFICIARY000000000000000000000000000000000000000000000",
    amount: 1000,
    usdValue: 120,
    createdAt: Date.parse("2026-01-01T00:00:00Z"),
    unlockAt: UNLOCK_AT,
    extendedCount: 0,
    ...overrides,
  } as Lock
}

describe("useOptimisticLock", () => {
  it("returns the source lock unchanged when nothing is in flight", () => {
    const lock = makeLock()
    const { result } = renderHook(() => useOptimisticLock(lock))

    expect(result.current.lock).toBe(lock)
    expect(result.current.isPending).toBe(false)
  })

  it("tolerates a null lock", () => {
    const { result } = renderHook(() => useOptimisticLock(null))

    expect(result.current.lock).toBeNull()
    expect(result.current.isPending).toBe(false)

    act(() => { result.current.applyOptimistic({ status: "withdrawn" }) })

    expect(result.current.lock).toBeNull()
  })

  describe("withdraw", () => {
    it("shows the lock as withdrawn before the transaction confirms", () => {
      const { result } = renderHook(() => useOptimisticLock(makeLock()))

      act(() => { result.current.applyOptimistic({ status: "withdrawn" }) })

      expect(result.current.lock?.status).toBe("withdrawn")
      expect(result.current.isPending).toBe(true)
    })

    it("rolls back to the previous status when the transaction fails", () => {
      const { result } = renderHook(() =>
        useOptimisticLock(makeLock({ status: "unlockable" })),
      )

      act(() => { result.current.applyOptimistic({ status: "withdrawn" }) })
      expect(result.current.lock?.status).toBe("withdrawn")

      act(() => { result.current.revertOptimistic() })

      expect(result.current.lock?.status).toBe("unlockable")
      expect(result.current.isPending).toBe(false)
    })

    it("keeps the withdrawn state on confirm, deferring to chain data", () => {
      const { result } = renderHook(() => useOptimisticLock(makeLock()))

      act(() => { result.current.applyOptimistic({ status: "withdrawn" }) })
      act(() => { result.current.confirmOptimistic() })

      // The overlay is dropped; the source lock is authoritative again and a
      // refetch is what supplies the real post-withdraw status.
      expect(result.current.isPending).toBe(false)
      expect(result.current.lock?.status).toBe("unlockable")
    })
  })

  describe("extend", () => {
    const NEW_UNLOCK_AT = Date.parse("2028-06-01T00:00:00Z")

    it("shows the new unlock date and bumped extension count immediately", () => {
      const { result } = renderHook(() => useOptimisticLock(makeLock()))

      act(() => {
        result.current.applyOptimistic({
          unlockAt: NEW_UNLOCK_AT,
          extendedCount: 1,
        })
      })

      expect(result.current.lock?.unlockAt).toBe(NEW_UNLOCK_AT)
      expect(result.current.lock?.extendedCount).toBe(1)
    })

    it("rolls back both fields when the extension fails", () => {
      const { result } = renderHook(() => useOptimisticLock(makeLock()))

      act(() => {
        result.current.applyOptimistic({
          unlockAt: NEW_UNLOCK_AT,
          extendedCount: 1,
        })
      })
      act(() => { result.current.revertOptimistic() })

      expect(result.current.lock?.unlockAt).toBe(UNLOCK_AT)
      expect(result.current.lock?.extendedCount).toBe(0)
    })

    it("leaves untouched fields alone while an extension is in flight", () => {
      const lock = makeLock()
      const { result } = renderHook(() => useOptimisticLock(lock))

      act(() => { result.current.applyOptimistic({ unlockAt: NEW_UNLOCK_AT }) })

      expect(result.current.lock?.amount).toBe(lock.amount)
      expect(result.current.lock?.beneficiary).toBe(lock.beneficiary)
      expect(result.current.lock?.status).toBe(lock.status)
    })
  })

  it("does not clobber a refetch that lands while a patch is in flight", () => {
    const initial = makeLock({ amount: 1000 })
    const { result, rerender } = renderHook(
      ({ lock }) => useOptimisticLock(lock),
      { initialProps: { lock: initial } },
    )

    act(() => { result.current.applyOptimistic({ status: "withdrawn" }) })

    // Fresh chain data arrives mid-flight with a different amount.
    const refetched = makeLock({ amount: 2500 })
    rerender({ lock: refetched })

    // The patch still applies, but the newer source value wins for the rest.
    expect(result.current.lock?.status).toBe("withdrawn")
    expect(result.current.lock?.amount).toBe(2500)
  })
})
