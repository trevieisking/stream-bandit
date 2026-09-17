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
| G0R-11 validation workflow coverage | **COMPLETE ✅** | PR #565 head `5d8c8e9d882b769041db318a9ad14d55a4f0c63f`; Validation #571 / run `35232546805` SUCCESS; merged main checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00` |
| G0R-07 matchmaking room lifetime | **COMPLETE IN SOURCE ✅** | PR #566 head `190c9c9e4bf07712571b978abbd3657f876febed`; all three acceptance workflows green; merged main `fce98178f2234386da7be3aef02a8496fa24195a`; Supabase/live deployment still HOLD |
| G0R-10 Tactic subtype boundary | **PROVEN / QUEUED 🟡** | exact source proves `play_tactic` lacks Ally/Device allow-list; Relic/Realm have dedicated routes; no runtime patch accepted yet |

**Accepted G0R source repairs:** **2 / 11**.

## G0R-07 checklist — ACCEPTED SOURCE REPAIR

| ID | Requirement | State | Evidence / acceptance |
|---|---|---|---|
| G0R07-01 | Exact source defect proven | COMPLETE | original matchmaking function gated `waiting`,`locked`,`in_match` retry/poll by `expires_at > now()` |
| G0R07-02 | Expired waiting queues still close | COMPLETE ✅ | replacement preserves `status='waiting' and expires_at <= now()` cleanup |
| G0R07-03 | Waiting-room reuse still requires unexpired queue lifetime | COMPLETE ✅ | replacement keeps `(r.status='waiting' and r.expires_at > now())` |
| G0R07-04 | Locked rooms remain discoverable after queue expiry | COMPLETE ✅ | replacement includes `locked` independent of queue expiry |
| G0R07-05 | In-match rooms remain discoverable after queue expiry | COMPLETE ✅ | replacement includes `in_match` independent of queue expiry |
| G0R07-06 | Candidate opponents remain waiting + unexpired only | COMPLETE ✅ | candidate lookup remains waiting + `expires_at > now()` |
| G0R07-07 | Repair is additive and does not rewrite existing room data | COMPLETE ✅ | new migration replaces function definition only |
| G0R07-08 | Focused contract test protects waiting-vs-matched expiry boundary | PASS ✅ | TCG Validation #574 / run `35233465142` SUCCESS |
| G0R07-09 | TCG Validation exact-head green | PASS ✅ | #574 / `35233465142` SUCCESS |
| G0R07-10 | Migration Replay exact-head green | PASS ✅ | #799 / `35233465044` SUCCESS, full disposable replay from zero |
| G0R07-11 | Functional Smoke exact-head green | PASS ✅ | #825 / `35233465614` SUCCESS including PostgreSQL replay smoke |
| G0R07-12 | No unresolved material review finding | PASS ✅ | review threads 0 at final pre-merge refresh |
| G0R07-13 | Exact PR diff remains two intended files | PASS ✅ | 2 files, +258 / -0; migration + focused test only |
| G0R07-14 | Merge to main | **PROMOTE / COMPLETE ✅** | PR #566 merged with expected head; merge/main `fce98178f2234386da7be3aef02a8496fa24195a` |
| G0R07-15 | Supabase/live deployment | HOLD 🔒 | source repair is not yet a production deployment; no live mutation performed |

## Exact G0R-07 identifiers

- repository: `trevieisking/stream-bandit`
- branch: `fix/tcg-g0r-07-matchmaking-room-lifetime`
- PR: #566
- base main: `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`
- reviewed PR head: `190c9c9e4bf07712571b978abbd3657f876febed`
- merge/current main: `fce98178f2234386da7be3aef02a8496fa24195a`
- migration commit: `ab754ebcbf381d90197185e5209ae47ea1d500b3`
- test/head commit: `190c9c9e4bf07712571b978abbd3657f876febed`
- files:
  - `supabase/migrations/20260917142500_tcg_matchmaking_locked_room_lifetime.sql`
  - `tcg/tests/card-pass-2-g0r-07-matchmaking-room-lifetime.test.mjs`
- exact-head workflows:
  - TCG Validation #574 / `35233465142` — SUCCESS
  - Migration Replay #799 / `35233465044` — SUCCESS
  - Functional Smoke #825 / `35233465614` — SUCCESS
- legacy combined statuses: none found; exact GitHub Actions evidence above is authoritative
- runtime/live impact: **source/main changed; Supabase/live deployment unchanged**
- Code Labs Writer: **not invoked**
- CG Repair Lab / Code God: **not invoked**

## Inherited critical rules still locked

- original playable prototype remains UX source of truth: RESTORE, DO NOT REDESIGN;
- 40-owner baseline remains authoritative;
- no owner #41 for a single card, label or browser convenience;
- every true Deck Search requires authoritative post-search shuffle and player wording **Then shuffle your deck.**;
- G0R-10 remains explicitly queued and may not be forgotten merely because another repair was completed.

## Exact next operation

Refresh current main `fce98178f2234386da7be3aef02a8496fa24195a` and choose the next safest single V2-G0R owner repair from exact source. Prefer a bounded additive/replay-safe repair over a risky whole-file replacement. Keep Supabase/live separate until source stabilization and deployment evidence justify promotion.
