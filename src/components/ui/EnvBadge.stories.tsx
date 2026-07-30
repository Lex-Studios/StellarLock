import type { Meta, StoryObj } from "@storybook/react"
import { EnvBadge } from "./EnvBadge"

const meta = {
  title: "UI/EnvBadge",
  component: EnvBadge,
  tags: ["autodocs"],
} satisfies Meta<typeof EnvBadge>

export default meta
type Story = StoryObj<typeof meta>

// In the Storybook dev server, DEV=true so the live component renders the sky/blue "dev" badge.
export const Dev: Story = {}

// Staging: shown in staging production builds — amber badge with the network name.
export const Staging: Story = {
  render: () => (
    <span
      className="inline-flex rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 border-amber-500/30"
      aria-label="Environment: staging"
    >
      staging
    </span>
  ),
}

// Testnet: badge is not rendered in testnet production builds.
export const Testnet: Story = {
  render: () => (
    <span className="text-sm italic text-muted-foreground">Hidden in testnet builds — EnvBadge returns null.</span>
  ),
}

// Mainnet: badge is not rendered in mainnet production builds.
export const Mainnet: Story = {
  render: () => (
    <span className="text-sm italic text-muted-foreground">Hidden in mainnet builds — EnvBadge returns null.</span>
  ),
}
