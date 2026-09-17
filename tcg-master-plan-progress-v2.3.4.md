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

- **G0R-11 — Validation workflow coverage: COMPLETE ✅** — PR #565; Validation #571 SUCCESS; merge checkpoint `5cfd9a5ae509d9dd091b99db822e24eb2d64bf00`.
- **G0R-07 — Matchmaking room lifetime: COMPLETE IN SOURCE ✅** — PR #566; Validation #574 + Replay #799 + Smoke #825 SUCCESS; merge checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`.
- **G0R-08 — Setup-legal deck validation: COMPLETE IN SOURCE ✅** — PR #567; Validation #586 + Replay #800 + Smoke #826 SUCCESS; merge checkpoint `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.
- **G0R-09 — Private-room Ready concurrency: IN PROGRESS 🔎**
  - exact source defect: `tcg_server_set_room_ready` updates one member row and counts readiness with no per-room serialization;
  - two simultaneous Ready transactions can both count before the other commits and both return `all_ready=false`;
  - the private-alpha API initializes the match only when a Ready RPC returns `r?.all_ready`;
  - dedicated branch `fix/tcg-g0r-09-ready-concurrency` created from exact main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`;
  - additive room-scoped transaction-lock migration + focused contract test landed at head `cc46b1fda04361105bc390c9efeddc8c475c6571`;
  - draft PR #568 opened with exactly 2 files / +105 / -0;
  - merge remains HOLD pending exact-head Validation + Migration Replay + Functional Smoke and review evidence.
- **G0R-10 — Tactic subtype boundary: PROVEN / QUEUED 🟡** — only Ally/Device may enter one-shot `play_tactic`; Relic/Realm remain dedicated-owner actions; runtime guard not yet accepted.

**Accepted G0R source repairs:** **3 / 11**. G0R-09 is not repair #4 until its exact-head acceptance fence passes.

## Exact next operation

Refresh PR #568 exact-head workflows and review evidence. Fail closed on any missing/failed lane. If Validation, Migration Replay and Functional Smoke all pass and the diff remains exactly the migration + focused test, recheck main/head and decide source merge promotion. Update plan/checklist/ledger before reporting acceptance. Supabase/live remains separate.
