# Stream Bandit TCG — Canonical Release Master Plan

**Canonical checkpoint:** 2026-09-16  
**Integration lane:** PR #549 — `feature/tcg-private-alpha-v0-5-source-recovery`  
**Execution ledger:** `tcg-master-plan-ledger.md`

## 0. Authority and anti-drift rule

This file is the single current TCG release plan. The ledger is the execution/audit record for this plan. Older progress percentages, PR comments, checkpoint documents and prototype plans are historical evidence only when they conflict with this file at a newer accepted head.

Authority order:

1. Trev's latest explicit TCG decision.
2. This canonical master plan and `tcg-master-plan-ledger.md` at the current accepted PR #549 head.
3. Current GitHub source, exact-head tests and accepted PR comments for the same head.
4. Current production Supabase database/function state.
5. Older comments/checkpoints/prototype plans only as historical evidence.

Conflict rule: if two sources disagree, do not create work from both. Record the conflict in the ledger, resolve it against the authority order above, then update the losing/stale source so it cannot reopen the same work later.

Progress rule: do not use old weighted completion percentages as release authority. Use the fixed release gates in this file. A completed gate is reopened only by new exact evidence tied to that gate.

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
11. PR #549 is the only Release 1 integration lane. No unrelated Stream Bandit/DJ/Web Builder/social work enters this PR.
12. Protected Writer / Repo Desk / CG Repair Lab / Code God are not the default TCG execution path. Normal GitHub branch work + exact tests + Supabase parity remain preferred.

## 3. Current evidence baseline

Accepted source baseline before this plan reconciliation:

- PR #549 head: `28fc3f46569b620ee7c30bb5a8fb5f05ea7b6834`.
- PR: open, draft, mergeable, unmerged.
- Exact-head workflows: TCG Card Pass 2 Validation #548 SUCCESS; Migration Replay #777 SUCCESS; Functional Smoke #803 SUCCESS.
- Review threads: 0.
- Legacy combined commit statuses: none found; absence is not counted as a PASS.
- Launch package authority: `tcg-element-packages-v0.2.json` = 8 launch elements, 193 structured identities, 8 starters, Fairy/Underworld `launch_blocker=false`.
- Production DB contains all eight accepted post-20260904110527 TCG migrations through `20260906193000_tcg_match_v0_2_runtime_marker_bridge`.
- Production registry proof previously accepted: `SB1-set-one-v0.2`, 193/193 structured rows, malformed 0, digest `8e2556604fd1757917ea60b7e9af8c0de717a69b72c7e37b0e2690abdcce430f`, runtime authority false until release gates finish.
- Production Edge functions currently exist for all three TCG routes with JWT verification enabled: `tcg-private-alpha-api` v2, `tcg-match-actions` v1, `tcg-tactic-actions` v1. Exact source parity is still a release gate; version existence alone is not parity proof.

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

Purpose: stop historical inventories from recreating already-completed work.

Required process:
1. Audit the 40 owner rows in `tcg-master-plan-ledger.md` against the current PR source/tests.
2. Treat an owner as accepted when its canonical module/DB owner exists and exact tests prove the Release 1 path uses it.
3. Reconcile `tcg-runtime-capabilities-v0.2.json` from current source/tests. It is a capability inventory, not a completion percentage.
4. For every operation/predicate still marked partial/missing, ask one question: **is it used by the 193-card Release 1 registry?**
   - If no: move it to post-release debt; do not implement it to satisfy an old inventory.
   - If yes: bind it to exactly one owner row and make one bounded repair.
5. For legacy parser/card-ID fallbacks, prove new marked v0.2 matches cannot select those fallbacks for launch cards. Legacy compatibility branches may remain for old/unmarked matches.
6. Add/retain source-contract tests that forbid duplicate mutation returning to an accepted owner.

Gate passes when all Release 1-used operations/predicates resolve through accepted owners and the capability manifest reflects current evidence.

