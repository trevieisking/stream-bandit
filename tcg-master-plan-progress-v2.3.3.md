# Stream Bandit TCG — Canonical Master Plan V2.3.3

**Plan date:** 2026-09-17  
**Status:** canonical deck-search integrity amendment over V2.3.2  
**Supersedes on conflict:** `tcg-master-plan-progress-v2.3.2.md`  
**Inherits:** every V2.3.2 requirement, gate, release-recovery item, prototype-restoration rule, visual rule, owner boundary, execution route and LIVE definition remains active unless this file explicitly adds or clarifies it  
**Execution checklist:** `tcg-master-plan-checklist-v2.3.3.md`  
**Execution ledger:** `tcg-master-plan-ledger-v2.3.3.md`  
**Machine release index:** `tcg-release-control-v2.2.json`  
**Deck-search integrity contract:** `tcg-deck-search-integrity-v1.json`  
**Previous canonical checkpoint:** `tcg-master-plan-progress-v2.3.2.md`

---

## 0. Continuity remains mandatory

The V2.3.2 continuity contract remains unchanged:

- every material work slice must update the canonical checklist before the work-result message is delivered;
- accepted work must be appended to the ledger with exact GitHub evidence and next operation;
- a source change without a checklist checkpoint is not an accepted master-plan step;
- a dropped message/new chat resumes from GitHub, not from memory;
- merge, deployment, runtime and live promotion remain separate evidence-gated decisions.

This V2.3.3 change is control/rules work only. It does not itself claim runtime implementation.

---

# 1. Deck Search Integrity — LOCKED, VERY IMPORTANT

## 1.1 Core rule

Every card/effect that performs a **true Deck Search** must end that search with a shuffle of the searched deck.

For the normal player searching their own deck, the player-facing rule must include:

> **Then shuffle your deck.**

If an effect ever searches another player's deck, the equivalent rule is:

> **Then shuffle that deck.**

This is a gameplay invariant, not optional card-by-card wording.

## 1.2 Why this rule exists

A Deck Search lets the searching player inspect eligible cards inside a hidden ordered deck. Without a shuffle, a skilled player could retain knowledge about future draw order or relative card positions after the search.

The game must therefore destroy usable search-derived order knowledge before ordinary play/effect resolution continues.

The digital client should additionally avoid exposing original deck-position metadata that the player does not need, but that UI privacy measure does **not** replace the mandatory shuffle.

---

# 2. Exact mechanic definition

A **true Deck Search** is any structured effect using `search.deck`, or any future equivalent whose rules permit a player to search a deck for one or more cards meeting stated criteria.

The following are **not automatically Deck Search** and therefore do not auto-shuffle merely because cards are viewed:

- draw cards;
- reveal/look at the top card;
- reveal/look at the top N cards;
- deliberately reorder the top N cards;
- deliberately reorder the bottom N cards;
- search hand;
- search discard;
- search Rewards;
- any other bounded-order mechanic whose rule intentionally preserves or changes a known portion of deck order.

Those mechanics follow their own structured rule and shuffle only if that rule explicitly says to shuffle.

This distinction is important so the mandatory search shuffle does not accidentally destroy intentional top-deck/reorder mechanics.

---

# 3. Mandatory Search → Shuffle composition

The generic capability relation is locked as:

`search.deck` **→ mandatory postcondition →** `deck.shuffle`

The postcondition is part of what `search.deck` means in Stream Bandit.

Therefore:

- an individual card cannot disable the shuffle merely by omitting `deck.shuffle` from its own data;
- validation/runtime must treat the shuffle as mandatory for every true Deck Search;
- player-facing generated rules/text must still make the shuffle visible to the player;
- no card-specific search helper may bypass this composition;
- no duplicate Search or Shuffle engine may be created to implement it.

---

# 4. Canonical resolution order

For a normal Deck Search:

1. server validates the Deck Search effect and eligibility rule;
2. server derives the legal search set without exposing unnecessary source deck positions;
3. searching player makes the permitted private choice;
4. selected card(s) move to the structured destination if they leave the deck;
5. the canonical server-side Shuffle/Randomization owner shuffles the searched deck;
6. only after the shuffle completes may later unrelated effects, listeners or ordinary play resume.

