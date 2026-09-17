# Stream Bandit TCG — Master Plan V2.4.2 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.2.md`  
**Canonical checklist:** `tcg-master-plan-checklist-v2.4.2.md`  
**Previous canonical plan:** `tcg-master-plan-progress-v2.4.1.md`  
**Previous canonical ledger:** `tcg-master-plan-ledger-v2.4.1.md`  
**Exact source base:** `main` @ `dacd0f2083b331cbdf0ea210d8f96a23aa952ed2`  
**Owner-family baseline:** 40 gameplay owner families retained  
**Ledger revision:** V2.4.2-1 — 2026-09-17  
**Release decision:** 🔒 HOLD public/live/production

## Ledger rules

- V2.4.2 inherits V2.4.1 in full and does not weaken V2.4 gameplay/account/social release gates.
- GitHub exact source/commit/CI evidence remains repository truth; Supabase deployed state remains live backend truth.
- Trev's latest shell decision is simple navigation, not a new navigation framework.
- Account/Directory/Friends are application/service concerns and do not create gameplay owner #41.
- A page may be laid out before its write owner exists only if unavailable actions remain disabled/unwired.
- General Stream Bandit social tables are not silently promoted into TCG-scoped authorities.
- Master Plan, Ledger and Checklist must agree before acceptance.

---

## V2.4.2 transactions

### V2.4.2-001 — Simple outside-match TCG navigation locked

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** NAV-PLAN-01 through NAV-PLAN-07

Latest Trev direction is to keep TCG navigation simple and obvious.

This aligns with the existing accepted Stream Bandit page-polish rail in `CHECKPOINT-ACCESS-OWNER-USER-MANAGEMENT-PAGE-POLISH-RAILS-V7-12-276.md`:

`Header → page navigation rail → hero/summary → optional internal tabs → content → Footer`

The TCG therefore reuses that established interaction pattern outside an active battle rather than creating a second menu framework.

Primary signed-in destination rail:

`Game Home · Play · Collection · Decks · Packs · Players · Friends · Learn · Progress · Settings · Account`

`Decks` is the player-facing Deck Builder label. `Players` is the TCG directory/discovery surface.

No new `Shop` route is introduced by this transaction.

The active match remains board-only and receives none of this normal application navigation.

---

### V2.4.2-002 — Account page family fully mapped

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** Section B

Canonical Account rail:

`Overview · Profile · Security · Privacy · Notifications · Preferences · Leave TCG · Delete Account`

Owner boundaries:

- Overview/Profile: shared `sb_profiles` identity plus `tcg_player_profiles` TCG membership/state;
- Security: existing authentication/session/password authority;
- Privacy: shared social settings may inform implementation, but TCG discovery/block state requires TCG-safe scoping;
- Notifications: shared infrastructure may be reused only with explicit TCG event scoping;
- Preferences: no canonical personal TCG preference owner is yet proven;
- Leave TCG: blocked until retention/cleanup semantics are accepted;
- Delete Account: use reviewed shared account-deletion lifecycle beginning with `sb_account_deletion_requests`.

The UI must make **Leave TCG** and **Delete Stream Bandit Account** visibly different operations.

No destructive owner is moved into browser code.

---

### V2.4.2-003 — TCG Players page family mapped to one Directory seam

**State:** ✅ PLANNING CONTRACT / 📋 backend + UI implementation open  
**Checklist:** Section C

Canonical pages:

- Players;
- Public TCG Player Profile.

The Players page is the single reusable TCG discovery seam for current/future Friends, Challenges, Leaderboards, Tournaments and Trades.

Directory rules inherited from V2.4 remain unchanged:

- TCG membership required;
- public-safe fields only;
- no broad `sb_profiles` search presented as TCG membership;
- do not weaken `tcg_player_profiles` RLS to make search convenient;
- no email/auth/admin/private-token exposure.

---

### V2.4.2-004 — Friends page family fully mapped

**State:** ✅ PLANNING CONTRACT / 📋 backend + UI implementation open  
**Checklist:** Section D

Canonical Friends rail:

`Friends · Requests · Find Players · Blocked`

Requests may use one simple internal tab set:

`Incoming · Sent`

`Find Players` routes to the canonical Players page and does not duplicate user search.

Required eventual social behavior remains:

- send friend request;
- accept;
- decline;
- cancel;
- list accepted TCG friends;
- remove friend;
- TCG block/unblock;
- open public TCG profile;
- future Challenge/Invite seam kept separate from Ranked/MMR.

---

### V2.4.2-005 — Production social-owner audit prevents unsafe reuse

**State:** ✅ EVIDENCE ACCEPTED / ⛔ scoped implementation still missing  
**Checklist:** OWNER-AUDIT-01 through OWNER-AUDIT-09

Read-only Supabase production inspection on 2026-09-17 proved:

- `tcg_player_profiles` exists;
- `tcg_match_players` exists;
- general `sb_user_friends` exists;
- general `sb_user_blocks` exists;
- shared profile/social/notification/account-deletion infrastructure exists;
- no TCG-scoped friendship table/routine was found;
- no TCG-scoped block table/routine was found;
- no TCG Player Directory table/routine was found;
- no canonical personal TCG account-preferences store was proven.

Important correction:

The generic `sb_user_friends` table has useful request mechanics and uniqueness safeguards, but V2.4 explicitly records that it has no TCG/game/product discriminator. Those mechanics are implementation reference material only; the table itself is **not** the TCG friendship graph.

Likewise, `sb_user_blocks` is not silently treated as the TCG block graph.

No production schema/function/data write occurred during this audit.

---

### V2.4.2-006 — Page shells may precede owners, writes may not

**State:** ✅ SAFETY RULE LOCKED

The visual shell may be implemented incrementally before every backend owner exists so the complete game application can take shape.

However:

- missing-owner actions stay disabled/unwired;
- no fake success/local-only social mutation;
- no browser-only authoritative friendship state;
- no weakening RLS to make a page work;
- no use of general Stream Bandit social rows as TCG rows merely for convenience;
- no raw TCG/whole-account delete until the correct lifecycle owner is proven.

This permits visual progress without creating hidden architecture debt.

---

### V2.4.2-007 — Implementation sequence recorded without displacing V2.4.1

**State:** ✅ ORDER LOCK / 📋 implementation open

V2.4.1 remains the immediate battlefield/card-renderer visual authority.

When Account/Players/Friends implementation is taken up, the bounded order is:

1. reuse existing page-rail shell pattern;
2. lay out route/page shells with safe unavailable states;
3. implement/prove one TCG Player Directory authority;
4. implement one TCG-scoped Friends authority;
5. implement one TCG-scoped Blocks authority;
6. wire Account Overview/Profile/Security through existing identity/auth owners;
7. wire social pages to scoped owners;
8. scope TCG notifications;
9. prove/introduce account preferences owner if retained;
10. define/test Leave TCG retention semantics;
11. wire shared whole-account deletion lifecycle;
12. run privacy/RLS/accessibility/direct-route/release-shell tests.

No runtime/gameplay/Supabase deployment is part of this documentation transaction.

---

## V2.4.2 checkpoint state

### Accepted planning/evidence

- ✅ simple outside-match navigation direction;
- ✅ reuse existing Stream Bandit page-rail pattern;
- ✅ complete Account page family;
- ✅ TCG Players + public profile page family;
- ✅ complete Friends/Requests/Find Players/Blocked page family;
- ✅ one-directory/no-duplicate-search rule;
- ✅ general Stream Bandit social tables barred from accidental TCG reuse;
- ✅ whole-account vs TCG-profile deletion boundary;
- ✅ production owner gaps explicitly recorded.

### Still open

- ☐ shell/page implementation;
- ☐ Directory owner;
- ☐ TCG Friends owner;
- ☐ TCG Blocks owner;
- ☐ scoped TCG notifications;
- ☐ personal TCG account preferences authority if retained;
- ☐ Leave TCG retention semantics;
- ☐ privacy/RLS/accessibility/direct-route tests;
- ☐ all inherited V2.4/V2.4.1 gameplay/visual/release gates.

**Promotion state:** docs-only candidate may be reviewed/validated; public/live/production stays 🔒 **HOLD**.