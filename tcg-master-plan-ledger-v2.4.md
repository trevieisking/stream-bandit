# Stream Bandit TCG — Master Plan V2.4 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.md`  
**Canonical checklist:** `tcg-master-plan-checklist-v2.4.md`  
**Previous canonical plan:** `tcg-master-plan-progress-v2.3.md`  
**Previous canonical ledger:** `tcg-master-plan-ledger-v2.3.md`  
**Rebaseline main SHA:** `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`  
**Owner-family baseline:** 40 gameplay owner families retained  
**Ledger revision:** V2.4-2 — 2026-09-17  
**Release decision:** 🔒 HOLD public/live/production

## Ledger rules

- V2.4 is append-only continuity over the V2.3 files proven on current `main`.
- GitHub exact source/commit/CI evidence is repository truth; Supabase deployed state is live backend truth.
- Unmerged/stale branch material is evidence only until explicitly revalidated into current-main continuity.
- A source/server capability is not automatically an end-to-end-proven feature.
- An end-to-end-proven feature is not automatically a release-ready product surface.
- Master Plan, Ledger and Checklist must carry the same gate/owner/scope/status at an accepted checkpoint.
- Existing gameplay owner boundaries stay authoritative; V2.4 does not create a fake owner #41 for application/account/social planning.

---

## V2.4 transactions

### V2.4-001 — Canonical control-file continuity rebaselined

**State:** ✅ ACCEPTED planning/control correction  
**Checklist:** V2.4-C01 through V2.4-C04

Fresh repository evidence established:

- current `main`: `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`;
- V2.3 plan present on `main`: `tcg-master-plan-progress-v2.3.md`;
- V2.3 ledger present on `main`: `tcg-master-plan-ledger-v2.3.md`;
- later PR descriptions referenced V2.3.3/V2.3.4 control filenames, but those references alone do not make missing/unmerged files current-main authority;
- open/stale PR #564 remains useful research/planning evidence but is not used as the write base for V2.4.

Decision:

- create one clean V2.4 continuity set from exact current `main`;
- do not write onto stale PR #564;
- require exact three-way Plan/Ledger/Checklist agreement going forward.

No runtime, database, Supabase or live change is part of this transaction.

---

### V2.4-002 — Release readiness rebaselined from real two-user evidence

**State:** ✅ ACCEPTED readiness correction / 🔒 release HOLD  
**Checklist:** V2.4-R01 through V2.4-R04

Observed journey accepted as evidence:

- two-user flow reached the battle path;
- substantial server-side foundations therefore exist and participated in the journey;
- Attack did not complete correctly;
- the journey is not a successful playable-match acceptance test.

Decision:

- stop treating accumulated source completeness as equivalent to release completeness;
- keep public/live/production HOLD;
- preserve existing working server systems and diagnose the exact remaining failure rather than rewrite the game.

No exact Attack root cause is asserted by this transaction.

---

### V2.4-003 — Three-level evidence model locked

**State:** ✅ LOCKED control rule  
**Checklist:** V2.4-R02 / V2.4-R03

Every material feature now carries one of three evidence levels:

1. **Source/server capability present** — machinery exists in code/schema/functions/tests.
2. **End-to-end behavior proven** — real production-shaped clients/users execute the feature through authoritative state and observe the correct result.
3. **Release ready** — E2E proof plus product/security/UX/deployment gates.

This prevents false progress caused by marking a backend primitive as though the whole user journey were finished.

---

### V2.4-004 — Recent current-main server/client foundations recorded without overclaim

**State:** ✅ SOURCE FOUNDATION / 🧪 E2E re-proof required  
**Checklist:** Section B “Existing source/server foundations”

Accepted current-main source checkpoints:

- PR #567 / G0R-08 — setup-legal Creature required by server deck validation;
- PR #568 / G0R-09 — private-room Ready mutation/count serialized per room;
- PR #569 — additive V2 Creature-card Attack intent client foundation;
- PR #570 — nested authoritative commit rejections surfaced to the V2 client;
- PR #571 / V2-SHELL-01A — board-only authenticated active-match route.

These remain valuable and are not reverted.

Their presence does not close V2-ATTACK-01 or the complete two-user gameplay matrix.

---

### V2.4-005 — V2-ATTACK-01 restored as first release-critical gameplay gate

**State:** ⛔ OPEN  
**Checklist:** V2.4-R05 / MATCH-12

Acceptance path:

`visible Creature card intent → server legality → cost/payment → target/choice resolution → exactly-one authoritative commit → damage/effects/listeners → defeat/Reward/promotion/Aftermath where applicable → turn progression → synchronized visible state on both clients`

Rules:

- capture exact failure evidence before another Attack repair;
- do not move legality/payment/damage rules into browser code;
- do not card-ID special-case the failing scenario;
- do not bypass revision/nonce/idempotency fences;
- change the smallest proven canonical owner defect;
- contract/unit tests support but do not replace real two-user proof.

V2-ATTACK-01 remains unchecked until this whole path succeeds.

---

### V2.4-006 — Complete two-user gameplay acceptance matrix established

**State:** 📋 ACTIVE RELEASE GATE  
**Checklist:** MATCH-01 through MATCH-25

The release match must be proven across:

- authentication/session;
- owned/legal deck selection;
- automatic Ranked matchmaking;
- authoritative match/revision binding;
- opening toss/first-second choice;
- opening hand/Rewards/setup/mulligan;
- Vanguard/Reserve placement/promotion;
- turn/phase ownership;
- draw/shuffle/search hidden information;
- Essence attachment;
- Cost/Payment;
- Attack;
- Active Ability;
- Tactic;
- Relic;
- Realm;
- Evolution;
- Withdraw/switch/forced switch;
- Conditions/checkup/timed effects;
- defeat/Reward/promotion;
- generic movement/heal/event listeners and choice resume;
- Aftermath/turn handoff;
- deck-out/win/loss/result;
- reconnect/stale-revision handling;
- synchronized public/private views for both players.

This matrix prevents one repaired Attack from being misreported as the entire game being release-ready.

---

### V2.4-007 — System/engine ownership remains canonical

**State:** ✅ LOCKED  
**Checklist:** Section I

The existing 40 gameplay owner-family architecture remains the starting authority.

V2.4 retains these principles:

- one canonical owner per state transition;
- coordinators call owners but do not duplicate them;
- Card-Zone owns physical transfers;
- Creature/Evolution owns Creature lifecycle/evolution semantics;
- Attack owns Attack orchestration;
- Active Ability, Tactic, Relic, Realm, Essence, Cost, Payment, Atomic Switch, listeners, Reward, Hidden Information, Randomization, Economy and Pack responsibilities remain separated according to the accepted architecture;
- future cards/moves/Abilities/decks/rules compose structured data/opcodes/capabilities rather than card-name/series branches;
- repeated domain behavior should be a reusable system/engine, not scattered helpers.

Account/social/application work does not itself create a numbered gameplay owner #41.

---

### V2.4-008 — Release shell route contract locked

**State:** ✅ architecture / 📋 implementation continuing  
**Checklist:** Section D

Locked route model:

`Landing / Sign In → Game Home → Play / Ranked → Matchmaking → Opponent Found → Board-only Match → Result`

Signed-in outside-match surfaces:

`Account · TCG Players/Friends · Collection · Deck Builder · Packs · Learn · Progress · Settings`

Boundaries:

- active match stays board-only;
- no normal site header/footer inside active battle;
- no Account/Friends/menu management inside active battle;
- no Ranked join-code UI;
- board binds to authoritative match identity/revision;
- Creature card remains primary game control.

V2-SHELL-01A source is accepted via PR #571.

V2-SHELL-01B and the full release journey remain open.

V2-AUDIO-01 remains a release requirement.

---

### V2.4-009 — TCG Account identity boundary accepted

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** ACCOUNT-PLAN-01 through ACCOUNT-PLAN-06

Canonical identity chain:

`auth.users → sb_profiles → tcg_player_profiles`

Responsibilities:

- auth/session authority stays with existing Stream Bandit authentication;
- `sb_profiles` remains shared basic Stream Bandit profile/display identity;
- `tcg_player_profiles` is authoritative membership in Stream Bandit TCG plus TCG-specific state.

Consequences:

- do not create a second auth stack;
- do not create a duplicate general profile universe;
- do not treat every Stream Bandit user as a TCG player;
- Account page lives outside active battle;
- reuse working Auth Gate, Social Profile and Owner Admin Hub patterns where safe.

No Account implementation is claimed complete by this transaction.

---

### V2.4-010 — TCG account lifecycle split accepted

**State:** ✅ PLANNING CONTRACT / 📋 destructive implementation open  
**Checklist:** ACCOUNT-LIFE-PLAN-01 / ACCOUNT-LIFE-PLAN-02

