# Stream Bandit TCG — Master Plan Execution Checklist V2.3.5

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.5.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.5.md`  
**Release index:** `tcg-release-control-v2.4.json`  
**Inherits:** every requirement and state from `tcg-master-plan-checklist-v2.3.4.md` unless explicitly superseded below.

## Continuity rule — MANDATORY

Every material implementation result is incomplete until this checklist and the ledger record the exact repository, PR/branch, reviewed head SHA, merge SHA if applicable, changed files, validation/review evidence, live impact, promotion decision and exact next operation. Resume from GitHub after timeout/new chat.

A source change without checklist synchronization is not an accepted master-plan checkpoint. A merge does not imply live/production acceptance.

## Current accepted implementation baseline

- repository: `trevieisking/stream-bandit`
- current accepted source `main`: `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`
- current control PR: #564, branch `docs/tcg-v2-3-post-test-consistency`
- existing TCG Edge Functions remain authoritative/reused: `tcg-private-alpha-api`, `tcg-match-actions`, `tcg-tactic-actions`
- Supabase/live/production: HOLD 🔒
- Code Labs Protected Writer / CG Repair Lab / Code God / Repo Desk: not invoked

## V2 authority rules — LOCKED

| ID | Requirement | State |
|---|---|---|
| AUTH-01 | Cards are the primary player controls during battle | LOCKED ✅ |
| AUTH-02 | Canonical engines/owners remain gameplay authority | LOCKED ✅ |
| AUTH-03 | Browser never owns legality, damage, payment, RNG, timing or state transitions | LOCKED ✅ |
| AUTH-04 | No duplicate browser rules engine | LOCKED ✅ |
| AUTH-05 | No new owner #41 for UI/audio/one card/one label | LOCKED ✅ |
| AUTH-06 | Existing TCG Edge Functions are reused/adapted, not replaced by a parallel backend | LOCKED ✅ |
| AUTH-07 | Original prototype is in-match interaction truth, not release-shell architecture | LOCKED ✅ |
| AUTH-08 | Release product uses separate game screens/routes | LOCKED ✅ |

## V2-SHELL-01A — Board-only active match route — ACCEPTED ✅

| ID | Requirement | State | Exact evidence |
|---|---|---|---|
| SHELL01A-01 | Active V2 match removes ordinary Stream Bandit header/footer site shell | COMPLETE ✅ | PR #571 `tcg-battle-v2.html` |
| SHELL01A-02 | Shared non-visual config bridge retained | COMPLETE ✅ | `stream-bandit-shell-v6-24.js` still loaded |
| SHELL01A-03 | Existing shared Auth Gate explicitly loaded by match page | COMPLETE ✅ | `stream-bandit-auth-gate-v7-13-001.js` |
| SHELL01A-04 | Existing V2 battle controller unchanged | COMPLETE ✅ | exact diff contains no controller file |
| SHELL01A-05 | Match page contains no matchmaking/menu/private-room controls | PASS ✅ | focused board-only regression |
| SHELL01A-06 | Board route still binds to authoritative `match_id` | PASS ✅ | focused board-only regression + existing controller |
| SHELL01A-07 | No Edge Function / SQL / Supabase / card-rule change | PASS ✅ | exact changed-file inventory |
| SHELL01A-08 | Stale card-control page-marker test corrected without relaxing gameplay assertions | COMPLETE ✅ | +1/-1 in existing Attack/card-control test |
| SHELL01A-09 | Exact-head TCG validation | PASS ✅ | Validation #619, run `35247988250`, head `b7f870bf9cb0a1679f71c762a05e67901b3df0c0` |
| SHELL01A-10 | Review threads clear | PASS ✅ | 0 threads at exact head |
| SHELL01A-11 | Review submissions/comments inventory | PASS / NONE FOUND ✅ | 0 reviews; 0 PR comments |
| SHELL01A-12 | Legacy combined commit statuses | NONE FOUND | not treated as an additional PASS |
| SHELL01A-13 | Exact diff bounded | PASS ✅ | 3 files / +42 / -8 / 3 commits |
| SHELL01A-14 | Source merge | COMPLETE ✅ | PR #571 merged to `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f` |
| SHELL01A-15 | Supabase/live deployment | UNCHANGED / HOLD 🔒 | no deployment performed |

### Exact #571 files

- `tcg-battle-v2.html` — +6 / -7
- `tcg/tests/card-pass-2-v2-battle-card-control-attack.test.mjs` — +1 / -1
- `tcg/tests/card-pass-2-v2-board-only-match-shell.test.mjs` — +35 / -0

## V2-SHELL-01 — Route-separated release game shell

| ID | Requirement | State |
|---|---|---|
| SHELL-01 | Signed-out Landing/Account clearly exposes Sign In + Create Account | PENDING 🔒 |
| SHELL-02 | Signed-in Game Home/Main Menu is a separate screen | PENDING 🔒 |
| SHELL-03 | Play/Mode Select is separate from the active match | PENDING 🔒 |
| SHELL-04 | Ranked is a dedicated screen/flow | PENDING 🔒 |
| SHELL-05 | Matchmaking is a dedicated searching screen | PENDING 🔒 |
| SHELL-06 | Opponent Found/Paired/Loading is a dedicated transition screen | PENDING 🔒 |
| SHELL-07 | Active match is board-only without global site/menu/dashboard/debug shell | **COMPLETE IN SOURCE ✅** |
| SHELL-08 | Match retains only match-safe HUD/settings (turn/phase/audio/accessibility/concede where appropriate) | PARTIAL 🟡 — turn/phase/revision HUD exists; remaining release-safe controls still pending |
| SHELL-09 | Match Result is separate and routes back to Ranked/Play/Home | PENDING 🔒 |
| SHELL-10 | Collection/Deck/Packs/Learn/Progress/Profile/Settings remain outside active match | LOCKED / IMPLEMENTATION PENDING 🟡 |
| SHELL-11 | Auth/session continuity survives navigation and direct match refresh safely | PARTIAL 🟡 — explicit Auth Gate dependency now present; full route journey unproven |
| SHELL-12 | Desktop + mobile/touch navigation supported | PENDING 🔒 |
| SHELL-13 | Original prototype card-table interaction preserved inside match | LOCKED ✅ |
| SHELL-14 | Prototype all-in-one product shell is not release authority | LOCKED ✅ |
| SHELL-15 | Page separation creates no duplicate rules engine/backend owner | LOCKED ✅ |

## V2-SHELL-01B — Release navigation foundation — NEXT 🔧

| ID | Requirement | State |
|---|---|---|
| SHELL01B-01 | Freeze current main before inventory | COMPLETE ✅ — `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f` |
| SHELL01B-02 | Inventory existing account-creation capability before adding signup | PENDING 🔎 |
| SHELL01B-03 | Inventory reusable auth/session/config components | PARTIAL ✅ — shared Auth Gate/config proven reusable; signup gap remains |
| SHELL01B-04 | Inventory current TCG/menu route assets | PENDING 🔎 |
| SHELL01B-05 | Define minimum separate route file set | PENDING 🔎 |
| SHELL01B-06 | Landing/Account implementation | PENDING 🔒 |
| SHELL01B-07 | Game Home implementation | PENDING 🔒 |
| SHELL01B-08 | Play/Ranked implementation | PENDING 🔒 |
| SHELL01B-09 | Matchmaking implementation | PENDING 🔒 |
| SHELL01B-10 | Paired/Opponent Found implementation | PENDING 🔒 |
| SHELL01B-11 | Result implementation | PENDING 🔒 |
| SHELL01B-12 | Navigation contract tests | PENDING 🔒 |
| SHELL01B-13 | Exact-head validation/review clean | PENDING 🔒 |
| SHELL01B-14 | Source merge decision | HOLD 🔒 |

## V2-MM-01 — Ranked automatic matchmaking

Canonical journey: **Ranked → Play → Matchmaking → Opponent Found/Paired → Board**.

| ID | Requirement | State |
|---|---|---|
| MM-01 | Ranked Play enters existing automatic matchmaking API | PENDING 🔒 |
| MM-02 | Server validates selected deck | PENDING 🔒 |
| MM-03 | Searching state is clear and cancellable before pairing where server state permits | PENDING 🔒 |
| MM-04 | Two signed-in users pair automatically without exchanging codes | PENDING 🔒 |
| MM-05 | Both users resolve the same authoritative match with opposite seats | PENDING 🔒 |
| MM-06 | Opponent-found transition shown before board | PENDING 🔒 |
| MM-07 | Paired transition opens board-only route with authoritative `match_id` | PENDING 🔒 |
| MM-08 | Refresh/rejoin does not create duplicate match or lose paired match | PENDING 🔒 |
| MM-09 | Cancel/leave/timeout follows authoritative server state | PENDING 🔒 |
| MM-10 | Hidden opponent/private data remains protected | PENDING 🔒 |
| MM-11 | Ranked never displays/copies/asks for join or pairing codes | LOCKED ✅ |
| MM-12 | Existing `join_code` may remain opaque compatibility data only | LOCKED ✅ |
| MM-13 | Direct-code rooms remain isolated for future Friends/Private mode | LOCKED ✅ |
| MM-14 | Existing `tcg-private-alpha-api` matchmaking/RPCs reused; no parallel service | LOCKED ✅ |

## V2-ATTACK-01 — Real playable Attack path

| ID | Required proof | State |
|---|---|---|
| ATK01-01 | Real two-user match reaches legal Attack state | PENDING 🔒 |
| ATK01-02 | Active Vanguard exposes correct structured Attack | PENDING 🔒 |
| ATK01-03 | Card action reaches canonical Attack route exactly once | PENDING 🔒 |
| ATK01-04 | Turn/Attack cost/target legality validated server-side | PENDING 🔒 |
| ATK01-05 | Authoritative damage/effect commits exactly once | PENDING 🔒 |
| ATK01-06 | Shield/Condition/listener/choice chain canonical | PENDING 🔒 |
| ATK01-07 | Defeat → Reward/promotion → Aftermath correct when applicable | PENDING 🔒 |
| ATK01-08 | Successful Attack automatically hands off turn | PENDING 🔒 |
| ATK01-09 | Both clients render same committed result | PENDING 🔒 |
| ATK01-10 | Illegal Attack visibly rejects with zero mutation | PENDING 🔒 |
| ATK01-11 | First failing seam identified before correction | PENDING 🔒 |
| ATK01-12 | Any correction stays in canonical owner/integration boundary | PENDING 🔒 |
| ATK01-13 | Focused deterministic regression after correction | PENDING 🔒 |
| ATK01-14 | Exact-head validation/review clean | PENDING 🔒 |

**Dependency:** V2-SHELL-01B + V2-MM-01 must provide the real two-user journey before this can be accepted.

## V2-AUDIO-01 — Background music + SFX

| ID | Requirement | State |
|---|---|---|
| AUD-01 | Menu/game background music where appropriate | PENDING 🔒 |
| AUD-02 | Gameplay/UI SFX for material visible actions/outcomes | PENDING 🔒 |
| AUD-03 | Attack declaration/impact + damage SFX | PENDING 🔒 |
| AUD-04 | Ability/Evolution/Essence/Tactic/Relic/Realm/Reward/turn/end cues | PENDING 🔒 |
| AUD-05 | Mute/unmute | PENDING 🔒 |
| AUD-06 | Music volume | PENDING 🔒 |
| AUD-07 | SFX volume | PENDING 🔒 |
| AUD-08 | Browser autoplay policy respected | PENDING 🔒 |
| AUD-09 | Audio cannot affect rules/RNG/timing/state/outcome | LOCKED ✅ |
| AUD-10 | Audio driven from presentation/authoritative events | LOCKED ✅ |
| AUD-11 | Assets original/licensed/rights-cleared | PENDING 🔒 |
| AUD-12 | No sound-only mandatory information | PENDING 🔒 |
| AUD-13 | No owner #41 solely for audio | LOCKED ✅ |
| AUD-14 | Audio acceptance required before public/live | REQUIRED 🔒 |

## G0R continuity

V2.3.4 G0R states remain inherited without change. G0R-10 remains explicitly queued and must not be lost while release-shell work proceeds.

## Exact promotion state

| Scope | Decision |
|---|---|
| PR #571 board-only source merge | PROMOTED ✅ |
| V2-SHELL-01A source acceptance | COMPLETE ✅ |
| V2-SHELL-01B source work | PROMOTE bounded branch work only 🔧 |
| V2-MM-01 source work | PROMOTE only when exact client seam is proven 🔧 |
| Edge Function mutation | HOLD unless inventory proves a required contract change 🔒 |
| Supabase schema/data/deployment | HOLD 🔒 |
| public/live/production | HOLD 🔒 |
| V2-ATTACK-01 completion claim | HOLD 🔒 |

## Superseding exact next operation

1. Freeze `main` at `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`.
2. Inventory existing signup/account-creation capability; do not duplicate auth.
3. Inventory current TCG/menu/navigation assets and the exact `tcg-private-alpha-api` matchmaking browser contract.
4. Define minimum routes: Landing/Account → Game Home → Play/Ranked → Matchmaking → Paired → existing board-only Match → Result.
5. Implement the first bounded release-navigation slice on a non-main branch.
6. Add focused route/auth/matchmaking contract tests without moving gameplay authority to the browser.
7. Refresh exact-head CI, changed files, reviews/comments/statuses.
8. Synchronize plan/checklist/ledger before reporting acceptance.
9. Merge only on a fresh PROMOTE decision.
10. Keep Supabase/live/production HOLD until separately proven.
