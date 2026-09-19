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


## 5. Exact-head acceptance

V2.4.12 source is accepted at exact PR head `944e97879f2a6ccd4a91b035f0b141cd0366b219`.

Fresh exact-head evidence:
- TCG Card Pass 2 Validation #672 — SUCCESS;
- Code Labs Migration Replay #842 — SUCCESS from zero;
- Code Labs V50 Functional Smoke #868 — SUCCESS, including independent PostgreSQL replay;
- review threads — 0;
- legacy combined-status entries — none found;
- bounded delta from `2d8b592c5d516ac4ac4bf3f7d1ee349b6c3fcdfc` — 2 commits / 9 files, including two historical regression-test relaxations and V2.4.12 controls.

The first V2.4.12 head `a2adf6c0...` exposed only stale V2.4.9 Realm and V2.4.10 setup source-shape/cache assertions. Repair head `944e9787...` changed those historical tests plus the ledger; the V2.4.12 controller/CSS/page implementation bytes did not change in the repair.

**Accepted interaction:** selected Evolution card → server `evolve_targets` → green legal Vanguard/Reserve stack → existing server `evolve` commit.

No Supabase deployment is required for V2.4.12. Existing `tcg-match-actions` v3 remains the authoritative server owner and was unchanged.

**Next master-plan target:** re-read V2.4.1 interaction order; INTERACT-03 Essence is the next unfinished direct-card family.
