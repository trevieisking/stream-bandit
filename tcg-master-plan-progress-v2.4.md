# Stream Bandit TCG — Canonical Master Plan V2.4

**Plan date:** 2026-09-17  
**Status:** canonical release-readiness rebaseline and application-layer continuation  
**Inherits:** `tcg-master-plan-progress-v2.3.md` in full except where V2.4 explicitly supersedes readiness/order/status  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.md`  
**Canonical source rebaseline:** `main` @ `24fe6d0feff7c7298ffb474887ae8eef2dc8b44f`  
**Previous canonical files proven on main:** `tcg-master-plan-progress-v2.3.md`, `tcg-master-plan-ledger-v2.3.md`  
**Release decision:** HOLD public/live/production until the release gates in this plan pass.

---

## 0. Why V2.4 exists

V2.3 correctly established the evergreen, extensible, data-driven game architecture. Subsequent work also added important setup, matchmaking, V2 battle-client and board-route foundations.

However, the latest real two-user journey changed the release-readiness assessment:

- the journey reached the battle path;
- substantial server-side functions and data paths were therefore demonstrably present;
- the user could not complete Attack correctly;
- that journey therefore did **not** prove a playable release match;
- source/contract success must no longer be used as a proxy for full two-user playability.

V2.4 puts the project back onto the plan board with explicit evidence classes, exact gameplay acceptance gates, and the release-shell/account/social work separated from core match proof.

### No invented diagnosis

The failed Attack journey proves a release blocker exists. It does **not**, by itself, prove which remaining Attack/runtime/client defect is responsible.

The next repair must be based on exact captured evidence from the failing path. Do not change Attack rules merely because the visible symptom was “Attack did not work.”

---

## 1. Canonical continuity correction

Current `main` is the source of truth for this rebaseline.

At this checkpoint the canonical plan/ledger files actually present on current `main` are:

- `tcg-master-plan-progress-v2.3.md`;
- `tcg-master-plan-ledger-v2.3.md`.

Some later PR descriptions referenced V2.3.3/V2.3.4 control filenames. Those references are useful historical evidence, but files not present on current `main` cannot silently become current-main authority.

Open/stale PR #564 contains substantial planning/research work. It remains useful evidence, but V2.4 does not inherit unmerged branch state automatically.

### V2.4 continuity rule

For every future checkpoint:

1. refresh current `main` or the exact active PR head;
2. read the control files actually present at that ref;
3. make Master Plan, Ledger and Checklist agree at the same exact SHA;
4. never infer a control version from a PR description alone;
5. never mark implementation complete because a planning document describes it;
6. keep GitHub exact source/commit/CI evidence as repository truth;
7. keep Supabase deployed state as live backend truth.

If Master Plan, Ledger and Checklist disagree, the checkpoint is HOLD.

---

## 2. Evidence/status model — LOCKED

V2.4 uses three separate technical states. They must not be collapsed into one progress percentage.

### 2.1 Source/server capability present

Code, SQL, Edge functions, schema, tests or shared engines exist and can plausibly support the feature.

This state answers:

> “Do we appear to have the machinery?”

It does **not** answer:

> “Can two real players complete the feature through the release client?”

### 2.2 End-to-end behavior proven

Two production-shaped clients/users can execute the feature through the authoritative server path and both observe the correct synchronized result.

This state requires the correct visible and server state, not merely a green unit/contract test.

### 2.3 Release ready

End-to-end behavior is proven and the surrounding product/security/UX/deployment gates are satisfied.

A system can therefore be:

- source-present but E2E-unproven;
- E2E-proven but not yet release-ready;
- release-ready only after all applicable gates pass.

### Status marks

- ✅ accepted/proven at the stated evidence level;
- 🧪 source/server foundation present, release behavior still unproven;
- 📋 planned requirement;
- ⛔ blocked/failed gate;
- 🔒 promotion HOLD.

---

## 3. Current factual baseline

### 3.1 Existing game/content foundation

V2.4 inherits V2.3's engine/system philosophy and evergreen architecture.

The project already has substantial TCG data and server-side machinery. This includes, among other established areas:

- structured card identities/printings;
- collections and decks;
- starter decks;
- rooms/matchmaking containers;
- match players/events/commands/views/private state;
- grants/reward configuration;
- server-authoritative match mutation boundaries;
- shared TCG mechanic owners/engines developed through the earlier runtime pass.

This is why the project should be repaired and completed, not rewritten as a second TCG backend.

### 3.2 Recent accepted source foundations on main

The following bounded source changes are accepted on current `main`:

- **PR #567 / G0R-08** — deck validation requires a setup-legal Creature;
- **PR #568 / G0R-09** — private-room Ready mutation/count is serialized per room;
- **PR #569** — V2 board client submits the existing generic `attack` intent from the active Creature card;
- **PR #570** — nested authoritative commit rejections are surfaced rather than silently treated as success;
- **PR #571 / V2-SHELL-01A** — active match is a board-only authenticated game route.

These prove useful source foundations. They do not prove V2-ATTACK-01 or full match playability.

### 3.3 Current critical blocker

**V2-ATTACK-01: ⛔ OPEN**

A real two-user V2 Attack must prove the complete path:

`visible Creature card intent → server legality → cost/payment → target/choice resolution → exactly-one authoritative state commit → damage/effects/listeners → defeat/Reward/promotion/Aftermath where applicable → turn progression → synchronized state on both clients`

Until that succeeds, public/live/production remains HOLD.

---

## 4. Architecture remains system/engine driven

V2.4 does not replace the existing 40-owner gameplay architecture.

The core rule remains:

> One canonical owner for each state transition; coordinators may call owners but must not become competing rule authorities.

Examples inherited from the accepted architecture include:

- Content Registry owns structured gameplay identity/content data;
- Card Printing / Art Metadata owns printings/variants;
- Collection owns player-owned game content;
- Deck Builder / Legality owns deck construction/format legality;
- Match Flow / Setup / Turn Lifecycle owns phase/timing progression where established;
- Creature/Evolution owns Creature lifecycle/evolution semantics;
- Attack owns Attack selection/resolution orchestration;
- Active Ability owns active Ability use;
- Tactic, Relic and Realm retain their own rule ownership;
- Essence Attachment / Cost / Payment own their respective resource transitions;
- Atomic Switch owns atomic switch context;
- Movement/Event/Heal listeners react generically rather than card-by-card;
- Card-Zone owns physical card transfers between zones;
- Reward Cards owns Reward movement/value consequences;
- Hidden Information owns visibility boundaries;
- Randomization owns authoritative random outcomes;
- Economy/Pack owners remain separate from battle rules.

### No helper sprawl

Where a repeated game operation is a real domain concern, implement/reuse a canonical system/engine rather than creating scattered card-specific helpers.

### No card-name/series-name branching

Future cards, moves, Abilities, decks, rules, types, elements, series and packs must continue to compose structured capabilities and shared owners.

### No fake owner #41

Account, directory, friends and administration are application/service concerns around the TCG. They do not automatically create a new numbered **gameplay** owner. First reuse/prove the existing account/social service authority; only introduce a new canonical service owner where an actual missing state transition requires it.

---

## 5. V2 two-user gameplay acceptance matrix — release authority

The next core-match phase is not “fix one Attack button and assume the game works.”

After the exact Attack defect is captured and repaired, the same production-shaped two-user journey must validate the whole required match loop.

### Identity / deck / pairing

1. Both users sign in through the approved shared Auth Gate.
2. Both users are valid TCG players.
3. Each user selects an owned legal deck.
4. Automatic Ranked matchmaking pairs exactly two eligible players.
5. Ranked exposes no join-code UX.
6. Both clients bind to the same authoritative match id and revision stream.

### Opening/setup

7. Toss winner and first/second choice are correct.
8. Opening hands and Rewards are created correctly.
9. Setup-legal Creature requirements are enforced.
10. Mulligans retry safely and terminate correctly.
11. Vanguard/Reserve placement is legal and synchronized.
12. Setup returns/ready transitions complete exactly once.

### Turn/resource actions

13. Active player/phase legality is correct.
14. Draw/shuffle/search preserve hidden-information boundaries.
15. Essence attachment is authoritative.
16. Cost and Payment are authoritative and atomic.
17. Withdraw/switch/forced switch use their canonical owners.
18. Evolution/overlay/placement legality uses the Creature/Evolution owner.

### Card action families

19. **V2-ATTACK-01** Attack passes the full end-to-end path.
20. Active Abilities resolve with correct receipts/limits.
21. Tactics resolve and resume correctly through choices/listeners.
22. Relics attach/remove and obey singleton/ownership semantics.
23. Realms persist/replace and apply effects through their owner.
24. Generic choices/listeners pause and resume the same resolution cursor without replay.

### Damage / state consequences

25. Ordinary attack damage, damage-counter placement and other damage semantics remain distinct where defined.
26. Healing and Shield semantics apply through canonical packets/owners.
27. Conditions/checkup/timed effects run at the correct lifecycle point.
28. Defeat scanning is coordinated once and does not duplicate card-zone transfers.
29. Reward collection is correctly ordered.
30. Mandatory promotion occurs correctly.
31. Aftermath/turn handoff occurs exactly once.

### Match completion / resilience

32. Deck-out and other win/loss conditions resolve correctly.
33. Both players see the same public outcome and only their permitted private information.
34. Result state is stable and can feed the release Result screen.
35. Refresh/reconnect returns to current authoritative state.
36. Stale revisions/rejected commits remain visible and do not produce duplicate mutation.

The Checklist is the executable acceptance board for these rows.

---

## 6. Attack repair protocol

V2-ATTACK-01 is the first release-critical gameplay lane.

### Before changing code

Capture from the next exact failure:

- both player identities/test seats without exposing secrets;
- match id;
- client-visible revision before intent;
- selected card/Attack slot;
- request payload shape;
- Edge response/status;
- authoritative result envelope;
- resulting command/event/state revision evidence;
- both clients' visible states after re-sync;
- any pending choice/listener/resolution state.

### Repair rule

Change only the smallest proven authority defect.

Do not:

- move Attack legality into the browser;
- reimplement Payment in the client;
- special-case a card id to make a test pass;
- bypass revision/nonce fences;
- retry mutations blindly after a rejection;
- add a parallel Edge/backend when an existing canonical owner can be repaired.

### Acceptance

A green source test is necessary where applicable but not sufficient. V2-ATTACK-01 closes only with a successful real two-user journey through the full path in Section 3.3.

---

## 7. Release application shell

The TCG is a game application, not one giant page and not the old private-alpha lab exposed as public release UI.

### 7.1 Locked route model

`Landing / Sign In → Game Home → Play / Ranked → Matchmaking → Opponent Found → Board-only Match → Result`

### 7.2 Signed-in outside-match surfaces

`Account · TCG Players/Friends · Collection · Deck Builder · Packs · Learn · Progress · Settings`

These surfaces may use the normal TCG application shell.

### 7.3 Active match boundary

The active match stays board-only:

- no normal site header/footer;
- no account/friends/menu management inside the active board;
- no matchmaking controls inside the active board;
- route binds to authoritative `match_id`;
- Creature card remains the primary gameplay control;
- searches/choices preserve board context rather than becoming debug forms.

**V2-SHELL-01A:** ✅ source accepted on main via PR #571.

**V2-SHELL-01B:** 📋 dedicated game screens and complete release journey remain to implement/prove.

### 7.4 Matchmaking

Reuse the existing automatic matchmaking authority.

Public Ranked requirements:

- choose legal deck;
- enter queue;
- wait/poll safely;
- pair with one eligible opponent;
- transition to Opponent Found / Match;
- do not display private join codes for Ranked.

Private/challenge modes may use different UX later, but must not contaminate Ranked/MMR semantics.

### 7.5 Audio

**V2-AUDIO-01 remains release-required.**

Background music, sound effects, mute/volume behavior and lifecycle behavior must be implemented and visibly tested before public release if included in the release design.

---

## 8. TCG Account System — application owner contract

The TCG must reuse Stream Bandit's working identity/auth infrastructure rather than creating another account universe.

### 8.1 Identity chain

`auth.users → sb_profiles → tcg_player_profiles`

Responsibilities:

- `auth.users` — authentication identity/session authority;
- `sb_profiles` — shared Stream Bandit display/profile identity;
- `tcg_player_profiles` — authoritative membership in Stream Bandit TCG plus TCG-specific progression/state.

A Stream Bandit account is **not automatically a TCG player**. TCG inclusion requires the TCG membership authority.

### 8.2 Reuse rules

Reuse where safe:

- existing Stream Bandit Auth Gate;
- password/session/recovery mechanisms;
- working Social Profile patterns;
- Owner Admin Hub administration patterns;
- reviewed account-deletion request infrastructure.

Do not build:

- second auth stack;
- second general profile database;
- TCG copies of working shared security primitives without a proven reason.

### 8.3 Account page requirements

Dedicated signed-in TCG Account page, outside active battle, should support only capabilities proven by existing authority, including:

- display of shared basic identity + TCG identity;
- sign out/session handling;
- password change/reset/recovery through approved auth authority;
- supported public/profile preferences;
- clear security/privacy/support links as appropriate;
- confirmation/re-auth for destructive operations where required.

Never expose private/admin fields such as permissions, internal admin notes, secrets or auth tokens.

---

## 9. Account lifecycle — TCG profile vs Stream Bandit account

The UI must distinguish two different destructive actions.

### 9.1 Leave/Delete TCG Profile

This removes/deactivates the player's TCG presence according to an accepted TCG retention policy while the wider Stream Bandit account may remain.

Before implementation, define exact behavior for:

- `tcg_player_profiles`;
- decks/deck cards;
- collection/owned printings;
- currencies/tokens/economy;
- progression/stats;
- grants/rewards;
- TCG friend/block relations;
- active/waiting matchmaking rooms;
- unfinished matches;
- historical match/event/audit references.

Historical integrity may require anonymization/retention rather than destructive deletion of records referenced by past matches.

### 9.2 Delete entire Stream Bandit account

This is a larger shared-account lifecycle and must use the approved reviewed account-deletion authority rather than a TCG client performing raw destructive auth deletion.

The existing `sb_account_deletion_requests` infrastructure is the starting foundation to review/reuse.

The labels must make the scope unmistakable.

---

## 10. TCG Player Directory — required public identity seam

The current ordinary TCG profile policy should not be weakened merely to let users search each other.

Create/reuse a narrow server-authoritative **TCG Player Directory** surface.

### 10.1 Membership filter

Only people who satisfy the TCG membership boundary may appear.

No automatic listing of every `sb_profiles` row.

### 10.2 Public-safe fields

Allow only approved public identity/game fields, for example:

- stable public TCG player identifier;
- username/display name;
- avatar;
- selected public TCG stats if design approves them.

Never expose:

- email;
- auth/session data;
- admin level/permissions;
- internal admin notes;
- private tokens/secrets;
- unrelated Stream Bandit private/social data.

### 10.3 Reusable consumers

One directory authority should later serve:

- TCG Players search;
- Friends;
- Challenges;
- Leaderboards;
- Tournaments;
- future trading/player lookup.

Do not create separate user-search implementations for each feature.

---

## 11. TCG Friends / Social System — isolated from general Stream Bandit friendships

The existing Stream Bandit Friends experience is valuable as a working UI/behavior blueprint.

But the existing general friendship table is not automatically the TCG graph.

### 11.1 Proven boundary

`sb_user_friends` currently has no TCG/game/product discriminator.

Therefore using it directly for the TCG Friends list could expose existing general Stream Bandit relationships as if they were TCG relationships.

The same scoping caution applies to `sb_user_blocks`.

### 11.2 Canonical TCG relationship requirements

Use one TCG-scoped friendship authority, such as `tcg_player_friends` or an equally safe existing/scoped equivalent after schema review.

Required invariants:

- requester and addressee are TCG players;
- self-request forbidden;
- duplicate/opposite pending races handled atomically;
- accepted relationship is unique;
- remove friend supported;
- block overrides/invalidates pending or active friendship according to accepted policy;
- discovery/privacy rules enforced server-side;
- abuse/rate limiting/anti-spam applied;
- relationship data never exposes unrelated Stream Bandit users.

### 11.3 Player-facing experience

Use **TCG Players** for discovery language.

The social surface should support:

- Find TCG Player;
- incoming requests;
- sent requests;
- accept;
- decline;
- cancel;
- friends list;
- remove friend;
- block/unblock;
- view public TCG Profile.

### 11.4 Notifications

Reuse approved notification infrastructure where possible, but TCG notifications must be scoped so unrelated Stream Bandit social events are not leaked into the TCG experience.

### 11.5 Future seams

Plan for, but do not falsely mark implemented:

- Challenge Friend;
- Invite to Match;
- tournaments;
- trading when the trading engine/owner exists;
- parties/guilds if later approved;
- spectating only if future rules/privacy explicitly permit it.

Social/challenge matchmaking remains separate from Ranked/MMR.

Presence/online status is optional and must not become a launch dependency unless existing infrastructure safely supports it.

---

## 12. TCG Administration

Reuse/adapt Owner Admin Hub patterns rather than creating a second arbitrary admin system.

TCG administration may need controlled actions for:

- TCG membership/profile state;
- approved moderation/suspension states;
- support/account-lifecycle review;
- visibility of safe TCG operational facts;
- audit evidence for administrative mutation.

It must not:

- automatically import all Stream Bandit users into TCG;
- expose general user private data merely because the operator is on a TCG screen;
- bypass existing role/permission/audit authority.

Exact admin actions remain an implementation audit item, not a completed feature.

---

## 13. Existing social/account infrastructure: reuse, do not conflate

V2.4 recognizes the existing working Stream Bandit foundations, including patterns/data for:

- profiles;
- friends;
- blocks;
- social settings;
- notifications;
- private messages;
- account-deletion requests;
- admin audit;
- social profile/admin UI.

These save substantial implementation time.

The reuse rule is:

> Reuse authentication, identity display, UI patterns, permissions/audit and generic infrastructure where safe; keep TCG membership and TCG relationship semantics explicitly scoped.

---

## 14. Collection / Deck / Pack / Progress application surfaces

V2.3's data-driven content/economy principles remain mandatory.

For release application work:

### Collection

Must display owned gameplay identities/printings without becoming rule authority.

### Deck Builder

Must use canonical server/data legality and owned-card state. Do not recreate legality rules in browser-only code.

### Packs

Future pack opening must use data-driven Pack owner recipes and authoritative collection/economy mutation; adding a pack must not require a per-pack Edge Function.

### Progress

Displays authoritative TCG progression/stats. It must not independently mutate wins/losses/XP/currency.

These surfaces are not considered release-proven merely because backing tables/functions exist.

---

## 15. Security / privacy rules

1. Keep RLS/server authority; do not weaken `tcg_player_profiles` RLS for convenience.
2. Public player search must be narrow and allowlisted.
3. Never expose email/auth/session/permissions/admin notes in public player data.
4. Client UI never becomes the only friendship/block/privacy enforcement.
5. Ranked matchmaking never exposes private join-code behavior as the normal queue.
6. Mutation requests remain authenticated and revision/idempotency fenced where applicable.
7. Account deletion/profile removal must have explicit scope and audit semantics.
8. Active-match private information stays seat-scoped.
9. Existing working Stream Bandit security systems should be reused rather than bypassed.

---

## 16. Release-gate order — V2.4 locked path

This order supersedes any earlier implication that the project could proceed directly from source foundations to public release.

### Phase 0 — Continuity rebaseline

- synchronize V2.4 Master Plan, Ledger and Checklist;
- keep exact main/PR SHA in every accepted checkpoint;
- treat unmerged stale planning as evidence, not source truth.

### Phase 1 — V2-ATTACK-01

- reproduce/capture exact two-user Attack failure;
- identify the smallest authoritative defect;
- repair on a bounded branch;
- run exact-head CI;
- repeat two-user Attack proof until full path succeeds.

### Phase 2 — Core two-user gameplay matrix

- prove setup through match completion across all release-required mechanic families;
- repair only proven gaps one bounded owner slice at a time;
- keep no duplicate owners/helpers.

### Phase 3 — Release shell completion

- Landing/Sign In;
- Game Home;
- Ranked/Matchmaking;
- Opponent Found;
- board-only Match;
- Result;
- outside-match navigation surfaces.

Shell can be developed in bounded parallel slices only when it does not obscure Phase 1/2 readiness. Shell completion never overrides a failed gameplay gate.

### Phase 4 — Account / TCG Player Directory / TCG Friends

- adapt shared Auth/Profile/Admin foundations;
- add TCG-only public directory boundary;
- add TCG-scoped relationship authority;
- implement account lifecycle semantics;
- security/RLS/privacy proof.

Features not required for the first playable test may be staged, but any Account/Friends UI shipped publicly must satisfy its security boundary.

### Phase 5 — Collection / Deck / Pack / Progress / Learn / Settings completion

- reuse existing data/engines;
- prove each product surface against its canonical owner.

### Phase 6 — Audio / polish / accessibility / device pass

- background music/SFX as required;
- touch + desktop parity;
- visible errors/loading/reconnect;
- accessibility for tap/select alternatives and controls.

### Phase 7 — Release candidate

Before public/live promotion:

- all release-critical Checklist rows checked;
- exact source SHA fixed;
- CI/checks green;
- deployed Supabase schema/functions match accepted release source where needed;
- two-user E2E passes on release-shaped client;
- security/privacy boundary reviewed;
- rollback point recorded;
- no hidden dependency on stale/unmerged branches.

---

## 17. Deployment / promotion policy

### Repository acceptance vs live promotion are separate decisions

A docs-only or source-only PR may safely merge while public/live remains HOLD.

### Supabase

Do not deploy migrations/Edge functions merely to make source and live “look synchronized.” Deploy only the accepted migration/function set needed by a proven release slice.

No new Supabase project/parallel paid backend is required by this plan.

### Live

No public/live promotion while V2-ATTACK-01 is open.

After Attack passes, the remaining release gates still apply.

---

## 18. What is complete vs what is not

### Accepted/planned authority

- ✅ V2.3 evergreen/extensibility philosophy inherited;
- ✅ current-main continuity rebaselined;
- ✅ system/engine ownership model retained;
- ✅ substantial server/source foundations acknowledged;
- ✅ board-only active match source exists;
- ✅ Account identity boundary defined;
- ✅ TCG Player Directory requirements defined;
- ✅ TCG Friends isolation requirements defined;
- ✅ account-lifecycle distinction defined;
- ✅ release acceptance matrix defined.

### Not yet release-proven

- ⛔ V2-ATTACK-01 real two-user Attack;
- 📋 complete two-user match matrix;
- 📋 complete release-shell journey;
- 📋 TCG Account page implementation;
- 📋 TCG Player Directory implementation;
- 📋 TCG Friends/block implementation;
- 📋 account/profile deletion implementation semantics;
- 📋 audio/polish release gate;
- 📋 final production-shaped E2E and deployment synchronization.

The project therefore retains a large amount of useful backend and engine work, but V2.4 deliberately reports release readiness conservatively until those gates are demonstrated.

---

## 19. Immediate next operation after V2.4 docs acceptance

**One thing only:** return to `V2-ATTACK-01` evidence capture on the release-shaped two-user V2 path.

Do not start another gameplay rewrite.

Do not move Account/Friends into the battle controller.

Do not deploy Supabase changes without a proven need.

Capture the exact failed Attack transaction first; then repair the owning layer and prove it end to end.

---

## 20. Canonical synchronization rule

For every accepted change from this point onward:

- update/mark the Checklist for the exact accepted gate;
- append the Ledger transaction/evidence;
- update the Master Plan only when scope/order/architecture/status changes;
- ensure all three agree before reporting the checkpoint as accepted;
- record exact GitHub SHA/PR/check evidence;
- distinguish repository acceptance from Supabase/live deployment.

**Current release decision:** 🔒 **HOLD public/live/production.**
