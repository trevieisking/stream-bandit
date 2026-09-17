# Stream Bandit TCG — Master Plan Checklist V2.4.5

**Canonical plan:** `tcg-master-plan-progress-v2.4.5.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.5.md`  
**Inherits:** `tcg-master-plan-checklist-v2.4.4.md` in full  
**Source parent:** PR #576 @ `8334c7b1214bf449bddd2f32504bb45bdf2bdc69`  
**Release state:** 🔒 HOLD `main` / public / live / production release.

## A. Pre-deploy security evidence

- [x] **DIRECTORY-SEC-EVIDENCE-01** V2.4.4 exact head passed TCG Validation #632, Migration Replay #802 and Functional Smoke #828.
- [x] **DIRECTORY-SEC-EVIDENCE-02** Production Directory table/RPCs are absent; the migration is not deployed.
- [x] **DIRECTORY-SEC-EVIDENCE-03** Current Supabase security guidance/advisor class 0029 identifies authenticated-callable exposed `SECURITY DEFINER` routines as a privilege boundary requiring review.
- [x] **DIRECTORY-SEC-EVIDENCE-04** Existing non-exposed `tcg_private` schema is available as the canonical privileged TCG boundary.
- [x] **DIRECTORY-SEC-EVIDENCE-05** Production security-advisor baseline captured before any TCG Directory DDL.

## B. V2.4.5 source hardening

- [x] **DIRECTORY-SEC-SRC-01** Keep `discoverable = false` owner preference semantics unchanged.
- [x] **DIRECTORY-SEC-SRC-02** Move privileged source aggregation into a non-exposed `tcg_private` projection/refresh owner.
- [x] **DIRECTORY-SEC-SRC-03** Make both public Directory RPCs `SECURITY INVOKER` wrappers.
- [x] **DIRECTORY-SEC-SRC-04** Revoke browser-role execution of privileged private refresh/trigger routines.
- [x] **DIRECTORY-SEC-SRC-05** Keep authenticated projection access read-only and non-Data-API-direct.
- [x] **DIRECTORY-SEC-SRC-06** Refresh from preferences, TCG profile, shared profile and shared privacy settings.
- [x] **DIRECTORY-SEC-SRC-07** Keep source-table RLS unchanged and expose no new sensitive fields.
- [x] **DIRECTORY-SEC-SRC-08** Strengthen the Card Pass 2 Directory contract for the private-definer/public-invoker boundary.

## C. Exact-head validation gates

- [ ] **DIRECTORY-SEC-CI-01** TCG Card Pass 2 Validation succeeds at the repaired head.
- [ ] **DIRECTORY-SEC-CI-02** Zero-to-current Migration Replay succeeds at the repaired head.
- [ ] **DIRECTORY-SEC-CI-03** Functional Smoke succeeds at the repaired head, including PostgreSQL replay.
- [ ] **DIRECTORY-SEC-REVIEW-01** Review threads remain zero or all material findings are resolved at the exact repaired head.

### C.1 Non-final gate-attempt evidence

Head `d6acd30936a4ecd580e53b408619568779f54589` exposed one regression-test false positive: the source-table RLS test matched unrelated `create policy` and source-table references in different parts of the migration. The migration itself was unchanged after that finding.

Head `3b486fc59e39a71ad8942f642ce8d55e312ae646` corrected only that assertion (`tcg/tests/card-pass-2-player-directory-contract.test.mjs`, +2/-2):

- TCG Card Pass 2 Validation #634 — SUCCESS;
- Functional Smoke #830 — SUCCESS, including its zero-to-current PostgreSQL replay;
- standalone Migration Replay #804 — CANCELLED before any job was created and therefore **not accepted as evidence**.

These successes prove the repaired static contract and execute the unchanged migration from zero, but this checklist remains fail-closed until a fresh exact-head standalone Migration Replay also succeeds. This continuity-only checklist update intentionally creates a clean synchronization event after the prior workflow queue is empty; it does not change Directory migration/runtime behavior.

## D. Production deployment gates

- [ ] **DIRECTORY-DEPLOY-01** Refresh immutable GitHub/Supabase evidence immediately before DDL.
- [ ] **DIRECTORY-DEPLOY-02** Apply only the reviewed `tcg_player_directory_v0_1` migration to production.
- [ ] **DIRECTORY-DEPLOY-03** Verify migration history, table/schema/RLS/policies/grants/functions/triggers against reviewed source.
- [ ] **DIRECTORY-DEPLOY-04** Verify Directory RPC behavior with safe read-only SQL probes.
- [ ] **DIRECTORY-DEPLOY-05** Re-run security advisor and prove this Directory adds no exposed-`SECURITY DEFINER` warning.
- [ ] **DIRECTORY-DEPLOY-06** Re-run performance advisor and record any TCG-specific findings.

## E. Still gated

- [ ] **DIRECTORY-UI-01** Wire Players search only after verified production deployment.
- [ ] **DIRECTORY-UI-02** Wire Public TCG Player Profile only after verified production deployment.
- [ ] TCG-scoped Friends authority.
- [ ] TCG-scoped Blocks authority.
- [ ] Social write actions and notifications.
- [ ] All inherited V2.4.1 gameplay/visual/end-to-end release gates.

**Current decision:** repaired source is proven by TCG + Functional Smoke, but production deployment remains blocked until the fresh exact-head standalone Migration Replay and review fence both pass.
