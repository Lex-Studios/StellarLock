import type { Meta, StoryObj } from "@storybook/react"
import {
  Skeleton,
  SkeletonLockCard,
  SkeletonStatCard,
  SkeletonTokenHeader,
  SkeletonLockDetail,
} from "./Skeleton"

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional Tailwind classes to customize the skeleton's appearance.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A versatile skeleton loader component with specialized variants for lock cards, stat cards, token headers, and lock detail pages.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: "h-6 w-48",
  },
}

export const Circle: Story = {
  args: {
    className: "h-16 w-16 rounded-full",
  },
}

export const RoundedBlock: Story = {
  args: {
    className: "h-32 w-full",
  },
}

export const TextLineSmall: Story = {
  args: {
    className: "h-3 w-24",
  },
}

export const TextLineMedium: Story = {
  args: {
    className: "h-4 w-40",
  },
}

export const LockCard: StoryObj = {
  render: () => <SkeletonLockCard />,
  parameters: {
    docs: {
      description: {
        story:
          "A complete skeleton placeholder for a lock card, including token avatar, title, status badge, amounts, progress bar, and footer.",
      },
    },
  },
}

export const StatCard: StoryObj = {
  render: () => <SkeletonStatCard />,
  parameters: {
    docs: {
      description: {
        story: "A skeleton placeholder for a statistics/metrics card with a label, large value, and subtitle.",
      },
    },
  },
}

export const TokenHeader: StoryObj = {
  render: () => <SkeletonTokenHeader />,
  parameters: {
    docs: {
      description: {
        story: "A skeleton placeholder for a token header section with icon, title, and three stat columns.",
      },
    },
  },
}

export const LockDetail: StoryObj = {
  render: () => <SkeletonLockDetail />,
  parameters: {
    docs: {
      description: {
        story:
          "A full-page skeleton placeholder for a lock detail view, including header card, chart area, and action buttons.",
      },
    },
  },
}