### G4 — Production Edge source parity — IN PROGRESS

Target functions:
- `tcg-private-alpha-api`
- `tcg-match-actions`
- `tcg-tactic-actions`

Required process for each function:
1. Pin the exact accepted PR head.
2. Build the complete relative dependency closure from that GitHub head.
3. Hash/identify every uploaded source file; no hand-written or reconstructed variants.
4. Compare deployed source/version marker to the accepted GitHub source graph.
5. If different, deploy the exact accepted closure with JWT verification preserved.
6. Read production function metadata/source back and prove parity.
7. Log deployed version and evidence in the ledger.

Do not reimplement a function merely because production is behind; production mismatch is a deployment/parity problem until source evidence proves otherwise.

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
- PR open/draft state appropriate for final review, mergeable, unmerged before merge.
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

### G7 — Merge / live promotion / live smoke — PENDING

Only after G0-G6 are green:
1. recheck exact PR head and merge candidate;
2. merge PR #549 to `main` using the repository's permitted merge path;
3. verify production UI/game route is serving the merged source;
4. run a compact live smoke: auth -> deck -> matchmaking/room -> match load -> legal command -> state refresh -> match completion/reward receipt;
5. record final production identities/versions and release checkpoint in the ledger.

Rollback/demotion trigger: auth/security regression, state corruption, hidden-information leak, duplicate reward/currency award, inability to start/complete a match, or proven source/deployment mismatch.

## 5. Locked execution order from this checkpoint

Do not skip ahead and do not start a second slice while a prior slice is unresolved.

1. **Plan/ledger reconciliation** — make this file + ledger + PR description agree on Release 1 scope and current truth.
2. **Capability/owner closeout** — reconcile the stale capability inventory against current owners/tests; repair only launch-used gaps.
3. **Edge parity** — exact-source transport/deploy/readback for the three TCG functions.
4. **Two-user E2E** — execute the full real journey and log defects by owner.
5. **Bounded repairs only if E2E proves them** — one owner / one defect / one test fence at a time.
6. **Final exact-head gate** — all CI + reviews + DB + Edge + E2E green together.
7. **Merge/live** — PR #549 -> `main`, then live smoke and release checkpoint.
8. **Post-release queue begins only after Release 1 is accepted** — Fairy, Underworld, Packs, Shop, Trading, Battle Pass and later content.

## 6. Mandatory repair process — every future fix

Use this sequence exactly:

**PROVE -> OWNER -> PATCH -> TEST -> ACCEPT -> DEPLOY (if required) -> LOG**

- **PROVE:** reproduce or identify the exact defect at the current head/environment.
- **OWNER:** choose the existing ledger owner. Do not create a helper/engine unless the ledger proves no rightful owner exists.
- **PATCH:** smallest generic fix in that owner; preserve unrelated working behavior.
- **TEST:** owner unit/contract tests + TCG Card Pass/Smoke/Migration gates as applicable.
- **ACCEPT:** exact diff/head review; no stale PASS evidence.
- **DEPLOY:** only when production parity is part of the slice and exact accepted source is transportable.
- **LOG:** update the ledger row with head SHA, evidence, remaining debt and next allowed operation.

A failed test means HOLD for that slice, not a new architecture pass. A production mismatch means parity/deployment investigation first, not source rewriting.

## 7. Reopen rules

A completed owner/gate may be reopened only by one of:

- a failing exact-head test tied to it;
- a real E2E reproduction tied to it;
- a production source/schema mismatch tied to it;
- a security/hidden-information defect tied to it;
- Trev explicitly changing a rule/scope requirement.

Old comments, old percentages, old capability labels or historical branch state cannot reopen completed work by themselves.

## 8. Progress meter

Release gates: **G0 ✅ | G1 ✅ | G2 ✅ | G3 🔎 | G4 🔎 | G5 ☐ | G6 ☐ | G7 ☐**

This is the only release progress meter. It deliberately does not translate the eight gates into a misleading implementation percentage.
