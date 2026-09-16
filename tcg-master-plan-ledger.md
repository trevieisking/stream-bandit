# Stream Bandit TCG — Master Plan Owner / Repair Ledger

**Plan authority:** `tcg-master-plan-progress.md`  
**Ledger revision:** 2 — 2026-09-16  
**Baseline owner count:** 40 families  
**Release lane:** PR #549

## Ledger rules

- This ledger records execution; it does not create a second master plan.
- One mechanic/state transition has one rightful owner.
- Submodules inside an owner family are not extra owners.
- `✅` = Release 1 owner/path accepted by current source/tests or production DB evidence.
- `🔎` = owner exists, but Release 1 closeout/source-contract proof remains.
- `⏭` = intentionally post-release and must not block Release 1.
- A `✅` row is reopened only under the master-plan reopen rules.
- Every repair must append an evidence entry under **Repair / promotion log**.

## 40 owner families — Release 1 reconciliation

| # | Owner / engine family | Canonical current home | Release 1 status | Precise remaining rule / fix process |
|---|---|---|---|---|
| 1 | Card Series / Content Registry | `tcg-element-packages-v0.2.json`, Set One builders/registry migrations | ✅ | Release authority is 8 elements / 193 identities / 8 starters. Generic future set onboarding may evolve after release; do not add Fairy/Underworld to Release 1. |
| 2 | Match Runtime Registry / Snapshot | `_shared/tcg-runtime-registry-v0-2.ts` + snapshot/runtime-marker migrations | ✅ | Preserve fail-closed registry metadata and sidecar guards. New marked matches must bind to the accepted v0.2 snapshot. |
| 3 | Card Printing / Art Metadata | `20260904110527_tcg_card_printings_and_art_bucket.sql` | ✅ | No Release 1 defect currently proven. |
| 4 | Collection Inventory | `tcg_collections` persistence | ✅ | Current starter/reward paths may orchestrate inventory. Before future Packs/Trade/Shop, centralize any new inventory mutation here rather than adding new direct writers. |
| 5 | Starter Grant / Provisioning | `tcg_server_grant_starter` | ✅ | Starter grant remains orchestration over collection/deck/profile state. 8 starters only for Release 1. |
| 6 | Deck Builder / Deck Legality | `tcg_server_validate_deck`, `tcg_decks`, `tcg_deck_cards` | ✅ | Current copy-rule alignment is production DB authority. Any new deck rule must change this owner and its tests, not callers. |
| 7 | Lobby / Private Room | `tcg_rooms`, `tcg_room_members`, room RPCs | ✅ | Keep room lifecycle separate from battle mechanics. |
| 8 | Matchmaking | `tcg_server_matchmake` | ✅ | Matchmaking orchestrates deck validation/room/preparation; it does not own those component rules. |
| 9 | Match Preparation / Initial State | prepare/install RPCs + v0.2 bridges | ✅ | Must continue to fail closed on invalid registry/snapshot metadata. |
| 10 | Match Command Commit / Persistence / Views | `tcg_server_commit_state` + match state/view tables | ✅ | Preserve nonce/revision idempotency and exactly-once terminal reward handoff. |
| 11 | Turn / Phase / Resolution Engine | `_shared/tcg-match-flow-engine-v0-2.ts`, `flow-turn`, `flow-resolution` | ✅ | Controllers request transitions; do not reintroduce competing direct phase/active-seat ownership. |
| 12 | RNG Engine | `_shared/tcg-match-randomization-engine-v0-2.ts` | ✅ | RNG chooses randomness only; downstream owners apply movement/result. |
| 13 | Creature / Evolution Engine | `_shared/tcg-match-creature-engine-v0-2.ts` | ✅ | Placement/evolution/defeat-related creature mutation stays here; callers sequence only. |
| 14 | Attack Engine | `_shared/tcg-match-attack-*` family | 🔎 | Current dispatcher still contains legacy printed-attack/card-ID fallback code. Release criterion is not “delete every legacy line”; prove marked v0.2 launch matches resolve structured attack metadata and cannot select legacy fallback for the 193-card roster. Reconcile capability manifest and add/retain source-contract guard. |
| 15 | Active Ability Engine | `_shared/tcg-match-active-ability-*` family + unified live route | ✅ | Unified dispatcher accepted at prior exact head. New Ability forms extend this family; no card-specific dispatcher branches. |
| 16 | Tactic Engine | `tcg-tactic-actions/index.ts` + structured grammar | ✅ | Owner/source accepted. Production source parity is tracked under release-control RC-03, not reopened as an engine rewrite. |
| 17 | Relic Engine | `_shared/tcg-match-relic-engine-v0-2.ts` | ✅ | Relic attach/replace lifecycle remains here. |
| 18 | Realm Engine | `_shared/tcg-match-realm-engine-v0-2.ts`, realm route/replaced-event owners | ✅ | Realm play/replace and replacement event stay in this family. |
| 19 | Condition Engine | `_shared/tcg-match-condition-engine-v0-2.ts` + lifecycle/protection owners | ✅ | New condition semantics extend this owner. |
| 20 | Damage / Shield Engine | `_shared/tcg-match-damage-*` family + protection/packet owners | 🔎 | Dispatcher/core still expose direct damage/shield adapters. Prove marked Release 1 effects route through canonical damage/packet/protection ownership; direct helpers may remain only as adapters/legacy compatibility. Update capability labels from tests. |
| 21 | Heal Engine | `_shared/tcg-match-heal-*` packet/before/listener family | 🔎 | Prove all marked Release 1 healing that must emit/listen to heal packets uses canonical packet/listener flow. Raw heal helper must not bypass required listener semantics on marked launch paths. |
| 22 | Essence Attachment Engine | `_shared/tcg-match-essence-attachment-*` family | ✅ | Physical attachment uses one transaction path; no structured competing mutation. |
| 23 | Essence Movement Engine | `_shared/tcg-match-essence-movement-v0-2.ts` | ✅ | Movement listeners/tactics delegate physical transfer here. |
| 24 | Essence Query / Selection Engine | `_shared/tcg-match-essence-query-v0-2.ts` | ✅ | Query/selection is non-mutating; movement/attachment remains with their owners. |
| 25 | Cost Engine | action/ability/payment cost owners + withdrawal cost owner | ✅ | Cost computes legality/value; it does not consume resources. |
| 26 | Payment Engine | `_shared/tcg-match-payment-*` family | ✅ | Payment consumes resources only after preflight. No caller-owned splice/discard payment path. |
| 27 | Atomic Switch / Battlefield Position Engine | `_shared/tcg-match-switch-context-v0-2.ts` | ✅ | Vanguard/Reserve position mutation and switch context live here. |
| 28 | Generic Event Listener Engine | `_shared/tcg-match-event-listener-*` family | ✅ | Listener engine orchestrates predicates/actions; nested mechanic mutation delegates to mechanic owner. |
| 29 | Movement Listener Engine | `_shared/tcg-match-movement-listener-v0-2.ts` | ✅ | Listener continuation only; physical movement delegates. |
| 30 | Card-Zone / Draw / Shuffle / Discard Engine | `_shared/tcg-match-card-zone-engine-v0-2.ts` | ✅ | Own physical card-instance movement/order. RNG chooses random order; Hidden Information controls views. |
| 31 | Card Search / Filter / Inspection Engine | specialized structured query/inspection owners + Card-Zone for mutation | 🔎 | Audit Release 1 search/inspection call sites. If they are non-mutating specialized queries, keep them in their domain owner. Any physical move after search must use Card-Zone. Create a new generic submodule only if exact duplicate search semantics are proven; do not invent owner #41. |
| 32 | Reward Card Engine (in-match) | reward inspection + Card-Zone take/transfer ownership | ✅ | Reward inspection/choice and physical take remain separated; match-end economy reward is owner #36. |
| 33 | Hidden Information / Private Visibility Engine | `_shared/tcg-match-hidden-information-v0-2.ts` + private views | ✅ | Two-user E2E must verify no opponent hidden data leak. |
| 34 | Defeat / Match-End Engine | `_shared/tcg-match-defeat-*` + terminal Match Flow + commit completion | ✅ | Defeat determines battle lifecycle; SQL commit persists terminal result/reward receipt. No duplicate winner authority. |
| 35 | Economy / Currency Ledger | player profile balances + server reward path | ✅ | For Release 1, match rewards are the only required currency writer. Before Shop/Trade/Pack spending launches, establish their transaction paths through this owner rather than direct balance updates. |
| 36 | Match Rewards / XP / Arcade Progression | `tcg_server_award_match_rewards`, `tcg_match_rewards`, reward config | ✅ | Exactly-once receipt and XP/currency result must be proven in two-user E2E. |
| 37 | Pack / Pack-Opening Engine | future product system | ⏭ | Post-release. Must own pack definition/odds/opening/award transaction and call Collection/Currency owners; no per-pack helpers. |
| 38 | Shop / Purchase Engine | future product system | ⏭ | Post-release. Must spend through Currency owner and award via product/collection owners. |
| 39 | Trading Engine | future product system | ⏭ | Post-release. Must own validation + atomic exchange and use Collection/Currency owners. |
| 40 | Battle Pass Engine | future product system | ⏭ | Post-release. Must own track/progression/reward claim and delegate awards to existing owners. |

