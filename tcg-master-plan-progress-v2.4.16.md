# Stream Bandit TCG — Master Plan Progress V2.4.16

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `2eda2ddd6f8d342abe4775f1a3071c93b6525a6f`  
**Master-plan target:** INTERACT-04 Relic browser interaction  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Complete the browser half of direct Relic interaction while keeping all Tactic/Relic subtype identity and one-Relic-per-Creature legality in deployed `tcg-match-actions` v5 and the canonical Relic owner.

A selected play-phase hand card asks the server for `attach_relic_targets(card_uid)`. When the server reports that card eligible, the browser highlights only the returned friendly Vanguard/Reserve Creature coordinates. Choosing one sends the existing `attach_relic` action.

## 2. Authority boundary

Browser owns only:
- selected-card presentation;
- read-only projection requests;
- rendering returned legal coordinates;
- green target feedback;
- pointer/keyboard intent;
- local projection cleanup after commit.

Relic owner retains:
- `card_family=Tactic` + `tactic.subtype=Relic` identity;
- occupied friendly Creature discovery;
- empty Relic-slot legality;
- exact target anchor identity;
- final declaration revalidation;
- exact hand → attached Relic atomic mutation.

No Relic subtype, one-Relic, card-ID or play-requirement rule is added to browser JavaScript.

## 3. Compatibility

Projection precedence is Evolution → Essence → Relic → generic Creature/Realm fallback. These families are server-classified and mutually exclusive, so precedence is transport safety rather than a second rules engine.

Setup, Attack, Ability, Realm, renderer, Supabase runtime and all card data remain unchanged.

## 4. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff evidence are required. This is a browser/UI slice; Supabase v5 remains the accepted server seam and requires no V2.4.16 redeploy.