Two distinct operations are required:

1. **Leave/Delete TCG Profile** — TCG-scoped membership/data lifecycle while the wider Stream Bandit account can remain.
2. **Delete Entire Stream Bandit Account** — shared account lifecycle through the approved reviewed deletion authority.

The existing `sb_account_deletion_requests` system is the starting foundation for whole-account deletion review.

Before TCG-profile removal can ship, accepted semantics are required for:

- TCG profile;
- decks/deck cards;
- collection/printings;
- currencies/tokens;
- progression/stats;
- grants/rewards;
- TCG friendships/blocks;
- matchmaking queues;
- active matches;
- historical match/event/audit references.

The TCG client must not ambiguously label one operation “Delete Account” if it could mean either scope.

---

### V2.4-011 — TCG Player Directory required as narrow public identity authority

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** DIRECTORY-PLAN-01 through DIRECTORY-PLAN-04

Requirement:

- only TCG members appear;
- public-safe allowlisted fields only;
- do not weaken ordinary `tcg_player_profiles` RLS for convenience;
- never expose email, auth/session data, admin permissions/notes or private tokens/secrets.

One directory should later serve:

- TCG Players search;
- Friends;
- Challenges;
- Leaderboards;
- Tournaments;
- future Trade/player lookup.

Avoid one user-search implementation per feature.

---

### V2.4-012 — TCG Friends/Social isolation accepted

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** SOCIAL-PLAN-01 through SOCIAL-PLAN-06

Verified design boundary:

- existing Stream Bandit Friends experience is a reusable blueprint;
- existing `sb_user_friends` has no TCG/game/product scope discriminator and therefore must not be assumed to be the TCG friend graph;
- existing `sb_user_blocks` carries the same scoping caution;
- both sides of a TCG relationship must satisfy TCG membership;
- player-facing discovery uses **TCG Players** rather than general Stream Bandit users;
- social/challenge matchmaking stays separate from Ranked/MMR.

Planned canonical TCG social capabilities:

- Find TCG Player;
- incoming/sent requests;
- accept/decline/cancel;
- friends list/remove;
- block/unblock;
- public TCG profile view;
- privacy/discovery controls;
- duplicate/self/race guards;
- anti-spam/rate limiting;
- safely scoped notifications;
- future Challenge/Invite/Trade/Tournament/Party seams.

A dedicated `tcg_player_friends`/`tcg_player_blocks` pattern is a likely implementation, but final table/authority naming must follow an exact schema/ownership review before migration.

No TCG Friends implementation is claimed complete by this transaction.

---

### V2.4-013 — TCG Administration reuse boundary accepted

**State:** ✅ PLANNING CONTRACT / 📋 implementation audit open  
**Checklist:** ADMIN-PLAN-01 through ADMIN-PLAN-03

Reuse/adapt Owner Admin Hub patterns for TCG player administration where appropriate.

Requirements:

- TCG administration acts on TCG membership/profile state;
- general Stream Bandit users are not automatically imported into TCG;
- public directory excludes private/admin fields;
- existing permission/audit authorities are preserved;
- exact TCG admin actions remain to be audited before implementation.

---

### V2.4-014 — Shared social/account infrastructure classified for reuse

**State:** ✅ ARCHITECTURE DECISION

Existing Stream Bandit foundations save implementation time and should be reused where their scope is correct, including patterns/data around:

- profiles;
- authentication/session;
- social settings;
- friends/blocks as general Stream Bandit reference implementations;
- notifications;
- private messaging;
- account deletion requests;
- admin audit;
- Social Profile UI;
- Owner Admin Hub UI/permissions patterns.

Reuse rule:

> Reuse generic identity/security/UI/audit infrastructure; keep TCG membership and TCG relationship semantics explicitly scoped.

---

### V2.4-015 — Security/privacy boundary locked for account/social work

**State:** ✅ LOCKED requirement

- Do not weaken `tcg_player_profiles` RLS merely to support search.
- Public TCG directory data is allowlisted and server-authoritative.
- Email/auth/session/admin/private fields never become public player data.
- Friendship/block/privacy invariants must be enforced server-side, not only in UI.
- Ranked matchmaking remains separate from private/challenge semantics.
- account deletion/profile removal requires explicit scope, confirmation and audit/retention behavior.
- active match retains seat-scoped private information.

Any Account/Friends UI included in release must pass these boundaries before public promotion.

---