## Release-control repair ledger

These rows are the only current cross-owner Release 1 closeout tasks. They prevent old backlog text from becoming new work.

| ID | Defect / gap | Exact fix/process | Acceptance evidence | State |
|---|---|---|---|---|
| RC-01 | Planning authority drift | Keep `tcg-master-plan-progress.md`, this ledger, PR description and element-package authority aligned on 8 / 193 / 8; Fairy/Underworld post-release. Older contradictory comments remain history only. | Exact doc diff + current package manifest | 🔎 current reconciliation |
| RC-02 | Capability inventory is historical/stale relative to later owner work | Reconcile `tcg-runtime-capabilities-v0.2.json` against current source and exact tests. For each partial/missing op/predicate, first prove whether the 193-card launch roster uses it. Implement only launch-used gaps; move unused shapes to post-release debt. | Capability test + TCG Card Pass + owner source-contract tests | ☐ |
| RC-03 | Production Edge source parity incomplete/uncertain | For all 3 TCG functions, pin accepted PR head, collect exact dependency closure, hash/identify files, compare readback, deploy only exact source where different, preserve JWT. Do not hand-copy shared engine graph. | Supabase deployed version/source readback + exact GitHub source identity | ☐ |
| RC-04 | Real two-user production journey not yet proven | Execute the 20-step G5 journey. Every defect must cite one owner row and reproduction. | two users, full match complete, private views correct, exactly-once rewards/XP/currency | ☐ |
| RC-05 | Final release fence not yet assembled at one head | Refresh PR metadata, changed files, review threads, exact-head workflows, DB parity, Edge parity and E2E at one immutable SHA. | all G0-G6 green at same head | ☐ |
| RC-06 | Merge/live not yet performed | Merge only after RC-05; verify live source; run compact live smoke; record production identities. | merged SHA + live smoke + final ledger checkpoint | ☐ |

