# Stream Bandit TCG — Canonical Master Plan V2.4.5

**Plan date:** 2026-09-17  
**Status:** pre-deploy Directory security hardening layered on accepted V2.4.4  
**Inherits:** `tcg-master-plan-progress-v2.4.4.md` and all earlier authority  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.5.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.5.md`  
**Source parent:** PR #576 @ `8334c7b1214bf449bddd2f32504bb45bdf2bdc69`  
**Release decision:** 🔒 HOLD `main`, GitHub Pages/public, live and production release until inherited gates pass.

## 0. Why V2.4.5 exists

V2.4.4 passed exact-head TCG validation, zero-to-current Migration Replay and Functional Smoke. Before production deployment, the mandatory fresh Supabase security review identified a current platform hardening requirement: authenticated-callable `SECURITY DEFINER` routines should not be placed in an exposed API schema when a non-exposed privileged boundary can be used instead.

Production remains unchanged. The V2.4.4 migration has not been applied and no rollback is required.

## 1. Production evidence before repair

The live Stream Bandit project `xzxqfrvqdgkzwujbkdbk` is ACTIVE_HEALTHY. Fresh inspection proves:

- the Directory preference table and both Directory RPCs do not exist in production;
- migration `20260917201805_tcg_player_directory_v0_1` is not in production migration history;
- canonical schema `tcg_private` already exists as the non-exposed TCG privileged boundary;
- the live security-advisor baseline already contains unrelated historical exposed-`SECURITY DEFINER` warnings, so this TCG slice must add zero new warnings of that class.

## 2. V2-DIRECTORY-SEC-01 — private projection owner

The Directory keeps the V2.4.4 privacy rules but changes the privilege shape before deployment:

- `public.tcg_player_directory_preferences` remains the owner-controlled opt-in store with `discoverable = false` by default;
- `tcg_private.player_directory_projection` becomes the canonical safe read projection and contains only approved public identity plus optional arcade/progression fields;
- authenticated clients receive read-only SQL access needed by the public invoker RPCs, but the `tcg_private` schema is not a Data API exposed schema;
- authenticated clients receive no mutation rights on the projection;
- a private privileged refresh owner derives projection rows from `tcg_player_profiles`, `sb_profiles`, `sb_profile_social_settings` and directory preferences;
- trigger-owned refreshes keep the projection synchronized when any authoritative source changes;
- privileged refresh/trigger routines are not executable by PUBLIC, anon, authenticated or service-role callers.

## 3. Public RPC boundary

The player-facing API names remain stable:

- `public.tcg_search_public_players(...)`;
- `public.tcg_get_public_player(uuid)`.

Both are now `SECURITY INVOKER`, authenticated-only wrappers over the safe private projection. They do not bypass RLS and do not read the private source tables directly. Search remains bounded to 50 results per request.

This preserves one reusable Directory capability for Players, Public TCG Player Profile, Friends Find Players and future challenge/invite discovery without creating a second user-search owner.

## 4. Privacy and ownership rules retained

A projection row exists only when all of these are true:

1. the user is a `tcg_player_profiles` member;
2. TCG Directory `discoverable` is true;
3. the shared Stream Bandit account is active;
4. shared `profile_visibility` is public.

No broad read policy is added to `tcg_player_profiles` or `sb_profiles`. No email, auth/session, admin/permission, economy or private match state enters the projection. General `sb_user_friends` and `sb_user_blocks` remain outside this owner. The 40 gameplay-owner baseline remains unchanged.

## 5. Validation and deployment rule

Because the still-unapplied migration file is corrected in-place, the complete exact PR head must re-pass:

1. TCG Card Pass 2 Validation;
2. Code Labs Migration Replay from zero;
3. Functional Smoke including its replay lane.

Only after those pass may the corrected migration be promoted to production. Post-deploy verification must prove the exact table/RLS/grant/function shapes and re-run both security and performance advisors. Players/Profile UI wiring remains gated until production verification succeeds.
