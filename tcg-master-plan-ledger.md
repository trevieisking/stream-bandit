# Stream Bandit TCG — Master Plan Owner / Repair Ledger

**Plan authority:** `tcg-master-plan-progress.md`  
**Release control:** `tcg-release-control-v1.json`  
**Ledger revision:** 6 — 2026-09-16  
**Accepted gameplay/capability baseline:** `af79a3c45db9a0c00406b44d1d0581aa1c8fb140`  
**Baseline owner count:** 40 families  
**Release lane:** PR #549 → private-alpha baseline on `main`

## Ledger rules

- This ledger is append-only execution history; it does not create a second master plan.
- One mechanic/state transition has one rightful owner. Submodules inside an owner family are not extra owners.
- `✅` = Release 1 owner/path accepted by exact source/tests or production evidence.
- `🔎` = owner exists, but Release 1 closeout/source-contract proof remains.
- `⏭` = intentionally post-release and must not block Release 1.
- A `✅` row reopens only under the master-plan reopen rules.
- Every release-significant source commit must update `tcg-release-control-v1.json` fingerprints and append one transaction here in that same commit.
- The master plan changes only for a material scope, architecture, gate or release-policy decision.
- Post-commit workflow/deployment/merge/page facts update one canonical PR comment marked `TCG-RELEASE-CONTROL-V1`; they do not require a commit that tries to record itself.
- After PR #549 creates the baseline, one owner-scoped change equals one small PR from `main`.

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
| 14 | Attack Engine | `_shared/tcg-match-attack-*` family | 🔎 | RC-02b1 and RC-02b2a accepted canonical attack-modifier consumption/production ownership. Remaining Release 1 closeout is broader: prove marked v0.2 launch attacks resolve structured attack metadata and cannot select legacy printed-English/card-ID fallback for the 193-card roster. Keep exact source-contract guards. |
| 15 | Active Ability Engine | `_shared/tcg-match-active-ability-*` family + unified live route | ✅ | RC-02b2 accepted the generic selected-modifier private-choice family with no card-ID routing. Ash Crown delegates to Attack #14; Mountain Warden delegates to Damage/Protection #20. New Ability forms extend this family only. |
| 16 | Tactic Engine | `tcg-tactic-actions/index.ts` + structured grammar | ✅ | Owner/source accepted. Production source parity is tracked under RC-03, not reopened as an engine rewrite. |
| 17 | Relic Engine | `_shared/tcg-match-relic-engine-v0-2.ts` | ✅ | Relic attach/replace lifecycle remains here. |
| 18 | Realm Engine | `_shared/tcg-match-realm-engine-v0-2.ts`, realm route/replaced-event owners | ✅ | Realm play/replace and replacement event stay in this family. |
| 19 | Condition Engine | `_shared/tcg-match-condition-engine-v0-2.ts` + lifecycle/protection owners | ✅ | New condition semantics extend this owner. |
| 20 | Damage / Shield Engine | `_shared/tcg-match-damage-*` family + protection/packet owners | 🔎 | RC-02b2b accepted ordinary attack-damage delegation into stored Damage/Protection before Shield, and RC-02b2 can install Mountain Warden generically. Broader closeout remains: prove every marked Release 1 damage/protection/packet shape routes through canonical ownership; direct helpers may remain only as adapters/legacy compatibility. |
| 21 | Heal Engine | `_shared/tcg-match-heal-*` packet/before/listener family | 🔎 | Tactic and attack-wide HEAL/HEAL_EACH owners exist, but `HEAL_EACH` remains partial because First Canopy uses a selected-target family not yet proven equivalent. Prove all marked Release 1 healing that requires heal-packet/listener semantics before reclassifying. |
| 22 | Essence Attachment Engine | `_shared/tcg-match-essence-attachment-*` family | ✅ | Physical attachment uses one transaction path; no structured competing mutation. |
| 23 | Essence Movement Engine | `_shared/tcg-match-essence-movement-v0-2.ts` | ✅ | Movement listeners/tactics delegate physical transfer here. |
| 24 | Essence Query / Selection Engine | `_shared/tcg-match-essence-query-v0-2.ts` | ✅ | Query/selection is non-mutating; movement/attachment remains with their owners. |
| 25 | Cost Engine | action/ability/payment cost owners + withdrawal cost owner | ✅ | Cost computes legality/value; it does not consume resources. |
| 26 | Payment Engine | `_shared/tcg-match-payment-*` family | ✅ | Payment consumes resources only after preflight. No caller-owned splice/discard payment path. |
| 27 | Atomic Switch / Battlefield Position Engine | `_shared/tcg-match-switch-context-v0-2.ts` | ✅ | Vanguard/Reserve position mutation and switch context live here. |
| 28 | Generic Event Listener Engine | `_shared/tcg-match-event-listener-*` family + Essence Attachment eligibility predicates | ✅ | RC-02c2 accepted `event_action_kind_is`; c3 accepted `event_controller_is_opponent`; c4 accepted `source_controller_is_self`; c5 accepted exact `event_attachment_kind_is` for Railhorn's `temporary` / `borrowed` branches. Listener predicates select eligibility only; mechanic mutation still delegates to its rightful owner. |
| 29 | Movement Listener Engine | `_shared/tcg-match-movement-listener-v0-2.ts` | ✅ | Listener continuation only; physical movement delegates. RC-02c2 runtime proof exercised the real `voluntary_withdrawal` action-kind case through this path. |
| 30 | Card-Zone / Draw / Shuffle / Discard Engine | `_shared/tcg-match-card-zone-engine-v0-2.ts` | ✅ | Own physical card-instance movement/order. RNG chooses random order; Hidden Information controls views. |
| 31 | Card Search / Filter / Inspection Engine | specialized structured query/inspection owners + Card-Zone for mutation | 🔎 | `INSPECT_ZONE` deliberately remains `missing`: current Reward inspection is bounded and does not prove generic zone-inspection parity. Audit Release 1 search/inspection call sites; any physical move after search must use Card-Zone. Do not invent owner #41. |
| 32 | Reward Card Engine (in-match) | reward inspection + Card-Zone take/transfer ownership | ✅ | Reward inspection/choice and physical take remain separated; bounded Reward inspection must not be misreported as generic `INSPECT_ZONE`. Match-end economy reward is owner #36. |
| 33 | Hidden Information / Private Visibility Engine | `_shared/tcg-match-hidden-information-v0-2.ts` + private views | ✅ | Two-user E2E must verify no opponent hidden data leak. |
| 34 | Defeat / Match-End Engine | `_shared/tcg-match-defeat-*` + terminal Match Flow + commit completion | ✅ | Defeat determines battle lifecycle; SQL commit persists terminal result/reward receipt. No duplicate winner authority. |
| 35 | Economy / Currency Ledger | player profile balances + server reward path | ✅ | For Release 1, match rewards are the only required currency writer. Before Shop/Trade/Pack spending launches, establish their transaction paths through this owner rather than direct balance updates. |
| 36 | Match Rewards / XP / Arcade Progression | `tcg_server_award_match_rewards`, `tcg_match_rewards`, reward config | ✅ | Exactly-once receipt and XP/currency result must be proven in two-user E2E. |
| 37 | Pack / Pack-Opening Engine | future product system | ⏭ | Post-release. Must own pack definition/odds/opening/award transaction and call Collection/Currency owners; no per-pack helpers. |
| 38 | Shop / Purchase Engine | future product system | ⏭ | Post-release. Must spend through Currency owner and award via product/collection owners. |
| 39 | Trading Engine | future product system | ⏭ | Post-release. Must own validation + atomic exchange and use Collection/Currency owners. |
| 40 | Battle Pass Engine | future product system | ⏭ | Post-release. Must own track/progression/reward claim and delegate awards to existing owners. |

