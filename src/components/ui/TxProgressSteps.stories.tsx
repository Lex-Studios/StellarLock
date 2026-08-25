import type { Meta, StoryObj } from "@storybook/react"
import { TxProgressSteps } from "./TxProgressSteps"

const meta = {
  title: "UI/TxProgressSteps",
  component: TxProgressSteps,
  tags: ["autodocs"],
  argTypes: {
    phase: {
      control: "select",
      options: ["idle", "simulating", "signing", "submitting", "confirming"],
    },
  },
} satisfies Meta<typeof TxProgressSteps>

export default meta
type Story = StoryObj<typeof meta>

export const Simulating: Story = {
  args: { phase: "simulating" },
}

export const Signing: Story = {
  args: { phase: "signing" },
}

export const Submitting: Story = {
  args: { phase: "submitting" },
}

export const Confirming: Story = {
  args: { phase: "confirming" },
}

export const Idle: Story = {
  args: { phase: "idle" },
  render: () => <span className="text-sm italic text-muted-foreground">Nothing rendered when phase is idle.</span>,
}
