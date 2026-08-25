import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useModalFocusTrap } from "@/lib/modalFocusTrap"

function createFocusableContainer() {
  const container = document.createElement("div")
  const btn1 = document.createElement("button")
  btn1.textContent = "First"
  const input = document.createElement("input")
  input.type = "text"
  const btn2 = document.createElement("button")
  btn2.textContent = "Last"
  container.append(btn1, input, btn2)
  document.body.appendChild(container)
  return { container, btn1, input, btn2 }
}

function createEmptyContainer() {
  const container = document.createElement("div")
  document.body.appendChild(container)
  return container
}

function fireKeyDown(key: string, shiftKey = false) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true }))
}

describe("useModalFocusTrap", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
    // Reset focus to body before each test
    document.body.focus?.()
  })

  describe("basic behavior", () => {
    it("focuses the first focusable element when activated", () => {
      const { container } = createFocusableContainer()
      const ref = { current: container }

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      // The first button should have focus
      expect(document.activeElement?.textContent).toBe("First")
    })

    it("does nothing when active is false", () => {
      const { container } = createFocusableContainer()
      const ref = { current: container }

      renderHook(() =>
        useModalFocusTrap({
          active: false,
          containerRef: ref,
        }),
      )

      // Nothing should be focused by the trap
      expect(container.contains(document.activeElement)).toBe(false)
    })

    it("does nothing when containerRef.current is null", () => {
      const ref = { current: null }

      const { result } = renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      // Should not throw
      expect(result).toBeDefined()
    })
  })

  describe("initialFocusRef", () => {
    it("focuses the initialFocusRef element instead of first focusable", () => {
      const { container, input } = createFocusableContainer()
      const ref = { current: container }
      const initialRef = { current: input }

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
          initialFocusRef: initialRef,
        }),
      )

      expect(document.activeElement).toBe(input)
    })
  })

  describe("Tab cycling", () => {
    it("wraps Tab from last to first focusable element", () => {
      const { container, btn1, btn2 } = createFocusableContainer()
      const ref = { current: container }

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      // Focus the last element first
      btn2.focus()
      expect(document.activeElement).toBe(btn2)

      // Press Tab (no shift) — should wrap to first
      fireKeyDown("Tab", false)
      expect(document.activeElement).toBe(btn1)
    })

    it("wraps Shift+Tab from first to last focusable element", () => {
      const { container, btn1, btn2 } = createFocusableContainer()
      const ref = { current: container }

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      // Focus the first element
      btn1.focus()
      expect(document.activeElement).toBe(btn1)

      // Press Shift+Tab — should wrap to last
      fireKeyDown("Tab", true)
      expect(document.activeElement).toBe(btn2)
    })

    it("prevents default Tab when no focusable elements exist (edge case)", () => {
      const container = createEmptyContainer()
      const ref = { current: container }
      const preventDefault = vi.fn()

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })
      Object.defineProperty(event, "preventDefault", { value: preventDefault })
      document.dispatchEvent(event)

      expect(preventDefault).toHaveBeenCalled()
    })
  })

  describe("Escape key", () => {
    it("calls onEscape when Escape is pressed", () => {
      const { container } = createFocusableContainer()
      const ref = { current: container }
      const onEscape = vi.fn()

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
          onEscape,
        }),
      )

      fireKeyDown("Escape")
      expect(onEscape).toHaveBeenCalledOnce()
    })

    it("prevents default on Escape", () => {
      const { container } = createFocusableContainer()
      const ref = { current: container }
      const preventDefault = vi.fn()

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
      Object.defineProperty(event, "preventDefault", { value: preventDefault })
      document.dispatchEvent(event)

      expect(preventDefault).toHaveBeenCalled()
    })

    it("does not call onEscape when active is false", () => {
      const { container } = createFocusableContainer()
      const ref = { current: container }
      const onEscape = vi.fn()

      renderHook(() =>
        useModalFocusTrap({
          active: false,
          containerRef: ref,
          onEscape,
        }),
      )

      fireKeyDown("Escape")
      expect(onEscape).not.toHaveBeenCalled()
    })
  })

  describe("focus restoration", () => {
    it("restores focus to the previously focused element on deactivation", () => {
      const { container } = createFocusableContainer()
      const ref = { current: container }

      // Pre-focus something outside the container
      const outsideBtn = document.createElement("button")
      outsideBtn.textContent = "Outside"
      document.body.appendChild(outsideBtn)
      outsideBtn.focus()
      expect(document.activeElement).toBe(outsideBtn)

      const { unmount } = renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      // The trap should have moved focus to the first element inside
      expect(document.activeElement?.textContent).toBe("First")

      // Unmount (deactivate)
      unmount()

      // Focus should be restored to the outside element
      expect(document.activeElement).toBe(outsideBtn)
    })

    it("does not throw when the previously focused element is no longer in the DOM", () => {
      const { container } = createFocusableContainer()
      const ref = { current: container }

      const outsideBtn = document.createElement("button")
      outsideBtn.textContent = "Outside"
      document.body.appendChild(outsideBtn)
      outsideBtn.focus()

      const { unmount } = renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      // Remove the outside button while trap is active
      outsideBtn.remove()

      // Unmount should not throw
      expect(() => unmount()).not.toThrow()
    })
  })

  describe("non-Tab/Escape keys", () => {
    it("does not interfere with other key presses", () => {
      const { container } = createFocusableContainer()
      const ref = { current: container }
      const onEscape = vi.fn()

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
          onEscape,
        }),
      )

      // These should be no-ops
      fireKeyDown("Enter")
      fireKeyDown("ArrowDown")
      fireKeyDown(" ")

      // Verify Escape still works separately
      expect(onEscape).not.toHaveBeenCalled()
    })
  })

  describe("hidden/disabled elements", () => {
    it("skips hidden elements when finding focusables", () => {
      const container = document.createElement("div")
      const btn1 = document.createElement("button")
      btn1.textContent = "Visible"
      const hiddenBtn = document.createElement("button")
      hiddenBtn.textContent = "Hidden"
      hiddenBtn.style.display = "none"
      const btn2 = document.createElement("button")
      btn2.textContent = "Last"
      container.append(btn1, hiddenBtn, btn2)
      document.body.appendChild(container)

      const ref = { current: container }

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      // First focusable should be the visible one, not the hidden one
      expect(document.activeElement).toBe(btn1)

      // Focus last, then Tab forward
      btn2.focus()
      fireKeyDown("Tab", false)
      // Should wrap to first visible, skipping hidden
      expect(document.activeElement).toBe(btn1)
    })

    it("skips disabled elements when finding focusables", () => {
      const container = document.createElement("div")
      const disabledBtn = document.createElement("button")
      disabledBtn.textContent = "Disabled"
      disabledBtn.setAttribute("disabled", "")
      const btn = document.createElement("button")
      btn.textContent = "Enabled"
      container.append(disabledBtn, btn)
      document.body.appendChild(container)

      const ref = { current: container }

      renderHook(() =>
        useModalFocusTrap({
          active: true,
          containerRef: ref,
        }),
      )

      // Should focus enabled button, not disabled
      expect(document.activeElement).toBe(btn)
    })
  })
})
