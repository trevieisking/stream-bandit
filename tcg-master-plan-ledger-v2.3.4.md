# Stream Bandit TCG — Master Plan Ledger V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.3.md`

## V2.3.4-001 — G0R-11 accepted

PR #565 accepted validation workflow coverage. Accepted head `5d8c8e9d882b769041db318a9ad14d55a4f0c63f`; Validation #571 SUCCESS; merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.

## V2.3.4-002 — G0R-10 remains proven / queued

Exact source proves `play_tactic` lacks the required one-shot Ally/Device subtype allow-list while Relic/Realm already have dedicated owner routes. No unsafe whole-file rewrite was forced. G0R-10 remains explicitly queued.

## V2.3.4-003 — G0R-07 accepted

PR #566 fixed matchmaking room lifetime. Reviewed head `190c9c9e4bf07712571b978abbd3657f876febed`; Validation #574, Migration Replay #799 and Functional Smoke #825 SUCCESS; review threads 0; merge checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`. Supabase/live remained undeployed.

## V2.3.4-004 — G0R-08 defect proven

At exact main `fce98178f2234386da7be3aef02a8496fa24195a`, latest `tcg_server_validate_deck` validated deck size, active IDs, ownership, copy limits and element membership but did not require any Creature that can legally begin setup.

The server-authoritative private-alpha setup runtime uses exactly three setup-legal recipe types:
- `Creature — Baby`;
- `Creature — Standalone`;
- `Creature — Mythic`.

Its opening loop mulligans until one appears and otherwise reaches `opening_hand_mulligan_guard`. The defect therefore belongs in deck validation rather than a browser workaround or weakened setup rule.

## V2.3.4-005 — G0R-08 bounded implementation

Created branch `fix/tcg-g0r-08-setup-legal-deck` from exact main `fce98178f2234386da7be3aef02a8496fa24195a`.

Added migration commit `2210eedfc3936561e3e6d49adb7f00e7d8861a6f`:
- `supabase/migrations/20260917143500_tcg_setup_legal_deck_validation.sql`;
- copies current validator rules;
- adds `v_setup_eligible` count using active structured card definitions and the exact three setup recipe types;
- rejects zero eligible copies with `deck_requires_setup_eligible_creature`;
- returns `setup_eligible_creature_copies` as validation evidence;
- rewrites no production rows by itself.

Added focused test/head commit `f612c450e911d1aa3cc3fdb37fd59c89c153236f`:
- `tcg/tests/card-pass-2-g0r-08-setup-legal-deck-validation.test.mjs`;
- binds validator recipe types to the private-alpha runtime and checks preservation of prior validator errors.

Opened draft PR #567. Exact diff: 2 files / +165 / -0.

## V2.3.4-006 — G0R-08 exact-head fence

All required exact-head workflows completed successfully on `f612c450e911d1aa3cc3fdb37fd59c89c153236f`:
- TCG Card Pass 2 Validation #586 / `35234474804` — SUCCESS;
- Code Labs Migration Replay #800 / `35234474906` — SUCCESS, including full disposable reset/replay from zero;
- Code Labs V50 Functional Smoke #826 / `35234475267` — SUCCESS, including Node, Deno and PostgreSQL replay smoke.

Final pre-merge evidence:
- PR #567 mergeable = true;
- PR head unchanged `f612c450e911d1aa3cc3fdb37fd59c89c153236f`;
- review threads = 0;
- exact diff remained 2 intended files / +165 / -0;
- main remained `fce98178f2234386da7be3aef02a8496fa24195a` immediately before merge;
- combined legacy statuses returned none found; GitHub Actions exact-head runs above are authoritative.

## V2.3.4-007 — G0R-08 promoted to main

**Promotion decision: PROMOTE G0R-08 source repair ✅.**

PR #567 was marked ready and merged using expected head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`.

- merge SHA/current main: `042559e252cfa49ad425d9f57fa01a678b2a3fe9`;
- G0R-08 source state: COMPLETE;
- accepted G0R source repairs: **3/11**.

Important boundary: source merge does **not** apply the new validator migration to production Supabase. Production/live deployment remains HOLD and requires a separate evidence/promotion decision.

## Current promotion state

- G0R-11 source: COMPLETE ✅
- G0R-07 source: COMPLETE ✅
- G0R-08 source: COMPLETE ✅
- accepted G0R source repairs: **3/11**
- G0R-10: PROVEN / QUEUED 🟡
- Supabase/runtime/live/production: HOLD / not changed by G0R-08 source merge
- Code Labs Writer: not invoked
- CG Repair Lab / Code God: not invoked

## Exact next operation

Refresh source from main `042559e252cfa49ad425d9f57fa01a678b2a3fe9` and implement exactly one next safe V2-G0R owner repair. Prefer additive/replay-safe work while maintaining the prototype authority, 40-owner architecture and Deck Search invariant. Update plan/checklist/ledger before the next delivered work result.
