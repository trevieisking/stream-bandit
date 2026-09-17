# Stream Bandit TCG — Master Plan Checklist V2.4

**Canonical plan:** `tcg-master-plan-progress-v2.4.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.md`  
**Inherits:** `tcg-master-plan-progress-v2.3.md` and `tcg-master-plan-ledger-v2.3.md` from `main`  
**Rebaseline source SHA:** `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`  
**Checklist date:** 2026-09-17  
**Release state:** HOLD until the unchecked release-critical items below are proven.

## Status meanings

- `[x]` = evidence accepted at the stated source/checkpoint.
- `[ ]` = not yet proven/implemented; never infer completion from nearby working infrastructure.
- Source-present and end-to-end-proven are different states.
- Master Plan, Ledger and Checklist must use the same owner names, gate IDs, scope and status before a checkpoint can be accepted.

---

## A. Continuity / source-of-truth reconciliation

- [x] **V2.4-C01** Refresh current `main` before planning: `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`.
- [x] **V2.4-C02** Read the canonical V2.3 plan and V2.3 ledger that actually exist on current `main`.
- [x] **V2.4-C03** Treat unmerged/stale PR #564 as research/planning evidence only, not as current-main authority.
- [x] **V2.4-C04** Record that later PR descriptions referenced V2.3.3/V2.3.4 control filenames that are not present on current `main`; V2.4 normalizes continuity against files that are actually committed to `main`.
- [x] **V2.4-C05** V2.4 Master Plan written and cross-checked against this checklist.
- [x] **V2.4-C06** V2.4 Execution Ledger written and cross-checked against this checklist.
- [x] **V2.4-C07** Three-way Master Plan ↔ Ledger ↔ Checklist consistency check complete.

---

## B. Release-readiness rebaseline after the failed two-user journey

- [x] **V2.4-R01** Record the observed test result accurately: the two-user journey reached the battle path, but Attack did not complete correctly; therefore the test is not release acceptance.
- [x] **V2.4-R02** Record that substantial server-side foundations already exist; do not equate those foundations with proven playable end-to-end behavior.
- [x] **V2.4-R03** Separate three statuses everywhere: **server/source capability present**, **end-to-end behavior proven**, and **release ready**.
- [x] **V2.4-R04** Keep public/live/production promotion on HOLD after the failed Attack journey.
- [ ] **V2.4-R05 / V2-ATTACK-01** Two real users complete a server-authoritative Attack from visible card intent through legality/cost/target, exactly-one state commit, damage/effects/listeners, defeat/Aftermath/turn progression, and synchronized visible state.
- [ ] **V2.4-R06** Capture exact evidence from the next failed or successful two-user Attack attempt before changing Attack rules/runtime.
- [ ] **V2.4-R07** Run the complete two-user gameplay acceptance matrix, not Attack alone, before calling the match experience release-ready.

### Existing source/server foundations already on `main`

These items prove useful foundations exist. They do **not** tick V2-ATTACK-01 or release readiness by themselves.

- [x] **G0R-08 / PR #567** Server deck validation requires at least one setup-legal Creature.
- [x] **G0R-09 / PR #568** Private-room Ready write/count is serialized per room.
- [x] **PR #569** Additive V2 board client can submit the existing generic `attack` intent from the active Creature card.
- [x] **PR #570** V2 transport surfaces nested authoritative commit rejections instead of silently treating them as success.
- [x] **V2-SHELL-01A / PR #571** Active match page is a board-only authenticated route.
- [ ] These source foundations have been re-proven together in a successful real two-user V2 match.

---

## C. Two-user core gameplay acceptance matrix

Every row must be demonstrated through the same production-shaped client/server authority boundary. A unit/contract test can support a row but cannot replace the two-user proof where visible interaction is required.

