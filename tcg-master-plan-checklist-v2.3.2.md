# Stream Bandit TCG — Master Plan Execution Checklist V2.3.2

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.2.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.2.md`  
**Release index:** `tcg-release-control-v2.1.json`  
**Repository:** `trevieisking/stream-bandit`  
**Control PR:** `#564` / `docs/tcg-v2-3-post-test-consistency`

---

## 0. How this checklist is used — MANDATORY

This file is the continuity checkpoint for all Stream Bandit TCG master-plan work.

### State legend

- `LOCKED` — requirement is explicitly preserved in the canonical plan.
- `TODO` — implementation/evidence not yet complete.
- `IN PROGRESS` — bounded work has started but is not accepted.
- `COMPLETE` — implementation + required exact-head evidence accepted.
- `HOLD` — do not progress/promo until stated evidence is available.
- `BLOCK` — a safety or correctness condition failed.

### Every work-result message must update this checkpoint

Before sending a user-facing result for a material TCG work slice, record:

- [ ] exact PR/branch and current head SHA;
- [ ] checklist ID(s) touched;
- [ ] exact files/systems changed or inspected;
- [ ] test/review/runtime evidence;
- [ ] production/live impact or explicit `none`;
- [ ] acceptance decision for the slice;
- [ ] next exact checklist ID/operation.

If message delivery fails, a new chat starts, or tool context disappears, resume from the newest GitHub checklist/ledger checkpoint. Do not reconstruct the active step from memory alone.

A source change without the checklist update is **not an accepted master-plan step**. A deployment/merge without the checklist's release evidence is **not a completed release gate**.

---

# A. Control & continuity

| ID | Requirement | Requirement state | Implementation / evidence |
|---|---|---|---|
| CTRL-001 | Master plan V2.3.2 explicitly locks release recovery + prototype restoration | LOCKED | COMPLETE — `tcg-master-plan-progress-v2.3.2.md`, commit `9b4ff3eb6bb86c07b0cd6c198e4ece7c026b57dc` |
| CTRL-002 | Dedicated execution checklist exists and mirrors the master-plan gates | LOCKED | COMPLETE — this file, initial commit `03384eedba586d160f7f3433bce243c7f4a058e0` |
| CTRL-003 | Dedicated append-only V2.3.2 ledger records accepted work slices and next operation | LOCKED | COMPLETE — `tcg-master-plan-ledger-v2.3.2.md`, latest evidence commit `b4e256715658e037dacd36064fb76aa7d2d1bf47` |
| CTRL-004 | Machine release/index authority points at V2.3.2 plan + checklist + ledger | LOCKED | COMPLETE — `tcg-release-control-v2.1.json`, commit `64d437335344853c3b38155698b6ba304bdd90e4` |
| CTRL-005 | Card visual authority is corrected to HP top-left without inventing Creature Cost | LOCKED | COMPLETE — `tcg-card-visual-printing-v1.2.json`, commit `bd86254e66594d95e573d7a9203fbee058a4559b` |
| CTRL-006 | Any controller/release authority pointer that conflicts with corrected visual authority is realigned | LOCKED | HOLD — exact inspection proves `tcg-v2-card-action-controller-v1.json` still points at `tcg-card-visual-printing-v1.1.json`; do not forget or mark complete |
| CTRL-007 | Every material work-result message updates this checkpoint before delivery | LOCKED | ACTIVE PROCESS — enforced by this final checkpoint update |
| CTRL-008 | Exact SHA/evidence, not memory, controls continuation after timeouts/new chats | LOCKED | ACTIVE PROCESS |
| CTRL-009 | `main`, runtime, Supabase and live remain unchanged during this control-only gate | LOCKED | COMPLETE for this slice |

---

# B. Product north star — original prototype online

All requirements below are locked. Implementation is verified later at V2-G2/G3/G4.

