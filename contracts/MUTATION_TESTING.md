# Mutation Testing — Smart Contracts

This document describes the mutation testing setup for the StellarLock smart contracts using [`cargo-mutants`](https://mutants.rs/).

## Why Mutation Testing?

Standard unit tests verify expected behaviour, but they don't prove the tests would *catch* bugs. Mutation testing automatically introduces small code changes (mutants) and verifies that the test suite detects each change. A surviving mutant means the tests miss that particular code path.

Target areas for StellarLock:
- Vesting amount calculation (time-proportional release)
- Unlock time boundary checks (`unlock_at <= now` vs `<`)
- Amount validation (zero, overflow, underflow guards)
- Authorization checks (`require_auth()` calls)
- Split-lock share arithmetic (shares summing to 10 000 bps)

## Setup

```bash
# Install cargo-mutants (one-time)
cargo install cargo-mutants

# Verify installation
cargo mutants --version
```

## Running Mutation Tests

### Token Locker

```bash
cd contracts/token-locker
cargo mutants --timeout 120 --jobs 4 2>&1 | tee mutation-results-token-locker.txt
```

### LP Locker

```bash
cd contracts/lp-locker
cargo mutants --timeout 120 --jobs 4 2>&1 | tee mutation-results-lp-locker.txt
```

### Both contracts from workspace root

```bash
cd contracts
cargo mutants --timeout 120 --jobs 4 -p token-locker -p lp-locker
```

## Acceptance Criteria

| Criterion | Target |
|-----------|--------|
| Overall mutation survival rate | < 20% |
| Vesting arithmetic mutants killed | 100% |
| Authorization check mutants killed | 100% |
| Boundary condition mutants killed | ≥ 90% |

## Surviving Mutants (Accepted)

The following surviving mutants are intentionally accepted with justification:

| Location | Mutation | Justification |
|----------|----------|---------------|
| `lib.rs: get_lock` return type | Replace return value | Read-only query; no state change; not security-critical |
| `lib.rs: get_locks_by_creator` | Skip index update | Index helpers; covered by integration tests at call sites |

## CI Integration

`.github/workflows/mutation-testing.yml` runs `cargo mutants` against
token-locker on a weekly schedule, on `workflow_dispatch`, and on PRs that
touch `contracts/token-locker/**`. cargo-mutants has no built-in flag to fail
the build once more than N% of mutants survive, so the workflow runs
`cargo mutants` itself with its exit code ignored, then has a separate
"Enforce mutation survival threshold" step compute `missed / (caught + missed)`
from `mutants.out/{caught,missed}.txt` and fail the job if that ratio is
`>= 20%`, matching the acceptance criterion above.

## Adding Tests to Kill Survivors

When `cargo mutants` reports surviving mutants, add targeted tests in `tests.rs`:

```rust
#[test]
fn test_vesting_boundary_exact_unlock_time() {
    // Verifies that tokens are NOT claimable exactly at vesting start
    // (kills off-by-one mutants on vesting start boundary)
    ...
}

#[test]
fn test_withdraw_requires_auth() {
    // Verifies that beneficiary auth is always required
    // (kills mutants that remove require_auth calls)
    ...
}
```
