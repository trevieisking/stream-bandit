# Stream Bandit TCG — Master Plan V2.4.15 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.15.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.15.md`  
**Continuity parent:** `3fb28d827f396021e3c480346b91da5ed4b66550`.

## V2.4.15-001 — next target selected

**State:** ✅

The synchronized V2.4.14 checklist leaves INTERACT-04 Relic and INTERACT-06 Tactic open. Canonical ordering selects INTERACT-04 Relic next.

## V2.4.15-002 — ownership diagnosis

**State:** ✅

The existing Relic engine already owns exact atomic hand → attached-Relic mutation and one-Relic-per-Creature enforcement, but Match Actions still owned structured Tactic/Relic source classification and coordinate legality inline. Browser targeting would therefore duplicate rules unless declaration legality moved into the existing owner first.

## V2.4.15-003 — registry corroboration

**State:** ✅

Production Set One registry contains 16 Relics. Every one is `card_family=Tactic`, `tactic.subtype=Relic`, with zero `tactic.play_requirements`.

## V2.4.15-004 — server seam candidate

**State:** ✅ SOURCE CANDIDATE

The Relic owner now exposes read-only legal target projection and final structured declaration validation. Match Actions delegates structured `attach_relic_targets` and `attach_relic` legality to those functions, then uses the existing atomic attachment mutation.

Legacy fallback and Stone Flintkin compatibility are preserved. No browser transport is added.

## V2.4.15-005 — acceptance

**State:** 🔄

Hold Supabase promotion and INTERACT-04 browser work until exact-head TCG Validation, Migration Replay, Functional Smoke, review/status, bounded-diff and release-control gates pass.


## V2.4.15-006 — historical Relic ownership contract rollover

**State:** ✅ REPAIR CANDIDATE

TCG #683 completed the deterministic runtime suite and every Match/Tactic/private-alpha type-check successfully. The Set One Node lane failed only two historical assertions in `card-pass-2-runtime-relic-ownership.test.mjs`: the old contract forbade the Relic owner from containing Relic subtype legality at all and required the former single-symbol import syntax.

Those assertions described the pre-V2.4.15 ownership split. They now protect the new canonical boundary instead: the Relic owner may own generic Tactic/Relic declaration legality, remains forbidden from card-ID-specific authority, and Match Actions imports/delegates all three Relic owner seams. Legacy dispatcher fallback and Flintkin compatibility checks remain protected.

No production/runtime source changed in this repair.


## V2.4.15-007 — exact-head gate concurrency retry

**State:** 🔄 CONTROL-ONLY RETRY

TCG #684 passed at the repaired candidate head. Migration #854 was cancelled before any job started because prior-head Migration #853 still occupied the serialized replay lane; #853 subsequently completed successfully.

This control-only checkpoint retriggers the exact-head TCG / Migration / Functional gate trio after the replay lane is clear. Relic owner, Match Actions, release-control, gameplay rules, database/schema, card data and Supabase production are unchanged.
