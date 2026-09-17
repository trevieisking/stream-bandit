# Stream Bandit TCG — Master Plan Ledger V2.3.2

**Date:** 2026-09-17  
**Status:** append-only continuity ledger for V2.3.2  
**Master plan:** `tcg-master-plan-progress-v2.3.2.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.2.md`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.1.md`  
**Repository:** `trevieisking/stream-bandit`  
**Control PR:** `#564`

---

## Ledger rules

1. This ledger is append-only for accepted V2.3.2 checkpoints.
2. GitHub exact branch/PR/commit evidence is the repository source of truth.
3. Supabase is the source of truth for deployed Edge Function/database state.
4. No runtime, deployment or release state is inferred from planning documents.
5. Every material TCG work-result message must leave a recoverable checkpoint in the checklist/ledger before delivery.
6. A work slice is not accepted until the checklist IDs, exact SHA, evidence and next operation are recorded.
7. Message timeout/new-chat recovery begins from the newest accepted ledger entry, not from memory.
8. The established 40-owner architecture remains the baseline; no new owner is created merely for UI convenience, a mechanic label or one card.

---

## V2.3.2-001 — Recovered product direction promoted to canonical plan

**State:** ACCEPTED CONTROL DECISION  
**Type:** documentation/control only  
**Runtime/live impact:** none

Recovered and locked the project-level product rule:

> Stream Bandit TCG must play like the original playable prototype, upgraded for authenticated online multiplayer and backed by the canonical server-authoritative engines.

Explicitly preserved:

- one-screen battlefield;
- real cards as the primary controls;
- drag/drop desktop with tap/select equivalent;
- board-visible choices;
- card-controlled Ability / Attack / Withdraw;
- green legal Evolution targets;
- visible Essence/Relic attachments;
- persistent Realm;
- Tactic board/overlay targeting rather than browser prompts;
- visible damage/Shield/Condition/defeat/Reward/promotion consequences;
- premium full-card renderer;
- complete-client Collection / Deck Builder / Packs / Practice / progression direction;
- no debug-form battlefield as the release experience.

**Master-plan commit:** `9b4ff3eb6bb86c07b0cd6c198e4ece7c026b57dc`

---

## V2.3.2-002 — Release failure lessons split into independent gates

**State:** ACCEPTED CONTROL DECISION  
**Runtime/live impact:** none

The failed release is no longer treated as one vague issue. The plan records three independent failure classes:

1. merge/deploy evidence was treated too much like product-readiness evidence;
2. the player experience drifted away from the original prototype/direct-card game;
3. post-merge runtime defects remained.

The plan therefore requires both technical stabilization and player-visible prototype restoration before LIVE.

---

## V2.3.2-003 — V2-G0R stabilization gate created

**State:** ACCEPTED CONTROL DECISION / IMPLEMENTATION TODO  
**Runtime/live impact:** none

Eleven post-merge defects are promoted into the mandatory `V2-G0R — Release Recovery & Runtime Stabilisation` gate:

1. reproducible registry/starter migration;
2. simultaneous-win/overtime lifecycle;
3. stale revision propagation;
4. global matchup damage application;
5. concession/reward abuse;
6. hidden-information isolation;
7. matchmaking locked/in-match room lifetime;
8. setup-legal deck validation;
9. private-room simultaneous Ready concurrency;
10. Tactic subtype boundary;
11. validation workflow coverage.

Current V2.3.2 implementation state: **0/11 accepted repairs**.

---

## V2.3.2-004 — Mandatory execution checklist created

**State:** ACCEPTED CONTROL DECISION  
**Runtime/live impact:** none

Created `tcg-master-plan-checklist-v2.3.2.md` with stable IDs for:

- control/continuity;
- product UX;
- forbidden release-client patterns;
- all eleven G0R defects;
- card-controller behavior;
- direct physical-card play;
- Attack/Ability/Withdraw/switch choreography;
- damage counters/defeat/Rewards/promotion;
- search/private-choice overlays;
- premium renderer requirements;
- architecture/owner invariants;
- V2-G1 content authority;
- V2-G1E generic extensibility;
- V2-G2 renderer;
- V2-G3 prototype restoration;
- V2-G4 full battle choreography;
- V2-G5 real two-user proof;
- V2-G6 player systems;
- V2-G7 release acceptance;
- LIVE definition.

**Checklist commit:** `03384eedba586d160f7f3433bce243c7f4a058e0`

Continuity rule now active: a material implementation change without its checklist checkpoint is not an accepted master-plan step.

---

## V2.3.2-005 — Card layout correction locked

**State:** REQUIREMENT LOCKED / AUTHORITY-FILE UPDATE TODO  
**Runtime/live impact:** none

The current V2.3.1 visual-contract wording drifted from the explicit prototype/showcase instruction by moving HP out of the fixed top-left position.

The V2.3.2 decision is:

- HP top-left for ordinary Creature cards;
- Type/Element top-right;
- name + stage/classification upper header;
- large artwork;
- exactly two action slots;
- Attack Cost/Damage explicitly labelled;
- Withdraw Cost bottom-right;
- do not invent an ordinary Creature play/evolution Cost when the schema does not define one.

`HP top-left` and `no invented Creature Cost` are both mandatory and compatible.

Pending control task: create corrected card visual authority and realign any conflicting authority pointer.

---

## V2.3.2-006 — Locked execution route

**State:** ACCEPTED CONTROL DECISION

The canonical route is now:

1. V2-G0R — Release Recovery & Runtime Stabilisation.
2. Synchronise plan + checklist + ledger + release-control checkpoint.
3. V2-G1 — Fairy -> Underworld -> deterministic 241 identities / 10 exact starters.
4. V2-G1E — generic capability-to-owner/opcode proof.
5. V2-G2 — premium full-card renderer.
6. V2-G3 — restore original playable prototype online.
7. V2-G4 — full battle choreography acceptance.
8. V2-G5 — real two-authenticated-user end-to-end.
9. V2-G6 — player systems integration.
10. V2-G7 — exact-head release acceptance fence.
11. LIVE.

No later gate may erase or silently bypass an earlier incomplete release blocker.

---

## Current checkpoint

**Control Gate:** V2.3.2 Control Gate 0  
**Control PR:** #564  
**Branch:** `docs/tcg-v2-3-post-test-consistency`  
**Latest accepted checklist commit entering this ledger write:** `03384eedba586d160f7f3433bce243c7f4a058e0`  
**main remains:** `59ab7857522373a53de7d551c66f12c2e514e934` at the last refresh  
**Runtime/live mutation:** none  
**Merge/live decision:** HOLD

### Next exact operations

1. create machine release/index authority pointing to V2.3.2 plan/checklist/ledger;
2. create corrected card visual authority for HP top-left + no invented Cost;
3. record controller visual-pointer inconsistency as resolved or still HOLD after exact inspection;
4. exact diff review of the V2.3.2 control slice;
5. refresh current review/CI/status evidence;
6. update checklist/ledger with final Control Gate 0 head and next implementation item.
