import { describe, it, expect } from "vitest"
import { getTvlOverTime, getLockVolumeByDay, getTokenDistribution } from "@/lib/dashboardStats"
import type { Lock, TokenMeta } from "@/types/lock"

const token = (symbol: string): TokenMeta => ({
  address: `C${symbol}ADDRESS`,
  symbol,
  name: symbol,
  decimals: 7,
})

const makeLock = (overrides: Partial<Lock>): Lock => ({
  id: "1",
  kind: "token",
  status: "locked",
  token: token("GLOW"),
  creator: "creator",
  beneficiary: "beneficiary",
  amount: 100,
  usdValue: 100,
  createdAt: Date.parse("2026-01-01T00:00:00Z"),
  unlockAt: Date.parse("2027-01-01T00:00:00Z"),
  extendedCount: 0,
  ...overrides,
})

describe("getTvlOverTime", () => {
  it("returns an empty array for no locks", () => {
    expect(getTvlOverTime([])).toEqual([])
  })

  it("accumulates usdValue per day in chronological order", () => {
    const locks = [
      makeLock({ id: "1", usdValue: 100, createdAt: Date.parse("2026-01-02T00:00:00Z") }),
      makeLock({ id: "2", usdValue: 50, createdAt: Date.parse("2026-01-01T00:00:00Z") }),
      makeLock({ id: "3", usdValue: 25, createdAt: Date.parse("2026-01-01T12:00:00Z") }),
    ]
    expect(getTvlOverTime(locks)).toEqual([
      { date: "2026-01-01", tvl: 75 },
      { date: "2026-01-02", tvl: 175 },
    ])
  })
})

describe("getLockVolumeByDay", () => {
  it("counts locks created per day", () => {
    const locks = [
      makeLock({ id: "1", createdAt: Date.parse("2026-01-01T00:00:00Z") }),
      makeLock({ id: "2", createdAt: Date.parse("2026-01-01T01:00:00Z") }),
      makeLock({ id: "3", createdAt: Date.parse("2026-01-02T00:00:00Z") }),
    ]
    expect(getLockVolumeByDay(locks)).toEqual([
      { date: "2026-01-01", count: 2 },
      { date: "2026-01-02", count: 1 },
    ])
  })
})

describe("getTokenDistribution", () => {
  it("sums usdValue per token symbol, sorted descending", () => {
    const locks = [
      makeLock({ id: "1", token: token("GLOW"), usdValue: 10 }),
      makeLock({ id: "2", token: token("NOVA"), usdValue: 50 }),
      makeLock({ id: "3", token: token("GLOW"), usdValue: 30 }),
    ]
    expect(getTokenDistribution(locks)).toEqual([
      { symbol: "NOVA", value: 50 },
      { symbol: "GLOW", value: 40 },
    ])
  })

  it("returns an empty array for no locks", () => {
    expect(getTokenDistribution([])).toEqual([])
  })
})
