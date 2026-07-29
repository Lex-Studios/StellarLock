import type { Meta, StoryObj } from "@storybook/react"
import { QrCodeModal } from "./QrCodeModal"

const SAMPLE_LOCK_URL = "https://stellarlock.xyz/lock/CA7QYNF5DQX5ZOAEXAMPLELOCKHASHADDRESS123456"

const meta = {
  title: "UI/QrCodeModal",
  component: QrCodeModal,
  tags: ["autodocs"],
  args: {
    onClose: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="relative min-h-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QrCodeModal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    url: SAMPLE_LOCK_URL,
    title: "Share Lock",
  },
}

export const CustomTitle: Story = {
  args: {
    url: SAMPLE_LOCK_URL,
    title: "Share Aquarius Lock",
  },
}