## Release-control repair ledger

These rows are the current cross-owner closeout map. The machine-readable exact state is `tcg-release-control-v1.json`.

| ID | Defect / gap | Exact fix/process | Acceptance evidence | State |
|---|---|---|---|---|
| RC-01 | Planning authority drift and self-referential control commits | Stable plan + append-only ledger + machine release manifest. Source fingerprints and ledger entry land with the source; post-commit facts live in one canonical GitHub comment. | Release-control test recomputes artifact blobs and all Edge closures. | 🔎 Release Control v1 commit awaiting its own exact-head CI |
| RC-02 | Capability inventory is historical/stale relative to later owner work | Reconcile one Release 1-used shape at a time. Accepted through c5: b1, b2a, b2b, b2, c1, c2, c3, c4, c5. Preserve audited non-changes. | Capability test + owner tests + exact-head Card Pass/Migration/Smoke + one ledger transaction. | 🔎 in progress |
| RC-03 | Production Edge source parity is false | Deploy exact manifest closures: private-alpha 7 files, match-actions 84, tactic-actions 36; preserve JWT; read back versions/source. | Supabase deployment/readback bound to manifest closure identities. | ☐ PA-01, next after control CI |
| RC-04 | No stable live/test baseline | After Edge parity, squash merge PR #549, create rollback branch, and verify Pages `t.html`. This is private alpha, not G7. | Merge SHA + rollback ref + served page blob/route in canonical comment. | ☐ PA-02 through PA-04 |
| RC-05 | Real journey not yet proven | Two authenticated users complete the G5 journey; every defect is assigned to one existing owner and repaired through a small PR from `main`. | Real session evidence + exactly-once reward + hidden-state checks. | ☐ PA-05 / G5 |
| RC-06 | Final public release fence incomplete | G0-G6 green at one accepted `main` checkpoint; then G7 promotion/live smoke. | GitHub + Supabase + E2E checkpoint. | ☐ pending |

