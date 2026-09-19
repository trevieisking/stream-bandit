# Stream Bandit TCG — Master Plan V2.4.5 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.5.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.5.md`  
**Previous accepted source checkpoint:** V2.4.4 / PR #576 @ `8334c7b1214bf449bddd2f32504bb45bdf2bdc69`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release decision:** 🔒 HOLD `main`, public/live and production release.

## V2.4.5-001 — mandatory pre-deploy advisor refresh

**State:** ✅ EVIDENCE ACCEPTED

Before applying any Directory DDL, the live project and current Supabase guidance were refreshed. Production has no Directory objects and no V2.4.4 Directory migration history. The security advisor baseline contains existing unrelated warnings for authenticated-callable public `SECURITY DEFINER` functions. The accepted V2.4.4 SQL would have added two more of that class, so that exact production shape is blocked before deployment.

## V2.4.5-002 — privileged Directory data moves behind `tcg_private`

**State:** ✅ SOURCE REPAIR CANDIDATE

The still-unapplied V2.4.4 migration file is corrected in-place. A private safe projection owns public Directory read data. A private refresh routine derives that projection from the four authoritative sources and is driven by database triggers, not browser-owned state.

The privileged refresh and trigger routines:

- live only in `tcg_private`;
- use empty `search_path` and fully qualified relations;
- are not executable by PUBLIC, anon, authenticated or service-role callers;
- expose no direct Data API endpoint.

## V2.4.5-003 — stable public API becomes invoker-only

**State:** ✅ SOURCE REPAIR CANDIDATE / 🔒 PRODUCTION HOLD

The public API remains exactly two reusable capabilities:

- `tcg_search_public_players`;
- `tcg_get_public_player`.

They are now `SECURITY INVOKER`, authenticated-only wrappers over the safe private projection. No public Directory routine bypasses RLS or reads the private source tables directly.

## V2.4.5-004 — projection synchronization

**State:** ✅ SOURCE REPAIR CANDIDATE

Database triggers refresh one player's projection row when any authoritative source changes:

1. TCG Directory preference;
2. TCG player profile/progression;
3. shared social privacy settings;
4. shared Stream Bandit display/account profile.

If opt-in/public/active eligibility ceases, the projection row is deleted rather than left stale.

## V2.4.5-005 — revalidation before any DDL

**State:** 🔄 CI REQUIRED

The exact repaired head must pass TCG Card Pass 2 Validation, zero-to-current Migration Replay and Functional Smoke. A fresh immutable evidence fence follows. Only then may production deployment be reconsidered.

## V2.4.5 checkpoint

**PR:** #576 draft/unmerged.  
**Production Supabase:** unchanged; no Directory objects deployed.  
**`main` / GitHub Pages / public/live:** HOLD.  
**Next:** validate the repaired source, re-run the promotion controller, then apply and verify only if every exact-head gate is green.
