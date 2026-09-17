# Stream Bandit TCG — Master Plan Execution Checklist V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`  
**Inherits:** every checklist requirement and state from `tcg-master-plan-checklist-v2.3.3.md` unless a later row below explicitly supersedes its older checkpoint state.

## Continuity rule — MANDATORY

A material implementation result is not accepted until this checklist/ledger chain records the exact repository, PR/branch, reviewed head, files, tests/reviews, live impact, decision and next operation. Resume from GitHub after any timeout/new chat.

## Current G0R state

| ID | State | Exact checkpoint |
|---|---|---|
| G0R-11 validation workflow coverage | **COMPLETE ✅** | PR #565; Validation #571 SUCCESS; merged checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00` |
| G0R-07 matchmaking room lifetime | **COMPLETE IN SOURCE ✅** | PR #566; Validation #574 + Replay #799 + Smoke #825 SUCCESS; merged checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`; Supabase/live HOLD |
| G0R-08 setup-legal deck validation | **COMPLETE IN SOURCE ✅** | PR #567 head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`; Validation #586 + Replay #800 + Smoke #826 SUCCESS; merged main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`; Supabase/live HOLD |
| G0R-10 Tactic subtype boundary | **PROVEN / QUEUED 🟡** | only Ally/Device may enter one-shot `play_tactic`; Relic/Realm dedicated; no runtime patch yet |

**Accepted G0R source repairs: 3 / 11 ✅**

## G0R-08 checklist — ACCEPTED SOURCE REPAIR

| ID | Requirement | State | Exact evidence |
|---|---|---|---|
| G0R08-01 | Current validator defect proven | COMPLETE | prior latest validator lacked setup eligibility check |
| G0R08-02 | Exact setup vocabulary proven | COMPLETE | `Creature — Baby`, `Creature — Standalone`, `Creature — Mythic` from server runtime |
| G0R08-03 | Opening failure consequence proven | COMPLETE | runtime otherwise can reach `opening_hand_mulligan_guard` |
| G0R08-04 | Reject zero setup-eligible copies | COMPLETE ✅ | replacement validator adds `deck_requires_setup_eligible_creature` |
| G0R08-05 | Preserve existing validation fence | COMPLETE ✅ | focused test verifies prior validation errors remain |
| G0R08-06 | Recipe types synchronized with runtime | PASS ✅ | TCG Validation #586 |
| G0R08-07 | Additive migration / no row rewrite | COMPLETE ✅ | `20260917143500_tcg_setup_legal_deck_validation.sql` |
| G0R08-08 | Focused contract test | PASS ✅ | `card-pass-2-g0r-08-setup-legal-deck-validation.test.mjs` in Validation #586 |
| G0R08-09 | TCG Validation exact-head | PASS ✅ | #586 / `35234474804` |
| G0R08-10 | Migration Replay exact-head | PASS ✅ | #800 / `35234474906` full disposable reset/replay SUCCESS |
| G0R08-11 | Functional Smoke exact-head | PASS ✅ | #826 / `35234475267` Node + Deno + PostgreSQL replay SUCCESS |
| G0R08-12 | Review findings | PASS ✅ | 0 review threads at final pre-merge refresh |
| G0R08-13 | Exact diff | PASS ✅ | 2 files / +165 / -0 |
| G0R08-14 | Merge to main | **PROMOTE / COMPLETE ✅** | PR #567 merged with expected head; merge/main `042559e252cfa49ad425d9f57fa01a678b2a3fe9` |
| G0R08-15 | Supabase/live deployment | HOLD 🔒 | source merge did not deploy migration to production |

## Exact G0R-08 identifiers

- repository `trevieisking/stream-bandit`
- branch `fix/tcg-g0r-08-setup-legal-deck`
- PR #567
- base main `fce98178f2234386da7be3aef02a8496fa24195a`
- migration commit `2210eedfc3936561e3e6d49adb7f00e7d8861a6f`
- reviewed PR head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`
- merge/current main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`
- exact diff 2 files / +165 / -0
- Supabase/live impact: none from source merge
- Code Labs Writer / CG Repair Lab / Code God: not invoked

## Inherited critical rules still locked

- original playable prototype is UX truth: RESTORE, DO NOT REDESIGN;
- 40-owner baseline, no owner #41 for one card/label/browser convenience;
- every true Deck Search requires authoritative post-search shuffle with **Then shuffle your deck.**;
- G0R-10 remains explicitly queued and cannot be lost.

## Exact next operation

Refresh current main `042559e252cfa49ad425d9f57fa01a678b2a3fe9` and implement exactly one next safe V2-G0R owner repair. Prefer additive/replay-safe work. Keep production Supabase/live separate until a later explicit deployment promotion fence.
