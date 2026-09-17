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
  - merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`;
  - TCG Validation run #571 / `35232546805` SUCCESS.
- **G0R-07 — Matchmaking room lifetime: COMPLETE IN SOURCE ✅**
  - merged PR #566;
  - accepted head `190c9c9e4bf07712571b978abbd3657f876febed`;
  - merge/current-main checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`;
  - TCG Validation #574 / `35233465142` SUCCESS;
  - Migration Replay #799 / `35233465044` SUCCESS, including full disposable database reset/replay from zero;
  - Functional Smoke #825 / `35233465614` SUCCESS;
  - zero unresolved review threads at final pre-merge refresh;
  - exact diff stayed 2 files: additive replacement migration + focused contract test;
  - waiting rooms remain expiry-gated; `locked`/`in_match` rooms remain discoverable after original queue expiry.
  - **Supabase/live is not yet changed by this source merge; deployment remains a separate HOLD decision.**
- **G0R-10 — Tactic subtype boundary: PROVEN / QUEUED 🟡**
  - only Ally/Device may enter one-shot `play_tactic`;
  - Relic/Realm remain dedicated-owner actions;
  - runtime guard is not yet accepted.

**Accepted G0R source repairs:** **2 / 11**.

## Exact next operation

Continue exactly one bounded V2-G0R repair from refreshed main `fce98178f2234386da7be3aef02a8496fa24195a`.

Priority remains:
1. use exact source evidence and the existing owner architecture;
2. prefer additive/replay-safe fixes that do not risk working production data;
3. keep G0R-10 explicitly queued until a safe byte-accurate mutation path for the large Tactic dispatcher is available;
4. require the repaired TCG Validation trigger plus any relevant Migration Replay / Functional Smoke gates;
5. update plan/checklist/ledger before each delivered implementation result.

No Supabase deployment or live promotion is authorized merely by the G0R-07 source merge.
