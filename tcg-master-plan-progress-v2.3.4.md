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
- **G0R-08 — Setup-legal deck validation: COMPLETE IN SOURCE ✅** — PR #567 head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`; Validation #586 + Replay #800 + Smoke #826 SUCCESS; merge checkpoint `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.
- **G0R-09 — Private-room Ready concurrency: COMPLETE IN SOURCE ✅**
  - defect fixed in the authoritative Ready RPC with a room-scoped transaction advisory lock around Ready mutation + aggregate count;
  - membership and deck-validation fences preserved;
  - exact two-members/two-ready `all_ready` rule preserved;
  - PR #568 reviewed head `cc46b1fda04361105bc390c9efeddc8c475c6571`;
  - TCG Validation #597 / `35235272269`, Migration Replay #801 / `35235272316`, Functional Smoke #827 / `35235272663` all SUCCESS;
  - zero review threads; exact two-file diff;
  - merged to source main `2bc55ecd6d626a465cd483ee2e889ceb6177c280`;
  - Supabase/live not deployed by this source merge.
- **G0R-10 — Tactic subtype boundary: PROVEN / QUEUED 🟡** — only Ally/Device may enter one-shot `play_tactic`; Relic/Realm remain dedicated-owner actions; runtime guard not yet accepted.

**Accepted G0R source repairs:** **4 / 11 ✅**.

## Exact next operation

1. refresh exact main `2bc55ecd6d626a465cd483ee2e889ceb6177c280`;
2. prove the next safest remaining G0R defect from exact current source;
3. prefer an additive/replay-safe owner repair where possible;
4. require exact-head validation/replay/smoke and review evidence before merge;
5. update plan/checklist/ledger/release index before every material result message;
6. keep Supabase/live deployment separate from source stabilization.

G0R-10 remains explicitly queued and cannot be silently skipped.
