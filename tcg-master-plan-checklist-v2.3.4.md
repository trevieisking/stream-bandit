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
| G0R-11 validation workflow coverage | **COMPLETE ✅** | PR #565 head `5d8c8e9d882b769041db318a9ad14d55a4f0c63f`; Validation #571 SUCCESS; merged main checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00` |
| G0R-07 matchmaking room lifetime | **COMPLETE IN SOURCE ✅** | PR #566 head `190c9c9e4bf07712571b978abbd3657f876febed`; Validation #574 + Migration Replay #799 + Functional Smoke #825 SUCCESS; merged main `fce98178f2234386da7be3aef02a8496fa24195a`; Supabase/live still HOLD |
| G0R-08 setup-legal deck validation | **IN PROGRESS 🔎** | PR #567 head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`; TCG Validation #586 PASS; Migration Replay #800 running; Functional Smoke #826 pending/running |
| G0R-10 Tactic subtype boundary | **PROVEN / QUEUED 🟡** | exact source proves `play_tactic` lacks Ally/Device allow-list; Relic/Realm have dedicated routes; no runtime patch accepted yet |

**Accepted G0R source repairs:** **2 / 11**.

## G0R-07 checklist — ACCEPTED SOURCE REPAIR

| ID | Requirement | State | Evidence / acceptance |
|---|---|---|---|
| G0R07-01 | Exact source defect proven | COMPLETE | original matchmaking function gated matched retry/poll by queue expiry |
| G0R07-02..07 | Waiting/matched lifetime semantics + additive repair | COMPLETE ✅ | PR #566 accepted source repair |
| G0R07-08..11 | Focused test + Validation + Migration Replay + Functional Smoke | PASS ✅ | #574 / #799 / #825 |
| G0R07-12 | Review findings | PASS ✅ | 0 threads final refresh |
| G0R07-13 | Exact PR diff | PASS ✅ | 2 files, +258 / -0 |
| G0R07-14 | Merge to main | COMPLETE ✅ | `fce98178f2234386da7be3aef02a8496fa24195a` |
| G0R07-15 | Supabase/live deployment | HOLD 🔒 | not deployed by source merge |

## G0R-08 checklist — ACTIVE SOURCE REPAIR

| ID | Requirement | State | Evidence / acceptance |
|---|---|---|---|
| G0R08-01 | Current deck validator defect proven | COMPLETE | validator checks 60 cards, ownership, active IDs, copy limits and elements but not opening/setup eligibility |
| G0R08-02 | Exact opening eligibility vocabulary proven | COMPLETE | private-alpha `starterLegal` is exactly `Creature — Baby`, `Creature — Standalone`, `Creature — Mythic` |
| G0R08-03 | Opening failure consequence proven | COMPLETE | opening loop otherwise reaches `opening_hand_mulligan_guard` |
| G0R08-04 | Validator rejects zero opening-eligible Creature copies | IMPLEMENTED / PENDING FULL FENCE | migration adds `v_setup_eligible` + `deck_requires_setup_eligible_creature` |
| G0R08-05 | Existing validation fence preserved | IMPLEMENTED / PENDING FULL FENCE | replacement retains all current validation error rules/strings |
| G0R08-06 | Exact three recipe types stay synchronized with runtime | **PASS ✅** | focused test passed in TCG Validation #586 |
| G0R08-07 | Additive migration only; no row rewrite | COMPLETE | `20260917143500_tcg_setup_legal_deck_validation.sql` |
| G0R08-08 | Focused contract test | **PASS ✅** | included in TCG Validation #586 / run `35234474804` |
| G0R08-09 | TCG Validation exact-head green | **PASS ✅** | run #586 / `35234474804`; both Set One and deterministic runtime jobs SUCCESS |
| G0R08-10 | Migration Replay exact-head green | **IN PROGRESS 🔎** | run #800 / `35234474906` |
| G0R08-11 | Functional Smoke exact-head green | **PENDING / RUNNING 🔎** | run #826 / `35234475267` |
| G0R08-12 | No unresolved material review finding | TODO | refresh after workflows |
| G0R08-13 | Exact PR diff remains intended two files | PASS at opening head | 2 files, +165 / -0 |
| G0R08-14 | Merge to main | HOLD 🔒 | requires full exact-head fence |
| G0R08-15 | Supabase/live deployment | HOLD 🔒 | separate deployment decision |

## Exact G0R-08 identifiers

- repository: `trevieisking/stream-bandit`
- branch: `fix/tcg-g0r-08-setup-legal-deck`
- PR: #567
- base main: `fce98178f2234386da7be3aef02a8496fa24195a`
- migration commit: `2210eedfc3936561e3e6d49adb7f00e7d8861a6f`
- exact PR head: `f612c450e911d1aa3cc3fdb37fd59c89c153236f`
- exact diff: 2 files, +165 / -0
- files:
  - `supabase/migrations/20260917143500_tcg_setup_legal_deck_validation.sql`
  - `tcg/tests/card-pass-2-g0r-08-setup-legal-deck-validation.test.mjs`
- source/main impact so far: none; branch/PR only
- Supabase/live impact: none
- Code Labs Writer: not invoked
- CG Repair Lab / Code God: not invoked

## Inherited critical rules still locked

- original playable prototype remains UX source of truth: RESTORE, DO NOT REDESIGN;
- 40-owner baseline remains authoritative;
- no owner #41 for a single card, label or browser convenience;
- every true Deck Search requires authoritative post-search shuffle and player wording **Then shuffle your deck.**;
- G0R-10 remains explicitly queued.

## Exact next operation

Finish Migration Replay #800 and Functional Smoke #826 on exact head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`. Fail closed on any failure. If both are green, refresh PR #567 review threads, exact diff/head and current main; then decide source merge promotion. Supabase/live remains separate.
