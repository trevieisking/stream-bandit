# Stream Bandit TCG — Canonical Release Master Plan

**Canonical checkpoint:** 2026-09-16 — Release Control v1 / private-alpha baseline after accepted RC-02c5  
**Accepted gameplay/capability baseline:** `af79a3c45db9a0c00406b44d1d0581aa1c8fb140`  
**Integration lane:** PR #549 — `feature/tcg-private-alpha-v0-5-source-recovery` → `main`  
**Release control:** `tcg-release-control-v1.json`  
**Execution ledger:** `tcg-master-plan-ledger.md`

## 0. Authority and anti-drift rule

There are four distinct authorities; none may impersonate another:

1. **Desired behaviour:** this master plan defines Release 1 scope, architecture invariants and gates.
2. **Source truth:** GitHub defines the exact code through reviewed source fingerprints and exact-head workflow evidence.
3. **Live truth:** Supabase project `xzxqfrvqdgkzwujbkdbk` defines deployed database/function reality.
4. **Audit truth:** `tcg-master-plan-ledger.md` is append-only history. `tcg-release-control-v1.json` binds current source fingerprints, external snapshot, gates and one next operation.

Trev's latest explicit decision outranks an older plan statement. When that happens, change policy here once, append the decision to the ledger once, and update the release manifest in the same commit.

**Non-circular checkpoint contract:**

- The plan changes only when scope, architecture, gate definitions or release policy changes.
- Every release-significant source change updates `tcg-release-control-v1.json` and appends one ledger transaction in the **same commit**.
- CI recomputes Git blob identities and all three Edge dependency closures. A source change without a matching manifest update fails.
- Post-commit facts that cannot exist before the commit—workflow run IDs, deployed function versions, merge SHA and Pages proof—are written to one canonical PR comment containing `TCG-RELEASE-CONTROL-V1`.
- Never create a commit merely to record that commit's own SHA or the workflows it triggered.
- A completed gate reopens only under section 7, not because an older comment or percentage disagrees.

## 1. Release 1 scope — locked

Release 1 is the first real playable Stream Bandit TCG production release.

### Included

- 8 launch elements: **Astral, Ember, Gale, Grove, Shade, Stone, Tide, Volt**.
- 193 structured gameplay identities: 8 x 24 elemental identities plus Prismatic Founder.
- 8 exact 60-card starter decks.
- Martial remains a Creature Type, not an Essence element.
- Server-authoritative two-player game flow from sign-in through completed battle.
- Starter grant, deck validation, private rooms, automatic Arcade matchmaking, match setup, hidden/private state, command commit, battle resolution, defeat/match end, XP and current three-currency match rewards.
- Existing canonical mechanics required by the 193-card launch registry.
- Existing UI/player route required to complete the real two-user journey.

### Explicitly post-release — not Release 1 blockers

- Fairy full-element package and Gracebound starter.
- Underworld full-element package and Debtbound starter.
- Pack-opening product system.
- Shop/purchase product system.
- Trading product system.
- Battle-pass reward-track product system.
- New elements, new sets, new card types, new rules or content not required by the 193-card launch registry.

Fairy and Underworld design/audit documents are preserved as expansion authority. They must not change Release 1 card count, starter count, registry SHA or release gates.

## 2. Architecture invariants — locked

1. **One rightful owner per mechanic/state transition.** The owner ledger remains 40 families unless an explicit ledger revision proves a genuinely new authority or merges two existing families.
2. Edge routes (`tcg-private-alpha-api`, `tcg-match-actions`, `tcg-tactic-actions`) are orchestration/HTTP boundaries. They may validate and sequence work but must not become competing mechanic engines.
3. Card-specific gameplay belongs in structured card/effect data whenever the shared grammar can express it. Do not add card-name/card-ID helpers for ordinary launch behavior.
4. New mechanics extend one canonical owner/opcode first, then cards consume that owner as data.
5. Existing per-copy `Inst.uid` is the runtime instance identity. Do not create a parallel copy-identity system.
6. RNG owns randomness. Card-Zone owns physical card movement/order after an order/selection is supplied. Hidden Information owns player-visible projection.
7. Payment owns resource consumption. Cost owners calculate legality/cost. Callers do not duplicate payment mutation.
8. Match Flow owns phase/turn/resolution/terminal transitions. Callers request transitions.
9. Marked v0.2 Release 1 matches must resolve launch gameplay through structured owners. Legacy fallbacks may remain only for explicitly unmarked/legacy matches; they are not release authority for new v0.2 matches.
10. Production database migrations remain additive/replay-safe. Never rewrite applied migration history to make planning text look current.
11. PR #549 is the one-time private-alpha baseline integration into `main`. After it merges, every remaining repair uses a small owner-scoped PR from `main`; no unrelated Stream Bandit/DJ/Web Builder/social work enters a TCG PR.
12. Protected Writer / Repo Desk / CG Repair Lab / Code God are not the default TCG execution path. Normal GitHub branch work + exact tests + Supabase parity remain preferred.
13. A release-significant slice is complete only when its source, release-manifest fingerprints and ledger transaction land together and exact-head CI passes. External deploy/merge evidence then updates the canonical GitHub checkpoint comment.