## Standard repair transaction

Every future defect uses one transaction:

1. **PROVE** — exact head/environment/reproduction.
2. **OWNER** — choose one existing owner row.
3. **PATCH** — smallest generic owner change; no unrelated cleanup.
4. **TEST** — owner tests plus affected release gates.
5. **ACCEPT** — exact diff/head review and promotion decision.
6. **DEPLOY** — only if production parity is part of that accepted slice.
7. **LOG** — append evidence below and update only the affected row/task.

If a problem cannot be assigned to a current owner, first prove that it is a distinct mechanic. Until that proof exists, do not create owner #41.

## Repair / promotion log

### 2026-09-16 — Ledger revision 2 reconciliation

Starting evidence:
- PR #549 accepted source head before documentation reconciliation: `28fc3f46569b620ee7c30bb5a8fb5f05ea7b6834`.
- exact-head workflows: Card Pass #548 SUCCESS; Migration Replay #777 SUCCESS; Functional Smoke #803 SUCCESS.
- review threads: 0.
- production database: eight accepted post-20260904110527 TCG migrations present; current TCG tables/RPCs present.
- production Edge inventory: `tcg-private-alpha-api` ACTIVE v2, `tcg-match-actions` ACTIVE v1, `tcg-tactic-actions` ACTIVE v1, all JWT verified.
- element-package authority: 8 launch packages / 193 identities / 8 starters; Fairy and Underworld future concepts with `launch_blocker=false`.

Reconciliation decisions:
- Release 1 scope is 8 / 193 / 8.
- Fairy + Underworld are post-release.
- Pack/Shop/Trading/Battle Pass are post-release product systems and do not block first playable production release.
- old percentage checkpoints are historical only.
- capability manifest must be reconciled before it can be used as current runtime completeness evidence.
- production parity and real two-user E2E remain genuine release blockers.

Next allowed operation: **RC-02 capability/owner closeout only.** Do not start Fairy/Underworld or post-release product systems and do not merge/live-promote until later release gates authorize them.
