# Stream Bandit TCG — Master Plan V2.4.22 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.22.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.22.md`  
**Continuity parent:** `b7581be870e5afe521494531f3c7eaa9383a51e8`.

## V2.4.22-001 — target diagnosis

**State:** ✅

Attack already satisfies card-context ownership in the V2 battlefield.

The old Arcade Lab is not reusable for Ability/Withdrawal: it infers active Ability from browser card metadata and asks the player to manually type a Withdrawal Essence cost. That duplicates server-owned legality and can drift from current modifiers/conditions.

## V2.4.22-002 — Ability projection

**State:** ✅ SOURCE CANDIDATE

`field_actions` simulates the canonical Active Ability live route on cloned state for each friendly field Creature and returns only legal source coordinates/anchors. Real `use_ability` reuses the same live-route helper against authoritative state.

## V2.4.22-003 — Withdrawal projection

**State:** ✅ SOURCE CANDIDATE

The shared declaration planner provides current Withdrawal availability, canonical cost, occupied Reserve targets and attached Essence options. Real `withdraw` uses the same plan, then the existing Withdrawal transaction owner proves and applies Payment + Atomic Switch.

## V2.4.22-004 — scope

**State:** ✅

One runtime file changes. No browser/renderer, database schema, migration or card-data source is changed.

## V2.4.22-005 — validation

**State:** 🔄

Hold Match Edge promotion and browser action work until fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff gates pass.
