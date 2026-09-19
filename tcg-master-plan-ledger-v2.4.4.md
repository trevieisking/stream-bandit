# Stream Bandit TCG — Master Plan V2.4.4 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.4.md`  
**Previous source checkpoint:** V2.4.3 / PR #576 @ `e622b9a61c8d1dbf2bea4ade9232c464556c92fe`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release decision:** 🔒 HOLD `main`, public/live and production.

## V2.4.4-001 — live Directory boundary audit

**State:** ✅ EVIDENCE ACCEPTED

Read-only production inspection proved the existing TCG member table and shared profile table are intentionally private under RLS, while shared social settings supply a public-profile visibility ceiling. No TCG Directory routine/relation exists today. The live database was not changed.

## V2.4.4-002 — privacy-first TCG discovery preference

**State:** ✅ SOURCE CANDIDATE

`tcg_player_directory_preferences` becomes the application/service owner for TCG discovery opt-in. It is not gameplay owner #41.

Rules:

- preference rows can exist only for `tcg_player_profiles` members;
- discovery defaults off;
- owner-only authenticated select/insert/update;
- no browser-authoritative friendship/block state;
- no broad read policy is added to the underlying TCG/shared profile tables.

## V2.4.4-003 — one reusable Directory read seam

**State:** ✅ SOURCE CANDIDATE / 🔒 PRODUCTION HOLD

Two routines form one Directory capability:

- `tcg_search_public_players` — bounded authenticated search;
- `tcg_get_public_player` — authenticated public TCG profile lookup.

Both require the TCG opt-in plus active/public shared profile and expose only approved public-safe identity and optional arcade/progression values. Friends `Find Players` must reuse this capability.

## V2.4.4-004 — validation before deployment

**State:** 🔄 CI REQUIRED

The source candidate adds `card-pass-2-player-directory-contract.test.mjs`. Because it also adds a `supabase/migrations/*tcg*.sql` file, PR #576 must pass both:

1. TCG Card Pass 2 Validation;
2. Code Labs Migration Replay from an empty local database.

No production migration or page wiring is permitted before both exact-head lanes pass and a new promotion decision is recorded.

## V2.4.4 checkpoint

**Source path:** implementation candidate created on PR #576.  
**Supabase production:** unchanged / HOLD.  
**`main` / GitHub Pages / public/live:** HOLD.  
**Next after CI:** accept or repair this exact candidate; only then consider production Directory deployment as a separate decision.