## Standard repair transaction

Every future defect uses one transaction:

1. **PROVE** — exact accepted-and-synchronized head/environment/reproduction.
2. **OWNER** — choose one existing owner row.
3. **PATCH** — smallest generic owner change; no unrelated cleanup.
4. **TEST** — owner tests plus affected release gates.
5. **ACCEPT** — exact diff/head review and promotion decision.
6. **DEPLOY** — only if production parity is part of that accepted slice.
7. **LOG** — update release-manifest fingerprints and append this transaction in the same source commit; after CI/deploy, update the canonical GitHub checkpoint comment.

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

### 2026-09-16 — RC-02 accepted owner/capability sequence through c2

Accepted exact-head chain:

1. **RC-02b1 — Attack modifier live consumer connection**  
   Accepted head: `da87b4c6e212317e38492f23c707c5862df13ffa`.  
   Precise fix: canonical Attack #14 modifiers are applied at legal attack declaration, bound riders flush through the accepted effect path, and end-of-turn expiry is connected. Historical guard assertions were updated only where source-order assumptions changed.  
   Result: Attack modifier owner is live in Match Actions; merge/main/production remained HOLD.

2. **RC-02b2a — canonical attack-modifier producer ownership**  
   Accepted head: `ea5f07b5941abc982c051d9deeedcbd41435674a`.  
   Precise fix: legacy structured producers that wrote incompatible modifier records now delegate to Attack #14; the old Surge reader is prevented from double-counting canonical reusable modifiers.  
   Result: one record schema/owner for structured attack modifiers; no card-ID special cases.

3. **RC-02b2b — attack damage → Damage/Protection connection**  
   Accepted head: `974a6edb66e8821ae7e3543ebd31bfa492c9449a`.  
   Precise fix: ordinary live attack damage now consults canonical stored temporary Damage/Protection before Shield while preserving exact action/seat/target context.  
   Result: Mountain Warden-style protection can be installed by the owner and actually consumed on positive prevented attack damage.

4. **RC-02b2 — generic selected-modifier Active-Ability family**  
   Accepted head: `29d92a7bb9df9385630ae9d8df67ef069a6e1eaa`.  
   Precise fix: one card-ID-free private-choice family recognizes `SELECT_CREATURE → modifier` programs, reuses existing once-per-turn/choice receipts, revalidates stale targets on resolve, and delegates mutation to the canonical owner.  
   Launch proof: Ash Crown → Attack #14; Mountain Warden → Damage/Protection #20.  
   Exact-head gates: Card Pass #558, Migration #787, Smoke #813 SUCCESS.

5. **RC-02c1 — incoming attack modifier capability classification**  
   Accepted head: `355c23ed611f8c15ec3348a86ae02e1fdd162173`.  
   Precise fix: `ADD_INCOMING_ATTACK_DAMAGE_MODIFIER` moved `missing → implemented` only after RC-02b2 proved the generic owner path.  
   No runtime/card/rule/migration/production change.  
   Exact-head gates: Card Pass #559, Migration #788, Smoke #814 SUCCESS.  
   GitHub accepted checkpoint: comment #5701246613.

6. **RC-02c2 — event action-kind predicate classification**  
   Accepted head: `34d54a0573c677377cd54e7158bf7779378200d2`.  
   Precise fix: `event_action_kind_is` moved `missing → implemented`.  
   Release 1 inventory proof: 8 accepted uses across Astral, Ember, Gale, Shade and Tide; all are listener/trigger requirements.  
   Generic owner proof: Event Listener requirement evaluator compares current event action kind; real movement/event-listener runtime suite executes the `voluntary_withdrawal` case.  
   No runtime/card/rule/migration/production change.  
   Exact-head gates: Card Pass #560, Migration #789, Smoke #815 SUCCESS.  
   GitHub accepted checkpoint: comment #5701734004.

