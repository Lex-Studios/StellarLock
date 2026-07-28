import type { Meta, StoryObj } from "@storybook/react"
import { CostEstimate } from "./CostEstimate"

const meta = {
  title: "Locks/CostEstimate",
  component: CostEstimate,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CostEstimate>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: {
    contractId: "CA7QYNF5DQX5ZOY2IEVDWQCKLGK2T4OBJCWTYADJUSTEDCONTRACT",
    method: "lock",
    args: [] as any,
  },
}

export const Success: Story = {
  args: {
    contractId: "CA7QYNF5DQX5ZOY2IEVDWQCKLGK2T4OBJCWTYADJUSTEDCONTRACT",
    method: "lock",
    args: [] as any,
  },
  parameters: {
    mockData: {
      estimate: {
        networkFee: 0.1,
        resourceFee: 0.05,
        total: 0.15,
      },
    },
  },
}

export const HighCost: Story = {
  args: {
    contractId: "CA7QYNF5DQX5ZOY2IEVDWQCKLGK2T4OBJCWTYADJUSTEDCONTRACT",
    method: "lock",
    args: [] as any,
  },
  parameters: {
    mockData: {
      estimate: {
        networkFee: 0.3,
        resourceFee: 0.3,
        total: 0.6,
      },
    },
  },
}

export const Error: Story = {
  args: {
    contractId: "CA7QYNF5DQX5ZOY2IEVDWQCKLGK2T4OBJCWTYADJUSTEDCONTRACT",
    method: "lock",
    args: [] as any,
  },
  parameters: {
    mockData: {
      error: true,
    },
  },
}

export const Unavailable: Story = {
  args: {
    contractId: "CA7QYNF5DQX5ZOY2IEVDWQCKLGK2T4OBJCWTYADJUSTEDCONTRACT",
    method: "lock",
    args: null,
  },
}
