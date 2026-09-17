# Stream Bandit TCG — Master Plan Checklist V2.4.2

**Canonical plan:** `tcg-master-plan-progress-v2.4.2.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.2.md`  
**Inherits:** `tcg-master-plan-checklist-v2.4.1.md` in full plus the Account / Directory / Social gates in `tcg-master-plan-checklist-v2.4.md`  
**Exact source base:** `main` @ `dacd0f2083b331cbdf0ea210d8f96a23aa952ed2`  
**Checklist date:** 2026-09-17  
**Release state:** 🔒 HOLD public/live/production.

## Status meanings

- `[x]` = planning/evidence accepted at the stated checkpoint.
- `[ ]` = implementation or release evidence still required.
- Page layout acceptance does not prove backend ownership or end-to-end behavior.
- Master Plan, Ledger and Checklist must agree at the same accepted SHA.

---

## A. V2-NAV-01 — simple TCG shell

- [x] **NAV-PLAN-01** Reuse the accepted Stream Bandit page pattern: Header → page rail → hero/summary → optional internal tabs → content → Footer.
- [x] **NAV-PLAN-02** Use one simple outside-match TCG navigation system rather than a second menu framework.
- [x] **NAV-PLAN-03** Primary signed-in destinations are `Game Home · Play · Collection · Decks · Packs · Players · Friends · Learn · Progress · Settings · Account`.
- [x] **NAV-PLAN-04** `Decks` is the player-facing label for Deck Builder; `Players` is the TCG Directory surface.
- [x] **NAV-PLAN-05** Do not invent a new Shop route in this checkpoint.
- [x] **NAV-PLAN-06** Active match remains board-only with no normal TCG header/footer/page rail.
- [x] **NAV-PLAN-07** Mobile/touch may scroll/compact the rail without changing route meaning.
- [ ] **NAV-IMPL-01** Shared TCG outside-match shell implemented using the accepted rail pattern.
- [ ] **NAV-IMPL-02** Every primary destination has a real route or an explicitly gated unavailable state; no dead/stale links.
- [ ] **NAV-IMPL-03** Current route is visibly active and keyboard/touch accessible.
- [ ] **NAV-IMPL-04** Direct route, signed-out and access-denied behavior is tested.

---

## B. Account page family

Canonical Account rail:

`Overview · Profile · Security · Privacy · Notifications · Preferences · Leave TCG · Delete Account`

### Planning

- [x] **ACCOUNT-PAGE-PLAN-01** Account Overview mapped.
- [x] **ACCOUNT-PAGE-PLAN-02** Profile mapped using shared Stream Bandit identity plus TCG membership/progression boundaries.
- [x] **ACCOUNT-PAGE-PLAN-03** Security mapped for password/session/recovery via existing auth authority.
- [x] **ACCOUNT-PAGE-PLAN-04** Privacy mapped without treating general Stream Bandit social settings/blocks as automatic TCG authority.
- [x] **ACCOUNT-PAGE-PLAN-05** TCG Notifications surface mapped with explicit TCG-scoping requirement.
- [x] **ACCOUNT-PAGE-PLAN-06** Account Preferences mapped but kept blocked until a personal TCG preferences owner is proven or introduced.
- [x] **ACCOUNT-PAGE-PLAN-07** Leave TCG remains separate from whole Stream Bandit account deletion.
- [x] **ACCOUNT-PAGE-PLAN-08** Delete Account routes through reviewed shared account-deletion lifecycle beginning with `sb_account_deletion_requests`.
- [x] **ACCOUNT-PAGE-PLAN-09** Sensitive/private/admin fields remain excluded from normal Account/public surfaces.

### Implementation

- [ ] **ACCOUNT-PAGE-IMPL-01** Account Overview implemented.
- [ ] **ACCOUNT-PAGE-IMPL-02** Profile implemented through approved shared/TCG authorities.
- [ ] **ACCOUNT-PAGE-IMPL-03** Change/reset password and session/sign-out behavior implemented through existing auth authority.
- [ ] **ACCOUNT-PAGE-IMPL-04** Privacy page implemented only after applicable TCG-scoped discovery/block authorities exist.
- [ ] **ACCOUNT-PAGE-IMPL-05** Notifications page implemented with TCG event scoping.
- [ ] **ACCOUNT-PAGE-IMPL-06** Personal TCG Account Preferences authority proven/implemented before enabling writes.
- [ ] **ACCOUNT-PAGE-IMPL-07** Leave TCG retention/cleanup semantics accepted and tested before enabling the action.
- [ ] **ACCOUNT-PAGE-IMPL-08** Whole-account deletion page uses shared reviewed deletion request lifecycle with clear confirmation/re-auth.
- [ ] **ACCOUNT-PAGE-IMPL-09** Account rail passes desktop/touch/accessibility/direct-route tests.

### Inherited lifecycle gates remain open

- [ ] **ACCOUNT-LIFE-IMPL-01** Define/test TCG-profile removal semantics for decks, collection, currencies, progression, rewards, TCG social state, matchmaking and historical references.
- [ ] **ACCOUNT-LIFE-IMPL-02** Implement TCG-profile removal only after retention/cleanup rules are accepted.
- [ ] **ACCOUNT-LIFE-IMPL-03** Whole-account deletion is explicitly labelled and routed through approved shared lifecycle.

---

## C. TCG Player pages

Canonical page family:

`Players · Public TCG Player Profile`