- [ ] **MATCH-01** Sign in/session gate works for both test players.
- [ ] **MATCH-02** Each player can select/submit a legal owned deck.
- [ ] **MATCH-03** Automatic Ranked matchmaking pairs exactly two eligible players without exposing join codes.
- [ ] **MATCH-04** Both clients bind to the same authoritative match and revision stream.
- [ ] **MATCH-05** Opening toss/first-second choice works.
- [ ] **MATCH-06** Opening hand, Rewards and legal setup complete for both players.
- [ ] **MATCH-07** Mulligan/setup retry path works without deadlock.
- [ ] **MATCH-08** Vanguard/Reserve placement and promotion are correct.
- [ ] **MATCH-09** Turn ownership and legal phase/action gating are correct.
- [ ] **MATCH-10** Draw/shuffle/search operations preserve hidden-information boundaries.
- [ ] **MATCH-11** Essence attachment and all payment/cost checks are server-authoritative.
- [ ] **MATCH-12 / V2-ATTACK-01** Attack resolves end to end and visibly updates both clients.
- [ ] **MATCH-13** Active Ability use/receipts/choices resolve end to end.
- [ ] **MATCH-14** Tactics resolve, including choices/listeners, without replay/duplicate effects.
- [ ] **MATCH-15** Relic attach/remove/singleton semantics resolve correctly.
- [ ] **MATCH-16** Realm play/replacement/persistence resolves correctly.
- [ ] **MATCH-17** Evolution/overlay/placement legality resolves correctly.
- [ ] **MATCH-18** Withdraw/switch/forced-switch semantics resolve correctly.
- [ ] **MATCH-19** Conditions/checkup/timed damage or healing resolve at the correct lifecycle checkpoint.
- [ ] **MATCH-20** Defeat scan, Reward collection and mandatory promotion are atomic and correctly ordered.
- [ ] **MATCH-21** Generic movement/heal/event listeners pause, choose, resume and do not replay prior effects.
- [ ] **MATCH-22** Turn handoff/Aftermath completes exactly once after Attack/resolution.
- [ ] **MATCH-23** Deck-out/win/loss/end-of-match result resolves correctly.
- [ ] **MATCH-24** Refresh/reconnect/revision-conflict handling returns to authoritative visible state without duplicate mutation.
- [ ] **MATCH-25** Both players finish the same match with synchronized public/private information boundaries intact.

---

## D. Release shell

Locked route model:

`Landing / Sign In → Game Home → Play / Ranked → Matchmaking → Opponent Found → Board-only Match → Result`

Signed-in outside-match surfaces:

`Account · TCG Players/Friends · Collection · Deck Builder · Packs · Learn · Progress · Settings`

- [x] **V2-SHELL-01A** Board-only active match source exists on `main`.
- [ ] **V2-SHELL-01B** Dedicated Landing / Game Home / Ranked / Matchmaking / Opponent Found / Result screens are mapped and implemented without adding navigation chrome to the active board.
- [ ] **V2-SHELL-02** Existing automatic matchmaking authority is wired into the release client journey.
- [ ] **V2-SHELL-03** Result screen consumes authoritative match outcome and returns safely to Game Home.
- [ ] **V2-AUDIO-01** Required background music/SFX/audio behavior is implemented and release-tested.
- [ ] **V2-SHELL-04** Desktop and touch journeys pass visible interaction review.

---

## E. TCG Account System — planned, not implemented by this checklist

Shared identity model:

`auth.users → sb_profiles → tcg_player_profiles`

- [x] **ACCOUNT-PLAN-01** Reuse the existing Stream Bandit Auth Gate; do not create a second authentication stack.
- [x] **ACCOUNT-PLAN-02** `sb_profiles` remains shared basic Stream Bandit identity/profile data.
- [x] **ACCOUNT-PLAN-03** `tcg_player_profiles` is the authoritative TCG membership boundary.
- [x] **ACCOUNT-PLAN-04** General Stream Bandit users without a `tcg_player_profiles` row must not automatically appear as TCG players.
- [x] **ACCOUNT-PLAN-05** Account page remains outside the active board-only match.
- [x] **ACCOUNT-PLAN-06** Reuse working Social Profile / Owner Admin Hub patterns where safe rather than cloning another account system.
- [ ] **ACCOUNT-IMPL-01** Dedicated TCG Account page implemented.
- [ ] **ACCOUNT-IMPL-02** Change/reset password, sign-out and session handling are wired through existing auth authority.
- [ ] **ACCOUNT-IMPL-03** Supported profile settings are wired without exposing admin/private fields.
- [ ] **ACCOUNT-IMPL-04** Destructive actions require clear confirmation/re-auth where appropriate.

### Account lifecycle boundary

- [x] **ACCOUNT-LIFE-PLAN-01** `Delete/Leave TCG Profile` and `Delete Entire Stream Bandit Account` are separate concepts.
- [x] **ACCOUNT-LIFE-PLAN-02** Existing `sb_account_deletion_requests` is the reviewed whole-Stream-Bandit-account deletion foundation; the TCG client must not silently bypass it.
- [ ] **ACCOUNT-LIFE-IMPL-01** Define and test TCG-profile removal semantics for decks, collection, currencies, progression, rewards, TCG friends/blocks, matchmaking queues and historical match references.
- [ ] **ACCOUNT-LIFE-IMPL-02** Implement TCG-profile removal only after those retention/cleanup rules are accepted.
- [ ] **ACCOUNT-LIFE-IMPL-03** Whole-account deletion path is explicitly labelled and routed through the approved shared lifecycle.

---

## F. TCG Player Directory — planned, not implemented by this checklist

