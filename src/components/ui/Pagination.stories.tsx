import type { Meta, StoryObj } from "@storybook/react"
import { Pagination } from "./Pagination"

const meta = {
  title: "UI/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  argTypes: {
    page: { control: "number" },
    pageSize: { control: "number" },
    total: { control: "number" },
  },
  args: {
    // no-op handler for all stories; individual stories can override
    onChange: () => {},
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/** First page of many — Prev button disabled, Next enabled. */
export const FirstPage: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 100,
  },
}

/** Middle page — both Prev and Next are enabled. */
export const MiddlePage: Story = {
  args: {
    page: 5,
    pageSize: 10,
    total: 100,
  },
}

/** Last page — Next button disabled, Prev enabled. */
export const LastPage: Story = {
  args: {
    page: 10,
    pageSize: 10,
    total: 100,
  },
}

/** Small dataset: only two pages total. */
export const TwoPages: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 15,
  },
}

/** Large dataset: hundreds of pages. */
export const LargePageCount: Story = {
  args: {
    page: 50,
    pageSize: 10,
    total: 5000,
  },
}

/**
 * Single page — component intentionally renders nothing when there is
 * nothing to paginate (total ≤ pageSize).
 */
export const SinglePageHidden: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 8,
  },
}
