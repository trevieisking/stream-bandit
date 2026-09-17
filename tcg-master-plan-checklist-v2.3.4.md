# Stream Bandit TCG — Master Plan Execution Checklist V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`  
**Inherits:** every requirement and state from `tcg-master-plan-checklist-v2.3.3.md` unless superseded below.

## Continuity rule — MANDATORY

Every material implementation result must leave the exact repository, PR/branch, head, files, tests/reviews, live impact, decision and next operation recorded here/ledger before delivery. Resume from GitHub after timeout/new chat.

## Current G0R state

| ID | State | Exact checkpoint |
|---|---|---|
| G0R-11 validation workflow coverage | COMPLETE ✅ | PR #565; Validation #571 SUCCESS; merged `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00` |
| G0R-07 matchmaking room lifetime | COMPLETE IN SOURCE ✅ | PR #566; #574 + #799 + #825 SUCCESS; merged `fce98178f2234386da7be3aef02a8496fa24195a`; live HOLD |
| G0R-08 setup-legal deck validation | COMPLETE IN SOURCE ✅ | PR #567 head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`; #586 + #800 + #826 SUCCESS; merged `042559e252cfa49ad425d9f57fa01a678b2a3fe9`; live HOLD |
| G0R-09 private-room Ready concurrency | COMPLETE IN SOURCE ✅ | PR #568 head `cc46b1fda04361105bc390c9efeddc8c475c6571`; #597 + #801 + #827 SUCCESS; zero review threads; merged `2bc55ecd6d626a465cd483ee2e889ceb6177c280`; live HOLD |
| G0R-10 Tactic subtype boundary | PROVEN / QUEUED 🟡 | Ally/Device one-shot; Relic/Realm dedicated; no runtime patch yet |

**Accepted G0R source repairs: 4 / 11 ✅**

## V2 authority rule — LOCKED

| ID | Requirement | State |
|---|---|---|
| AUTH-01 | Cards are the primary player controls | LOCKED ✅ |
| AUTH-02 | Each card action resolves through its appropriate canonical engine/owner | LOCKED ✅ |
| AUTH-03 | Card/browser never becomes legality, damage, payment, RNG, timing or state-transition authority | LOCKED ✅ |
| AUTH-04 | No duplicate browser rules engine | LOCKED ✅ |
| AUTH-05 | No new owner #41 for UI, audio, one card or one label | LOCKED ✅ |

## V2-UI-01 — Card-face Attack intent/control foundation

| ID | Requirement | State | Evidence / acceptance |
|---|---|---|---|
| UI01-01 | Active Vanguard card is primary Attack control | COMPLETE ✅ | PR #569 source |
| UI01-02 | Attack slots originate from structured card data | COMPLETE ✅ | V2 controller + focused contract |
| UI01-03 | Client submits generic `attack` + `attack_slot` only | COMPLETE ✅ | no card-name Attack dispatcher added |
| UI01-04 | `match_id` + fresh nonce + expected revision fence retained | COMPLETE ✅ | controller contract |
| UI01-05 | Server remains rules authority | COMPLETE ✅ | no browser legality/payment/damage engine |
| UI01-06 | Rejection refreshes authoritative state and retains visible reason | COMPLETE ✅ | V2 controller source |
| UI01-07 | Exact-head validation | PASS ✅ | Validation #608 / run `35241870575` |
| UI01-08 | Source merge | COMPLETE ✅ | PR #569 → main `e59ee73443ed085b04175a2339b2eac3f8f8d818` |
| UI01-09 | Real two-user Attack gameplay proven | **NOT PART OF THIS CHECKPOINT** | moved to V2-ATTACK-01 |

**Classification:** V2-UI-01 proves card→Attack intent/control wiring. It does **not** prove Attack gameplay complete.

## V2-ATTACK-01 — Real playable Attack engine path — REQUIRED / PENDING 🔒

Historical evidence includes a user-observed failed playable test in which Attack did not execute. Current source also contains isolated real-dispatch Attack tests that can commit damage and advance the turn. Therefore the correct state is **full path unproven**, not “all Attack code broken” and not “Attack complete.”

| ID | Required proof | State |
|---|---|---|
| ATK01-01 | Real V2 two-user match reaches legal Attack state | PENDING 🔒 |
| ATK01-02 | Active Creature card exposes correct structured Attack | PENDING 🔒 |
| ATK01-03 | Card action reaches canonical Attack route once | PENDING 🔒 |
| ATK01-04 | Engine validates turn + Attack cost + target legality | PENDING 🔒 |
| ATK01-05 | Expected authoritative damage/effect commits exactly once | PENDING 🔒 |
| ATK01-06 | Shield/Condition/listener/choice chain remains canonical | PENDING 🔒 |
| ATK01-07 | Defeat → Reward/promotion → Aftermath order correct when applicable | PENDING 🔒 |
| ATK01-08 | Successful Attack advances/hands off turn correctly | PENDING 🔒 |
| ATK01-09 | Both players receive/render the same committed board result | PENDING 🔒 |
| ATK01-10 | Illegal Attack rejects with visible reason and zero mutation | PENDING 🔒 |
| ATK01-11 | Exact failing seam identified before any runtime correction | PENDING 🔒 |
| ATK01-12 | Any correction stays in canonical owner/integration boundary, never browser workaround | PENDING 🔒 |
| ATK01-13 | Focused deterministic regression coverage after any correction | PENDING 🔒 |
| ATK01-14 | Exact-head Validation/review clean | PENDING 🔒 |

