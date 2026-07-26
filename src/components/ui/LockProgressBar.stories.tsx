import type { Meta, StoryObj } from "@storybook/react"
import { LockProgressBar } from "./LockProgressBar"

const NOW = Date.now()
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const meta = {
  title: "UI/LockProgressBar",
  component: LockProgressBar,
  tags: ["autodocs"],
  argTypes: {
    showLabel: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof LockProgressBar>

export default meta
type Story = StoryObj<typeof meta>

/** 0% — lock was just created; unlock is still far in the future. */
export const NotStarted: Story = {
  args: {
    createdAt: NOW,
    unlockAt: NOW + 30 * DAY,
    showLabel: true,
  },
}

/** ~50% — halfway through the lock period. */
export const HalfVested: Story = {
  args: {
    createdAt: NOW - 15 * DAY,
    unlockAt: NOW + 15 * DAY,
    showLabel: true,
  },
}

/** ~75% — three-quarters through the lock period. */
export const MostlyVested: Story = {
  args: {
    createdAt: NOW - 22 * DAY,
    unlockAt: NOW + 8 * DAY,
    showLabel: true,
  },
}

/** 100% — unlock time has passed; ready to withdraw. */
export const FullyVested: Story = {
  args: {
    createdAt: NOW - 30 * DAY,
    unlockAt: NOW - DAY,
    showLabel: true,
  },
}

/** Label hidden — as used inside LockCard where the label is suppressed. */
export const NoLabel: Story = {
  args: {
    createdAt: NOW - 10 * DAY,
    unlockAt: NOW + 20 * DAY,
    showLabel: false,
  },
}

/** Custom className — demonstrates width / spacing overrides from a parent. */
export const CustomClassName: Story = {
  args: {
    createdAt: NOW - 5 * DAY,
    unlockAt: NOW + 25 * DAY,
    showLabel: true,
    className: "max-w-xs",
  },
}