If the search is optional and the player searches/accesses the deck but ultimately selects **zero cards**, the deck still shuffles.

If the player never enters/performs the search because an optional effect is declined before deck access begins, no search occurred and no automatic search shuffle is required.

---

# 5. Intentional post-search top/bottom placement

Future effects may intentionally say, in substance, "search for X, then put it on top/bottom of the deck."

To preserve both the search-integrity rule and the intentional known placement, the structured sequence must be explicit:

**search/select → remove/hold selected card as required → shuffle searched deck → perform explicit post-shuffle top/bottom placement.**

A Deck Search must never silently preserve the deck's pre-search order.

---

# 6. Hidden-information requirements

Deck Search remains server-authoritative and private-choice aware.

The Battle Client must:

- show only card information legally available to the searching player;
- not expose original deck index/position metadata unless a separate explicit mechanic requires it;
- not leak searched deck identities/order to the opponent;
- use the existing board-preserving search grid/carousel/overlay interaction;
- never perform the authoritative shuffle in the browser.

The server Shuffle/Randomization owner performs the shuffle. Deterministic seeding may be used in tests, not as client authority in production.

---

# 7. Owner boundaries — no new owner

This rule reuses the established architecture:

- **Search** — validates and resolves search requirement/eligible set;
- **Hidden Information** — controls legal visibility during the private search;
- **Card-Zone** — moves selected cards between deck and their destination;
- **Shuffle / Randomization** — shuffles the searched deck authoritatively.

The 40-owner baseline remains unchanged.

This rule does **not** justify owner #41, a card-specific helper, a browser-side shuffle, or another search engine.

---

# 8. Card authoring / renderer requirement

Any card whose structured rules contain a true Deck Search must render/generated-text the mandatory post-search wording.

For own-deck search, the standard wording is:

> **Then shuffle your deck.**

Validation must flag a player-facing card/rules representation that contains a true Deck Search but fails to communicate the mandatory shuffle.

The runtime invariant remains mandatory even if presentation text has a defect; presentation and runtime must both eventually pass acceptance.

---

# 9. Minimum acceptance tests before implementation is COMPLETE

Deck-search integrity does not become COMPLETE merely because this plan exists.

At minimum, implementation proof must cover:

1. one-card search to hand → selected card moves → deck shuffles;
2. multi-card search → all selected cards move → deck shuffles exactly once after the search operation;
3. optional search that accesses deck but selects zero → deck still shuffles;
4. declined optional search before deck access → no unnecessary shuffle;
5. search followed by another effect cannot observe/rely on pre-search deck order;
6. player-visible search does not expose unnecessary source-position metadata;
7. opponent receives no illegal searched-deck information;
8. look/reveal top N does **not** auto-shuffle when no Deck Search occurs;
9. explicit reorder-top/reorder-bottom does **not** auto-shuffle unless its own rule says so;
10. search + intentional post-shuffle top/bottom placement preserves the explicit final placement;
11. shuffle is server-authoritative and deterministic under test seed;
12. every Set One/current/future structured card containing `search.deck` either explicitly renders the shuffle wording or is flagged by validation.

---

# 10. Relationship to existing gates

This rule is immediately **LOCKED** as desired behavior but runtime implementation/proof belongs to the existing execution path:

- V2-G0R repairs remain first;
- V2-G1 content translation must not author a Deck Search that bypasses this rule;
- V2-G1E must bind `search.deck` to mandatory `deck.shuffle` in the generic owner/opcode mapping;
- V2-G3/V2-G4 Battle Client/search overlays must preserve private information and board context;
- V2-G7 release acceptance must include Deck Search/shuffle behavior in functional coverage if Deck Search is reachable in the release card pool.

No existing V2.3.2 gate is removed or weakened by this amendment.

---

# 11. Locked next operation

After recording this V2.3.3 control checkpoint, return to the previously locked execution route with this invariant carried forward:

1. keep PR #564 / main / runtime / Supabase / live promotion gated by current evidence;
2. keep V2-G0R at 0/11 until actual runtime repairs are proven;
3. during V2-G1E, prove the Search owner + Card-Zone + Hidden Information + Shuffle/Randomization composition generically;
4. do not accept any current/future Deck Search card that can complete without the mandatory shuffle.
