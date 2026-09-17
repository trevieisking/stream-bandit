# Stream Bandit TCG — Master Plan Execution Checklist V2.3.4

**Date:** 2026-09-17  
**Master plan:** `tcg-master-plan-progress-v2.3.4.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`  
**Inherits:** every requirement and state from `tcg-master-plan-checklist-v2.3.3.md` unless superseded below.

## Continuity rule — MANDATORY

Every material implementation result must leave the exact repository, PR/branch, head, files, tests/reviews, live impact, decision and next operation recorded here/ledger before delivery. Resume from GitHub after timeout/new chat.

## Current G0R state

| ID | State | Exact checkpoint |
|---|---|---|
| G0R-11 validation workflow coverage | COMPLETE ✅ | PR #565; Validation #571 SUCCESS; merged `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00` |
| G0R-07 matchmaking room lifetime | COMPLETE IN SOURCE ✅ | PR #566; #574 + #799 + #825 SUCCESS; merged `fce98178f2234386da7be3aef02a8496fa24195a`; live HOLD |
| G0R-08 setup-legal deck validation | COMPLETE IN SOURCE ✅ | PR #567; #586 + #800 + #826 SUCCESS; merged `042559e252cfa49ad425d9f57fa01a678b2a3fe9`; live HOLD |
| G0R-09 private-room Ready concurrency | **IN PROGRESS 🔎** | PR #568 head `cc46b1fda04361105bc390c9efeddc8c475c6571`; Validation #597 PASS; Migration Replay #801 running; Functional Smoke #827 pending/running |
| G0R-10 Tactic subtype boundary | PROVEN / QUEUED 🟡 | Ally/Device one-shot; Relic/Realm dedicated; no runtime patch yet |

**Accepted G0R source repairs: 3 / 11 ✅**

## G0R-09 checklist — ACTIVE SOURCE REPAIR

| ID | Requirement | State | Evidence / acceptance |
|---|---|---|---|
| G0R09-01 | Simultaneous Ready defect proven | COMPLETE | no serialization around Ready write + aggregate count |
| G0R09-02 | Client dependency proven | COMPLETE | private-alpha initializes only when Ready RPC returns `r?.all_ready` |
| G0R09-03 | Serialize write + aggregate per room | IMPLEMENTED / PENDING FULL FENCE | room-scoped `pg_advisory_xact_lock` before mutation/count |
| G0R09-04 | Lock is room-scoped, not global | IMPLEMENTED / PENDING FULL FENCE | key derives from room id + `:ready` |
| G0R09-05 | Membership/deck validation fences preserved | IMPLEMENTED / PENDING FULL FENCE | focused test + source |
| G0R09-06 | Exact all-ready rule preserved | IMPLEMENTED / PENDING FULL FENCE | `v_count=2 and v_ready_count=2` |
| G0R09-07 | Additive migration / no row rewrite | COMPLETE | `20260917144500_tcg_private_room_ready_concurrency.sql` |
| G0R09-08 | Focused contract test | PASS ✅ | included in Validation #597 / run `35235272269` |
| G0R09-09 | TCG Validation exact-head | PASS ✅ | #597 / `35235272269`; Set One + deterministic runtime jobs SUCCESS |
| G0R09-10 | Migration Replay exact-head | IN PROGRESS 🔎 | #801 / `35235272316` |
| G0R09-11 | Functional Smoke exact-head | PENDING / RUNNING 🔎 | #827 / `35235272663` |
| G0R09-12 | Review findings clear | TODO | final refresh required |
| G0R09-13 | Exact diff limited to two intended files | PASS at opening head | 2 files / +105 / -0 |
| G0R09-14 | Merge to main | HOLD 🔒 | requires full exact-head fence |
| G0R09-15 | Supabase/live deployment | HOLD 🔒 | separate deployment decision |

## Exact G0R-09 identifiers

- repository `trevieisking/stream-bandit`; PR #568; branch `fix/tcg-g0r-09-ready-concurrency`
- base main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`
- migration commit `4c08c8528677aef8a58955a91e1a05f7227f5854`
- exact PR head `cc46b1fda04361105bc390c9efeddc8c475c6571`
- exact diff 2 files / +105 / -0
- source/main impact none; Supabase/live impact none
- Code Labs Writer / CG Repair Lab / Code God not invoked

## Inherited critical rules still locked

Original prototype = UX truth; 40-owner baseline; no owner #41 for one card/label/UI; every true Deck Search ends in authoritative shuffle with **Then shuffle your deck.**; G0R-10 remains explicitly queued.

## Exact next operation

Finish Migration Replay #801 and Functional Smoke #827 on exact head `cc46b1fda04361105bc390c9efeddc8c475c6571`. Fail closed on any failure. If both become green, refresh PR #568 review threads, exact diff/head and current main; then decide source merge promotion. Supabase/live stays separate.