| ID | Player/product requirement | Locked | Implementation |
|---|---|---:|---:|
| UX-001 | RESTORE, DO NOT REDESIGN — original playable prototype is the player-experience authority | ✅ | TODO |
| UX-002 | Backend/networking improves the prototype; backend complexity is not the player UI | ✅ | TODO |
| UX-003 | One-screen battlefield remains the centre of play | ✅ | TODO |
| UX-004 | Opponent top / player bottom | ✅ | TODO |
| UX-005 | 1 Vanguard + 4 Reserve slots each | ✅ | TODO |
| UX-006 | 6 visible face-down Reward positions each | ✅ | TODO |
| UX-007 | Deck + Discard visible | ✅ | TODO |
| UX-008 | Hand along bottom edge | ✅ | TODO |
| UX-009 | Realm presence visible | ✅ | TODO |
| UX-010 | Attached Essence/Relic state visible | ✅ | TODO |
| UX-011 | Board remains visible during choices whenever practical | ✅ | TODO |
| UX-012 | Desktop hover / click-select / drag-drop | ✅ | TODO |
| UX-013 | Touch tap-select / tap-destination equivalent | ✅ | TODO |
| UX-014 | Keyboard/reduced-motion/text legality accessibility equivalents | ✅ | TODO |
| UX-015 | Player can cancel/change a legal pre-commit choice where practical | ✅ | TODO |
| UX-016 | No local undo after authoritative legal commit | ✅ | TODO |

### Explicit release-client prohibitions

| ID | Forbidden normal release pattern | Locked | Verified absent |
|---|---|---:|---:|
| UX-F01 | debug-form battlefield | ✅ | TODO |
| UX-F02 | browser prompt targeting | ✅ | TODO |
| UX-F03 | raw backend action/array-index controls as primary gameplay | ✅ | TODO |
| UX-F04 | generic global Attack button as primary Attack UI | ✅ | TODO |
| UX-F05 | duplicate browser rules engine | ✅ | TODO |
| UX-F06 | hidden opponent-card leakage | ✅ | TODO |
| UX-F07 | replacing real card identity with anonymous rectangles where full cards can be used | ✅ | TODO |

---

# C. V2-G0R — Release Recovery & Runtime Stabilisation

**Gate state: HOLD — 0/11 repairs accepted in V2.3.2.**

The deployed 193-card / 8-starter private-alpha baseline must be preserved while each repair is proven.

| ID | Release-recovery defect | State | Acceptance evidence required |
|---|---|---|---|
| G0R-01 | reproducible registry/starter migration / clean recovery | TODO | clean migration/replay proves runtime authority available without destructive production overwrite |
| G0R-02 | simultaneous-win/overtime lifecycle cannot dead-end | TODO | deterministic simultaneous terminal-state test reaches valid resolution |
| G0R-03 | stale authoritative revision rejection propagates as failure/retry, not success | TODO | dispatcher tests for match/tactic/setup affected paths |
| G0R-04 | canonical global elemental matchup multiplier applied exactly once to eligible attack damage | TODO | matchup fixtures prove expected damage and non-applicable cases |
| G0R-05 | ineligible/pre-play concession cannot farm Arcade/match rewards | TODO | reward eligibility tests include early-concession abuse case |
| G0R-06 | private deck/card identities do not leak to opponent view before reveal | TODO | two-seat public/private view test |
| G0R-07 | locked/in-match room remains discoverable despite original queue expiry | TODO | matchmaking expiry transition test |
| G0R-08 | accepted deck always has legal setup recipe | TODO | validator + opening setup/mulligan fixtures |
| G0R-09 | simultaneous private-room Ready initializes deterministically once | TODO | concurrency/serialization test |
| G0R-10 | Tactic interpreter rejects/routes non-Tactic families correctly | TODO | Relic/Realm/invalid subtype boundary tests |
| G0R-11 | TCG validation workflow covers shared TCG modules and relevant migrations | TODO | exact changed-path trigger proof + workflow run |

### G0R promotion fence

- [ ] all 11 repaired or disproved by current exact-source evidence;
- [ ] exact-head validation green;
- [ ] migration replay green;
- [ ] functional smoke green;
- [ ] no unresolved material review finding on repaired head;
- [ ] checklist + ledger updated with exact accepted SHA;
- [ ] production deployment remains a separate decision after exact evidence refresh.

---

# D. Card is the controller

