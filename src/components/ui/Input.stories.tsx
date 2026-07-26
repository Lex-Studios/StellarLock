import type { Meta, StoryObj } from "@storybook/react"
import { Input, Label } from "./Input"

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: ["text", "number", "email", "password"],
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/** Empty text field — the most common entry point for a token contract address. */
export const Default: Story = {
  args: { placeholder: "C… (Soroban token contract)" },
}

/** Pre-filled with a real-looking contract address to show truncation and font rendering. */
export const WithValue: Story = {
  args: { defaultValue: "CBFCKEOQRQIXKLGU4QBUQVOINOKFBOXJ37LXEKLKNUO6TW4FNGDU26AW" },
}

/** Interaction is blocked — pointer events removed and opacity halved via Tailwind. */
export const Disabled: Story = {
  args: { placeholder: "Not editable", disabled: true },
}

/**
 * The app has no built-in error prop on Input — invalid state is signalled by
 * overriding the border/ring via `className`, matching form-level error patterns
 * used elsewhere in the codebase.
 */
export const InvalidState: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="story-invalid">Beneficiary</Label>
      <Input
        id="story-invalid"
        defaultValue="not-a-valid-address"
        aria-invalid="true"
        className="border-destructive/60 focus-visible:ring-destructive"
      />
      <p className="text-xs text-destructive">Enter a valid Stellar address.</p>
    </div>
  ),
}

/** Numeric amount field — uses `inputMode="decimal"` for mobile keyboards. */
export const NumberInput: Story = {
  args: { type: "number", inputMode: "decimal", min: "0", step: "any", placeholder: "0.00" },
}

/** Paired with a `Label` — the standard pattern for accessible form fields. */
export const WithLabel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="story-token">Token contract address</Label>
      <Input id="story-token" placeholder="C… (Soroban token contract)" />
    </div>
  ),
}
