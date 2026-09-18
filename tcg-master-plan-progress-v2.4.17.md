# Stream Bandit TCG — Master Plan Progress V2.4.17

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `a46749873304a8a4e2eff4bb02862aeeae3a595f`  
**Master-plan target:** INTERACT-06 Tactic server playability seam  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Expose read-only Tactic playability from the existing `tcg-tactic-actions` owner before adding browser Tactic controls.

The new `play_tactic_legality(card_uid)` action and the real `play_tactic` action use the same evaluator. Browser code therefore will not need to infer Tactic identity, Ally first-turn restriction, play requirements, required targets/resources or unsupported effect contracts.

## 2. Existing owner retained

The accepted Tactic interpreter remains unchanged for effect execution and choices. It already owns:
- `play_tactic` and `resolve_choice`;
- structured Tactic identity/effect schema;
- Ally first-turn restriction;
- play requirements;
- required target/resource availability;
- unsupported lifecycle detection;
- generic effect choices;
- Tactic heal-listener and movement-listener continuation choices.

V2.4.17 changes only declaration/playability ownership reuse.

## 3. Projection contract

Read-only result:
- eligible Tactic: `{eligible:true, card_uid, subtype}`;
- ineligible selection: `{eligible:false, card_uid, reason, unsupported_ops?}`.

The projection never removes a card, creates effect state or commits a command.

## 4. Browser fence

No browser Tactic transport or choice UI is added in V2.4.17. The next browser slice may consume only server-returned playability and existing authoritative pending-choice views.

## 5. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status, bounded-diff and release-control evidence are required before any in-place `tcg-tactic-actions` deployment.
