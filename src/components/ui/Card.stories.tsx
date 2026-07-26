import type { Meta, StoryObj } from "@storybook/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card"
import { Button } from "./Button"

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/** Bare card with no sub-components — just a styled container. */
export const Default: Story = {
  args: {
    children: "Card content goes here.",
    className: "p-5 max-w-sm",
  },
}

/** Full composition: Header (title + description), Content, and Footer. */
export const WithHeaderContentFooter: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Lock #42</CardTitle>
        <CardDescription>USDC · Locked for 90 days</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Beneficiary will be able to withdraw after the lock period ends.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">
          Details
        </Button>
        <Button size="sm">Withdraw</Button>
      </CardFooter>
    </Card>
  ),
}

/** Custom padding override — zero padding with inner sections, as used on lock-summary cards in the app. */
export const ZeroPaddingWithDividedRows: Story = {
  render: () => (
    <Card className="max-w-sm divide-y divide-border overflow-hidden p-0">
      <div className="bg-secondary/40 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lock Summary</p>
      </div>
      <div className="px-5 py-3 flex justify-between text-sm">
        <span className="text-muted-foreground">Token</span>
        <span className="font-medium">USDC</span>
      </div>
      <div className="px-5 py-3 flex justify-between text-sm">
        <span className="text-muted-foreground">Amount</span>
        <span className="font-medium">10,000</span>
      </div>
      <div className="px-5 py-3 flex justify-between text-sm">
        <span className="text-muted-foreground">Unlock date</span>
        <span className="font-medium">2025-12-31</span>
      </div>
    </Card>
  ),
}

/** Hover border highlight — mirrors the transition used on LockCard. */
export const HoverHighlight: Story = {
  render: () => (
    <Card className="max-w-sm p-5 transition-colors hover:border-primary/40 cursor-pointer">
      <p className="text-sm text-muted-foreground">Hover over this card to see the border highlight.</p>
    </Card>
  ),
}

/** Selected state — ring + border shown when a card is checked in bulk-select mode. */
export const Selected: Story = {
  render: () => (
    <Card className="max-w-sm p-5 border-primary ring-1 ring-primary/40">
      <p className="text-sm">This card is in the selected state.</p>
    </Card>
  ),
}

/** Empty / placeholder state — as used in RecentActivity when there are no items. */
export const EmptyState: Story = {
  render: () => (
    <Card className="max-w-sm p-8 text-center text-muted-foreground">
      <p>No recent activity.</p>
    </Card>
  ),
}
