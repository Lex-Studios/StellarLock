import type { Meta, StoryObj } from "@storybook/react"
import { StatusBadge } from "./StatusBadge"

const meta = {
  title: "UI/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["locked", "unlockable", "withdrawn"],
    },
  },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

/** Tokens are still within the lock period. */
export const Locked: Story = {
  args: {
    status: "locked",
  },
}

/** Lock period has ended — tokens can be withdrawn. */
export const Unlockable: Story = {
  args: {
    status: "unlockable",
  },
}

/** Tokens have already been withdrawn from the lock. */
export const Withdrawn: Story = {
  args: {
    status: "withdrawn",
  },
}
