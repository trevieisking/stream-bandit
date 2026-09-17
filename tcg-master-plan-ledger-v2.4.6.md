# Stream Bandit TCG — Master Plan V2.4.6 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.6.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.6.md`  
**Previous accepted source checkpoint:** V2.4.5 / PR #576 @ `b8479c2998e4ed66525dd6e9b17fc07bc49ab232`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release decision:** 🔒 HOLD `main`, public and full live release.

## V2.4.6-001 — V2.4.5 production Directory promotion

**State:** ✅ PRODUCTION ACCEPTED

Exact V2.4.5 head passed TCG Validation #635, Migration Replay #805 and Functional Smoke #831 with zero material review threads. The reviewed Directory migration alone was promoted to Supabase production and recorded as `20260917213104_tcg_player_directory_v0_1`.

Post-deploy inspection proved the expected RLS/policy/grant/function/trigger boundary and no new exposed-`SECURITY DEFINER` security warning. No Edge Function, gameplay runtime or public page was deployed as part of this promotion.

## V2.4.6-002 — reusable Directory browser adapter

**State:** ✅ SOURCE IMPLEMENTED / 🔒 ACCEPTANCE HOLD

`stream-bandit-tcg-player-directory-v2-4-6.js` is the one browser adapter for Directory discovery, public profile reads and the signed-in user's Directory preference row. It consumes the existing shared Supabase public config/session path and contains no service-role path.

The browser does not read authoritative profile sources or the private projection directly.

## V2.4.6-003 — Players search

**State:** ✅ SOURCE IMPLEMENTED / 🔒 ACCEPTANCE HOLD

`tcg-players.html` now exposes a real authenticated search form. The controller calls only `tcg_search_public_players`, requests 25 rows, renders approved public fields safely and links to the canonical public profile route.

## V2.4.6-004 — Public TCG Player Profile

**State:** ✅ SOURCE IMPLEMENTED / 🔒 ACCEPTANCE HOLD

`tcg-player-profile.html` resolves a selected player only through `tcg_get_public_player`. Missing, private or otherwise ineligible players fail closed. Friend/Challenge/Invite writes remain gated.

## V2.4.6-005 — Account Privacy opt-in

**State:** ✅ SOURCE IMPLEMENTED / 🔒 ACCEPTANCE HOLD

`tcg-account-privacy.html` loads and upserts only the signed-in user's `tcg_player_directory_preferences` row. Discoverability remains database-default false. Optional arcade/progression visibility is independently controllable. TCG-specific block controls remain gated.

## V2.4.6-006 — ownership regression contract

**State:** ✅ SOURCE IMPLEMENTED / 🔄 CI REQUIRED

`tcg/tests/card-pass-2-player-directory-ui.test.mjs` locks:

- canonical RPC-only discovery/profile reads;
- own-row preference usage;
- no direct source-table browsing;
- no `sb_user_friends` / `sb_user_blocks` reuse;
- no service-role browser path;
- continued gating of unowned social writes.

## V2.4.6 checkpoint

**PR:** #576 remains draft/unmerged.  
**Production Supabase Directory backend:** accepted live.  
**V2.4.6 UI:** source branch only.  
**Gameplay engines / registry / card data / rules:** unchanged by this slice.  
**`main` / GitHub Pages / public/full live:** HOLD.  
**Next:** run fresh exact-head TCG Validation, Migration Replay, Functional Smoke and review/diff fence; then return to the shortest missing link in the locked end-to-end gameplay route.
