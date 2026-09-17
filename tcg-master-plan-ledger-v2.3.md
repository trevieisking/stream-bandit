# Stream Bandit TCG — Master Plan V2.3 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.3.md`  
**Previous canonical plan:** `tcg-master-plan-progress-v2.2.md`  
**Previous ledger:** `tcg-master-plan-ledger-v2.2.md`  
**Mechanic research:** `tcg-mechanic-heritage-research-v1.md`  
**Evergreen contract:** `tcg-evergreen-extensibility-v1.json`  
**Historical runtime ledger:** `tcg-master-plan-ledger.md`  
**Owner-family baseline:** 40  
**Ledger revision:** V2.3-1 — 2026-09-17

## Rules

- This ledger is append-only continuity over V2.2; it does not erase V2.2 or historical runtime evidence.
- V2.3 inherits the complete V2.2 prototype-restoration / video-style Battle Client authority.
- V2.3 adds evergreen legality, backward compatibility and future-mechanic extensibility policy.
- GitHub exact source/PR/commit evidence is repository truth.
- Supabase remains deployed/live truth.
- Historical Pokémon TCG research is mechanic/category research only. Stream Bandit remains original in card names, mechanic names, rules wording, artwork, frames, branded UI, audio and assets.
- The current 241-card V2 target remains the current content baseline; researched future mechanics are not falsely claimed as implemented in Set One.
- The 40-owner architecture remains the starting authority. No owner #41 is created merely because a future mechanic receives a new player-facing name.

---

## V2.3 transactions

### V2.3-001 — Evergreen ownership philosophy accepted

**State:** ✅ LOCKED planning policy

Player principle supplied by Trev:

> Players should not lose the practical use of legitimately acquired cards just because a newer series is released.

Canonical policy:

- primary Stream Bandit all-cards format uses **no age-based rotation**;
- a released gameplay card remains eligible by age;
- collection ownership and printing history persist;
- new series add cards/mechanics rather than automatically invalidating older purchases;
- older card identities must remain representable by versioned current rules/data;
- optional curated/event/limited formats may restrict card pools without deleting or invalidating the player's collection.

This is an intentional design difference from Pokémon's rotating Standard format.

Research context recorded 2026-09-17:

- Pokémon's 2026 Standard rotation removes `G` regulation-mark cards from Standard;
- Pokémon's Expanded format remains a much broader historical pool (Black & White onward under current published competitive format guidance);
- Pokémon TCG Live has been expanding historical-format support separately from physical Expanded legality.

Primary reference URLs:

- https://www.pokemon.com/uk/pokemon-news/2026-pokemon-tcg-standard-format-rotation-announcement
- https://play.pokemon.com/en-gb/resources/rules/
- https://www.pokemon.com/uk/pokemon-video-games/pokemon-trading-card-game-live

Stream Bandit deliberately chooses Evergreen as the default philosophy instead.

### V2.3-002 — Balance safety valve accepted

**State:** ✅ LOCKED

No age rotation does not mean severe balance/exploit problems must remain untouched.

Accepted correction order:

1. implementation bug fix;
2. explicit rules errata only when genuinely necessary;
3. healthy counterplay through future content;
4. copy-limit/restricted-list controls when appropriate;
5. competitive suspension/ban only as a last resort for severe loops, exploits or format-breaking balance.

If a card requires competitive restriction:

- ownership is preserved;
- artwork/printings are preserved;
- historical deck records are preserved;
- card should remain usable in suitable Private / Practice / Open formats whenever technically and safely possible.

Optional formats are additional experiences, not collection deletion.

### V2.3-003 — Historical/current special-mechanic research completed

**State:** ✅ research authority accepted

Detailed source-backed research is stored in:

- `tcg-mechanic-heritage-research-v1.md`

Reviewed mechanic families include:

- original Pokémon-ex;
- Pokémon-EX;
- old Mega Evolution Pokémon-EX;
- Pokémon-GX;
- TAG TEAM Pokémon-GX;
- Pokémon V;
- Pokémon VMAX;
- Pokémon VSTAR;
- Pokémon V-UNION;
- Radiant / Pokémon Star-style singleton Creatures;
- ACE SPEC-style shared deck singleton support cards;
- Prism Star-style singleton + destination-replacement cards;
- Pokémon LV.X-style overlay upgrades;
- BREAK-style inherited-action evolutions;
- Tera ex-style alternate form/position protection;
- current Mega Evolution Pokémon ex high-reward modern forms;
- faction/style/rule tags such as historical strike/era tags.

The research conclusion is **not** “create an EX engine, GX engine, V engine, etc.”

The conclusion is that those eras repeatedly combine a smaller family of generic capabilities:

