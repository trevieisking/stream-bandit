# Stream Bandit TCG — Runtime 79b Recovery Checkpoint

**Status:** branch-only master-plan companion checkpoint.  
**Canonical master plan:** `tcg-master-plan-progress.md`.  
**PR:** #549 — `feature/tcg-private-alpha-v0-5-source-recovery`.  
**Source head before this documentation-only checkpoint:** `2cfa12fde3bdaf2929021f2d90d15435a6e290e2`.

> This file records the current 79a/79b recovery state without replacing the larger canonical master-plan file through a truncated whole-file transport. Fold these facts into `tcg-master-plan-progress.md` when a full exact-file route is available. This file does not itself accept 79b or authorize promotion.

## Progress meter

- **78% — accepted.**
- **79a — accepted.**
- **79b — locally verified and backed up; not committed as gameplay source yet.**
- **79c — pending.**
- **Overall 79% — OPEN.**

## 79a accepted foundation

At exact head `2cfa12fde3bdaf2929021f2d90d15435a6e290e2`, Runtime 79a is accepted.

The branch contains the shared Runtime v0.2 movement foundation, including:

- canonical atomic Vanguard ↔ Reserve switch context/event ownership;
- exact `moved_to_reserve` and `became_vanguard` event truth;
- generic movement-listener continuation for the frozen 20 Set One movement listeners;
- private hidden inspection/order handling;
- private movement choices;
- exact current-turn Essence attachment receipts required by Jetstream Essence;
- movement listener replay/limit protection;
- canonical heal/Essence/condition handoffs.

PR #549 source-of-truth checkpoint comment: **#5604907812**.

## 79b exact intended scope

`tcg-match-actions` 79b remains bounded to these seams:

1. Manual hand Essence attachment records the exact private v0.2 attachment receipt.
2. Voluntary withdrawal preserves all current legality/payment checks but uses the shared atomic switch owner.
3. The resulting movement events run through the generic movement-listener continuation and seat-private choice/inspection views.
4. Movement-triggered heals resume through the canonical heal-listener path and cannot bypass defeat scanning.
5. Post-attack Vanguard ↔ Reserve switching uses the same atomic switch owner and movement continuation.
6. Aeralith — Storm Shepherd's **Eye of the Storm** switch remains **optional**, matching the frozen card definition.
7. Reserve → empty Vanguard promotion remains a distinct non-swap operation.
8. Existing attack defeat scan / Aftermath ownership remains in `tcg-match-actions`; no duplicate interpreter or defeat engine is introduced.

## Verified local 79b recovery identity

Exact current `tcg-match-actions` source:

- Git blob: `415ac70c1be729a11121bed2505360955412bca1`
- SHA-256: `94d3ed494e4f55d8285c476f0a6475bda454d7c442959d112ebf879f2b9d8f33`

Locally verified intended `tcg-match-actions` 79b candidate:

- Git blob: `0243bc6fa4a9a56a3ce71677469f219c8fd0f9d9`
- SHA-256: `a223362e091e865aebdd43e4cc25d1ff9b1783a686616f261d9460af3d12725a`
- size: 79,914 bytes

The direct GitHub large-blob attempt was rejected by the SHA safety gate because the connector truncated the payload. No tree, commit or branch ref was created from that failed blob.

## Code Labs recovery backup

Code Labs was rebound to the exact PR #549 source head and the stale C3b-B job/packet/test selections were cleared.

Fresh checkpoint:

- ID: `9e06df40-5fb4-45da-81ec-d418167943d9`
- Label: `TCG 79b verified candidate recovery backup`

The checkpoint preserves a deterministic reconstruction script which starts from exact Git blob `415ac70c1be729a11121bed2505360955412bca1`, asserts every expected old seam exactly once, performs only the reviewed 79b replacements, and must reproduce exact Git blob `0243bc6fa4a9a56a3ce71677469f219c8fd0f9d9` before the candidate is considered usable.

Buddy Canvas contains a human-readable 79b recovery/workbench manifest. It is deliberately **not** Writer-ready source.

## Ally healing rule captured during 79b

**Allies may heal whenever their structured card program says they heal.** There is no global rule preventing an Ally from using a healing opcode.

Frozen Set One proof: **Reef Medic Olan** is a Tide `Ally` whose program selects up to two damaged friendly Tide Creatures and resolves `HEAL_EACH` for 30.

Separate Runtime Pass E parity debt discovered while checking this rule:

- the current tactic interpreter's `HEAL` / `HEAL_EACH` branches call the raw `healRuntimeDamage` primitive;
- those tactic-owned heals therefore do not yet emit canonical `after_heal_packet` events;
- the generic tactic-heal packet bridge must be completed during the appropriate Runtime Pass E work so cards such as Shellip / Moonlit Reef can react correctly;
- this is **not** an Ally-specific exception and must not be mixed into 79b merely to move the progress meter.

PR #549 source-of-truth Ally/heal-parity comment: **#5604971318**.

## Protected Writer fence

**Writer remains HOLD.**

Do not enter or execute the protected Writer chain until File Lab, full-file candidate, Packet Builder, Preview + Test, Checkpoints, Repo Desk, Code God, GitHub destination/PR, GitHub Tracker, and Master Plan / Master Checklist all describe the **same exact full-file candidate and exact reviewed head**.

The old C3b-B job, packet, test and checkpoints are historical evidence only and must not be reused for the current 79b candidate.

## Promotion fence

Nothing in this checkpoint changes:

- `main`;
- live/production;
- deployed Supabase functions or database objects;
- DJ/music/Web Builder work.

79b is not accepted until its exact gameplay source exists on PR #549 and exact-head validation passes. 79c remains required before overall 79% can be accepted.
