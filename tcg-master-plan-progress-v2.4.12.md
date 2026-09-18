# Stream Bandit TCG — Master Plan Progress V2.4.12

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `2d8b592c5d516ac4ac4bf3f7d1ee349b6c3fcdfc`  
**Master-plan target:** INTERACT-02 / STATE-VIS-05 / STATE-VIS-06  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Complete the browser half of Evolution direct interaction without moving legality into the client.

The selected hand card asks deployed `tcg-match-actions` v3 for `evolve_targets(card_uid)`. If the server classifies it as an Evolution card, the client highlights only returned legal Vanguard/Reserve stacks in green. Choosing one sends the existing `evolve` action.

## 2. Authority boundary

Browser owns:
- selected-card presentation;
- calling the read-only target projection;
- rendering returned legal coordinates;
- green target feedback;
- click/tap/keyboard intent;
- clearing selection after commit.

Creature/Evolution owner retains:
- first-personal-turn lock;
- Teen/Adult eligibility;
- predecessor identity;
- entered/evolved turn locks;
- one Evolution per stack per turn;
- final revalidation and mutation;
- evolved listeners/effects/defeat continuation.

No card-name/stage/predecessor rule branch is added to browser JavaScript.

## 3. Compatibility

When `evolve_targets` reports the selected hand card is not an Evolution card, existing generic Creature Reserve and Realm destination behavior remains unchanged.

Attack remains card-owned and turn-ending after full attack resolution/Aftermath. Active Ability rules remain unchanged.

## 4. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review-thread/status check and bounded diff are required. This is a client/UI slice; no additional Supabase deployment is required unless source evidence reveals a server defect.
