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
| AUTH-06 | Existing TCG Edge Functions are reused/adapted rather than replaced by a parallel game backend | LOCKED ✅ |

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

## V2-ATTACK-00A — Authoritative rejection-envelope visibility repair

| ID | Requirement | State | Evidence / acceptance |
|---|---|---|---|
| ATK00A-01 | Prove authoritative logical rejection can be nested under HTTP-200 Edge envelope | COMPLETE ✅ | `tcg_server_commit_state` + current match-action envelope |
| ATK00A-02 | V2 client treats nested `result.ok === false` as rejection | COMPLETE ✅ | PR #570 controller change |
| ATK00A-03 | Rejected action visibly shows server reason and re-syncs authoritative state | COMPLETE ✅ | focused regression + controller flow |
| ATK00A-04 | No Attack rules moved into browser | COMPLETE ✅ | 2-file bounded diff |
| ATK00A-05 | Exact-head Validation | PASS ✅ | Validation #614 / run `35243998846` SUCCESS |
| ATK00A-06 | Review findings clear | PASS ✅ | 0 review threads |
| ATK00A-07 | Source merge | COMPLETE ✅ | PR #570 → main `d331e93f75e8c5ce6345ac030651f44c37f78866` |
| ATK00A-08 | Supabase/live deployment | NOT APPLICABLE / UNCHANGED | browser source + test only |

**Classification:** this removes one proven silent-failure path; V2-ATTACK-01 remains pending.

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

## V2-SHELL-01 — Route-separated release game shell — REQUIRED / PENDING 🎮

| ID | Requirement | State |
|---|---|---|
| SHELL-01 | Signed-out Landing/Account screen clearly exposes Sign In + Create Account | PENDING 🔒 |
| SHELL-02 | Signed-in Game Home/Main Menu is a separate screen | PENDING 🔒 |
| SHELL-03 | Play/Mode Select is separate from the active match | PENDING 🔒 |
| SHELL-04 | Ranked is a dedicated screen/flow | PENDING 🔒 |
| SHELL-05 | Matchmaking is a dedicated searching screen | PENDING 🔒 |
| SHELL-06 | Opponent Found/Paired/Loading is a dedicated transition state/screen | PENDING 🔒 |
| SHELL-07 | Active match opens a **board-only** route without global site/menu/dashboard/debug shell | PENDING 🔒 |
| SHELL-08 | Board-only route retains match-safe HUD/settings only (turn/phase/audio/accessibility/concede where appropriate) | PENDING 🔒 |
| SHELL-09 | Match Result is separate and routes cleanly back to Ranked/Play/Home | PENDING 🔒 |
| SHELL-10 | Collection, Deck Builder, Packs, Learn/Card Viewer, Progress/Season/Profile/Settings remain outside active match | PENDING 🔒 |
| SHELL-11 | Auth/session continuity survives navigation and direct match refresh safely | PENDING 🔒 |
| SHELL-12 | Desktop + mobile/touch navigation supported | PENDING 🔒 |
| SHELL-13 | Original prototype card-table interaction is preserved **inside the match** | LOCKED ✅ |
| SHELL-14 | Prototype all-in-one product shell is **not** release authority | LOCKED ✅ |
| SHELL-15 | Page separation creates no duplicate rules engine or backend owner | LOCKED ✅ |

## V2-MM-01 — Ranked automatic matchmaking — REQUIRED / PENDING 🎯

Canonical player journey: **Ranked → Play → Matchmaking → Opponent Found/Paired → Board**.

| ID | Requirement | State |
|---|---|---|
| MM-01 | Ranked Play enters existing automatic matchmaking API | PENDING 🔒 |
| MM-02 | Selected deck is validated by server matchmaking boundary | PENDING 🔒 |
| MM-03 | Searching state is clear and cancellable before pairing | PENDING 🔒 |
| MM-04 | Two signed-in users are paired automatically without exchanging codes | PENDING 🔒 |
| MM-05 | Both users resolve to the same authoritative match with opposite seats | PENDING 🔒 |
| MM-06 | Opponent-found/paired transition shown before board | PENDING 🔒 |
| MM-07 | Paired transition opens board-only match route with authoritative `match_id` | PENDING 🔒 |
| MM-08 | Refresh/rejoin does not create duplicate match or lose existing paired match | PENDING 🔒 |
| MM-09 | Cancel/leave/timeout follows server state safely | PENDING 🔒 |
| MM-10 | Hidden opponent deck/private data remains protected | PENDING 🔒 |
| MM-11 | Ranked never displays, copies, asks for or requires join/pair codes | LOCKED ✅ |
| MM-12 | Internal `join_code` may remain only as opaque compatibility data | LOCKED ✅ |
| MM-13 | Existing private/join-code flow preserved for future Friends/Private mode | LOCKED ✅ |
| MM-14 | Existing `tcg-private-alpha-api` matchmaking actions/RPCs reused; no parallel matchmaking service | LOCKED ✅ |

## V2-AUDIO-01 — Background music + SFX — REQUIRED / PENDING 🔊

| ID | Requirement | State |
|---|---|---|
| AUD-01 | Game/menu and battle background music exists where appropriate in release client | PENDING |
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
- accepted implementation main `d331e93f75e8c5ce6345ac030651f44c37f78866`
- V2 card-control source PR #569 reviewed head `ba1f5ef61439d24a4e91ae96272a5d046ae9d80c`
- PR #569 Validation #608 / `35241870575` — SUCCESS
- Attack rejection-envelope PR #570 reviewed head `f013637d5d6684117441deeb8a2057fab95f7454`
- PR #570 Validation #614 / `35243998846` — SUCCESS
- historical accepted G0R repairs: 4/11
- G0R-10: queued
- Supabase/live/production: HOLD
- Code Labs Writer / CG Repair Lab / Code God: not invoked

## Inherited critical rules still locked

Original prototype **battle interaction** = in-match UX truth; release product = route-separated game screens; 40-owner baseline; cards initiate actions while canonical engines own rules; existing TCG Edge Functions reused/adapted; no owner #41 for one card/label/UI/audio; every true Deck Search ends in authoritative shuffle with **Then shuffle your deck.**; G0R-10 remains explicitly queued and may not be forgotten.

## Superseding exact next operation

1. Freeze current source main `d331e93f75e8c5ce6345ac030651f44c37f78866` and inventory existing auth/menu/TCG/matchmaking/battle routes/components before creating anything new.
2. Reuse working auth/session/product components; implement V2-SHELL-01 as a bounded route-separated release shell.
3. Implement V2-MM-01 using existing `tcg-private-alpha-api` automatic matchmaking actions/RPCs; Ranked has no player-facing codes.
4. Enter a board-only active match route carrying authoritative `match_id` and authenticated context.
5. Use that real two-user journey to prove V2-ATTACK-01, including synchronized visible result and turn progression.
6. If Attack fails, prove the first exact seam before coding and repair only that authoritative owner/integration boundary.
7. After Attack acceptance, continue card-control slices: active Ability → Creature placement → Evolution → Essence → Relic → Realm → Ally/Device Tactic.
8. Implement and prove V2-AUDIO-01 before public/live promotion.
9. Keep G0R-10 queued and close it before live/public promotion using `play_tactic`.
10. Keep Supabase/live deployment separate until the complete two-user release journey passes.
