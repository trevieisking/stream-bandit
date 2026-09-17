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
  - Migration Replay #799 / `35233465044` SUCCESS;
  - Functional Smoke #825 / `35233465614` SUCCESS;
  - Supabase/live deployment remains a separate HOLD decision.
- **G0R-08 — Setup-legal deck validation: IN PROGRESS 🔎**
  - exact source proves the latest `tcg_server_validate_deck` does not require any opening/setup-legal Creature;
  - exact private-alpha runtime defines setup legality as recipe type `Creature — Baby`, `Creature — Standalone`, or `Creature — Mythic` and the opening mulligan loop depends on at least one of those being drawable;
  - dedicated branch `fix/tcg-g0r-08-setup-legal-deck` created from exact main `fce98178f2234386da7be3aef02a8496fa24195a`;
  - additive validator migration + focused contract test landed on branch head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`;
  - draft PR #567 opened with exactly 2 files / +165 / -0;
  - exact-head workflow runs were none found at the first immediate post-open refresh, so merge remains HOLD until the normal GitHub Actions triggers appear and pass.
- **G0R-10 — Tactic subtype boundary: PROVEN / QUEUED 🟡**
  - only Ally/Device may enter one-shot `play_tactic`;
  - Relic/Realm remain dedicated-owner actions;
  - runtime guard is not yet accepted.

**Accepted G0R source repairs:** **2 / 11**. G0R-08 is not repair #3 until exact-head validation/replay/smoke and review evidence pass.

## Exact next operation

1. refresh PR #567 exact-head workflow runs/statuses and review evidence;
2. if validation has not triggered, diagnose the trigger rather than assuming PASS;
3. if any lane fails, repair only the bounded G0R-08 branch;
4. if TCG Validation, Migration Replay and Functional Smoke all pass and the diff remains exactly the migration + focused test, refresh main/head and decide source merge promotion;
5. update plan/checklist/ledger before reporting acceptance;
6. keep Supabase/live deployment separate and keep G0R-10 explicitly queued.
