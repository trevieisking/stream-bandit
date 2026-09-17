# Stream Bandit TCG — Canonical Master Plan V2.4.7

**Plan date:** 2026-09-17  
**Status:** reusable full-card renderer + complete tabletop zone skeleton source candidate  
**Inherits:** V2.4.6 and the full V2.4.1 release/visual authority  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.7.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.7.md`  
**Accepted parent:** PR #576 @ `bd2f5b30109f0927a23f4c8e380548d447cf7678`  
**Release decision:** 🔒 HOLD PR merge, `main`, GitHub Pages/public, live and production release until inherited end-to-end gates pass.

## 0. Accepted parent

V2.4.6 is accepted as PR source state at exact head `bd2f5b30109f0927a23f4c8e380548d447cf7678` after:

- TCG Card Pass 2 Validation #645 — SUCCESS;
- Code Labs Migration Replay #815 attempt 2 — SUCCESS, including zero-to-current disposable PostgreSQL replay;
- Code Labs V50 Functional Smoke #841 — SUCCESS;
- zero review threads;
- no legacy combined-status entries.

This does not authorize PR merge or public/live release.

## 1. V2.4.7 purpose

V2.4.1 established that the existing Battle V2 panel layout is a development scaffold, not the release tabletop. The authoritative server already exposes enough safe state to construct the missing table without adding another gameplay owner:

- both Vanguard and four-Reserve formations;
- local hand identities and opponent hand count only;
- Deck counts only;
- Reward counts only;
- Discard counts, with local identities available but not required for this slice;
- shared Realm identity;
- Creature damage, Shield, conditions, attached Essence and Relic;
- canonical `card_index` definitions and structured v0.2 metadata.

V2.4.7 therefore changes presentation only. It does not add or alter gameplay rules, database state, migrations, Edge Functions, card definitions, starter recipes, the 40 gameplay-owner baseline or the accepted Attack transport contract.

## 2. Reusable card renderer

`stream-bandit-tcg-card-renderer-v2-4-7.js` is the single presentation owner for known TCG cards on the battle surface.

It is deliberately pure:

- no `fetch`;
- no Supabase client;
- no Edge Function names;
- no RPC or database access;
- no randomization;
- no card-id/name gameplay branches;
- no legality, payment, damage or effect resolution.

The renderer consumes data already supplied by authoritative state and presents generic card families. For Creature cards it reads structured/current data for:

- name, family, element and stage;
- maximum/current HP and damage;
- Shield;
- Withdraw Cost;
- Ability identity/mode as printed information;
- conditions;
- attached Essence and Relic presentation;
- server-supplied Attack slots/cost/damage presentation.

Only the controller decides which already-server-owned command may be offered. Attack remains the only newly usable battle-card action in this slice because it was already accepted before V2.4.7.

## 3. Artwork truth

The accepted structured Set One gameplay definitions explicitly keep display/card-art data outside gameplay authority. V2.4.7 therefore must not invent an artwork URL, printing mapping or `approved` state.

The renderer supports explicit presentation states:

- `approved` — only when a real presentation asset URL is supplied by a future canonical art/printing authority;
- `placeholder` — development artwork explicitly marked as such;
- `missing` — no art mapping exists.

The current battle controller supplies no invented art mapping, so cards render as `missing` / Artwork pending. **ART-IMPL-01…06 remain open where not separately proven.** Missing/placeholder artwork is still a release visual gate failure.

## 4. Tabletop zone skeleton

`tcg-battle-v2.html` remains the board-only route and now carries the complete source-level table skeleton:

### Opponent edge → centre

1. hidden opponent hand backs/count;
2. opponent Deck count/back;
3. six Reward slots represented as hidden backs/claimed spaces;
4. opponent Discard count/back;
5. four opponent Reserve positions;
6. opponent Vanguard;
7. shared Realm at the centre.

### Centre → local edge

1. local Vanguard;
2. four local Reserve positions;
3. local Deck count/back;
4. six local Reward slots represented as hidden backs/claimed spaces;
5. local Discard count/back;
6. local known hand cards.

The source keeps the tabletop one-screen mental model and uses horizontal overflow on narrower screens rather than collapsing into a debug form. Desktop/tablet and touch visual acceptance remain manual release gates.

## 5. Hidden-information boundary

The browser must never infer or request hidden identity data merely to draw the table.

V2.4.7 uses only:

- `opponent.hand_count` for opponent hand backs;
- `opponent.deck_count` for opponent Deck;
- `opponent.rewards_count` for opponent Rewards;
- `opponent.discard_count` for opponent Discard;
- local counts for local Deck/Rewards/Discard;
- identities only where the existing authoritative player view already exposes them.

Reward backs are always count-driven; no Reward identity is manufactured. Opponent hand/Deck/Discard identities are never read by the controller.

## 6. Authoritative gameplay boundary retained

The existing battle controller keeps:

- `tcg-private-alpha-api` as match-view transport;
- `tcg-match-actions` as authoritative action transport;
- `match_id`;
- `client_nonce`;
- `expected_revision`;
- `attack_slot` for Attack;
- post-command authoritative refresh;
- pending-choice and busy fences.

The renderer does not own any of those fields.

## 7. Extensibility

This slice follows the element-package extension contract rather than hard-coding the current roster:

- new cards remain structured data;
- new elements remain package/manifest data;
- new card names require no renderer code branch;
- new mechanics must first extend an existing canonical domain engine/opcode, then become data;
- future presentation/art/printing data can be supplied separately without changing gameplay authority.

## 8. Still open after V2.4.7 source work

V2.4.7 does **not** close:

- approved art/printing asset mapping;
- desktop/tablet visual review;
- mobile/touch visual review;
- card zoom/inspector acceptance;
- play Creature / Evolution / Essence / Relic / Realm / Tactic direct interactions;
- active Ability interaction;
- Withdraw interaction;
- legal-target highlighting and Evolution glow;
- complete pending-choice UI;
- KO/promotion animation and result presentation;
- animation/audio pass;
- fresh real two-user V2-ATTACK-01 proof;
- MATCH-01…MATCH-25;
- release shell and public/live deployment gates.

## 9. Validation rule

The complete exact PR head carrying V2.4.7 must pass fresh:

1. TCG Card Pass 2 Validation;
2. Code Labs Migration Replay from zero;
3. Code Labs V50 Functional Smoke;
4. zero material review threads;
5. bounded diff review against accepted parent `bd2f5b...`.

Only then may V2.4.7 be accepted as PR source state. PR merge, `main` and public/live promotion remain separate later decisions.