| ID | Requirement | Locked | Implemented/verified |
|---|---|---:|---:|
| CARD-CTRL-01 | real rendered Creature card is primary control surface | ✅ | TODO |
| CARD-CTRL-02 | ordinary Creature has exactly Ability + Attack 1 OR Attack 1 + Attack 2 | ✅ | TODO |
| CARD-CTRL-03 | never ordinary Ability + Attack 1 + Attack 2 together | ✅ | TODO |
| CARD-CTRL-04 | active Ability invoked from Creature card | ✅ | TODO |
| CARD-CTRL-05 | active Ability normally once/turn unless structured rule says otherwise | ✅ | TODO |
| CARD-CTRL-06 | passive/triggered Ability visible but not fake manual button | ✅ | TODO |
| CARD-CTRL-07 | Attack invoked from selected Vanguard card | ✅ | TODO |
| CARD-CTRL-08 | Withdraw invoked contextually from selected Vanguard | ✅ | TODO |
| CARD-CTRL-09 | raw action names/indexes/owner terminology hidden from ordinary player | ✅ | TODO |

---

# E. Direct physical-card play

| ID | Interaction | Locked | Implemented/verified |
|---|---|---:|---:|
| PLAY-01 | Creature hand card -> legal Vanguard/Reserve highlights -> drop -> server validate -> animate | ✅ | TODO |
| PLAY-02 | Evolution -> all legal targets highlight green -> drop -> validate -> visible stack | ✅ | TODO |
| PLAY-03 | Essence -> legal friendly Creatures highlight -> attach visibly | ✅ | TODO |
| PLAY-04 | Relic -> legal Creature -> remains visibly attached until removed | ✅ | TODO |
| PLAY-05 | Realm -> Realm slot -> persists across turns until replacement/removal | ✅ | TODO |
| PLAY-06 | Tactic played from physical hand card -> board/overlay target flow -> canonical destination | ✅ | TODO |
| PLAY-07 | illegal target stays inactive and useful legality reason shown where practical | ✅ | TODO |
| PLAY-08 | selected/picked card gets clear lift/focus feedback | ✅ | TODO |

---

# F. Attack, Ability, Withdraw & switch choreography

| ID | Requirement | Locked | Implemented/verified |
|---|---|---:|---:|
| ACT-01 | Vanguard card shows printed Attack name/cost/damage/effect | ✅ | TODO |
| ACT-02 | server validates payment/targets/legality | ✅ | TODO |
| ACT-03 | visible resolution: payment -> attack -> damage -> protection/conditions/listeners -> defeat -> Rewards -> promotion -> Aftermath | ✅ | TODO |
| ACT-04 | completed Attack automatically ends attacker's turn | ✅ | TODO |
| ACT-05 | no extra developer End Turn step after completed Attack | ✅ | TODO |
| ACT-06 | Withdraw shows cost and legal Reserve replacements | ✅ | TODO |
| ACT-07 | exact Withdraw payment/replacement validated server-side | ✅ | TODO |
| ACT-08 | Vanguard <-> Reserve exchange visibly animated | ✅ | TODO |
| ACT-09 | effect-driven switches reuse same board movement and canonical switch context | ✅ | TODO |

---

# G. Damage, counters, defeat, Rewards & promotion

| ID | Requirement | Locked | Implemented/verified |
|---|---|---:|---:|
| DMG-01 | ordinary damage value + HP delta visible | ✅ | TODO |
| DMG-02 | Shield/protection changes visible | ✅ | TODO |
| DMG-03 | Conditions visibly represented | ✅ | TODO |
| DMG-04 | relevant player-visible trigger/listener feedback | ✅ | TODO |
| DMG-05 | damage counter base unit 10 | ✅ | TODO |
| DMG-06 | counter interaction uses resolving-card focus + legal targets + counter tray | ✅ | TODO |
| DMG-07 | drag counters plus tap/select accessibility equivalent | ✅ | TODO |
| DMG-08 | fixed vs up-to/partial amount comes from structured rule | ✅ | TODO |
| DMG-09 | single-target counter placement/move hits immediate defeat boundary | ✅ | TODO |
| DMG-10 | grouped multi-target counter placement commits atomically then batch defeat scan | ✅ | TODO |
| DMG-11 | attack-generated counter choices finish before automatic turn handoff | ✅ | TODO |
| DMG-12 | turn-transition Condition counter ticks resolve before next normal actions | ✅ | TODO |
| DMG-13 | defeat animation is visible | ✅ | TODO |
| DMG-14 | Reward positions stay visible face-down | ✅ | TODO |
| DMG-15 | Reward choice interacts with Reward area, not raw indexes | ✅ | TODO |
| DMG-16 | defeated Vanguard triggers legal Reserve promotion highlight/animation | ✅ | TODO |

---

# H. Search/private-choice overlays

