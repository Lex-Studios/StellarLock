import type { Meta, StoryObj } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"
import { Breadcrumb } from "./Breadcrumb"

const meta = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Short: Story = {
  args: {
    items: [
      { label: "Home", to: "/" },
      { label: "Locks" },
    ],
  },
}

export const DeepNested: Story = {
  args: {
    items: [
      { label: "Home", to: "/" },
      { label: "Portfolio", to: "/portfolio" },
      { label: "Aquarius Locks", to: "/portfolio/aquarius" },
      { label: "Lock #42" },
    ],
  },
}

export const NonClickableIntermediate: Story = {
  args: {
    items: [
      { label: "Home", to: "/" },
      { label: "Section" },
      { label: "Current Page" },
    ],
  },
}