**Attack gameplay status: HOLD / NOT COMPLETE.**

## V2-AUDIO-01 — Background music + SFX — REQUIRED / PENDING 🔊

| ID | Requirement | State |
|---|---|---|
| AUD-01 | Battle background music exists in release client | PENDING |
| AUD-02 | Gameplay/UI SFX cover material visible actions/outcomes | PENDING |
| AUD-03 | Attack declaration/impact + damage have SFX | PENDING |
| AUD-04 | Ability/Evolution/Essence/Tactic/Relic/Realm/Reward/turn/end-state cues supported | PENDING |
| AUD-05 | Mute/unmute available | PENDING |
| AUD-06 | Music volume control | PENDING |
| AUD-07 | SFX volume control | PENDING |
| AUD-08 | Browser autoplay policy respected; audio starts only after permitted user gesture | PENDING |
| AUD-09 | Audio cannot alter rules, RNG, timers, state or outcome | LOCKED ✅ |
| AUD-10 | Audio cues are driven from authoritative/presentation events, not treated as rules authority | LOCKED ✅ |
| AUD-11 | Audio assets original/licensed/rights-cleared | PENDING |
| AUD-12 | Gameplay remains understandable when muted; no sound-only mandatory information | PENDING |
| AUD-13 | No owner #41 created solely for audio presentation | LOCKED ✅ |
| AUD-14 | Audio acceptance complete before public/live promotion | REQUIRED 🔒 |

## G0R-09 checklist — ACCEPTED SOURCE REPAIR

| ID | Requirement | State | Evidence / acceptance |
|---|---|---|---|
| G0R09-01 | Simultaneous Ready defect proven | COMPLETE ✅ | original Ready function had no serialization around per-member write + aggregate count |
| G0R09-02 | Client dependency proven | COMPLETE ✅ | private-alpha initializes only when Ready RPC returns `r?.all_ready` |
| G0R09-03 | Serialize write + aggregate per room | COMPLETE ✅ | room-scoped `pg_advisory_xact_lock` before mutation/count |
| G0R09-04 | Lock is room-scoped, not global | COMPLETE ✅ | key derives from room id + `:ready` |
| G0R09-05 | Membership/deck validation fences preserved | COMPLETE ✅ | exact patch + focused test |
| G0R09-06 | Exact all-ready rule preserved | COMPLETE ✅ | `v_count=2 and v_ready_count=2` |
| G0R09-07 | Additive migration / no row rewrite | COMPLETE ✅ | `20260917144500_tcg_private_room_ready_concurrency.sql` |
| G0R09-08 | Focused contract test | PASS ✅ | Validation #597 / run `35235272269` |
| G0R09-09 | TCG Validation exact-head | PASS ✅ | #597 / `35235272269` SUCCESS |
| G0R09-10 | Migration Replay exact-head | PASS ✅ | #801 / `35235272316` SUCCESS |
| G0R09-11 | Functional Smoke exact-head | PASS ✅ | #827 / `35235272663` SUCCESS |
| G0R09-12 | Review findings clear | PASS ✅ | review threads 0 at final pre-merge refresh |
| G0R09-13 | Exact diff limited to two intended files | PASS ✅ | migration + focused test only; 2 files / +105 / -0 |
| G0R09-14 | Merge to main | COMPLETE ✅ | PR #568 merged from expected head to `2bc55ecd6d626a465cd483ee2e889ceb6177c280` |
| G0R09-15 | Supabase/live deployment | HOLD 🔒 | separate deployment decision; none performed |

## Exact current identifiers

- repository `trevieisking/stream-bandit`
- accepted implementation main `e59ee73443ed085b04175a2339b2eac3f8f8d818`
- V2 card-control source PR #569 reviewed head `ba1f5ef61439d24a4e91ae96272a5d046ae9d80c`
- PR #569 Validation #608 / `35241870575` — SUCCESS
- historical accepted G0R repairs: 4/11
- G0R-10: queued
- Supabase/live/production: HOLD
- Code Labs Writer / CG Repair Lab / Code God: not invoked

## Inherited critical rules still locked

Original prototype = UX truth; 40-owner baseline; cards initiate actions while canonical engines own rules; no owner #41 for one card/label/UI/audio; every true Deck Search ends in authoritative shuffle with **Then shuffle your deck.**; G0R-10 remains explicitly queued and may not be forgotten.

## Exact next operation

1. Freeze current source main `e59ee73443ed085b04175a2339b2eac3f8f8d818` as the Attack-E2E investigation baseline.
2. Prove V2-ATTACK-01 with the simplest legal structured Attack through the real card-control → server-owner → committed-state → visible-board path.
3. If it fails, identify the exact first failing seam before coding and repair only that canonical owner/integration boundary.
4. Require damage/effect + Aftermath/turn progression + synchronized board proof before marking Attack complete.
5. After Attack acceptance, continue card-control slices: active Ability → Creature placement → Evolution → Essence → Relic → Realm → Ally/Device Tactic.
6. Implement and prove V2-AUDIO-01 before public/live promotion.
7. Keep G0R-10 queued and close it before live/public promotion using `play_tactic`.
8. Keep Supabase/live deployment separate until the complete two-user V2 fence passes.
