# Stream Bandit TCG — Master Plan Progress V2.4.20

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `93a954ea6672d0a0b122a8ad97bbb20d9acbec6c`  
**Master-plan target:** INTERACT-07 selection cancellation  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Close canonical V2.4.1 **INTERACT-07**: misclick/selection can be cancelled before authoritative commit where rules permit.

## 2. Existing implementation proof

No new product code is required.

The accepted V2 battle controller already uses a local pre-commit selection state:
- selecting a hand card stores its UID;
- selecting that same hand card again toggles the UID back to empty;
- cancellation clears Evolution, Essence, Relic and Tactic projections;
- because `deselect === true`, no new projection request is launched;
- selecting another battlefield card toggles its anchor locally and clears hand/projection selection;
- pointer and Enter/Space activation use the same selection function.

Actual gameplay mutation remains in separate intent functions and does not happen merely because a card is selected or deselected.

## 3. Rules boundary

INTERACT-07 applies only before authoritative commit where cancellation is permitted.

After a committed Tactic or other action creates an authoritative pending choice, the player must resolve that server-owned state according to its own rules. V2.4.20 does not invent a local cancel path for committed server continuations.

## 4. Scope

V2.4.20 adds regression/evidence controls only:
- no controller change;
- no renderer/CSS/HTML change;
- no Supabase runtime/schema/migration change;
- no card-data change.

## 5. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff evidence are required.


## 6. Accepted checkpoint

V2.4.20 is accepted at `872e9a82679eebfa9bf09fb21761d6b314b7f9e4`.

INTERACT-07 selection cancellation is complete. No controller, renderer, Supabase runtime, schema, migration or card-data bytes changed.

**Next locked target from canonical V2.4.1:** INTERACT-08 — server authority remains final legality authority for every interaction. Prove the projection/commit revalidation chain across setup, Creature, Evolution, Essence, Relic, Realm, Tactic and Attack before considering any code change.
