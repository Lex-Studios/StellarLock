import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { Tabs } from "./Tabs"
import type { TabItem } from "./Tabs"

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

const TWO_TABS: TabItem[] = [
  { value: "created", label: "Created by me", count: 12 },
  { value: "received", label: "Beneficiary", count: 3 },
]

const MANY_TABS: TabItem[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active", count: 8 },
  { value: "unlocked", label: "Unlocked", count: 2 },
  { value: "extended", label: "Extended", count: 1 },
]

const NO_COUNT_TABS: TabItem[] = [
  { value: "tokens", label: "Tokens" },
  { value: "lp", label: "LP Positions" },
]

/**
 * Interactive two-tab strip — mirrors the exact usage in MyLocks.tsx.
 * Click each tab to see the active state switch.
 */
export const TwoTabsInteractive: Story = {
  args: {
    items: TWO_TABS,
    value: "created",
    onChange: () => {},
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tab, setTab] = useState("created")
    return (
      <div className="space-y-4">
        <Tabs items={TWO_TABS} value={tab} onChange={setTab} />
        <p className="text-sm text-muted-foreground">Active tab: {tab}</p>
      </div>
    )
  },
}

/** First tab active (default view when the page loads). */
export const FirstTabActive: Story = {
  args: {
    items: TWO_TABS,
    value: "created",
    onChange: () => {},
  },
}

/** Second tab active. */
export const SecondTabActive: Story = {
  args: {
    items: TWO_TABS,
    value: "received",
    onChange: () => {},
  },
}

/** Four tabs — demonstrates layout with more options and mixed count/no-count items. */
export const ManyTabsInteractive: Story = {
  args: {
    items: MANY_TABS,
    value: "all",
    onChange: () => {},
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tab, setTab] = useState("all")
    return (
      <div className="space-y-4">
        <Tabs items={MANY_TABS} value={tab} onChange={setTab} />
        <p className="text-sm text-muted-foreground">Active tab: {tab}</p>
      </div>
    )
  },
}

/** Tabs without counts — verifies the count badge is omitted cleanly. */
export const NoCountBadges: Story = {
  args: {
    items: NO_COUNT_TABS,
    value: "tokens",
    onChange: () => {},
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tab, setTab] = useState("tokens")
    return <Tabs items={NO_COUNT_TABS} value={tab} onChange={setTab} />
  },
}

/** Zero count — count badge is present but shows 0 (edge case). */
export const ZeroCount: Story = {
  args: {
    items: [
      { value: "created", label: "Created by me", count: 0 },
      { value: "received", label: "Beneficiary", count: 0 },
    ],
    value: "created",
    onChange: () => {},
  },
}

/** Custom className — verifies external width/spacing overrides apply correctly. */
export const CustomClassName: Story = {
  args: {
    items: TWO_TABS,
    value: "created",
    onChange: () => {},
    className: "w-full justify-center",
  },
}
