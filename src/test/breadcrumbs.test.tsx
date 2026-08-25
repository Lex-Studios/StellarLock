import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { I18nextProvider } from "react-i18next"
import i18n from "@/i18n"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"

function renderAt(path: string) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/app/lock/token/:id" element={<Breadcrumbs />} />
          <Route path="/app/lock/lp/:id" element={<Breadcrumbs />} />
          <Route path="/explore/:token" element={<Breadcrumbs />} />
          <Route path="*" element={<Breadcrumbs />} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe("Breadcrumbs", () => {
  it("renders nothing on the home route", () => {
    const { container } = renderAt("/")
    expect(container).toBeEmptyDOMElement()
  })

  it("renders nothing on top-level routes", () => {
    expect(renderAt("/explore").container).toBeEmptyDOMElement()
    expect(renderAt("/app/locks").container).toBeEmptyDOMElement()
    expect(renderAt("/app/create").container).toBeEmptyDOMElement()
  })

  it("renders Home > My Locks > Lock #<id> for a token lock detail route", () => {
    renderAt("/app/lock/token/42")

    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("My Locks")).toBeInTheDocument()
    expect(screen.getByText("Lock #42")).toBeInTheDocument()
  })

  it("renders Home > My Locks > Lock #<id> for an LP lock detail route", () => {
    renderAt("/app/lock/lp/7")

    expect(screen.getByText("Lock #7")).toBeInTheDocument()
  })

  it("renders Home > Discover > shortened token for a long token address", () => {
    renderAt("/explore/GA1234567890ABCDEFGHIJKL")

    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Discover")).toBeInTheDocument()
    expect(screen.getByText("GA1234…IJKL")).toBeInTheDocument()
  })

  it("renders the full token address when it is short", () => {
    renderAt("/explore/abc")

    expect(screen.getByText("abc")).toBeInTheDocument()
  })

  it("links Home and My Locks to their routes, leaving the current page unlinked", () => {
    renderAt("/app/lock/token/1")

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: "My Locks" })).toHaveAttribute("href", "/app/locks")
    expect(screen.queryByRole("link", { name: "Lock #1" })).not.toBeInTheDocument()
  })
})