### V2.4-016 — Release execution order corrected

**State:** ✅ LOCKED ORDER

1. Synchronize V2.4 Plan/Ledger/Checklist.
2. Return to V2-ATTACK-01 exact evidence capture.
3. Repair only the proven owning defect.
4. Prove real two-user Attack end to end.
5. Execute the complete two-user match acceptance matrix one bounded gap at a time.
6. Complete release-shell journey without moving game rules into shell/client code.
7. Implement/reuse Account / TCG Player Directory / TCG Friends with explicit isolation/security.
8. Complete Collection / Deck / Pack / Learn / Progress / Settings surfaces against their canonical owners.
9. Complete audio/polish/accessibility/device pass.
10. Build exact release candidate, verify CI/deployed Supabase synchronization/rollback, then decide public/live promotion.

Shell/account work may proceed in bounded slices when it does not obscure the failed gameplay gate, but no amount of shell progress closes V2-ATTACK-01.

---

### V2.4-017 — Deployment and promotion separation reaffirmed

**State:** ✅ LOCKED

Repository acceptance and live deployment are separate decisions.

- docs/source PRs may merge when their own gates pass;
- Supabase changes deploy only when required by an accepted implementation slice;
- no duplicate/parallel paid backend is introduced by this plan;
- public/live/production stays HOLD while V2-ATTACK-01 is open;
- after Attack passes, all other applicable Checklist release gates still apply.

---

### V2.4-018 — Current V2 card-owned Attack click path behaviorally proven

**State:** ✅ SOURCE-PATH PROOF / 🧪 real two-user Attack still required  
**Checklist:** V2-ATTACK-SOURCE-01  
**Pull request:** #573  
**Behavioral-test head:** `fdf227159c2031fc1a1968bc3f624c93c80e6624`  
**Validation:** TCG Card Pass 2 Validation #625 — SUCCESS

The new executable browser harness runs the real `stream-bandit-tcg-v2-battle-controller.js` rather than only matching source text. It proves that a playable structured Creature card:

- renders its card-owned Attack control;
- binds the real click listener;
- submits exactly one request to `tcg-match-actions`;
- sends `action='attack'`, `attack_slot`, `match_id`, a unique `client_nonce` and the visible `expected_revision`;
- recognizes a logical nested authoritative rejection even when the outer HTTP/result envelope is successful;
- re-syncs authoritative match state after that rejection;
- leaves the rejection reason visible to the player.

This materially closes the source-test gap between “the wiring text exists” and “the current controller actually executes that wiring.”

It does **not** close V2-ATTACK-01. Yesterday's exact rejected response was not persisted, so this transaction does not claim that the nested-result transport defect was the sole historical root cause. A fresh two-user V2 match must still prove an accepted Attack commit, payment/damage/effects and synchronized visible result.

No runtime, game-rule, Edge Function, migration or Supabase change is part of this source-path proof.

---

## Current progress board

| Area | State | Release meaning |
|---|---|---|
| V2.3 evergreen/extensible architecture | ✅ accepted | retained |
| Current-main continuity | ✅ rebaselined | V2.4 is new canonical continuation |
| Server/source foundations | 🧪 substantial | useful, not whole-match proof |
| V2 Attack card-click transport | ✅ behaviorally proven in source | fresh two-user authoritative Attack still required |
| Board-only active match route | ✅ source accepted | V2-SHELL-01A complete in source |
| V2-ATTACK-01 | ⛔ open | blocks public/live |
| Full two-user gameplay matrix | 📋 open | required release proof |
| Complete release shell | 📋 open | V2-SHELL-01B onward |
| TCG Account requirements | ✅ planned | implementation open |
| TCG Player Directory | ✅ planned | implementation open |
| TCG Friends isolation | ✅ planned | implementation open |
| TCG Administration reuse | ✅ planned | implementation audit open |
| Audio/polish | 📋 open | release gate |
| Public/live/production | 🔒 HOLD | no promotion |

---

## Next ledger transaction

After this source-path proof is accepted, the next gameplay transaction remains the exact **V2-ATTACK-01 fresh two-user evidence capture / smallest-proven-repair** lane.

Do not start a broad runtime rewrite and do not let Account/Friends work enter the battle controller. If the fresh two-user Attack succeeds, capture and mark that E2E evidence before moving to the rest of MATCH-01 through MATCH-25. If it fails, capture the exact authoritative request/response/revision evidence before changing gameplay owners.