### 2026-09-16 — audited capability non-changes

These were explicitly audited and must not be rediscovered as if no decision exists:

- **`INSPECT_ZONE` stays `missing`.** Current Reward inspection ownership is intentionally bounded. Existing Reward-card inspection does not prove generic `INSPECT_ZONE` grammar/runtime parity. Reopen only if a Release 1 generic inspection shape is proven and bound to owner #31/#32.
- **`HEAL_EACH` stays `partial`.** Accepted tactic `HEAL_EACH` and attack-wide `HEAL_EACH` owners exist, but First Canopy adds a distinct selected-target shape (`SELECT_CREATURE` for 0–2 damaged field targets → `HEAL_EACH targets:$canopy_targets`). Do not classify implemented until that Release 1 family is proven through canonical Heal ownership.

### 2026-09-16 — unrelated `main` advance reconciled

During the RC-02c2 promotion fence, `main` advanced:

- old observed base: `39943d5fe5090cd0c140d7706092874dc98d2530`
- current base: `e0a71e1b292b45373f2c4ba658a4f346f5c1c84c`

The new base commit is **Revert unsafe Buddy Canvas Quick Writer V244 sync** and changes only:

- `code-labs/assets/buddy-canvas-assistant-sync-v124.js`

It contains no TCG runtime, migration, Supabase function, capability manifest, master-plan or ledger change. GitHub recalculated PR #549 as mergeable, and RC-02c2 then passed fresh Card Pass #560, Migration #789 and Smoke #815 against the current base. Record this as unrelated repository drift, not a TCG defect.

### 2026-09-16 — Ledger revision 3 control synchronization

Accepted synchronized head: `eefe4afc294489fbcbb637712a732e3857110b28`.

The revision-3 control sync recorded accepted work through RC-02c2 and passed:
- Card Pass #563 SUCCESS
- Migration #792 SUCCESS
- Smoke #818 SUCCESS
- review threads 0
- combined statuses none found

During transport, an accidental branch-only `dummy` file appeared in commit `8135256f32e22205e17fe94f31d47fef9fb4c71b`. It was removed immediately in repaired tree `081a0677689165b06c732e47705303e867036de9`. `eefe4afc294489fbcbb637712a732e3857110b28` is a same-tree validation commit used to obtain a clean exact-head workflow set. Net compare from the prior accepted gameplay head contains only the master plan and ledger; `dummy` has zero residual presence. `main`, runtime source, migrations, Supabase and production were untouched. GitHub source-of-truth comment: #5701883152.

### 2026-09-16 — RC-02c3 opponent event-controller predicate accepted

Accepted head: `086840853f34add8ac610e1a9764dd0a728fb05d`.

Precise reconciliation:
- `event_controller_is_opponent`: **`missing → implemented`**.
- owner: **#28 Generic Event Listener Engine**.
- Release 1 roster proof: exactly two accepted uses, both Shade Event Listener requirements — Nightmaw / Dread Hunger and Eclipse Essence / Eclipse Condition Heal.
- all other launch element packages and Prismatic Founder contain zero uses.
- generic owner semantics: affected event controller is compared with the opposite of the listener controller.
- committed controller-predicate Deno suite proves both positive and negative matching and keeps `source_controller_is_self` semantically distinct.
- no runtime/card/rule/migration/production change.

Exact-head evidence:
- Card Pass #564 SUCCESS
- Migration #793 SUCCESS, full zero-state replay
- Smoke #819 SUCCESS, independent zero-state replay
- review threads 0
- combined statuses none found
- complete PR inventory 394 files
- GitHub source-of-truth comment #5702012161

### 2026-09-16 — Ledger revision 4 control synchronization

Purpose: complete mandatory `LOG` for RC-02c3 before any RC-02c4 audit.

This revision synchronizes:
- accepted baseline `086840853f34add8ac610e1a9764dd0a728fb05d`;
- owner #28 with accepted `event_controller_is_opponent` coverage;
- RC-02 accepted chain through c3;
- exact #564/#793/#819 evidence;
- retained audited non-changes and transport/base-drift audit history;
- next allowed operation.

**Next allowed operation after this two-file control commit itself passes exact-head Card Pass / Migration / Smoke plus review/status fence:** continue **RC-02 capability/owner closeout only**, one Release 1-used shape at a time from the synchronized head. Do not begin G4, Fairy/Underworld or post-release product systems yet.


### 2026-09-16 — RC-02c4 source-controller self predicate accepted

