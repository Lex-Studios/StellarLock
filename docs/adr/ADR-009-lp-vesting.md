# ADR-009: LP Locker Supports Optional Linear Vesting

## Status
Accepted

## Context
`token-locker` has supported optional linear vesting since launch (see ADR-005).
`lp-locker` shipped without an equivalent — LP locks were always cliff-only (full
amount released at `unlock_at`).

This gap was silent: nothing in the README, ADRs, or UI communicated it as an
intentional product boundary. A user locking Aquarius or Soroswap LP shares for
a team allocation or token-generation event had no way to apply a gradual release
schedule, even though the identical use case was supported for single-asset token
locks.

Two resolutions were considered:

1. **Port vesting to `lp-locker`** — add the same `Vesting` struct, `calculate_vested`
   helper, and vesting-aware `withdraw` logic that `token-locker` already ships,
   keeping both contracts at feature parity.

2. **Document LP vesting as out of scope** — record a deliberate decision not to
   support it and suppress vesting controls in the frontend for LP locks.

A reason to prefer option 2 would be if LP pool-share tokens composed poorly with
partial withdrawal (e.g. if redeeming a fractional share caused protocol-level
issues on Aquarius or Soroswap). Investigation found no such constraint: LP share
tokens on both DEXes are standard SEP-41 fungible tokens and can be transferred in
any amount. There is therefore no technical barrier to partial release, and the
same `token::Client::transfer` call used for full withdrawal works unchanged.

## Decision
Port `token-locker`'s linear vesting to `lp-locker` (option 1).

Concretely:

- `LpLock` gains a `vesting: Vesting` field (`start`, `end`, `released`).
- `Vesting::none()` / `Vesting::is_none()` serve as the absence sentinel
  (zero timestamps), matching `token-locker` exactly so client code can use
  a single helper.
- `create_lock` and `create_split_lock` accept `vesting: Option<Vesting>` and
  validate `end > start` before storing.
- `withdraw` applies `calculate_vested` when a schedule is present, releasing
  only the linearly vested portion and keeping the lock open until
  `vesting.released >= lock.amount`.
- Two new error codes are added: `VestingEndBeforeStart = 15`,
  `NothingToRelease = 16`.
- All existing tests are updated for the new `create_lock` signature (the
  `vesting` argument is inserted before `metadata`). Seven new vesting-specific
  tests mirror the equivalent suite in `token-locker`.

## Consequences
- Both locker contracts now support the same optional linear vesting semantics.
  Frontend client code (`src/lib/lp-locker.ts`) must pass the new `vesting`
  argument; `undefined` / `null` maps to `None` and preserves existing cliff
  behaviour.
- The `LpLock` on-chain struct layout changes (new `vesting` field). Any lock
  created before this upgrade cannot be read back with the new struct — a
  contract migration or re-deployment is required before the new WASM is
  activated via `execute_upgrade`.
- `create_split_lock` propagates the same `Vesting` value to every sub-lock.
  Per-beneficiary vesting schedules are not supported; users who need different
  schedules per beneficiary must create separate individual locks, consistent
  with `token-locker` behaviour (ADR-005).
- No cliff, step, or custom schedule support is introduced — this remains
  linear-only per ADR-005.
