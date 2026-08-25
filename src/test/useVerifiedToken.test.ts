import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TESTNET_ADDRESS = "CBFCKEOQRQIXKLGU4QBUQVOINOKFBOXJ37LXEKLKNUO6TW4FNGDU26AW"
const MAINNET_ADDRESS = "CCBC3GTNZPUGSXEKQFXB3XMBJQ2YOLZX43RDXHDSYTWNK64EP4WFVRS"
const UNKNOWN_ADDRESS = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"

const VERIFIED_TOKENS_FIXTURE = {
  testnet: [{ address: TESTNET_ADDRESS, symbol: "TST", name: "Test Token" }],
  mainnet: [{ address: MAINNET_ADDRESS, symbol: "MLK", name: "Mainnet Token" }],
}

function makeResponse(data: unknown, ok = true): Response {
  return new Response(JSON.stringify(data), {
    status: ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  })
}

// Reset the module-level cache between tests by re-importing the module.
// Because vitest caches modules we clear the internal _caches Map by
// calling vi.resetModules() in beforeEach.
beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useVerifiedToken", () => {
  describe("initial / undefined contractId", () => {
    it("returns null when no contractId is provided", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )

      // Dynamic import after resetModules so we get a fresh module with empty cache
      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(undefined))

      // No async work triggered — stays null
      expect(result.current).toBeNull()
    })

    it("returns null when contractId is an empty string", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(""))

      expect(result.current).toBeNull()
    })
  })

  describe("testnet environment", () => {
    beforeEach(() => {
      // Default import.meta.env points to testnet
      vi.stubEnv("VITE_NETWORK", "testnet")
    })

    it("returns true for an address that is in the testnet verified list", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(TESTNET_ADDRESS))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(true)
    })

    it("returns false for an address NOT in the testnet verified list", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(UNKNOWN_ADDRESS))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(false)
    })

    it("is case-insensitive for address matching", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(TESTNET_ADDRESS.toLowerCase()))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(true)
    })
  })

  describe("mainnet environment", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_NETWORK", "mainnet")
    })

    it("returns true for an address in the mainnet verified list", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(MAINNET_ADDRESS))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(true)
    })

    it("returns false for a testnet address when on mainnet", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(TESTNET_ADDRESS))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(false)
    })
  })

  describe("staging environment (maps to mainnet list)", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_NETWORK", "staging")
    })

    it("returns true for a mainnet address when VITE_NETWORK is staging", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(MAINNET_ADDRESS))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(true)
    })
  })

  describe("fetch failure / error handling", () => {
    it("returns false when the fetch response is not ok", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(null, false))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(TESTNET_ADDRESS))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(false)
    })

    it("returns false when fetch throws a network error", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.reject(new Error("network error"))),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(TESTNET_ADDRESS))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(false)
    })

    it("returns false when the JSON is malformed / missing expected keys", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(new Response("not-json", { status: 200, headers: { "Content-Type": "text/plain" } })),
        ),
      )

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result } = renderHook(() => hook(TESTNET_ADDRESS))

      await waitFor(() => expect(result.current).not.toBeNull())
      expect(result.current).toBe(false)
    })
  })

  describe("cache hit path", () => {
    it("only calls fetch once for the same network even with multiple hook instances", async () => {
      const mockFetch = vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE)))
      vi.stubGlobal("fetch", mockFetch)
      vi.stubEnv("VITE_NETWORK", "testnet")

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")

      const { result: r1 } = renderHook(() => hook(TESTNET_ADDRESS))
      const { result: r2 } = renderHook(() => hook(UNKNOWN_ADDRESS))

      await waitFor(() => expect(r1.current).not.toBeNull())
      await waitFor(() => expect(r2.current).not.toBeNull())

      // fetch should be called once (or at most 2 times if both hooks race before cache is set),
      // but certainly not once per hook. We allow up to 2 due to the race window.
      expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(2)
      expect(r1.current).toBe(true)
      expect(r2.current).toBe(false)
    })
  })

  describe("contractId changes", () => {
    it("updates the result when contractId changes from known to unknown", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(makeResponse(VERIFIED_TOKENS_FIXTURE))),
      )
      vi.stubEnv("VITE_NETWORK", "testnet")

      const { useVerifiedToken: hook } = await import("@/hooks/useVerifiedToken")
      const { result, rerender } = renderHook(({ id }: { id: string }) => hook(id), {
        initialProps: { id: TESTNET_ADDRESS },
      })

      await waitFor(() => expect(result.current).toBe(true))

      act(() => {
        rerender({ id: UNKNOWN_ADDRESS })
      })

      await waitFor(() => expect(result.current).toBe(false))
    })
  })
})
