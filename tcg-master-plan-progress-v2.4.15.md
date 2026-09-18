# Stream Bandit TCG — Master Plan Progress V2.4.15

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `3fb28d827f396021e3c480346b91da5ed4b66550`  
**Master-plan target:** INTERACT-04 Relic server legality/projection seam  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Move structured manual Relic declaration legality into the existing Relic owner before adding browser Relic targeting.

The server exposes `attach_relic_targets(card_uid)` as a read-only projection and revalidates `attach_relic` through the same owner before calling the existing atomic Relic mutation.

## 2. Authority boundary

Relic owner owns:
- Set One registry identity: `card_family=Tactic` + `tactic.subtype=Relic`;
- occupied friendly Vanguard/Reserve target discovery;
- one-Relic-per-Creature destination legality;
- exact target anchor identity;
- final structured declaration validation;
- existing exact hand → attached Relic atomic mutation.

Match Actions remains orchestration/compatibility only. Legacy/unstructured fallback remains unchanged. Existing Stone Flintkin compatibility remains in the dispatcher until generic `relic_attached` event parity is separately proven.

## 3. Registry evidence

Production registry inspection confirms all 16 Set One Relics have zero `tactic.play_requirements`. No additional card-specific placement condition is required for this projection.

## 4. Browser fence

No browser Relic transport is added in V2.4.15. The next browser slice may consume only server-returned legal coordinates and the existing `attach_relic` action.

## 5. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status, bounded-diff and release-control closure evidence are required before any in-place `tcg-match-actions` deployment.
