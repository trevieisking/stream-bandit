# Stream Bandit TCG — Master Plan V2.4.9 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.9.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.9.md`  
**Accepted functional parent:** V2.4.8 @ `d218c946daf7fa1971f32589ca0a7dd5c7a655a1`  
**Continuity parent:** `1896dae20805cb700051eadbab301b844650f7a5`  
**Owner-family baseline:** 40 gameplay owners retained  
**Release decision:** 🔒 HOLD PR merge / `main` / public / live / production release.

## V2.4.9-001 — V2.4.8 acceptance synchronized

**State:** ✅ ACCEPTED

PR comment #5727014949 records V2.4.8 accepted at `d218c946...`. Continuity head `1896dae2...` records that acceptance in Plan/Checklist/Ledger only; TCG #660, Migration #830 and Functional #856 succeeded there.

## V2.4.9-002 — existing Realm owner selected

**State:** ✅ EVIDENCE ACCEPTED

GitHub source and deployed Supabase `tcg-match-actions` v2 agree on `play_realm`. Input beyond the shared envelope is only `card_uid`; the server retains Realm family/type, timing, same-name replacement, placement/replacement and listener/defeat authority.

## V2.4.9-003 — shared Realm destination

**State:** ✅ SOURCE CANDIDATE

The shared Realm slot becomes a keyboard/click destination while a hand card is selected and the authoritative turn/pending/busy presentation fence permits an action. No browser Realm classification is introduced.

## V2.4.9-004 — authoritative transport and re-sync

**State:** ✅ SOURCE CANDIDATE

`runPlayRealmIntent` submits `action: play_realm` plus `card_uid` through the existing action envelope. Success and rejection re-fetch authoritative state; success clears the consumed selection.

## V2.4.9-005 — delivery cache integrity

**State:** ✅ SOURCE CANDIDATE

The battle tabletop marker and modified CSS/controller cache keys advance to V2.4.9. The V2.4.7 renderer remains unchanged.

## V2.4.9-006 — regression contract

**State:** ✅ SOURCE CANDIDATE

A dedicated Card Pass 2 contract proves payload minimality, server ownership, Realm targeting, authoritative re-sync, cache-key advancement and absence of browser Realm legality rules.

## V2.4.9-007 — validation fence

**State:** ✅ ACCEPTED @ `0df1e34414b0acc9dbccb5a6a4f7707dd6263f5f`

Before source acceptance, the final PR head must pass TCG Validation, Migration Replay from zero, Functional Smoke, zero material review threads and bounded diff review from `1896dae2...`.

## V2.4.9-008 — exact-head acceptance

**State:** ✅ ACCEPTED

Exact head `0df1e34414b0acc9dbccb5a6a4f7707dd6263f5f` passed TCG Validation #662, Migration Replay #832 from zero and Functional Smoke #858 with an independent PostgreSQL replay. Review threads were zero, legacy combined statuses had no entries, and the bounded V2.4.9 delta contained exactly the intended Realm interaction/test/control scope.

Initial head `20548e8...` exposed two test-contract mismatches only. Repair head `0df1e344...` changed only the Attack fake-DOM harness and the Realm ownership assertion; no controller/server/gameplay bytes changed in the repair.

## V2.4.9 checkpoint

**PR:** #576 remains draft/unmerged.  
**Supabase production:** no V2.4.9 database or Edge deployment is required.  
**Accepted exact head:** `0df1e34414b0acc9dbccb5a6a4f7707dd6263f5f`.  
**`main` / GitHub Pages / public/live:** HOLD.  
**Next:** re-read latest GitHub comments + Master Plan before selecting V2.4.10; comments are the source of truth for any locked next slice.