| ID | Requirement | Locked | Implemented/verified |
|---|---|---:|---:|
| CHOICE-01 | battlefield remains visible behind search/choice where practical | ✅ | TODO |
| CHOICE-02 | visual eligible-card grid/carousel | ✅ | TODO |
| CHOICE-03 | requirement + selected count visible | ✅ | TODO |
| CHOICE-04 | confirm + cancel/change before commit | ✅ | TODO |
| CHOICE-05 | hidden-information boundaries maintained | ✅ | TODO |
| CHOICE-06 | return directly to same board after resolution | ✅ | TODO |

---

# I. Premium full-card renderer

| ID | Requirement | Locked | Implemented/verified |
|---|---|---:|---:|
| VIS-01 | HP top-left on ordinary Creature | ✅ | CONTROL CONTRACT COMPLETE in v1.2; renderer TODO |
| VIS-02 | Type/Element top-right | ✅ | CONTROL CONTRACT COMPLETE in v1.2; renderer TODO |
| VIS-03 | name + stage/classification in upper header | ✅ | CONTROL CONTRACT COMPLETE in v1.2; renderer TODO |
| VIS-04 | large dedicated artwork | ✅ | TODO |
| VIS-05 | exactly two action slots below art | ✅ | CONTROL CONTRACT COMPLETE; renderer TODO |
| VIS-06 | Attack Cost explicitly labelled with Essence type/count | ✅ | TODO |
| VIS-07 | Damage explicitly labelled | ✅ | TODO |
| VIS-08 | Withdraw Cost bottom-right | ✅ | CONTROL CONTRACT COMPLETE in v1.2; renderer TODO |
| VIS-09 | do not invent ordinary Creature play/evolution Cost | ✅ | CONTROL CONTRACT COMPLETE in v1.2; renderer TODO |
| VIS-10 | every gameplay number has named property/accessible standardized label | ✅ | CONTROL CONTRACT COMPLETE; renderer TODO |
| VIS-11 | full card identity remains recognisable on battlefield | ✅ | TODO |
| VIS-12 | hover/tap/hold enlarges readable card | ✅ | TODO |
| VIS-13 | target proper artwork on every printable gameplay card | ✅ | TODO |
| VIS-14 | Basic / Rare / Extra Rare / Mythic gameplay rarity tiers | ✅ | CONTROL CONTRACT COMPLETE; renderer TODO |
| VIS-15 | Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic finishes supported | ✅ | CONTROL CONTRACT COMPLETE; renderer TODO |
| VIS-16 | printing/finish never changes gameplay power | ✅ | CONTROL CONTRACT COMPLETE; renderer TODO |

---

# J. Architecture & owner integrity

| ID | Requirement | Locked | Implemented/verified |
|---|---|---:|---:|
| ARC-01 | established 40-owner gameplay architecture remains baseline | ✅ | CURRENT BASELINE |
| ARC-02 | no owner #41 for UI convenience/mechanic label/one card | ✅ | ACTIVE RULE |
| ARC-03 | new owner only for proven new reusable state-transition responsibility | ✅ | ACTIVE RULE |
| ARC-04 | reusable engines/systems preferred over card-specific helpers | ✅ | ACTIVE RULE |
| ARC-05 | browser projects legality and player intent; server owns rules/state mutation | ✅ | TODO full client proof |
| ARC-06 | no duplicate owner for same responsibility | ✅ | ACTIVE RULE |
| ARC-07 | preserve working features while replacing bypass/duplicate mutation paths | ✅ | ACTIVE RULE |

---

# K. V2-G1 — Content authority

**Gate state: HOLD behind G0R stabilization unless bounded preparation cannot mask G0R.**

| ID | Requirement | State |
|---|---|---|
| G1-01 | translate Fairy / Glimmerwish into exact canonical schema | TODO |
| G1-02 | translate Underworld / Grave Pact into exact canonical schema | TODO |
| G1-03 | deterministic 10-element authority | TODO |
| G1-04 | deterministic 241 structured identities | TODO |
| G1-05 | deterministic 10 exact 60-card starters | TODO |
| G1-06 | no Fairy/Underworld card-name-specific runtime branch | TODO |
| G1-07 | preserve historical deployed 8/193/8 until explicit later promotion | ACTIVE RULE |

---

# L. V2-G1E — Generic extensibility

