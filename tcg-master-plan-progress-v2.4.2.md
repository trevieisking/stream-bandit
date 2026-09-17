# Stream Bandit TCG — Canonical Master Plan V2.4.2

**Plan date:** 2026-09-17  
**Status:** simple release-shell navigation and complete Account / TCG Players / Friends page-map correction layered on V2.4.1  
**Inherits:** `tcg-master-plan-progress-v2.4.1.md` in full and the Account / Directory / Social owner boundaries from `tcg-master-plan-progress-v2.4.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.2.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.2.md`  
**Exact source base:** `main` @ `dacd0f2083b331cbdf0ea210d8f96a23aa952ed2`  
**Existing shell-layout authority:** `CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`  
**Release decision:** 🔒 HOLD public/live/production until inherited V2.4/V2.4.1 release gates pass.

---

## 0. Why V2.4.2 exists

V2.4 and V2.4.1 correctly identify the signed-in TCG application surfaces, but Account and TCG Players/Friends are still described mostly as broad destinations rather than a complete player-facing page map.

Trev's latest visual direction is to keep navigation simple, direct and game-like rather than building a complex nested application shell.

That direction also matches an already accepted Stream Bandit layout rule in `CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`:

1. Header shell;
2. page navigation pill rail directly under the header;
3. hero / page summary;
4. internal section tabs only when the current page genuinely needs them;
5. page content/output;
6. footer shell.

V2.4.2 therefore maps the missing TCG pages while preserving existing owner boundaries and the V2.4.1 visual-first battlefield priority.

This checkpoint does **not** change gameplay rules, runtime owners, Supabase production state or the active board-only match boundary.

---

## 1. V2-NAV-01 — simple TCG application shell

Outside an active match, use one obvious reusable TCG shell and one simple page rail. Do not create a second navigation framework, route maze or page-specific menu system.

### 1.1 Primary signed-in destinations

The existing V2 route authority is made explicit as a simple flat rail:

`Game Home · Play · Collection · Decks · Packs · Players · Friends · Learn · Progress · Settings · Account`

Naming notes:

- `Decks` is the player-facing label for the existing Deck Builder destination.
- `Players` is the player-facing label for TCG Player Directory/discovery.
- `Friends` is the TCG-scoped social destination.
- `Settings` remains a separate game/client-settings destination; Account must not silently absorb every game setting.
- No new `Shop` destination is introduced by this checkpoint; economy/shop routing remains governed by its existing/future canonical plan and owner.

### 1.2 Shell shape

Normal signed-in pages use:

`Header → primary TCG page rail → page hero/summary → optional internal tabs → page content → Footer`

Rules:

- page-to-page movement belongs in the rail;
- internal tabs are used only for sections of the current page;
- the current page is visibly active;
- mobile/touch may horizontally scroll or compact the rail without changing route meaning;
- no deep multi-level navigation is required for ordinary player journeys;
- existing theme variables/components should be reused rather than inventing a parallel visual system.

### 1.3 Active match remains different

The active battle stays board-only exactly as V2.4/V2.4.1 require:

- no normal header/footer;
- no Account/Friends management;
- no normal shell rail;
- no unrelated application chrome competing with the tabletop.

---

## 2. V2-ACCOUNT-PAGES-01 — complete Account page family

Account is one destination with a simple account rail. Pages may be laid out before every write owner exists, but an unavailable action must remain disabled/unwired rather than being connected to the wrong backend.

Canonical Account rail:

`Overview · Profile · Security · Privacy · Notifications · Preferences · Leave TCG · Delete Account`

### 2.1 Account Overview

Purpose:

- shared Stream Bandit display identity;
- TCG membership identity;
- approved TCG progression/stats summary;
- clear links to the other Account pages;
- session/sign-out affordance where appropriate.

Authority:

`auth.users → sb_profiles → tcg_player_profiles`

Never expose auth secrets, email to other players, permission internals, admin notes or private tokens.

### 2.2 Profile

Purpose:

- edit supported shared public profile fields through existing shared profile authority;
- show supported TCG-specific identity/progression fields;
- preview what a public TCG profile may expose once the Directory authority exists.

TCG directory/discovery visibility must not be implemented by weakening `tcg_player_profiles` RLS.

### 2.3 Security

Purpose:

- change password;
- reset/recover password where applicable;
- sign out / session handling;
- re-authentication flow before sensitive/destructive actions where required.

Authority:

- existing Stream Bandit/Supabase authentication mechanisms;
- no second TCG auth stack.

### 2.4 Privacy

Purpose:

- TCG discovery/profile visibility controls when a scoped authority exists;
- TCG block/unblock management when the TCG block owner exists;
- links/explanations for shared Stream Bandit profile/privacy settings where relevant.

Important boundary:

`sb_profile_social_settings` and `sb_user_blocks` are general Stream Bandit social infrastructure. They are useful implementation references, but they do not automatically become TCG discovery/block authority.

### 2.5 Notifications

Purpose:

- TCG-specific notification controls and history/preferences where approved;
- friend-request/game-related notification categories when implemented.

Existing shared notification infrastructure may be reused only with explicit TCG scoping so unrelated Stream Bandit social events are not leaked into the game surface.

### 2.6 Preferences

Purpose:

- account-scoped TCG preferences that do not belong in the top-level game/client Settings page.

Current evidence does not prove a canonical TCG account-preferences store. Do **not** use `sb_app_settings` as a personal preference store merely because it exists.

The implementation gate remains open until one safe existing authority is proven or one additive scoped owner is deliberately introduced.

### 2.7 Leave TCG

This is not whole-account deletion.

It removes/deactivates the TCG profile only after V2.4 retention/cleanup semantics are accepted for:

- TCG profile;
- decks/collection;
- currencies/progression/rewards;
- TCG friendships/blocks;
- queues/unfinished matches;
- historical match/audit references.

No raw delete button may be wired before those semantics are defined and tested.

### 2.8 Delete Account

This means the whole Stream Bandit account.

Use the reviewed shared account-deletion lifecycle beginning with `sb_account_deletion_requests`; the TCG client must not directly bypass that lifecycle.

The page must make the difference between **Leave TCG** and **Delete Stream Bandit Account** unmistakable.

---

## 3. V2-PLAYERS-PAGES-01 — TCG Player discovery pages

TCG Players is the reusable public-safe player discovery seam required by V2.4.

Canonical page family:

`Players · Public TCG Player Profile`

### 3.1 Players

Purpose:

- search/find only TCG members;
- show approved public-safe TCG identity fields;
- open public TCG profile;
- expose Friend action only after TCG social authority exists.

The page must never search every `sb_profiles` row as though every Stream Bandit user were a TCG player.

### 3.2 Public TCG Player Profile

Purpose:

- approved public display name/avatar;
- approved public TCG stats/progression only;
- friendship state/actions when implemented;
- future Challenge/Invite seam without mixing Ranked/MMR.

Never expose email, auth/session data, permission level, internal admin fields or private tokens.

---

## 4. V2-FRIENDS-PAGES-01 — complete Friends page family

Canonical Friends rail:

`Friends · Requests · Find Players · Blocked`

`Find Players` routes to the canonical Players directory rather than creating a second search implementation.

### 4.1 Friends

Purpose:

- accepted TCG friends only;
- open public TCG profile;
- remove friend;
- future Challenge/Invite action only when its owner exists.

### 4.2 Requests

One page may use simple internal tabs:

`Incoming · Sent`

Required actions when backend authority exists:

- send;
- accept;
- decline;
- cancel.

The UI must handle duplicate/opposite races safely through the server owner, not browser-only assumptions.

### 4.3 Find Players

This is a route/link to `Players`, not a duplicate directory implementation.

### 4.4 Blocked

Purpose:

- list TCG-scoped blocked players;
- block/unblock through the canonical TCG block authority;
- blocking overrides pending/active TCG friendship according to accepted server policy.

General Stream Bandit blocks must not silently appear as TCG blocks.

---

## 5. Production owner audit — 2026-09-17

Read-only production schema review at the V2.4.2 planning checkpoint established:

### Existing reusable/shared foundations

- `tcg_player_profiles` exists and remains the TCG membership boundary;
- `sb_account_deletion_requests` exists as the reviewed whole-account deletion workflow foundation;
- general Stream Bandit `sb_user_friends`, `sb_user_blocks`, `sb_profile_social_settings`, `sb_social_notifications` and profile/auth infrastructure exist as useful patterns/reusable shared infrastructure where safely scoped.

### Missing TCG-scoped owners that remain implementation prerequisites

No production table/routine was proven for:

- a TCG Player Directory authority;
- TCG-scoped friendships;
- TCG-scoped blocks;
- TCG-specific account preferences.

The current TCG-related social/player table inventory found `tcg_player_profiles` and `tcg_match_players`, but no `tcg_player_friends`, TCG block table or TCG directory table/routine.

### Important non-reuse boundary

`sb_user_friends` already has useful generic friendship mechanics, including request status and uniqueness guards, but V2.4 explicitly records that it has no TCG/product discriminator. It is a blueprint, **not** the TCG friendship graph.

The same scoping caution applies to `sb_user_blocks`.

---

## 6. V2.4.2 implementation order for these surfaces

This page-map checkpoint does not replace V2.4.1's immediate visual battlefield/renderer priority. It makes the surrounding application ready for bounded implementation slices.

When shell implementation reaches Account/Players/Friends, use this order:

1. reuse the existing accepted Stream Bandit page-rail visual pattern for TCG outside-match screens;
2. create route/page shells with disabled/unavailable states rather than fake writes;
3. implement/prove one server-authoritative TCG Player Directory seam;
4. implement one TCG-scoped friendship owner;
5. implement one TCG-scoped block owner;
6. reuse existing Auth/Profile authority for Account Overview/Profile/Security;
7. wire Friends/Requests/Blocked/Player Profile to those scoped owners;
8. scope notification reuse to TCG events;
9. prove or introduce one personal TCG Account Preferences owner if still required;
10. define/test Leave TCG retention semantics before enabling it;
11. wire whole-account deletion only through the reviewed shared deletion workflow;
12. test desktop/touch, privacy/RLS, signed-out/direct-route handling and normal shell navigation before release acceptance.

No gameplay owner #41 is created by this application-shell work.

---

## 7. Acceptance boundary

V2.4.2 accepts the **page map and owner boundaries**, not the implementation.

Accepted planning outcomes:

- ✅ simple flat TCG navigation direction;
- ✅ reuse of existing Stream Bandit page-rail visual convention;
- ✅ full Account page family mapped;
- ✅ TCG Players pages mapped;
- ✅ full Friends/Requests/Blocked page family mapped;
- ✅ Find Players reuses one Directory seam;
- ✅ general Stream Bandit friendships/blocks explicitly prevented from becoming the TCG graph by accident;
- ✅ destructive account scopes separated;
- ✅ missing TCG-scoped backend owners recorded as prerequisites.

Still open:

- ☐ page implementation;
- ☐ TCG Player Directory owner;
- ☐ TCG friendship owner;
- ☐ TCG block owner;
- ☐ TCG notification scoping;
- ☐ TCG account-preferences owner if retained;
- ☐ Leave TCG retention semantics;
- ☐ end-to-end privacy/security/navigation tests;
- ☐ inherited V2.4/V2.4.1 gameplay, visual and release gates.

**Current decision:** 🔒 **HOLD public/live/production.**