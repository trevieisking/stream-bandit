# Stream Bandit TCG — Canonical Master Plan V2.4.4

**Plan date:** 2026-09-17  
**Status:** privacy-first TCG Player Directory source owner layered on V2.4.3  
**Inherits:** `tcg-master-plan-progress-v2.4.3.md` and all inherited V2.4.2/V2.4.1 authority  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.4.md`  
**Source parent:** PR #576 @ `e622b9a61c8d1dbf2bea4ade9232c464556c92fe`  
**Release decision:** 🔒 HOLD `main`, GitHub Pages/public, live and production until inherited release gates pass.

## 0. Why V2.4.4 exists

V2.4.3 created the real standalone Players/Friends/Account routes but correctly kept discovery and social writes gated. A fresh read-only production audit now proves the exact Directory boundary needed to implement the first backend owner safely.

## 1. Live owner evidence

Production Supabase `xzxqfrvqdgkzwujbkdbk` is ACTIVE_HEALTHY and currently has two `tcg_player_profiles` rows and two `sb_profiles` rows.

The audit proves:

- `tcg_player_profiles` has RLS enabled and authenticated users may select only their own row;
- `sb_profiles` has RLS enabled and normal profile select is own/admin only;
- `sb_profile_social_settings` has RLS enabled and carries shared `profile_visibility`;
- no existing TCG Directory relation or routine was found;
- TCG progression fields exist on `tcg_player_profiles` while shared display identity is held by `sb_profiles`.

These source policies remain unchanged.

## 2. V2-DIRECTORY-01 — one server-authoritative discovery seam

The Directory owner is additive and deliberately narrow:

- `tcg_player_directory_preferences` owns TCG discovery opt-in and public arcade-stat preference;
- `discoverable` defaults to `false`, so existing TCG players are not exposed automatically;
- the shared Stream Bandit profile must also be `active` and `profile_visibility = 'public'`;
- `tcg_search_public_players(...)` is the single search seam;
- `tcg_get_public_player(...)` is the single public-profile read seam;
- both routines are authenticated-only and expose only approved display identity plus optional arcade/progression fields;
- result paging is bounded to 50 rows per request;
- no email, auth/session, admin/permission, economy, or private TCG state is exposed.

`Players`, `Public TCG Player Profile`, Friends `Find Players`, and future Challenge/Invite discovery must reuse this seam rather than creating another user search.

## 3. Security boundary

The source uses one narrowly scoped `SECURITY DEFINER` read boundary because the underlying member/profile rows intentionally remain private under RLS. It must:

- require `auth.uid()`;
- use fully-qualified relations with an empty `search_path`;
- revoke routine execution from PUBLIC/anon and grant only authenticated/service-role callers;
- keep the preference table RLS-protected with owner-only select/insert/update;
- never add broad read policies to `tcg_player_profiles` or `sb_profiles`.

General `sb_user_friends` and `sb_user_blocks` remain outside this owner.

## 4. Source vs production state

This checkpoint implements **source only**. The migration must first pass exact-head TCG validation and a zero-to-current migration replay on PR #576.

Until a later explicit production promotion decision:

- the live database is unchanged;
- V2.4.3 Players/Profile controls stay gated;
- no Friends/Blocks write is enabled;
- no public/live route is released.

No gameplay owner #41 is created.
