import type { Meta, StoryObj } from "@storybook/react"
import { CopyButton } from "./CopyButton"

const meta = {
  title: "UI/CopyButton",
  component: CopyButton,
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "The text to copy to clipboard when the button is clicked.",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the button.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A compact copy-to-clipboard button that shows a copy icon by default and a checkmark when text has been successfully copied.",
      },
    },
  },
} satisfies Meta<typeof CopyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  },
}

export const ShortText: Story = {
  args: {
    text: "USDC",
  },
}

export const ContractAddress: Story = {
  args: {
    text: "CBFCKEOQRQIXKLGU4QBUQVOINOKFBOXJ37LXEKLKNUO6TW4FNGDU26AW",
  },
}

export const CustomClass: Story = {
  args: {
    text: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    className: "text-primary hover:text-primary/80",
  },
}
