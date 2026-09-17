# Stream Bandit TCG — Master Plan Ledger V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.3.md`

## V2.3.4-001 — G0R-11 accepted baseline

PR #565 accepted G0R-11 validation workflow coverage. Accepted head `5d8c8e9d882b769041db318a9ad14d55a4f0c63f`; TCG Validation #571 SUCCESS; merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.

## V2.3.4-002 — G0R-10 remains proven, not silently skipped

Exact source proves `play_tactic` lacks the required one-shot subtype allow-list. Canonical boundary: Ally/Device may use one-shot `play_tactic`; Relic/Realm use dedicated owner routes. No runtime change accepted yet because a safe byte-accurate mutation path for the large dispatcher is still preferred over a risky whole-file replacement.

## V2.3.4-003 — G0R-07 accepted

PR #566 repaired matchmaking room lifetime on source/main. Reviewed head `190c9c9e4bf07712571b978abbd3657f876febed`; exact diff 2 files / +258 / -0. Validation #574, Migration Replay #799 and Functional Smoke #825 all SUCCESS; review threads 0. Merge/current main `fce98178f2234386da7be3aef02a8496fa24195a`.

Source rule now preserves queue expiry for waiting rooms while keeping locked/in_match rooms discoverable after original queue expiry. Production Supabase was not migrated by this source merge and remains a separate HOLD.

Accepted G0R source repairs after this step: **2/11**.

## V2.3.4-004 — G0R-08 defect proven

Exact current validator source: `supabase/migrations/20260905105500_tcg_economy_and_copy_limit_alignment.sql` at main `fce98178f2234386da7be3aef02a8496fa24195a`.

The latest `tcg_server_validate_deck` validates exact 60-card count, active IDs, ownership quantities, copy limits and declared elements but has no requirement that the deck contain any Creature capable of legal opening/setup placement.

Exact server-authoritative setup source: `supabase/functions/tcg-private-alpha-api/index.ts` at the same main SHA.

Its `starterLegal` predicate accepts exactly:
- `Creature — Baby`;
- `Creature — Standalone`;
- `Creature — Mythic`.

The opening loop mulligans until the seven-card hand contains one of those and throws `opening_hand_mulligan_guard` after bounded retries if no legal opening hand can be generated. Therefore a validator-approved deck with zero such copies can enter matchmaking/room preparation but cannot reliably enter setup.

**Decision:** repair G0R-08 at deck validation, not by weakening setup legality or adding a browser workaround.

## V2.3.4-005 — G0R-08 bounded branch implementation

**Branch-only promotion decision:** PROMOTE ✅.

Created from exact main `fce98178f2234386da7be3aef02a8496fa24195a`:
- branch `fix/tcg-g0r-08-setup-legal-deck`.

Added migration:
- `supabase/migrations/20260917143500_tcg_setup_legal_deck_validation.sql`;
- commit `2210eedfc3936561e3e6d49adb7f00e7d8861a6f`.

The migration copies the latest validator behavior and adds only:
- `v_setup_eligible` copy count from active structured card definitions;
- exact three recipe types matching `starterLegal`;
- error `deck_requires_setup_eligible_creature` when count is zero;
- `setup_eligible_creature_copies` in the validation result for evidence/diagnostics.

Added focused test:
- `tcg/tests/card-pass-2-g0r-08-setup-legal-deck-validation.test.mjs`;
- head commit `f612c450e911d1aa3cc3fdb37fd59c89c153236f`.

The test binds the validator's exact recipe-type vocabulary to the private-alpha runtime and checks that all pre-existing validator error strings remain present.

Exact diff from base main:
- 2 commits;
- 2 files;
- +165 / -0.

Draft PR #567 opened with exact head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`.

At the first immediate post-open exact-head refresh, GitHub returned **no workflow runs yet**. This is not a PASS. PR merge/main/Supabase/live remain HOLD until the required workflow evidence appears and succeeds.

## Current promotion state

- G0R-11 source: COMPLETE ✅
- G0R-07 source: COMPLETE ✅
- G0R-08 branch implementation: PROMOTE ✅ / PR merge HOLD 🔒
- accepted G0R source repairs: **2/11**
- G0R-10: PROVEN / QUEUED 🟡
- Supabase/runtime/live/production: HOLD / unchanged by G0R-08 branch
- Code Labs Writer: not invoked
- CG Repair Lab / Code God: not invoked

## Exact next operation

Refresh PR #567 exact-head workflow runs/statuses and review threads. Require TCG Validation, Migration Replay and Functional Smoke to run and pass against exact head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`; fail closed and repair the branch if any lane fails. If all evidence is green and the diff remains exactly two intended files, recheck main/head and decide source merge promotion. Update the plan/checklist/ledger before reporting that decision.
