import type { Meta, StoryObj } from "@storybook/react"
import { TokenAvatar } from "./TokenAvatar"

const meta = {
  title: "UI/TokenAvatar",
  component: TokenAvatar,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    showVerified: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof TokenAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithLogo: Story = {
  args: {
    symbol: "USDC",
    contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    size: "md",
    showVerified: false,
  },
}

export const MonogramFallback: Story = {
  args: {
    symbol: "XLM",
    size: "md",
    showVerified: false,
  },
}

export const WithVerifiedBadge: Story = {
  args: {
    symbol: "USDC",
    contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    size: "md",
    showVerified: true,
  },
}

export const Small: Story = {
  args: {
    symbol: "XLM",
    size: "sm",
    showVerified: false,
  },
}

export const Large: Story = {
  args: {
    symbol: "USDC",
    size: "lg",
    showVerified: true,
  },
}

export const MonogramTwoLetters: Story = {
  args: {
    symbol: "BTC",
    size: "md",
    showVerified: false,
  },
}

export const MonogramSpecialChars: Story = {
  args: {
    symbol: "$MEME",
    size: "md",
    showVerified: false,
  },
}