| ID | Requirement | State |
|---|---|---|
| G1E-01 | every accepted capability has parameter schema | TODO |
| G1E-02 | every accepted capability mapped to existing owner/opcode or justified generic extension | TODO |
| G1E-03 | deterministic tests for supported capability families | TODO |
| G1E-04 | future sample series can be defined without card-name/series-name runtime branch | TODO |
| G1E-05 | backward compatibility for existing cards/collections | TODO |
| G1E-06 | indexed mechanic does not become "implemented" without runtime proof | ACTIVE RULE |
| G1E-07 | Evergreen/no-age-rotation direction retained | ACTIVE RULE |

---

# M. V2-G2 — Premium renderer

- [ ] VIS-01 through VIS-16 implemented and visually inspected.
- [ ] no invented schema properties.
- [ ] real structured rules drive visible card text/numbers.
- [ ] representative cards from all 10 element families render correctly.
- [ ] card variants/printings do not alter gameplay identity.

---

# N. V2-G3 — Original playable prototype restored online

**Gate state: TODO.**

- [ ] UX-001 through UX-016 pass.
- [ ] UX-F01 through UX-F07 absent from normal release gameplay.
- [ ] CARD-CTRL-01 through CARD-CTRL-09 pass.
- [ ] PLAY-01 through PLAY-08 pass.
- [ ] ACT-01 through ACT-09 pass.
- [ ] CHOICE-01 through CHOICE-06 pass.
- [ ] applicable DMG interaction requirements pass.

Core acceptance sentence:

> Hand -> pick/drag card -> legal destination highlights -> release/select -> server validates -> board visibly responds -> keep playing.

---

# O. V2-G4 — Full battle choreography acceptance

| ID | Journey requirement | State |
|---|---|---|
| FLOW-01 | authenticated match entry | TODO |
| FLOW-02 | toss/opening choice | TODO |
| FLOW-03 | opening hand | TODO |
| FLOW-04 | mulligan | TODO |
| FLOW-05 | place Vanguard | TODO |
| FLOW-06 | optional Reserve placement | TODO |
| FLOW-07 | Ready/confirm | TODO |
| FLOW-08 | six Rewards installed | TODO |
| FLOW-09 | normal board appears without debug-form transition | TODO |
| FLOW-10 | draw | TODO |
| FLOW-11 | play Creature | TODO |
| FLOW-12 | Evolution green targets | TODO |
| FLOW-13 | Essence attachment | TODO |
| FLOW-14 | Relic attachment | TODO |
| FLOW-15 | Realm persistence | TODO |
| FLOW-16 | Tactic flow | TODO |
| FLOW-17 | active Ability | TODO |
| FLOW-18 | Withdraw/switch | TODO |
| FLOW-19 | Attack | TODO |
| FLOW-20 | damage/protection/Condition/listener feedback | TODO |
| FLOW-21 | defeat -> Reward -> promotion -> Aftermath | TODO |
| FLOW-22 | automatic turn handoff | TODO |
| FLOW-23 | victory/defeat presentation | TODO |
| FLOW-24 | match rewards exactly once | TODO |
| FLOW-25 | completed match immutable | TODO |
| FLOW-26 | rematch/exit | TODO |

---

# P. V2-G5 — Real two-user online proof

- [ ] two distinct authenticated users join one match;
- [ ] both receive correct public state;
- [ ] each receives only their legal private state;
- [ ] actions synchronize correctly between clients;
- [ ] choice waits/resumes are visible and deterministic;
- [ ] reconnection/reload does not corrupt authoritative match state;
- [ ] one complete normal match finishes through the card-table UI.

---

# Q. V2-G6 — Complete-client player systems

| ID | Player destination | State |
|---|---|---|
| SYS-01 | TCG Home | TODO/EXISTING WORK TO AUDIT |
| SYS-02 | Learn / Tutorial | TODO/EXISTING WORK TO AUDIT |
| SYS-03 | Collection / Card Viewer | TODO/EXISTING WORK TO AUDIT |
| SYS-04 | Deck Builder with ownership + legality clarity | TODO/EXISTING WORK TO AUDIT |
| SYS-05 | Packs / opening / history | TODO/EXISTING WORK TO AUDIT |
| SYS-06 | Practice / Test Deck | TODO/EXISTING WORK TO AUDIT |
| SYS-07 | Private room | TODO/EXISTING WORK TO AUDIT |
| SYS-08 | Casual matchmaking | TODO/EXISTING WORK TO AUDIT |
| SYS-09 | Season / Battle Pass / progression | TODO/EXISTING WORK TO AUDIT |
| SYS-10 | future Ranked/events only after dedicated safety gates | LOCKED RULE |

