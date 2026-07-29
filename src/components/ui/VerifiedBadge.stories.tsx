import type { Meta, StoryObj } from "@storybook/react"
import { VerifiedBadge } from "./VerifiedBadge"

const meta = {
  title: "UI/VerifiedBadge",
  component: VerifiedBadge,
  tags: ["autodocs"],
  argTypes: {
    verified: {
      control: "select",
      options: [true, false, null],
    },
    showUnverified: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof VerifiedBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Verified: Story = {
  args: {
    verified: true,
    showUnverified: true,
  },
}

export const Unverified: Story = {
  args: {
    verified: false,
    showUnverified: true,
  },
}

export const UnverifiedHidden: Story = {
  args: {
    verified: false,
    showUnverified: false,
  },
}

export const NullState: Story = {
  args: {
    verified: null,
    showUnverified: true,
  },
}