Accepted head: `e822ba8e4d881b7e022f90248e1b1124f0a7a2c9`.

Precise reconciliation:
- `source_controller_is_self`: **`missing → implemented`**.
- owner: **#28 Generic Event Listener Engine**.
- frozen Release 1 inventory proof: exactly eight uses — Astral 2 (Dreamglass, Orbit Ring), Shade 2 (Nightmaw, Eclipse Essence), Tide 3 (Rillrunner, Reefshell, Tidal Lens), Volt 1 (Circuit Essence); all other launch packages and Prismatic Founder contain zero.
- every occurrence is a triggered/listener requirement.
- generic owner semantics compare `event.source_controller_seat` with the listener candidate seat.
- focused tests prove self=true, opponent=false and affected-controller/source-controller independence.
- no runtime/card/rule/migration/Edge/database/production change.

Exact-head evidence:
- Card Pass #566 SUCCESS, including the focused controller-predicate suite.
- Migration #795 SUCCESS, full zero-state replay.
- Smoke #821 SUCCESS, independent zero-state replay.
- review threads 0.
- combined statuses none found.
- complete PR inventory 394 files.
- GitHub source-of-truth comment #5702217085.

### 2026-09-16 — Ledger revision 5 control synchronization

Purpose: complete mandatory `LOG` for RC-02c4 before any RC-02c5 audit.

This revision synchronizes:
- accepted capability baseline through RC-02c4 at `e822ba8e4d881b7e022f90248e1b1124f0a7a2c9`;
- owner #28 with exact source-controller predicate semantics and eight-use launch inventory;
- RC-02 accepted chain through c4;
- exact #566/#795/#821 verification;
- unchanged 40-owner, Supabase and production boundaries;
- next allowed operation.

**Next allowed operation after this two-file control commit itself passes exact-head Card Pass / Migration / Smoke plus review/status fence:** continue **RC-02 capability/owner closeout only**, one Release 1-used shape at a time from the synchronized head. Do not begin G4, Fairy/Underworld or post-release product systems yet.


### 2026-09-16 — Ledger revision 6 / Release Control v1 / RC-02c5

Latest accepted functional checkpoint:

- source head: `af79a3c45db9a0c00406b44d1d0581aa1c8fb140`
- merge candidate observed before control commit: `2550bbffa1816c003457abe4d1bd6e0696c9cf53`
- PR #549: open, draft, mergeable, unmerged
- complete inventory: 395 changed files, all TCG/workflow scope
- exact-head Card Pass #568, Migration Replay #797 and Functional Smoke #823: SUCCESS
- review threads: 0; legacy combined statuses: none found

RC-02c5 accepted:

- `event_attachment_kind_is`: **missing → implemented**
- owner: **#28 Generic Event Listener Engine**, using the canonical Essence Attachment eligibility snapshot
- Release 1 use: Railhorn / Power Rail contains two exact accepted branches, `temporary` and `borrowed`
- focused Deno proof covers positive exact-kind matches and negative cross-kind/ordinary cases
- no production, migration or live source changed in RC-02c5

Deployment truth measured before promotion:

- `tcg-private-alpha-api` v2 differs from the accepted 7-file closure
- `tcg-match-actions` v1 differs from the accepted 84-file closure
- `tcg-tactic-actions` v1 has an exact entrypoint but is missing Attack Modifier and differs in Event Listener + Surge Lifecycle; accepted closure is 36 files
- all three deployed functions remain ACTIVE with JWT verification
- therefore **merge-only is BLOCKED as a playable release action**

Control-loop repair accepted as policy:

- the plan is stable policy, not a per-commit diary
- this ledger is append-only history
- `tcg-release-control-v1.json` carries machine-checkable source/closure fingerprints and exactly one next operation
- source + manifest + ledger land together
- one canonical PR comment marked `TCG-RELEASE-CONTROL-V1` records workflow/deploy/merge/page facts that only exist after a commit
- no further commit may exist solely to name itself or echo its own CI
- after PR #549 establishes the baseline, further work uses small owner-scoped PRs from `main`

Latest explicit release decision:

PR #549 may establish an authenticated **private-alpha test baseline** on `main` before final G3/G5/G6/G7 closeout. The order is fixed: control CI → exact Edge deploy/readback → squash merge → rollback branch → Pages `t.html` verification → two-user E2E. This is not public Release 1 promotion.

**Current operation:** PA-00 only. Promotion remains HOLD until the revision-6 Release Control v1 commit passes fresh Card Pass / Migration Replay / Functional Smoke with zero unresolved review threads.