## 3. Current evidence baseline

Accepted functional source checkpoint:

- PR #549 head: `af79a3c45db9a0c00406b44d1d0581aa1c8fb140`.
- Current `main` base: `e0a71e1b292b45373f2c4ba658a4f346f5c1c84c`.
- PR: open, draft, mergeable, unmerged.
- Merge candidate: `2550bbffa1816c003457abe4d1bd6e0696c9cf53`.
- Exact-head workflows: TCG Card Pass 2 Validation #568 SUCCESS; Migration Replay #797 SUCCESS; Functional Smoke #823 SUCCESS, including independent PostgreSQL replay from zero.
- Review threads: 0. Legacy combined statuses: none found; absence is not counted as a PASS.
- Complete PR inventory: 395 files, all TCG/workflow scope.
- Launch authority remains 8 elements / 193 identities / 8 starters.
- Production DB contains accepted TCG migrations through `20260906193000_tcg_match_v0_2_runtime_marker_bridge`.
- Production registry remains `SB1-set-one-v0.2`, 193/193 structured rows, malformed 0, digest `8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f`.
- The authenticated test surface is `t.html` (blob `10e8dabd6ad7bedfc4f839a2f506a29cf9cb51a6`). It contains no service-role/private-key pattern and requires an approved signed-in Supabase session.
- Production Edge functions are active with JWT verification, but are not at accepted source parity: private-alpha API v2 differs; match-actions v1 differs; tactic-actions v1 is missing Attack Modifier and has two differing shared sources.
- Supabase security advisors report no TCG-specific WARN finding. The two TCG registry tables with RLS/no client policy remain server-only informational findings.

Accepted G3 reconciliation chain now recorded as current evidence:Accepted G3 reconciliation chain now recorded as current evidence:

