/**
 * Unit tests for src/hooks/useTheme.ts — #328
 *
 * Covers:
 *  - Initializes to 'dark' when localStorage has 'dark' saved
 *  - Initializes to 'light' when localStorage has 'light' saved
 *  - Falls back to system preference (prefers-color-scheme) when localStorage is empty
 *  - Defaults to 'light' when both localStorage and system preference are absent
 *  - toggleTheme flips dark → light and light → dark
 *  - DOM class 'dark' is added/removed on the <html> element in sync with theme state
 *  - Theme value is persisted to localStorage on every change
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useTheme } from "@/hooks/useTheme"

// ── helpers ────────────────────────────────────────────────────────────────────

/** Stub window.matchMedia so `prefers-color-scheme: dark` matches (or not). */
function stubMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)" ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// ── tests ──────────────────────────────────────────────────────────────────────

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
    // Default: system has no dark preference
    stubMatchMedia(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })

  // ── Initialization ─────────────────────────────────────────────────────────

  it("initializes to 'dark' when localStorage contains 'dark'", () => {
    localStorage.setItem("theme", "dark")

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe("dark")
  })

  it("initializes to 'light' when localStorage contains 'light'", () => {
    localStorage.setItem("theme", "light")

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe("light")
  })

  it("initializes to 'dark' when localStorage is empty and system prefers dark", () => {
    stubMatchMedia(true) // system dark mode on

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe("dark")
  })

  it("initializes to 'light' when localStorage is empty and system prefers light", () => {
    stubMatchMedia(false) // system dark mode off

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe("light")
  })

  it("prefers localStorage over system preference", () => {
    localStorage.setItem("theme", "light")
    stubMatchMedia(true) // system prefers dark, but storage says light

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe("light")
  })

  // ── Toggle ─────────────────────────────────────────────────────────────────

  it("toggleTheme switches from 'light' to 'dark'", () => {
    localStorage.setItem("theme", "light")

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe("dark")
  })

  it("toggleTheme switches from 'dark' to 'light'", () => {
    localStorage.setItem("theme", "dark")

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe("light")
  })

  it("toggleTheme can be called multiple times and alternates correctly", () => {
    localStorage.setItem("theme", "light")

    const { result } = renderHook(() => useTheme())

    act(() => { result.current.toggleTheme() }) // → dark
    act(() => { result.current.toggleTheme() }) // → light
    act(() => { result.current.toggleTheme() }) // → dark

    expect(result.current.theme).toBe("dark")
  })

  // ── DOM synchronization ────────────────────────────────────────────────────

  it("adds the 'dark' class to <html> when theme is dark", () => {
    localStorage.setItem("theme", "dark")

    renderHook(() => useTheme())

    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("removes the 'dark' class from <html> when theme is light", () => {
    // Pre-set dark class to verify it gets removed
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "light")

    renderHook(() => useTheme())

    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("syncs the DOM class after toggling", () => {
    localStorage.setItem("theme", "light")

    const { result } = renderHook(() => useTheme())
    expect(document.documentElement.classList.contains("dark")).toBe(false)

    act(() => { result.current.toggleTheme() })
    expect(document.documentElement.classList.contains("dark")).toBe(true)

    act(() => { result.current.toggleTheme() })
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  // ── localStorage persistence ───────────────────────────────────────────────

  it("persists 'dark' to localStorage when theme is set to dark", () => {
    localStorage.setItem("theme", "light")

    const { result } = renderHook(() => useTheme())

    act(() => { result.current.toggleTheme() })

    expect(localStorage.getItem("theme")).toBe("dark")
  })

  it("persists 'light' to localStorage when theme is toggled back to light", () => {
    localStorage.setItem("theme", "dark")

    const { result } = renderHook(() => useTheme())

    act(() => { result.current.toggleTheme() })

    expect(localStorage.getItem("theme")).toBe("light")
  })
})
