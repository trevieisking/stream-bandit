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
| G0R-11 validation workflow coverage | **COMPLETE ✅** | PR #565 head `5d8c8e9d882b769041db318a9ad14d55a4f0c63f`; Validation #571 / run `35232546805` SUCCESS; merged main `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00` |
| G0R-10 Tactic subtype boundary | **PROVEN / QUEUED 🟡** | exact source proves `play_tactic` lacks Ally/Device allow-list; Relic/Realm have dedicated routes; no runtime patch accepted yet |
| G0R-07 matchmaking room lifetime | **IN PROGRESS 🔎** | PR #566 head `190c9c9e4bf07712571b978abbd3657f876febed`; TCG Validation + independent Migration Replay green; Functional Smoke PostgreSQL lane still running |

**Accepted G0R repairs:** **1 / 11**.

## G0R-07 checklist

| ID | Requirement | State | Evidence / acceptance |
|---|---|---|---|
| G0R07-01 | Exact source defect proven | COMPLETE | `20260905110000_tcg_automatic_matchmaking.sql`: idempotent room lookup gated `waiting`,`locked`,`in_match` by `expires_at > now()` |
| G0R07-02 | Expired waiting queues still close | LOCKED | replacement migration preserves `status='waiting' and expires_at <= now()` cleanup |
| G0R07-03 | Waiting-room reuse still requires unexpired queue lifetime | LOCKED | replacement predicate keeps `(r.status='waiting' and r.expires_at > now())` |
| G0R07-04 | Locked rooms remain discoverable after queue expiry | IMPLEMENTED / PENDING FULL FENCE | replacement predicate includes `locked` independent of `expires_at` |
| G0R07-05 | In-match rooms remain discoverable after queue expiry | IMPLEMENTED / PENDING FULL FENCE | replacement predicate includes `in_match` independent of `expires_at` |
| G0R07-06 | Candidate opponents remain waiting + unexpired only | LOCKED | candidate lookup unchanged |
| G0R07-07 | Repair is additive and does not rewrite existing room data | COMPLETE | new migration replaces function definition only |
| G0R07-08 | Focused contract test protects waiting-vs-matched expiry boundary | **PASS ✅** | included in TCG Validation #574 / run `35233465142` SUCCESS |
| G0R07-09 | TCG Validation exact-head green | **PASS ✅** | run #574 / `35233465142` completed SUCCESS on exact head |
| G0R07-10 | Migration Replay exact-head green | **PASS ✅** | run #799 / `35233465044`; full disposable `supabase db reset --local --no-seed` replay SUCCESS |
| G0R07-11 | Functional Smoke exact-head green | **IN PROGRESS 🔎** | run #825 / `35233465614`; Node + Deno PASS; PostgreSQL replay smoke currently running |
| G0R07-12 | No unresolved material review finding | CURRENTLY CLEAR | PR #566 review threads currently 0; final refresh required before merge |
| G0R07-13 | Exact PR diff remains two intended files | COMPLETE at opening head | 2 files, +258 / -0; migration + focused test only |
| G0R07-14 | Merge to main | HOLD 🔒 | requires final Functional Smoke + fresh immutable recheck |
| G0R07-15 | Supabase/live deployment | HOLD 🔒 | separate later decision; none performed |

## Exact implementation identifiers

- repository: `trevieisking/stream-bandit`
- branch: `fix/tcg-g0r-07-matchmaking-room-lifetime`
- PR: #566
- base main at branch creation: `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`
- PR head: `190c9c9e4bf07712571b978abbd3657f876febed`
- migration commit: `ab754ebcbf381d90197185e5209ae47ea1d500b3`
- test/head commit: `190c9c9e4bf07712571b978abbd3657f876febed`
- files:
  - `supabase/migrations/20260917142500_tcg_matchmaking_locked_room_lifetime.sql`
  - `tcg/tests/card-pass-2-g0r-07-matchmaking-room-lifetime.test.mjs`
- runtime/live impact so far: **none**
- Code Labs Writer: **not invoked**
- CG Repair Lab / Code God: **not invoked**

## Exact next operation

Finish exact-head Functional Smoke #825. Fail closed on any failure. If it finishes green, refresh review threads, PR metadata, exact diff and main; then make the G0R-07 merge promotion decision. Update this checklist/ledger again before delivering the accepted result.
