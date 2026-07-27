import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}))

function fireKeydown(key: string, options: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, ...options })
  window.dispatchEvent(event)
  return event
}

describe("useKeyboardShortcuts", () => {
  let onShowHelp: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onShowHelp = vi.fn()
    mockNavigate.mockClear()
    // Ensure no active input element
    if (document.activeElement && document.activeElement !== document.body) {
      ;(document.activeElement as HTMLElement).blur()
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("registration", () => {
    it("attaches keydown listener on mount and removes it on unmount", () => {
      const addSpy = vi.spyOn(window, "addEventListener")
      const removeSpy = vi.spyOn(window, "removeEventListener")

      const { unmount } = renderHook(() => useKeyboardShortcuts({ onShowHelp }))

      expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function))

      unmount()

      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function))

      addSpy.mockRestore()
      removeSpy.mockRestore()
    })
  })

  describe("? key — show help", () => {
    it("calls onShowHelp when ? is pressed outside an input", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("?")
      expect(onShowHelp).toHaveBeenCalledTimes(1)
    })

    it("does NOT call onShowHelp when ? is pressed while focused in an INPUT", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))

      const input = document.createElement("input")
      document.body.appendChild(input)
      input.focus()

      fireKeydown("?")
      expect(onShowHelp).not.toHaveBeenCalled()

      input.blur()
      document.body.removeChild(input)
    })

    it("does NOT call onShowHelp when ? is pressed while focused in a TEXTAREA", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))

      const textarea = document.createElement("textarea")
      document.body.appendChild(textarea)
      textarea.focus()

      fireKeydown("?")
      expect(onShowHelp).not.toHaveBeenCalled()

      textarea.blur()
      document.body.removeChild(textarea)
    })

    it("does NOT call onShowHelp when ? is pressed in a contenteditable element", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))

      const div = document.createElement("div")
      div.setAttribute("contenteditable", "true")
      document.body.appendChild(div)
      div.focus()

      fireKeydown("?")
      expect(onShowHelp).not.toHaveBeenCalled()

      div.blur()
      document.body.removeChild(div)
    })
  })

  describe("Ctrl/Meta + k — navigate to /explore", () => {
    it("navigates to /explore on Ctrl+K", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("k", { ctrlKey: true })
      expect(mockNavigate).toHaveBeenCalledWith("/explore")
    })

    it("navigates to /explore on Meta+K (macOS)", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("k", { metaKey: true })
      expect(mockNavigate).toHaveBeenCalledWith("/explore")
    })
  })

  describe("Ctrl/Meta + n — navigate to /app/create", () => {
    it("navigates to /app/create on Ctrl+N", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("n", { ctrlKey: true })
      expect(mockNavigate).toHaveBeenCalledWith("/app/create")
    })

    it("navigates to /app/create on Meta+N", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("n", { metaKey: true })
      expect(mockNavigate).toHaveBeenCalledWith("/app/create")
    })
  })

  describe("Ctrl/Meta + l — navigate to /app/locks", () => {
    it("navigates to /app/locks on Ctrl+L", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("l", { ctrlKey: true })
      expect(mockNavigate).toHaveBeenCalledWith("/app/locks")
    })
  })

  describe("Ctrl/Meta + e — navigate to /explore", () => {
    it("navigates to /explore on Ctrl+E", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("e", { ctrlKey: true })
      expect(mockNavigate).toHaveBeenCalledWith("/explore")
    })
  })

  describe("shortcuts ignored while typing in input", () => {
    it("does NOT navigate when Ctrl+K is pressed inside an INPUT", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))

      const input = document.createElement("input")
      document.body.appendChild(input)
      input.focus()

      fireKeydown("k", { ctrlKey: true })
      expect(mockNavigate).not.toHaveBeenCalled()

      input.blur()
      document.body.removeChild(input)
    })

    it("does NOT navigate when Ctrl+N is pressed inside a SELECT", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))

      const select = document.createElement("select")
      document.body.appendChild(select)
      select.focus()

      fireKeydown("n", { ctrlKey: true })
      expect(mockNavigate).not.toHaveBeenCalled()

      select.blur()
      document.body.removeChild(select)
    })
  })

  describe("unrelated keys", () => {
    it("does nothing for an arbitrary key without modifier", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("a")
      expect(onShowHelp).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("does nothing for an uppercase key that matches a shortcut without modifier", () => {
      renderHook(() => useKeyboardShortcuts({ onShowHelp }))
      fireKeydown("K")
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe("re-registration when deps change", () => {
    it("uses the latest onShowHelp callback after re-render", () => {
      const firstHelp = vi.fn()
      const secondHelp = vi.fn()

      const { rerender } = renderHook(
        ({ cb }: { cb: () => void }) => useKeyboardShortcuts({ onShowHelp: cb }),
        { initialProps: { cb: firstHelp } },
      )

      rerender({ cb: secondHelp })

      fireKeydown("?")
      expect(secondHelp).toHaveBeenCalledTimes(1)
      expect(firstHelp).not.toHaveBeenCalled()
    })
  })
})
