import type { Meta, StoryObj } from "@storybook/react"
import { CountdownTimer } from "./CountdownTimer"

const meta = {
  title: "UI/CountdownTimer",
  component: CountdownTimer,
  tags: ["autodocs"],
  argTypes: {
    compact: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof CountdownTimer>

export default meta
type Story = StoryObj<typeof meta>

/** A lock that expires in ~30 days — typical counting-down state. */
export const FutureDate: Story = {
  args: {
    target: Date.now() + 30 * 24 * 60 * 60 * 1000,
  },
}

/** A lock whose unlock time has already passed — shows "Unlocked". */
export const Expired: Story = {
  args: {
    target: Date.now() - 60 * 1000,
  },
}

/** Under 60 seconds remaining — near-expiry urgency. */
export const NearExpiry: Story = {
  args: {
    target: Date.now() + 45 * 1000,
  },
}

/** Compact single-line format counting down from ~30 days. */
export const CompactFuture: Story = {
  args: {
    target: Date.now() + 30 * 24 * 60 * 60 * 1000,
    compact: true,
  },
}

/** Compact format when already expired — shows "Unlocked". */
export const CompactExpired: Story = {
  args: {
    target: Date.now() - 60 * 1000,
    compact: true,
  },
}