- 2- or 3-Reward knockout values;
- once-per-match Attack/Ability receipts;
- exact-parent or ordinary-stage special evolution;
- inherited rule tags/classes;
- special deck-building limits;
- multi-card assembly;
- inherited attacks/Abilities;
- zone replacement / out-of-play movement;
- position-based protection;
- bonus effects for extra cost;
- ordinary shared damage/heal/condition/search/movement mechanics.

### V2.3-004 — Original Stream Bandit mechanic vocabulary accepted as working canon

**State:** ✅ working design vocabulary

The following original Stream Bandit terms are accepted for architecture/design use. Player-facing names may be refined later without changing the underlying generic capability model.

| Stream Bandit term | Generic capability bundle |
|---|---|
| **Ascendant Creature** | high-stakes Creature, normally 2 Rewards when defeated |
| **Colossus Creature** | extreme high-stakes Creature, normally 3 Rewards when defeated |
| **Signature Power** | one shared once-per-match special Attack or Ability |
| **Bonded Creature** | multiple beings represented by one Creature gameplay identity |
| **Convergence Creature** | Creature assembled from multiple component cards |
| **Gleam Creature** | powerful one-per-deck special Creature |
| **Prime Card** | one card total from a shared powerful support group per deck |
| **Voidmarked Card** | special identity capable of discard-destination replacement into the Void |
| **Overform** | upgrade/evolution capable of inheriting selected lower-card actions/properties |
| **Aspect Creature** | alternate form/element with optional positional/form rule |
| **Ascension Evolution** | special evolution procedure capable of extra timing consequences |

These are gameplay classes/capabilities and remain separate from acquisition rarity:

- Basic
- Rare
- Extra Rare
- Mythic

And separate from printing finish:

- Standard
- Shine
- Holo
- Full-Art Shine
- Alt-Art
- Signature Mythic

### V2.3-005 — Composable mechanic architecture accepted

**State:** ✅ LOCKED design rule

Future special cards must be composed from shared data and owners rather than series/card-name branches.

A future Creature may combine, for example:

- `reward_value:3`;
- `rule_tags:["colossus","bonded"]`;
- one ordinary attack;
- one once-per-match Signature Attack;
- an extra-Essence bonus effect;
- ordinary movement/damage/condition opcodes;

without creating a bespoke “this named card” engine.

Generic data surfaces must be capable of expressing:

- Reward-value override;
- game-global once-per-match receipt;
- Attack or Ability Signature Power;
- per-turn/per-card/per-name/per-controller limits;
- exact-parent special evolution;
- ordinary-stage special class;
- optional evolve-and-end-turn behaviour;
- `counts_as` / special-rule tags;
- multi-character identity;
- extra-cost bonus;
- component assembly;
- once-per-game assembly receipt;
- component vs assembled state semantics;
- shared deck-group singleton restriction;
- per-identity singleton restriction;
- no-evolution flag;
- overlay/inherited attacks and Abilities;
- selective HP/element/type/property overrides;
- transform/upgrade cleanse;
- destination replacement / Void zone;
- positional protection;
- dynamic Reserve-size rules;
- attack/Ability cooldowns and receipts;
- attack copying;
- Reward/hand/Reserve/Discard/attachment scaling;
- Reserve splash;
- damage-counter placement;
- prevention/reduction;
- Essence relocation/attachment/discard/recovery;
- Deck/Discard search-and-attach;
- both-player switch effects;
- Realm-dependent effects;
- Condition immunity/cleanse;
- trait/faction synergies;
- multiple printings for one gameplay identity.

This is an extensibility acceptance target, not a claim that every capability is currently live.

### V2.3-006 — Future content extension contract accepted

**State:** ✅ LOCKED

Stream Bandit must remain open to adding through data-driven content:

- new attacks;
- new Abilities;
- new Creatures/card families;
- new special Creature classes/forms;
- new elements/types;
- new traits/factions;
- new series/sets;
- new starter/theme/constructed deck recipes;
- new booster packs and pack slot/odds recipes;
- new rarity/printing treatments;
- new alternate art;
- new collectible coins;
- new deck boxes/sleeves/accessories;
- new Realms/Relics/Tactics/Essence;
- new optional event formats.

Rules:

- adding a new series must not require ordinary runtime `if series == ...` branches;
- adding a deck is a recipe/legality-data operation, not a new deck engine;
- adding a booster pack is a Pack #37 recipe, not a new Edge Function;
- collectible coins/accessories are Collection/cosmetic data;
- gameplay random coin flips remain Randomization-engine behaviour and are separate from owned coin cosmetics.

### V2.3-007 — Backward compatibility promise accepted

**State:** ✅ LOCKED

Every future expansion must preserve older released content.

Compatibility requirements:

- existing gameplay identities remain parseable;
- existing printings remain linked to their gameplay identities;
- existing deck recipes remain loadable or receive explicit versioned migration;
- older effect opcodes keep their defined meaning;
- new schema fields are additive/default-safe where practical;
- rules changes use explicit versioning/errata rather than silent behaviour mutation;
- historical replay/test fixtures remain runnable where retained;
- Collection records are never discarded simply because a new set/schema version exists.

This is the technical half of the Evergreen player promise.

### V2.3-008 — V2-G1E Evergreen/extensibility schema gate added

**State:** ☐ NOT YET IMPLEMENTED

V2-G1 remains the current engineering lane for the current 241-card / ten-starter baseline.

After V2-G1, **V2-G1E** must prove the schema/validators can represent future mechanic families without card/series-name branching.

Minimum V2-G1E proof:

- Reward value override;
- global once-per-match action receipt metadata;
- rule tags / `counts_as` classes;
- identity and shared-group deck limits;
- inheritance/overlay metadata;
- multi-card assembly metadata;
- zone-replacement metadata;
- series/set references;
- deck/pack recipe references;
- gameplay-identity vs printing-identity separation.

V2-G1E is a schema/architecture gate. It does **not** require every researched future mechanic to ship in Set One.

### V2.3-009 — Product UX must support Evergreen ownership

**State:** ✅ desired behaviour LOCKED

Future Collection / Deck Builder work must show:

- all owned series, not just current-season cards;
- printing/rarity variants grouped under gameplay identity;
- selected format legality without deleting/archiving ownership;
- visible reason when a card is disallowed in an optional restricted format;
- Open/Evergreen availability by default where card is not specifically restricted;
- old decks remain viewable even when an optional format does not permit every card;
- replacement/new printing never silently changes gameplay identity when rules are identical.

### V2.3-010 — V2.2 playable-prototype rules remain authoritative

**State:** ✅ inherited / unchanged

Nothing in Evergreen/extensibility work weakens the existing player-experience lock:

- one-screen board-first battle;
- physical cards as controls;
- drag/drop desktop and tap/select touch equivalent;
- green legal-Evolution highlighting;
- Essence dragged/selected onto Creature;
- persistent Realm;
- Ability normally once/turn unless card says otherwise;
- Attack selected from Vanguard card and ends turn after resolution/Aftermath;
- Withdraw from the Vanguard card;
- search/private-choice overlays preserve battlefield context;
- premium full-card renderer;
- debug-form release battlefield forbidden.

New future mechanic classes must fit into this same simple interaction language.

### V2.3-011 — Current engineering order remains disciplined

**State:** 🔎 active control

Do not abandon the current V2 baseline to implement future mechanics prematurely.

Locked order:

1. finish Fairy + Underworld exact `sb-tcg-card-v0.2` translation;
2. validate deterministic 241 identities + ten exact 60-card starters;
3. repair only proven generic dispatcher gaps;
4. implement/prove V2-G1E extensibility schema metadata;
5. build premium reusable full-card renderer;
6. restore one-screen playable Battle Client;
7. prove genuine two-user V2 match;
8. expand Collection/Deck Builder for Evergreen + printing variants;
9. implement Pack #37 through data-driven recipes;
10. add later special-mechanic series one bounded generic capability slice at a time.

No future mechanic is marked runtime-complete merely because its research/design capability is documented.

---

## Current tracker

| Area | State |
|---|---|
| Historical private-alpha 8 / 193 / 8 | ✅ |
| V2 target 10 / 241 / 10 | ✅ |
| V2.2 prototype-restoration UX | ✅ canonical |
| Evergreen/no-age-rotation philosophy | ✅ LOCKED |
| Old-card ownership/usefulness preservation | ✅ LOCKED |
| Pokémon era mechanic-family research | ✅ |
| Original Stream Bandit mechanic vocabulary | ✅ working canon |
| Machine-readable extensibility contract | ✅ |
| Data-driven future series/cards/decks/packs/coins policy | ✅ LOCKED |
| Backward compatibility contract | ✅ LOCKED |
| V2-G1 current 241-card schema | 🔎 IN PROGRESS |
| V2-G1E extensibility schema proof | ☐ |
| Premium full-card renderer | ☐ |
| Restored playable Battle Client | ☐ |
| Evergreen Collection/Deck UX | ☐ |
| Data-driven Pack #37 runtime | ☐ |
| Future special-mechanic series | ☐ open-ended |
| Public V2 | 🔒 HOLD |

---

## Locked restart point

Continue exactly here:

**V2-G1 Fairy/Underworld schema → 241/10 deterministic authority → generic dispatcher gaps → V2-G1E extensibility schema → premium renderer → restored Battle Client → two-user E2E → Evergreen Collection/Deck → Pack #37 recipes → future special series.**