- **RC-02b1** — Attack #14 modifier consumption/bound-rider/end-turn wiring accepted at `da87b4c6e212317e38492f23c707c5862df13ffa`.
- **RC-02b2a** — existing structured attack-modifier producers collapsed onto canonical Attack #14 ownership accepted at `ea5f07b5941abc982c051d9deeedcbd41435674a`.
- **RC-02b2b** — ordinary attack damage connected to canonical stored Damage/Protection before Shield accepted at `974a6edb66e8821ae7e3543ebd31bfa492c9449a`.
- **RC-02b2** — card-ID-free selected-modifier Active-Ability family accepted at `29d92a7bb9df9385630ae9d8df67ef069a6e1eaa`; Ash Crown delegates to Attack #14 and Mountain Warden delegates to Damage/Protection #20.
- **RC-02c1** — `ADD_INCOMING_ATTACK_DAMAGE_MODIFIER` capability classification reconciled `missing → implemented` at `355c23ed611f8c15ec3348a86ae02e1fdd162173`.
- **RC-02c2** — `event_action_kind_is` predicate classification reconciled `missing → implemented` at `34d54a0573c677377cd54e7158bf7779378200d2`; GitHub source-of-truth comment #5701734004.
- **Control sync revision 3** — master plan + ledger synchronized and validated at `eefe4afc294489fbcbb637712a732e3857110b28`; GitHub source-of-truth comment #5701883152.
- **RC-02c3** — `event_controller_is_opponent` predicate classification reconciled `missing → implemented` at `086840853f34add8ac610e1a9764dd0a728fb05d`; exactly two Release 1 uses, both Shade Event Listener requirements: Nightmaw — Dread Hunger and Eclipse Essence — Eclipse Condition Heal. Generic Event Listener positive/negative controller semantics are covered by the committed controller-predicate Deno suite. Exact-head gates #564/#793/#819 all SUCCESS. GitHub source-of-truth comment #5702012161.
- **Control sync revision 4** — master plan + ledger synchronized and validated at `4fd1a10fda98b33822767755a6df600febd366de`; exact-head gates #565/#794/#820 all SUCCESS; GitHub source-of-truth comment #5702112552.
- **RC-02c4** — `source_controller_is_self` predicate classification reconciled `missing → implemented` at `e822ba8e4d881b7e022f90248e1b1124f0a7a2c9`; exactly eight Release 1 uses across Astral 2 / Shade 2 / Tide 3 / Volt 1, all Event Listener requirements owned by #28. Exact focused tests prove self/opponent source-controller semantics and independence from affected-controller predicates. Exact-head gates #566/#795/#821 all SUCCESS. GitHub source-of-truth comment #5702217085.
- **Control sync revision 5** — plan + ledger synchronized and validated at `fd8b3f155b44031a2681efd8988d13e2634a96f8`; exact-head gates #567/#796/#822 all SUCCESS; GitHub source-of-truth comment #5702316329.
- **RC-02c5** — `event_attachment_kind_is` reconciled `missing → implemented` at `af79a3c45db9a0c00406b44d1d0581aa1c8fb140`; Railhorn Power Rail supplies the two launch uses (`temporary` or `borrowed`). The generic Essence Attachment eligibility owner is covered by positive and negative exact-kind tests. Exact-head gates #568/#797/#823 all SUCCESS.

Audited classifications deliberately **not** changed:

- `INSPECT_ZONE` remains `missing`: current Reward inspection ownership is intentionally bounded and does not prove generic `INSPECT_ZONE` parity.
- `HEAL_EACH` remains `partial`: Release 1 includes at least three shapes, including First Canopy `SELECT_CREATURE (0–2 damaged field targets) → HEAL_EACH targets:$canopy_targets`; accepted tactic and attack-wide heal owners do not yet prove that selected-target family.

Repository-drift note retained:

- `main` advanced from `39943d5fe5090cd0c140d7706092874dc98d2530` to `e0a71e1b292b45373f2c4ba658a4f346f5c1c84c` through the Code Labs Buddy Canvas V244 rollback.
- That base advance changed no TCG runtime, migration, Supabase function, capability, master-plan or ledger source.
- The prior control-sync transport incident is retained in the ledger/source-of-truth comment; its accidental `dummy` file has zero residual presence in the PR tree.

## 4. Fixed Release 1 gates

### G0 — Scope authority — COMPLETE

Acceptance:
- 8 launch elements / 193 identities / 8 starters.
- Fairy + Underworld remain post-release.
- Product-layer Pack/Shop/Trade/Battle Pass remain post-release.

Reopen only if Trev explicitly changes Release 1 scope.

### G1 — Content / registry / starter authority — COMPLETE

Acceptance:
- 193 structured identities pass Card Pass validation.
- 8 exact starter recipes pass validator/copy-limit rules.
- element-package authority points only at launch packages.
- registry builder/digest remain deterministic.

Reopen only on a failing exact-head content/registry test or an explicit card/rule correction.

### G2 — Production database parity — COMPLETE

Acceptance:
- accepted migrations are applied in order under canonical versions.
- card/version/printing, collection/deck, room/match, registry, profile/reward persistence exists.
- server RPCs for starter grant, deck validation, room/matchmaking, match preparation/initial state, commit and rewards exist.
- no Release 1 schema migration remains unapplied.

Reopen only on missing migration, replay failure, schema mismatch or runtime DB error.

### G3 — Owner/capability reconciliation — IN PROGRESS

Purpose: stop historical inventories from recreating already-completed work and prove that every launch-used shape reaches exactly one canonical owner.

