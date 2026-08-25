import type { Meta, StoryObj } from "@storybook/react"
import { PwaUpdatePrompt } from "./PwaUpdatePrompt"
import { Button } from "./Button"

const meta = {
  title: "UI/PwaUpdatePrompt",
  component: PwaUpdatePrompt,
  tags: ["autodocs"],
} satisfies Meta<typeof PwaUpdatePrompt>

export default meta
type Story = StoryObj<typeof meta>

/** No service worker update detected — the component renders nothing. */
export const Hidden: Story = {}

/**
 * Simulates the visible state when a new app version is available.
 * The real component shows this banner after detecting a waiting service worker.
 */
export const Visible: Story = {
  render: () => (
    <div
      role="alert"
      className="relative flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg"
    >
      <p className="text-sm font-medium">A new version is available.</p>
      <Button size="sm">Update</Button>
    </div>
  ),
}