- [x] **PLAYERS-PAGE-PLAN-01** `Players` is the single TCG discovery/search surface.
- [x] **PLAYERS-PAGE-PLAN-02** Only TCG members may appear in discovery.
- [x] **PLAYERS-PAGE-PLAN-03** Public TCG profile exposes approved public-safe identity/game fields only.
- [x] **PLAYERS-PAGE-PLAN-04** Find Player for Friends/Challenges/future systems must reuse this Directory seam rather than create separate user searches.
- [x] **PLAYERS-PAGE-PLAN-05** Friend/Challenge actions remain gated until their canonical owners exist.
- [ ] **DIRECTORY-IMPL-01** Server-authoritative public TCG Player Directory view/RPC/Edge authority implemented using existing security conventions.
- [ ] **DIRECTORY-IMPL-02** Players search UI implemented with privacy/discovery rules.
- [ ] **PLAYERS-PAGE-IMPL-01** Public TCG Player Profile implemented.
- [ ] **PLAYERS-PAGE-IMPL-02** Directory/profile privacy and direct-route tests pass.

---

## D. TCG Friends page family

Canonical Friends rail:

`Friends · Requests · Find Players · Blocked`

- [x] **FRIENDS-PAGE-PLAN-01** Friends list page mapped for accepted TCG friendships only.
- [x] **FRIENDS-PAGE-PLAN-02** Requests page mapped with `Incoming · Sent` internal tabs.
- [x] **FRIENDS-PAGE-PLAN-03** Find Players routes to the canonical Players Directory rather than duplicating search.
- [x] **FRIENDS-PAGE-PLAN-04** Blocked page mapped for TCG-scoped blocks only.
- [x] **FRIENDS-PAGE-PLAN-05** Remove Friend and block/unblock actions belong to server owners, not browser-only state.
- [x] **FRIENDS-PAGE-PLAN-06** Future Challenge/Invite seam remains separate from Ranked/MMR.
- [ ] **SOCIAL-IMPL-01** One canonical TCG-scoped friendship authority implemented.
- [ ] **SOCIAL-IMPL-02** One canonical TCG-scoped block authority implemented or a safely scoped equivalent proven.
- [ ] **SOCIAL-IMPL-03** Send/accept/decline/cancel requests implemented server-authoritatively.
- [ ] **SOCIAL-IMPL-04** Friends list/remove friend implemented.
- [ ] **SOCIAL-IMPL-05** Block/unblock implemented with block overriding pending/active TCG friendship according to policy.
- [ ] **SOCIAL-IMPL-06** Duplicate/self/opposite-race/privacy/anti-spam protections implemented.
- [ ] **SOCIAL-IMPL-07** TCG social notifications reuse approved infrastructure without leaking unrelated Stream Bandit events.
- [ ] **SOCIAL-IMPL-08** TCG profile view from Player/Friend result implemented.
- [ ] **FRIENDS-PAGE-IMPL-01** Friends rail/pages pass desktop/touch/accessibility/direct-route tests.

---

## E. Production-owner evidence recorded at this checkpoint

- [x] **OWNER-AUDIT-01** `tcg_player_profiles` exists as TCG membership foundation.
- [x] **OWNER-AUDIT-02** `sb_account_deletion_requests` exists as reviewed shared whole-account deletion foundation.
- [x] **OWNER-AUDIT-03** General `sb_user_friends` mechanics exist but V2.4 forbids treating the unscoped table as the TCG friendship graph.
- [x] **OWNER-AUDIT-04** General `sb_user_blocks` exists but is not automatically the TCG block authority.
- [x] **OWNER-AUDIT-05** No TCG-scoped friendship table/routine was proven in the 2026-09-17 production audit.
- [x] **OWNER-AUDIT-06** No TCG-scoped block table/routine was proven in the 2026-09-17 production audit.
- [x] **OWNER-AUDIT-07** No TCG Player Directory table/routine was proven in the 2026-09-17 production audit.
- [x] **OWNER-AUDIT-08** No canonical personal TCG account-preferences store was proven; `sb_app_settings` must not be repurposed by assumption.
- [x] **OWNER-AUDIT-09** No production write/schema change is part of V2.4.2 planning.

---

## F. Implementation safety/order

- [x] **ORDER-ACCOUNT-01** Page shells may be laid out before owner completion only if unavailable writes remain disabled/unwired.
- [ ] **ORDER-ACCOUNT-02** Implement/prove Directory before enabling player discovery actions.
- [ ] **ORDER-ACCOUNT-03** Implement scoped Friends/Blocks owners before enabling social writes.
- [ ] **ORDER-ACCOUNT-04** Reuse existing Auth/Profile authority for Account Overview/Profile/Security.
- [ ] **ORDER-ACCOUNT-05** Scope notifications and preferences before enabling their writes.
- [ ] **ORDER-ACCOUNT-06** Define Leave TCG retention semantics before enabling deletion/deactivation.
- [ ] **ORDER-ACCOUNT-07** Run privacy/RLS/direct-route/accessibility tests before release acceptance.

V2.4.1 battlefield/renderer restoration remains the immediate visual-development authority; this page-map checkpoint does not demote it.

---

## G. Inherited release gates remain active

- [ ] **V2-ATTACK-01** Real two-user Attack resolves end to end.
- [ ] Full **MATCH-01…MATCH-25** production-shaped gameplay matrix passes.
- [ ] V2.4.1 visual/renderer/art/tabletop gates pass.
- [ ] Release shell journey passes.
- [ ] Any shipped Account/Players/Friends surfaces pass security/privacy/RLS checks.
- [ ] Exact-head CI/checks pass.
- [ ] Required deployed Supabase state matches accepted release source where deployment is required.
- [ ] Rollback/recovery point recorded.

**Current decision:** 🔒 **HOLD public/live/production.**