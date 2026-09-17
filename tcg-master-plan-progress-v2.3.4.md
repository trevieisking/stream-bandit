# Stream Bandit TCG — Canonical Master Plan V2.3.4

**Date:** 2026-09-17  
**Status:** active implementation checkpoint  
**Inherits:** every requirement, rule, UX authority, owner boundary, Deck Search invariant, gate and LIVE definition in `tcg-master-plan-progress-v2.3.3.md` unless explicitly changed here  
**Checklist:** `tcg-master-plan-checklist-v2.3.4.md`  
**Ledger:** `tcg-master-plan-ledger-v2.3.4.md`  
**Release index:** `tcg-release-control-v2.3.json`

## Non-negotiable authority

The original playable prototype remains the player-experience source of truth: **RESTORE, DO NOT REDESIGN**. The established 40-owner server architecture remains the gameplay authority. No debug-form redesign, card-specific helper, duplicate owner or owner #41 is authorized by this checkpoint.

The V2.3.3 Deck Search rule remains fully locked: every true `search.deck` has the mandatory authoritative postcondition `deck.shuffle`, with player-facing wording **Then shuffle your deck.**

## V2-G0R implementation state

- **G0R-11 — Validation workflow coverage: COMPLETE ✅**
  - merged PR #565;
  - accepted head `5d8c8e9d882b769041db318a9ad14d55a4f0c63f`;
  - merge/current-main checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`;
  - TCG Validation run #571 / `35232546805` SUCCESS;
  - no runtime/Supabase/live behavior changed.
- **G0R-10 — Tactic subtype boundary: PROVEN / QUEUED 🟡**
  - only Ally/Device may enter one-shot `play_tactic`;
  - Relic/Realm remain dedicated-owner actions;
  - runtime guard is not yet accepted.
- **G0R-07 — Matchmaking room lifetime: IN PROGRESS 🔎**
  - exact defect: retry/poll applied queue expiry to waiting + locked + in_match rooms;
  - required rule: waiting rooms remain expiry-gated; locked/in_match rooms stay discoverable after original queue expiry;
  - repair PR #566 exact head `190c9c9e4bf07712571b978abbd3657f876febed`;
  - exact diff: additive replacement migration + focused contract test only;
  - TCG Validation, Migration Replay and Functional Smoke have all triggered and are pending at this checkpoint.

**Accepted G0R repairs:** **1 / 11**. G0R-07 does not become repair #2 until exact-head gates pass and a fresh promotion decision is made.

## Exact next operation

1. wait only for the already-triggered exact-head PR #566 validation evidence;
2. if any lane fails, repair G0R-07 on the same bounded branch and re-run the exact-head fence;
3. if all required lanes are green and review evidence is clean, refresh PR/main identifiers and decide merge promotion;
4. update this plan/checklist/ledger before reporting acceptance;
5. then continue the next safest V2-G0R owner repair, retaining G0R-10 as a proven queued defect until a safe full-file mutation path is available.

No Supabase deployment or live promotion is authorized by this checkpoint.