Required process:
1. Start from the latest accepted release manifest and canonical GitHub checkpoint. If fingerprints, ledger transaction or exact-head evidence disagree, **stop and reconcile that one checkpoint first**.
2. Audit the 40 owner rows in `tcg-master-plan-ledger.md` against the current PR source/tests.
3. Treat an owner as accepted when its canonical module/DB owner exists and exact tests prove the Release 1 path uses it.
4. Reconcile `tcg-runtime-capabilities-v0.2.json` from current source/tests. It is a capability inventory, not a completion percentage.
5. For every operation/predicate still marked partial/missing, first ask: **is it used by the 193-card Release 1 registry?**
   - If no: keep/move it to post-release debt; do not implement it to satisfy an old inventory.
   - If yes: bind it to exactly one owner row and make one bounded repair or evidence-backed classification correction.
6. For legacy parser/card-ID fallbacks, prove new marked v0.2 matches cannot select those fallbacks for launch cards. Legacy compatibility branches may remain for old/unmarked matches.
7. Add/retain source-contract tests that forbid duplicate mutation returning to an accepted owner.
8. In the same source commit, update release-manifest fingerprints and append one ledger transaction. After CI, update the canonical GitHub checkpoint comment; do not create a self-referential documentation commit.

Gate passes when all Release 1-used operations/predicates resolve through accepted owners and the capability manifest reflects current evidence.

### G4 — Production Edge source parity — IN PROGRESS; REQUIRED BEFORE PRIVATE-ALPHA MERGE

Target functions:
- `tcg-private-alpha-api`
- `tcg-match-actions`
- `tcg-tactic-actions`

Required process for each function:
1. Pin the exact accepted-and-synchronized PR head.
2. Build the complete relative dependency closure from that GitHub head.
3. Hash/identify every uploaded source file; no hand-written or reconstructed variants.
4. Compare deployed source/version marker to the accepted GitHub source graph.
5. If different, deploy the exact accepted closure with JWT verification preserved.
6. Read production function metadata/source back and prove parity.
7. Record deployed version/readback in the canonical GitHub checkpoint comment. Update the manifest on the next source-bearing commit; do not create a commit solely to echo external state.

Do not reimplement a function merely because production is behind; production mismatch is a deployment/parity problem until source evidence proves otherwise.

### Private-alpha baseline lane — AUTHORIZED, NOT PUBLIC RELEASE

Trev's latest decision authorizes PR #549 to establish a recoverable authenticated test baseline on `main` before G3/G5 are fully closed. This does **not** mark Release 1 complete and does not change G7.

1. **PA-00:** freeze accepted source, install Release Control v1 and pass fresh exact-head CI.
2. **PA-01:** deploy the exact 7-file / 84-file / 36-file Edge closures with JWT preserved; read back parity.
3. **PA-02:** mark PR #549 ready and squash merge it to `main`.
4. **PA-03:** create `release/tcg-private-alpha-v0.1` at the merged baseline for rollback/recovery.
5. **PA-04:** verify GitHub Pages serves the merged `t.html` authenticated test route.
6. **PA-05:** run the real two-user journey. Log any defect against one owner and fix it in a small PR from `main`.

### G5 — Real two-user production E2E — PENDING

Run with two real authenticated users against the Release 1 production path.

Required journey:
1. sign in/authentication;
2. starter ownership/deck availability;
3. deck validation;
4. private room and/or Arcade matchmaking route;
5. two seats established;
6. coin/toss/random first-player path;
7. opening setup, Rewards, opening hand and mulligan;
8. Vanguard/Reserve setup;
9. turn start/draw;
10. Essence attachment/payment/cost;
11. creature placement/evolution;
12. Relic and Realm play/replace paths;
13. Tactic play including a pending choice;
14. Active Ability including immediate and targeted/private choice path;
15. attack declaration/cost/target/damage/Shield/condition/listener path;
16. switch/withdrawal/movement listener path;
17. defeat, forced promotion and Reward-card handling;
18. terminal match result;
19. match reward receipt, XP and currency update exactly once;
20. private/hidden information remains seat-correct throughout.

A discovered defect is not a reason to invent another system. Log it against its rightful owner row, repair that owner only, rerun its tests, then repeat the failed E2E segment and exact-head gates.

### G6 — Final exact-head acceptance fence — PENDING

