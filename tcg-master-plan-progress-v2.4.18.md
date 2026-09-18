# Stream Bandit TCG — Master Plan Progress V2.4.18

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `ad8cf902c0900f6d7573c45ab024778ee0c4d3d1`  
**Master-plan target:** INTERACT-06 Tactic dedicated-owner fence  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Why this prerequisite exists

V2.4.17 exposed server-owned Tactic playability. Before the browser consumes it, the Set One authority audit proved that all four Tactic-family subtypes — Ally, Device, Realm and Relic — carry the same structured effect schema.

Realm and Relic already have dedicated gameplay owners and direct battlefield transports. Allowing them through generic `play_tactic` would create a second mutation path.

## 2. Canonical ownership fence

The existing `tacticPlayability` evaluator now accepts only:
- Ally;
- Device.

Realm and Relic return `tactic_subtype_uses_dedicated_owner` before any generic Tactic play mutation can begin.

Because `play_tactic_legality` and real `play_tactic` share this evaluator, the same ownership fence protects both browser projection and direct API calls.

## 3. Preserved owners

- Realm → canonical Realm owner / `play_realm`;
- Relic → canonical Relic owner / `attach_relic`;
- Ally + Device → canonical Tactic owner / `play_tactic`.

No browser logic, effect interpreter, card data, schema or migration changes are included.

## 4. Next target

After exact-head acceptance and in-place Tactic Edge promotion, INTERACT-06 browser interaction may safely consume `play_tactic_legality` without duplicating subtype routing.

## 5. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status, bounded-diff and release-control evidence are required before promotion.
