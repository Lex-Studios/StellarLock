import { describe, it, expect, vi } from "vitest"
import { prefetch } from "@/lib/prefetch"

// Mock dynamic imports to avoid loading actual page components in tests
vi.mock("@/pages/Landing", () => ({ default: () => null }))
vi.mock("@/pages/CreateLock", () => ({ default: () => null }))
vi.mock("@/pages/MyLocks", () => ({ default: () => null }))
vi.mock("@/pages/Discover", () => ({ default: () => null }))
vi.mock("@/pages/History", () => ({ default: () => null }))
vi.mock("@/pages/Analytics", () => ({ default: () => null }))

describe("prefetch", () => {
  it("should export a landing lazy import function", () => {
    expect(typeof prefetch.landing).toBe("function")
  })

  it("should export a createLock lazy import function", () => {
    expect(typeof prefetch.createLock).toBe("function")
  })

  it("should export a myLocks lazy import function", () => {
    expect(typeof prefetch.myLocks).toBe("function")
  })

  it("should export a discover lazy import function", () => {
    expect(typeof prefetch.discover).toBe("function")
  })

  it("should export a history lazy import function", () => {
    expect(typeof prefetch.history).toBe("function")
  })

  it("should export an analytics lazy import function", () => {
    expect(typeof prefetch.analytics).toBe("function")
  })

  it("should resolve each lazy import to a module with a default export", async () => {
    const landingModule = await prefetch.landing()
    expect(landingModule).toBeDefined()
    expect(landingModule.default).toBeDefined()
  })

  it("should only have the expected six keys", () => {
    const keys = Object.keys(prefetch)
    expect(keys).toHaveLength(6)
    expect(keys).toEqual(["landing", "createLock", "myLocks", "discover", "history", "analytics"])
  })

  it("should return a promise when calling a prefetch function", () => {
    const result = prefetch.landing()
    expect(result).toBeInstanceOf(Promise)
  })
})
