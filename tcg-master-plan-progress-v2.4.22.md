# Stream Bandit TCG — Master Plan Progress V2.4.22

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `b7581be870e5afe521494531f3c7eaa9383a51e8`  
**Master-plan target:** INTERACT-09 server card-action projection  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Prepare the server seam for canonical V2.4.1 INTERACT-09 without moving Ability or Withdrawal legality into the browser.

Attack already renders as actions on the Vanguard card and remains unchanged.

## 2. New read-only projection

`tcg-match-actions` adds `field_actions`, returning:
- currently legal Active Ability source coordinates/anchor UIDs;
- current Withdrawal eligibility;
- authoritative Withdrawal cost;
- occupied legal Reserve target coordinates/anchors;
- attached Essence payment options.

The projection never commits state.

## 3. Ability ownership

The projection simulates each friendly field Creature on a structured clone and invokes the same `runtimeV02BeginActiveAbilityLiveRoute` used by real `use_ability`.

The original state is never passed to the projection route, so activation receipts/effects/choices created during eligibility probing exist only in the clone.

Real `use_ability` and the projection share one source-binding/live-route helper.

## 4. Withdrawal ownership

A single dispatcher-level `withdrawalDeclaration` now owns the declaration fence shared by projection and real `withdraw`:
- once-per-turn flag;
- Vanguard presence;
- Stunned/Rooted prevention;
- occupied Reserve targets;
- current canonical Withdrawal cost;
- exact available attached Essence payment pool.

Real `withdraw` still performs payment + switch through `runtimeV02ApplyWithdrawalPaymentAndSwitch`, so Payment and Atomic Switch remain canonical owners.

## 5. Browser fence

No browser Ability/Withdraw control is added in V2.4.22. The next slice may consume only the projection.

## 6. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status, bounded-diff and release-control evidence are required before in-place Match Edge promotion.
