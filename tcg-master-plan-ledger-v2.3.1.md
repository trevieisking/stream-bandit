# Stream Bandit TCG — Master Plan V2.3.1 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.3.1.md`  
**Previous canonical plan:** `tcg-master-plan-progress-v2.3.md`  
**Previous ledger:** `tcg-master-plan-ledger-v2.3.md`  
**Owner-family baseline:** 40  
**Ledger revision:** V2.3.1-2 — 2026-09-17

## Rules

- This ledger is append-only continuity over V2.3.
- V2.3 remains historical evidence; V2.3.1 closes post-test consistency gaps only.
- GitHub exact commit/PR/comment evidence remains repository truth.
- Supabase remains live/deployed truth.
- No concept-art number becomes a gameplay rule unless structured data declares it.
- External TCG mechanic names are research provenance only; Stream Bandit player-facing names are original.

---

## V2.3.1 transactions

### V2.3.1-001 — Full post-test master-plan audit completed

**State:** ✅ COMPLETE

Audit basis:

- current `main` after V2.3;
- V2.3 evergreen/extensibility authority;
- inherited V2.2 prototype/video interaction authority;
- Release Control V2;
- ten approved showcase image families;
- accepted Fairy/Underworld design packages;
- accepted card-controller contract;
- supplied special-card examples and V2.3 rule matrix.

Initial audit result found two explicit inconsistencies:

1. approved showcase Creature headers visually use Cost top-left + clearly labelled HP in the upper identity/header area, while the older written contract said HP top-left;
2. type/element weakness/resistance-style damage affinity was visible in the supplied special-card examples but was not explicitly reserved in the V2.3 generic capability target.

Subsequent user clarification added two details that also belong in the consistency layer:

3. researched special-card family labels must have original Stream Bandit names rather than shipping EX/GX/V/etc terminology;
4. damage counters require their own physical drag/place/move interaction and turn-transition Condition timing contract.

No other missing post-test planning requirement is currently known.

### V2.3.1-002 — Showcase header reconciliation

**State:** ✅ LOCKED

Corrected renderer authority:

- Cost badge top-left when structured Creature data defines that cost;
- Element/type badge top-right;
- name + stage/classification identity band;
- HP clearly labelled in the upper identity/header area;
- large art;
- exactly two ordinary Creature action slots;
- Withdraw Cost bottom-right;
- rarity/printing/set treatment in frame/footer.

Concept-art values remain non-authoritative. If a Creature has no structured generic Cost, the renderer must omit that field rather than invent it.

### V2.3.1-003 — Damage-affinity capability reserved

**State:** ✅ LOCKED planning capability

Working terminology:

- Vulnerability — configured incoming damage amplification;
- Resistance — configured incoming damage reduction/prevention.

Requirements:

- structured source matching by element/type/rule tag;
- declared modifier mode/value;
- deterministic damage-order interaction;
- visible card marker + accessible text;
- server-authoritative calculation;
- no rarity/printing/special-class automatic assumption;
- no Set One card behaviour changes without explicit structured data.

The capability should first attempt to compose existing Damage/effect owners. No new owner is justified merely by reserving the concept.

### V2.3.1-004 — Original special-family names locked as working canon

**State:** ✅ LOCKED WORKING NAMES

Machine-readable authority:

- `tcg-special-mechanic-names-v1.json`

Working mapping:

- EX/current ex research pattern → **Ascendant Creature**
- GX → **Sigilborn Creature**
- TAG TEAM GX → **Bonded Sigilborn**
- V → **Exalted Creature**
- VMAX → **Colossus Creature**
- VSTAR → **Starforged Creature**
- V-UNION → **Convergence Creature**
- Radiant → **Gleam Creature**
- ACE SPEC → **Prime Card**
- Prism Star → **Riftmarked Card**
- LV.X → **Overform**
- BREAK → **Ascension Form**
- Tera → **Aspect Creature**
- current Mega-ex → **Apex Ascendant**
- historical Mega EX evolve/end-turn pattern → **Ascension Evolution**

Shared once-per-match action name remains **Signature Power**, with Signature Attack / Signature Ability variants.

Important architecture rule:

These names are player-facing/family labels only. They do not create one engine per label. Generic metadata/capabilities remain authoritative.

### V2.3.1-005 — Damage-counter interaction/timing locked

**State:** ✅ LOCKED desired behaviour

Machine-readable authority:

- `tcg-damage-counter-interaction-v1.json`

Counter model:

- base unit = **10 damage**;
- visible counter choices use 10-point increments up to the exact amount permitted by the card/effect/Condition property;
- legal targets and totals come from server-authoritative effect data.

Place-counter choreography:

1. resolving card lifts/hovers;
2. board remains visible;
3. legal targets highlight;
4. counter tray appears;
5. player drags 10-point counter values onto targets, with tap/select accessibility equivalent;
6. selected distribution/remaining amount stays visible;
7. change/cancel is allowed before server commit where practical;
8. server validates and commits;
9. counters visibly land.

Move-counter choreography:

- source card lifts/hovers;
- movable existing damage is visualized;
- legal destinations highlight;
- player drags counters from source to destination;
- source and destination updates commit atomically;
- moved amount cannot exceed the effect limit or available source damage.

Attack ordering:

- attack damage/effects;
- required counter placement/movement choices;
- listeners/Conditions;
- defeat scan;
- Rewards/promotion;
- Aftermath;
- turn-transition checkpoint;
- next player's ordinary play.

Therefore a counter allocation caused by an Attack resolves **before the automatic turn handoff**.

Turn-based Condition rule:

- a Condition may declare damage counters at each canonical turn-switch/checkup checkpoint;
- configured amount is a Condition property;
- 10-point counter animation is reused;
- defeat/Reward/promotion consequences resolve before the next player's ordinary actions;
- not every Condition must deal damage.

Semantic separation is retained between ordinary damage, placing counters, moving counters and turn-transition Condition counters. Ordinary damage modifiers, Vulnerability/Resistance and Shield do not automatically alter placed/moved counters unless explicit structured rules say so.

No new owner is justified by the interaction itself; browser remains presentation/input only.

### V2.3.1-006 — Post-test coverage confirmed

**State:** ✅ COMPLETE

Confirmed retained authority includes:

- prototype restoration / one-screen board;
- full video choreography;
- all-card drag/drop/tap targeting;
- green Evolution target glow;
- Essence/Relic/Realm/Tactic direct play;
- Realm persistence;
- card-owned Ability/Attack/Withdraw;
- active Ability normally once/turn;
- attack auto-end-turn;
- interactive damage counter placement/movement before attack handoff;
- turn-transition Condition damage counters;
- ten visual families;
- 10 / 241 / 10 V2 target;
- Fairy + Underworld;
- artwork on every printable gameplay card;
- rarity + cosmetic printing variants;
- named numeric properties;
- corrected card header layout;
- original Stream Bandit special-mechanic family names;
- Evergreen/no age rotation;
- backward compatibility;
- future cards/attacks/Abilities/series/decks/packs/coins/accessories/events;
- generic special-mechanic capability architecture;
- Vulnerability/Resistance capability;
- 40-owner architecture / no owner #41 by label.

### V2.3.1-007 — Restart point unchanged

**State:** 🔎 V2-G1 remains active

Next:

1. Fairy canonical schema;
2. Underworld canonical schema;
3. deterministic 241/10 authority;
4. proven generic dispatcher gaps only;
5. V2-G1E extensibility schema including damage-affinity + damage-counter interaction metadata + original family labels;
6. premium renderer;
7. restored one-screen Battle Client;
8. real two-user E2E.
