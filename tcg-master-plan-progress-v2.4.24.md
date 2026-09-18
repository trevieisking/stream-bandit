# Stream Bandit TCG — Master Plan Progress V2.4.24

**Repository:** `trevieisking/stream-bandit`  
**Pull request:** #576  
**Continuity parent:** `90df200bdbc136ff59724498c047c7c36d5c498d`  
**Master-plan target:** Stage 3 board-visible Reward + mandatory promotion resolution  
**Release:** 🔒 HOLD merge / `main` / public / full live release.

## 1. Proven gap

The canonical interaction family is complete, but Stage 3 / V2-VISUAL-02 remains open because the V2 battlefield cannot resolve Match-owned `pending_resolution`.

The authoritative Match view already exposes only the public resolution envelope:
`{kind, seat, count}`.

The canonical Match owner already implements:
- `take_reward(reward_positions)`;
- `promote(reserve_index)`;
- post-promotion movement/heal listener continuations;
- defeat/resolution queue progression.

Without browser controls, a real match can stall after defeat.

## 2. Reward claim presentation

When `pending_resolution.kind === 'take_reward'` belongs to the local seat:
- remaining Reward Cards stay face-down;
- their visible positions become selectable;
- selection can be toggled before commit;
- confirm enables only when the number of selected positions equals the server-projected count;
- commit sends only `reward_positions`.

The browser never receives or infers hidden Reward identities.

## 3. Mandatory promotion presentation

When `pending_resolution.kind === 'promote'` belongs to the local seat:
- occupied local Reserve cards are visibly highlighted;
- one Reserve can be selected/deselected before commit;
- explicit confirmation sends only `reserve_index`;
- the status explicitly states that the Vanguard was defeated and mandatory promotion is required.

The server remains final authority over whether that Reserve is legal and applies the canonical forced-promotion movement.

## 4. Opponent / continuation behavior

If the pending resolution belongs to the opponent, the local board shows a waiting state and exposes no local resolution controls.

Any post-promotion movement/heal listener choices continue through the already-accepted generic authoritative choice router.

## 5. Scope

Battle controller + cache/CSS + browser regression tests + V2.4.24 controls only.

No Match/Tactic/Setup runtime, renderer, database schema, migration or card-data source change. Supabase remains Match v6 / Tactic v4.

## 6. Acceptance

Fresh exact-head TCG Validation, Migration Replay, Functional Smoke, review/status and bounded-diff evidence are required.

Accepted behavior head: `37e06263ade6b7ee15a881ce39a230411dee2161`.

Exact-head evidence:
- TCG Card Pass 2 Validation #708 ✅
- Migration Replay #878 ✅
- Functional Smoke #904 ✅
- review threads 0 ✅
- legacy combined statuses 0 ✅
- exact delta from V2.4.23 control-sync: 1 commit / 8 files, bounded to browser/CSS/cache/tests/V2.4.24 controls ✅

Canonical effect:
- STATE-VIS-07 Reward count/claim state ✅
- STATE-VIS-11 defeat/KO + mandatory promotion resolution surface ✅
- ORDER-05 remains open until the remaining board-visible state checklist is reconciled.