At one immutable PR head require:
- One immutable final-release source checkpoint on `main` or a bounded final-release PR; the earlier private-alpha baseline merge is not itself G7 acceptance.
- TCG Card Pass 2 Validation SUCCESS.
- Migration Replay SUCCESS.
- Functional Smoke SUCCESS.
- review threads = 0.
- capability/owner Release 1 closeout accepted.
- DB parity accepted.
- Edge parity accepted.
- real two-user E2E accepted.
- no unrelated changed files introduced by closeout.

If the head changes, refresh this gate. Do not transfer PASS evidence from an older head.

### G7 — Release 1 public promotion / live smoke — PENDING

Only after G0-G6 are green:

1. pin the exact accepted `main` source and matching Supabase versions;
2. promote the authenticated test baseline to the intended Release 1 player entry point;
3. run compact live smoke: auth → deck → matchmaking/room → match load → legal command → state refresh → match completion/reward receipt;
4. record the immutable release checkpoint and rollback identity in the canonical GitHub comment and release manifest on the next source-bearing release commit.

Rollback/demotion trigger: auth/security regression, state corruption, hidden-information leak, duplicate reward/currency award, inability to start/complete a match, or proven source/deployment mismatch.

## 5. Locked execution order from this checkpoint

Only one current operation is allowed:

1. **PA-00 now:** land Release Control v1 with RC-02c5 recorded; pass fresh Card Pass / Migration Replay / Functional Smoke on that exact head.
2. **PA-01:** deploy and read back the exact accepted closures for `tcg-private-alpha-api`, `tcg-match-actions` and `tcg-tactic-actions`.
3. **PA-02:** refresh PR head/mergeability, mark ready and squash merge PR #549 to `main`.
4. **PA-03:** create the rollback branch at the merged baseline.
5. **PA-04:** verify `https://trevieisking.github.io/stream-bandit/t.html` serves the merged authenticated test surface.
6. **PA-05 / G5:** run the two-user journey and log defects by owner.
7. Continue G3 only for a Release 1-used shape proven by the registry or E2E; use one small PR per owner repair.
8. G6 then G7 remain the final public-release fence.
9. Fairy, Underworld, Packs, Shop, Trading and Battle Pass remain post-release.

## 6. Mandatory repair process — every future fix

Use this sequence exactly:

**PROVE → OWNER → PATCH → TEST → ACCEPT → DEPLOY (if required) → LOG**

- **PROVE:** reproduce or identify the exact defect at the current accepted-and-synchronized head/environment.
- **OWNER:** choose the existing ledger owner. Do not create a helper/engine unless the ledger proves no rightful owner exists.
- **PATCH:** smallest generic fix in that owner; preserve unrelated working behavior.
- **TEST:** owner unit/contract tests + TCG Card Pass/Smoke/Migration gates as applicable.
- **ACCEPT:** exact diff/head review; no stale PASS evidence.
- **DEPLOY:** only when production parity is part of that accepted slice and exact accepted source is transportable.
- **LOG:** in the same source commit, update release-manifest fingerprints and append one ledger transaction. Change this plan only for a material policy/scope/gate change. After CI or deployment, update the one canonical GitHub checkpoint comment.

A failed test means HOLD for that slice, not a new architecture pass. A production mismatch means parity/deployment investigation first, not source rewriting.

## 7. Reopen rules

A completed owner/gate may be reopened only by one of:

- a failing exact-head test tied to it;
- a real E2E reproduction tied to it;
- a production source/schema mismatch tied to it;
- a security/hidden-information defect tied to it;
- Trev explicitly changing a rule/scope requirement.

Old comments, old percentages, old capability labels, old branch state or a later unrelated `main` commit cannot reopen completed TCG work by themselves.

## 8. Progress meter

Private-alpha baseline: **PA-00 🔎 | PA-01 ☐ | PA-02 ☐ | PA-03 ☐ | PA-04 ☐ | PA-05 ☐**

Release 1 gates: **G0 ✅ | G1 ✅ | G2 ✅ | G3 🔎 | G4 🔎 | G5 ☐ | G6 ☐ | G7 ☐**

Accepted G3 chain: **RC-02b1 ✅ | RC-02b2a ✅ | RC-02b2b ✅ | RC-02b2 ✅ | RC-02c1 ✅ | RC-02c2 ✅ | RC-02c3 ✅ | RC-02c4 ✅ | RC-02c5 ✅**

This meter separates “a recoverable test version exists” from “Release 1 is complete.” No percentage may override these gates.
