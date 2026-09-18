# Stream Bandit TCG — Master Plan V2.4.23 Execution Ledger

**Plan:** `tcg-master-plan-progress-v2.4.23.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.23.md`  
**Continuity parent:** `3216cb5638bc85267d87b8e7eb23d0ba356d450c`.

## V2.4.23-001 — target selected

**State:** ✅

V2.4.22 accepted/live Match v6 provides read-only `field_actions`. INTERACT-09 therefore advances to browser consumption only.

## V2.4.23-002 — Ability card ownership

**State:** ✅ SOURCE CANDIDATE

The browser matches only server-returned coordinate + anchor UID pairs. Matching Vanguard/Reserve Creature cards receive a generic **Use Ability** context action. Real commit is `use_ability`.

No browser ability-mode, timing, limit, target or effect legality is consulted.

## V2.4.23-003 — Withdrawal card ownership

**State:** ✅ SOURCE CANDIDATE

The projected eligible Vanguard receives **Withdraw**. Local pre-commit mode renders only projected Reserve targets and payment-option UIDs, can be cancelled, and submits `withdraw` with the chosen projected target/payment values.

Cost, conditions, once-per-turn state, exact payment and switch remain server-owned.

## V2.4.23-004 — generic choice continuation

**State:** ✅ SOURCE CANDIDATE

The accepted Tactic choice panel is generalized by authoritative route metadata:
- Match owns Attack/Ability/event/normal movement/normal heal;
- Tactic owns generic Tactic and effect-resolution movement/heal.

Only server-projected choice IDs/options are submitted.

## V2.4.23-005 — field anchor persistence

**State:** ✅ SOURCE CANDIDATE

Selected friendly field-card anchors now remain selected across authoritative refreshes whether the source is Vanguard or Reserve, enabling Reserve Ability card controls without introducing legality.

## V2.4.23-006 — scope

**State:** ✅

No server runtime, renderer, database schema, migration or card-data file changes. Supabase remains Match v6 / Tactic v4.

## V2.4.23-007 — validation

**State:** 🔄

Hold INTERACT-09 acceptance until fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff gates pass.