- [x] **DIRECTORY-PLAN-01** Directory membership requires a corresponding `tcg_player_profiles` row.
- [x] **DIRECTORY-PLAN-02** Directory returns only public-safe TCG player fields; never email, auth secrets, admin notes, permission data or private tokens.
- [x] **DIRECTORY-PLAN-03** Do not weaken current `tcg_player_profiles` RLS merely to enable player search.
- [x] **DIRECTORY-PLAN-04** Directory is the reusable public lookup seam for Friends, Challenges, Leaderboards, Tournaments and future Trades.
- [ ] **DIRECTORY-IMPL-01** Server-authoritative public TCG Player Directory view/RPC/Edge authority implemented using existing security conventions.
- [ ] **DIRECTORY-IMPL-02** Find TCG Player UI implemented with privacy/discovery rules.

---

## G. TCG Friends / Social — planned, TCG-isolated

- [x] **SOCIAL-PLAN-01** Existing Stream Bandit Friends UI/behavior is a reusable blueprint.
- [x] **SOCIAL-PLAN-02** Existing unscoped `sb_user_friends` is **not** the TCG friendship graph because it has no game/product discriminator.
- [x] **SOCIAL-PLAN-03** Existing unscoped `sb_user_blocks` must not be assumed to be TCG-scoped.
- [x] **SOCIAL-PLAN-04** Player-facing discovery terminology is **TCG Players**; do not expose/import the general Stream Bandit user population.
- [x] **SOCIAL-PLAN-05** Both sides of a TCG relationship must satisfy the TCG membership boundary.
- [x] **SOCIAL-PLAN-06** TCG social/challenge queues remain separate from Ranked/MMR.
- [ ] **SOCIAL-IMPL-01** Implement one canonical TCG-scoped friendship authority (for example `tcg_player_friends` or an equally safe scoped equivalent after schema review).
- [ ] **SOCIAL-IMPL-02** Implement one canonical TCG-scoped block authority or prove an existing safely scoped equivalent.
- [ ] **SOCIAL-IMPL-03** Send/accept/decline/cancel requests.
- [ ] **SOCIAL-IMPL-04** Friends list/remove friend.
- [ ] **SOCIAL-IMPL-05** Block/unblock with block overriding pending/active friendship.
- [ ] **SOCIAL-IMPL-06** Privacy/discovery rules, duplicate/self/race guards and anti-spam/rate limits.
- [ ] **SOCIAL-IMPL-07** TCG social notifications use/reuse approved notification infrastructure without leaking unrelated Stream Bandit social data.
- [ ] **SOCIAL-IMPL-08** TCG profile view from TCG Player/Friend result.
- [ ] **SOCIAL-FUTURE-01** Challenge Friend / Invite to Match seam.
- [ ] **SOCIAL-FUTURE-02** Trading/tournament/party/guild seams only when their owning systems exist.

---

## H. TCG Administration — planned reuse

- [x] **ADMIN-PLAN-01** Reuse/adapt Owner Admin Hub patterns rather than build an unrelated admin authority.
- [x] **ADMIN-PLAN-02** TCG administration manages TCG membership/profile state without automatically importing all Stream Bandit users into the game.
- [x] **ADMIN-PLAN-03** Administrative/private fields stay outside the public TCG Player Directory.
- [ ] **ADMIN-IMPL-01** Exact TCG admin actions/permissions audited against existing owner/admin infrastructure.
- [ ] **ADMIN-IMPL-02** Required TCG player-management actions implemented with audit evidence.

---

## I. Content and long-term extensibility — inherited and still mandatory

- [x] Evergreen/no-age-rotation philosophy inherited from V2.3.
- [x] Generic capability composition instead of card-name/series-name runtime branches inherited from V2.3.
- [x] Existing 40 gameplay-owner architecture remains the starting authority.
- [x] New Account/Directory/Social planning does not create a fake gameplay owner #41; reuse/prove service ownership before numbering any new owner.
- [ ] Future moves, Abilities, cards, decks, rules, elements, series, packs and social features continue to pass owner/extensibility checks as they are added.

---

## J. Release gate — all must be true before public/live promotion

- [ ] Master Plan ↔ Ledger ↔ Checklist agree at exact reviewed SHA.
- [ ] No release-critical item above is incorrectly marked complete.
- [ ] V2-ATTACK-01 passes with real two-user evidence.
- [ ] Complete two-user gameplay acceptance matrix reaches the required release baseline.
- [ ] Release shell journey passes end to end.
- [ ] Account/TCG Player exposure boundaries are secure for any account/social screens included in release.
- [ ] Audio/polish gate passes.
- [ ] Exact-head CI/checks are green.
- [ ] Supabase deployed functions/migrations match the accepted release source where deployment is required.
- [ ] Rollback/recovery point is recorded before deployment.

**Current decision:** 🔒 **HOLD public/live/production.**
