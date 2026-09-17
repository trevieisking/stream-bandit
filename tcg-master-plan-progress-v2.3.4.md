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
  - TCG Validation #571 SUCCESS.
- **G0R-07 — Matchmaking room lifetime: COMPLETE IN SOURCE ✅**
  - merged PR #566;
  - accepted head `190c9c9e4bf07712571b978abbd3657f876febed`;
  - merge checkpoint `fce98178f2234386da7be3aef02a8496fa24195a`;
  - TCG Validation #574, Migration Replay #799 and Functional Smoke #825 SUCCESS.
- **G0R-08 — Setup-legal deck validation: COMPLETE IN SOURCE ✅**
  - merged PR #567;
  - accepted head `f612c450e911d1aa3cc3fdb37fd59c89c153236f`;
  - merge/current-main checkpoint `042559e252cfa49ad425d9f57fa01a678b2a3fe9`;
  - exact diff stayed 2 files / +165 / -0;
  - TCG Validation #586 / `35234474804` SUCCESS;
  - Migration Replay #800 / `35234474906` SUCCESS;
  - Functional Smoke #826 / `35234475267` SUCCESS;
  - zero unresolved review threads at final pre-merge refresh;
  - the validator now requires at least one active structured setup-legal Creature copy using the exact server-authoritative recipe types `Creature — Baby`, `Creature — Standalone`, or `Creature — Mythic`;
  - all pre-existing validator checks remain preserved;
  - **Supabase/live has not been migrated by this source merge and remains a separate HOLD decision.**
- **G0R-10 — Tactic subtype boundary: PROVEN / QUEUED 🟡**
  - only Ally/Device may enter one-shot `play_tactic`;
  - Relic/Realm remain dedicated-owner actions;
  - runtime guard is not yet accepted.

**Accepted G0R source repairs:** **3 / 11**.

## Exact next operation

Continue exactly one bounded V2-G0R repair from refreshed main `042559e252cfa49ad425d9f57fa01a678b2a3fe9`.

Priorities remain:
1. prove the exact current source defect and owner boundary before mutation;
2. prefer additive/replay-safe repairs while they can move the project safely;
3. keep G0R-10 explicitly queued until the large Tactic dispatcher can be changed through a safe byte-accurate path;
4. require TCG Validation and any relevant Migration Replay / Functional Smoke gates;
5. update plan/checklist/ledger before every delivered implementation result;
6. keep Supabase/live deployment separate from source acceptance.
