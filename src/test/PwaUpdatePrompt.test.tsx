import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { PwaUpdatePrompt } from "@/components/ui/PwaUpdatePrompt"

describe("PwaUpdatePrompt", () => {
  afterEach(() => {
    // @ts-expect-error -- restore to the jsdom default (no service worker support)
    delete navigator.serviceWorker
  })

  it("renders nothing when no update is available", () => {
    // @ts-expect-error -- simulating a browser without service worker support
    delete navigator.serviceWorker

    render(<PwaUpdatePrompt />)

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows the update prompt once a new worker installs, and applies the update on click", async () => {
    const listeners: Record<string, () => void> = {}
    const registrationListeners: Record<string, () => void> = {}
    const postMessage = vi.fn()

    const installingWorker = {
      state: "installing",
      addEventListener: (event: string, handler: () => void) => {
        listeners[event] = handler
      },
      postMessage,
    }

    const registration = {
      installing: installingWorker,
      addEventListener: (event: string, handler: () => void) => {
        registrationListeners[event] = handler
      },
    }

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(registration),
        controller: {},
        addEventListener: vi.fn(),
      },
      configurable: true,
    })

    render(<PwaUpdatePrompt />)

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()

    await waitFor(() => expect(registrationListeners.updatefound).toBeDefined())
    act(() => registrationListeners.updatefound())

    installingWorker.state = "installed"
    act(() => listeners.statechange())

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(screen.getByText(/a new version is available/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /update/i }))

    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" })
  })
})
