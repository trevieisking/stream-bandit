# Stream Bandit TCG — Master Plan Progress V2.4.23

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `3216cb5638bc85267d87b8e7eb23d0ba356d450c`  
**Master-plan target:** INTERACT-09 browser Ability + Withdraw card-context actions  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Target

Complete canonical INTERACT-09 on the V2 battlefield without moving Ability or Withdrawal legality into browser code.

Attack remains the existing Vanguard card action and is unchanged.

## 2. Server projection consumption

The browser requests the live Match v6 `field_actions` projection for the current authoritative revision and stores only:
- Ability source coordinate + anchor UID;
- Withdrawal eligibility/reason;
- Withdrawal cost;
- legal Reserve target coordinate + anchor UID;
- attached Essence payment option UID/card ID/label.

No browser Ability metadata inference, condition checks, once-per-turn checks, Withdrawal cost calculation or payment ownership rules are introduced.

## 3. Card-owned Ability

Only a field Creature whose exact coordinate + top-card anchor UID appears in `ability_sources` receives a **Use Ability** action on that physical card.

Commit reuses existing `use_ability(where,index)`.

Reserve card selection persistence is generalized to all friendly field anchors so Reserve Ability controls remain attached to their source card across authoritative refreshes.

## 4. Card-owned Withdrawal

Only an eligible Vanguard receives a **Withdraw** action on that physical card.

Selecting it enters a cancellable pre-commit mode:
- only server-projected Reserve anchors become green targets;
- only server-projected attached Essence UIDs are selectable;
- confirm is enabled only when one legal target and exactly the projected cost are selected.

Commit reuses existing `withdraw(reserve_index, discard_essence_uids)`; the server revalidates declaration, payment and Atomic Switch.

## 5. Generic authoritative choice continuation

The existing server-choice panel becomes route-generic. It consumes only authoritative choice-view fields and routes:
- Attack / Ability / event / normal movement / normal heal choices → Match owner;
- Tactic generic choices and effect-resolution movement/heal continuations → Tactic owner.

This allows Ability and Withdrawal continuations to complete without card IDs, listener IDs or effect-opcode browser rules.

## 6. Scope

Browser controller + battle cache/CSS + browser regression tests + V2.4.23 controls only.

No Match/Tactic/Setup runtime, renderer, database schema, migration or card-data source changes.

## 7. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff evidence are required. Supabase v6 remains unchanged for this browser slice.


## 8. Accepted checkpoint

V2.4.23 is accepted at `3840c79f9eef51fe1ae70f21cbbc86a55adadd57` after TCG #706, Migration #876 and Functional Smoke #902 all succeeded.

The full canonical **INTERACT-01…09** family is now accepted. Match v6 and Tactic v4 remain unchanged because V2.4.23 is browser-only.

**Next locked target:** V2.4.24 / Stage 3 board-visible resolution — authoritative `pending_resolution` → visible Reward claim and mandatory promotion controls using existing `take_reward` and `promote` owners. No reward-count, defeat, or promotion legality may be duplicated in the browser.