All player systems must reuse canonical card identity/printing/ownership/deck authorities.

---

# R. V2-G7 — Release acceptance fence

- [ ] all release-blocking checklist gates complete;
- [ ] exact PR head recorded;
- [ ] exact merge SHA recorded if merged;
- [ ] exact-head validation green;
- [ ] migration replay green;
- [ ] functional smoke green;
- [ ] material review threads resolved/current;
- [ ] production Supabase function identities/readback match approved source where relevant;
- [ ] production database/schema/data boundary checked non-destructively;
- [ ] premium card renderer acceptance complete;
- [ ] original prototype interaction gate complete;
- [ ] full battle choreography complete;
- [ ] real two-user end-to-end complete;
- [ ] private/public information boundary proven;
- [ ] no known G0R release blocker open;
- [ ] checklist + ledger + release-control synchronized to exact promoted source.

---

# S. Definition of LIVE

LIVE requires all of the following:

- [ ] real authenticated player can open Stream Bandit;
- [ ] choose/play a legal deck;
- [ ] play another authenticated player;
- [ ] complete a normal match;
- [ ] use the one-screen card-table/direct-card interface;
- [ ] no backend/debug terminology required to understand ordinary play;
- [ ] correct authoritative result;
- [ ] no private-information leakage;
- [ ] no known release-blocking runtime defect;
- [ ] promoted source/deployment recorded in release control.

`PR merged` alone is not LIVE.  
`Edge Functions deployed` alone is not LIVE.  
`CI green` alone is not LIVE.

---

# T. Current checkpoint — V2.3.2 Control Gate 0

**Decision:** PROMOTE documentation/control branch work only; HOLD merge/main/runtime/live.  
**Control PR:** #564  
**Branch:** `docs/tcg-v2-3-post-test-consistency`  
**Starting reviewed head for this control slice:** `b11330a802d4b8574eb5847b54c249b5ed43adfe`  
**Five-file recovery authority head:** `bd86254e66594d95e573d7a9203fbee058a4559b`  
**Latest ledger evidence checkpoint before this final checklist commit:** `b4e256715658e037dacd36064fb76aa7d2d1bf47`  
**Five-file diff from start:** 5 commits ahead / 0 behind; exactly 5 new control files; no runtime file changed.  
**Workflow runs on `bd86254...`:** none found.  
**Combined statuses on `bd86254...`:** none found.  
**Workflow runs on ledger head `b4e2567...`:** none found.  
**Combined statuses on ledger head `b4e2567...`:** none found.  
**Latest visible Codex review summary:** reviewed older commit `0596901`, not the V2.3.2 control head.  
**Exact controller inspection:** `tcg-v2-card-action-controller-v1.json` still points to visual `v1.1`; CTRL-006 therefore remains HOLD.  
**Runtime/live changes in this slice:** none.

### Files added in this recovery control slice

- `tcg-master-plan-progress-v2.3.2.md`
- `tcg-master-plan-checklist-v2.3.2.md`
- `tcg-master-plan-ledger-v2.3.2.md`
- `tcg-release-control-v2.1.json`
- `tcg-card-visual-printing-v1.2.json`

### Control Gate 0 status

- [x] canonical V2.3.2 recovery/prototype master plan created;
- [x] dedicated V2.3.2 execution checklist created;
- [x] V2.3.2 append-only ledger created and updated with this message's evidence;
- [x] machine release/index authority created;
- [x] card visual authority corrected to HP top-left + no invented Cost;
- [ ] controller visual authority pointer realigned to v1.2 — **next exact control task**;
- [x] exact five-file recovery diff reviewed;
- [x] workflow/status evidence refreshed — none found, therefore merge remains HOLD;
- [ ] current-head review evidence obtained after the V2.3.2 control changes;
- [ ] final Control Gate 0 accepted head recorded after CTRL-006 and current review evidence.

### Next exact operation

**CTRL-006:** safely realign `tcg-v2-card-action-controller-v1.json` from `tcg-card-visual-printing-v1.1.json` to `tcg-card-visual-printing-v1.2.json`, preserving every unrelated byte/field, then re-run exact diff/review/status checks and update this checklist before the next work-result message.
