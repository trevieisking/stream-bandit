# Stream Bandit TCG — Card Pass 2 — Deterministic Card Schema

**Status:** Card Pass 2 schema authority only. No production card registry, migration, engine, starter recipe or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

## Authority boundary

The completed Set One audit ledgers plus `tcg-card-pass-2-founder.md` remain authoritative for card design. `tcg-card-pass-2-weakness-resistance.md` remains authoritative for the corrected weakness/resistance rule and the 89-creature Set One assignments.

This file is authoritative for **how those accepted rules are represented deterministically in Card Pass 2**.

It does not rewrite card designs. It defines one canonical structured rules format so the registry, battle engine, deterministic Test Deck Battle and later printed/display text can all refer to the same underlying gameplay data.

---

# CP2-03 — schema decision

## One successor, not a second rules system

Current Supabase evidence shows 40 active SB1 Tactics already contain structured `engine_effects` using `sb-tcg-effects-v0.1`:

- 16 Allies
- 24 Devices

The current interpreter already supports useful deterministic primitives for draw/search, hidden choices, healing, Shield, condition clearing, switching, Essence movement/attachment, temporary modifiers and pending choices.

Card Pass 2 therefore **extends that existing effect language into one successor** rather than inventing a parallel effect engine.

### Canonical versions

- **Card definition schema:** `sb-tcg-card-v0.2`
- **Effect program schema:** `sb-tcg-effects-v0.2`

`sb-tcg-effects-v0.2` is the single successor to `sb-tcg-effects-v0.1`.

During migration, the existing 40 v0.1 Tactics may be used as source evidence, but the final Set One registry must converge on v0.2. Runtime must not keep two competing card-effect owners after migration completes.

---

# 1. Canonical card-definition envelope

Every active Set One identity ultimately receives one `definition` object shaped around the following canonical fields:

```json
{
  "schema": "sb-tcg-card-v0.2",
  "effect_schema": "sb-tcg-effects-v0.2",
  "id": "card-id",
  "name": "Card Name",
  "card_family": "Creature | Essence | Tactic",
  "element": "Astral | Ember | Gale | Grove | Shade | Stone | Tide | Volt | Prismatic",
  "traits": [],
  "pack_only": false,
  "deck_limit": null,
  "creature": null,
  "essence": null,
  "tactic": null,
  "display": {
    "rules_text": null
  }
}
```

Exactly one of `creature`, `essence` or `tactic` is populated according to `card_family`.

## Single-owner cleanup

The final v0.2 definition must not retain duplicate authoritative concepts from the prototype shape.

The following prototype duplicates are retired as gameplay authority after conversion:

- `kind` duplicates `card_family`;
- `stage` duplicates `creature_stage`;
- `family` / `recipe_type` duplicate Tactic subtype or display classification;
- `subtype` duplicates `essence_subtype`;
- raw `attack_1` / `attack_2` strings duplicate structured attacks;
- prose `ability` duplicates structured Ability data;
- `effect_text` duplicates structured rule operations.

Compatibility/display projections may be generated while the UI is migrated, but there is exactly **one structured gameplay owner** for each rule.

---

# 2. Creature schema

A Creature uses:

```json
{
  "creature": {
    "stage": "Baby | Teen | Adult | Standalone",
    "evolves_from_id": null,
    "hp": 120,
    "withdrawal": 1,
    "reward_value": 1,
    "weakness": {
      "element": "Shade",
      "multiplier": 2
    },
    "resistance": null,
    "ability": {},
    "attacks": [],
    "prestige": null
  }
}
```

## Stage rules

`stage` is only:

- Baby
- Teen
- Adult
- Standalone

**Mythic is never a stage.** Mythic is a trait in the top-level `traits` array.

Teen and Adult require a valid `evolves_from_id`.

Baby and Standalone do not evolve from another card unless a future explicit mechanic says otherwise.

## HP

Printed Creature HP must remain in the locked **40–390** range.

Temporary or conditional effects may take effective survivability above 390 through Shield/healing/prevention, but printed HP does not.

## Reward value

`reward_value` is explicit structure, not inferred at runtime from printed wording.

Current Set One design expects:

- ordinary creatures: 1
- Mythic creatures: 2

A future rule may define another value, but the engine must consume the explicit field rather than infer from `stage`.

---

# 3. Weakness and resistance structure

## Weakness

Set One weakness is stored explicitly:

```json
{
  "weakness": {
    "element": "Tide",
    "multiplier": 2
  }
}
```

The corrected CP2-02 rule is binding:

- weakness is directional;
- matching opposing **attack damage** is multiplied by 2;
- weakness does not imply reverse resistance;
- payment Essence does not change attack element;
- direct effect damage, recoil, Aftermath condition damage, healing, Shield and Reward values are not multiplied by weakness.

## Resistance

Resistance is nullable and independent:

```json
{
  "resistance": null
}
```

A future rare resistance may instead use:

```json
{
  "resistance": {
    "element": "ExampleElement",
    "reduction": 30,
    "damage_scope": "attack"
  }
}
```

There is no global automatic resistance amount.

**All 89 current SB1 creatures structure `resistance: null`.**

---

# 4. Creature Ability schema

Every Set One Creature has exactly one named Ability.

An Ability is represented as:

```json
{
  "ability": {
    "id": "ability-id",
    "name": "Ability Name",
    "mode": "active | triggered | continuous",
    "event": null,
    "timing": "own_turn | any_turn | build | attack | aftermath | passive",
    "limit": null,
    "requirements": [],
    "costs": [],
    "steps": [],
    "display_text": "Human-readable rules text"
  }
}
```

`display_text` is for UI/printing only. Runtime legality and resolution come from the structured fields.

## Ability limits

Limits use explicit scope:

```json
{
  "limit": {
    "scope": "turn | match | card_instance | attachment",
    "count": 1,
    "owner": "controller"
  }
}
```

Examples include:

- once during your turn;
- first time each turn;
- once per match;
- once while this Essence instance remains attached.

No card-name-specific turn flags should be needed after conversion.

---

# 5. Attack schema

Creature attacks are an ordered array, not parsed strings:

```json
{
  "attacks": [
    {
      "id": "attack-id",
      "name": "Attack Name",
      "cost": [
        {"element": "Astral", "amount": 2},
        {"element": "Any", "amount": 1}
      ],
      "damage_element": "source_creature",
      "base_damage": 80,
      "damage_formula": null,
      "requirements": [],
      "on_declare": [],
      "before_damage": [],
      "after_damage": [],
      "display_text": "Human-readable attack text"
    }
  ]
}
```

## Essence payment

Attack cost normally checks attached Essence; paying an attack does **not** discard Essence.

Discarding or moving attached Essence occurs only through an explicit structured effect.

`Any` means any attached Essence can satisfy that portion after typed requirements are satisfied.

## Attack element

`damage_element: "source_creature"` means the attack uses the attacking Creature's printed element for weakness.

A future exceptional attack may use an explicit element override, but no current SB1 card relies on Essence colour to change its attack element.

---

# 6. Damage formulas

Conditional attack bonuses must not be discovered by searching English phrases.

A fixed conditional bonus uses an explicit formula term:

```json
{
  "damage_formula": {
    "base": 110,
    "terms": [
      {
        "kind": "conditional_add",
        "amount": 20,
        "when": {"predicate": "target_has_condition", "condition": "Venomed"}
      }
    ]
  }
}
```

A counted formula uses:

```json
{
  "damage_formula": {
    "base": 120,
    "terms": [
      {
        "kind": "count_add",
        "counter": "distinct_attached_essence_elements",
        "amount_per": 20,
        "max_count": 8
      }
    ]
  }
}
```

That structure supports Prismatic Founder's **Total Convergence** without runtime string parsing.

## Attack damage pipeline

The structured engine applies:

1. base/formula attacker damage;
2. attacker-side attack modifiers;
3. weakness ×2 when applicable;
4. rare explicit resistance when applicable;
5. defender-side attack-damage prevention/reduction;
6. Shield;
7. remaining damage;
8. post-damage effects;
9. defeat scan;
10. Reward resolution;
11. win checks.

---

# 7. Starbound schema

Starbound is separate from Mythic, rarity and evolution stage.

A Creature with a Starbound action uses:

```json
{
  "prestige": {
    "starbound": {
      "action_kind": "attack | ability",
      "action_id": "action-id",
      "shared_usage_key": "starbound",
      "consume": "legal_declaration_or_activation"
    }
  }
}
```

A non-Starbound Creature uses `prestige: null` or no Starbound entry.

## Shared marker rule

Each player has exactly one shared Starbound use per match.

The generic gate must work for both:

- Starbound Ability activation;
- Starbound Power attack declaration.

Consumption happens immediately once the activation/declaration is legal, before later prevention/failure resolution.

Ordinary Abilities and attacks on a Starbound Creature remain ordinary actions.

No runtime name matching such as `Starbound Power —` is authoritative after v0.2 conversion.

---

# 8. Essence schema

An Essence uses:

```json
{
  "essence": {
    "subtype": "Basic | Special",
    "provides": [
      {"element": "Volt", "amount": 1}
    ],
    "attach_requirements": [],
    "on_attach": [],
    "continuous": [],
    "listeners": [],
    "lifecycle": null
  }
}
```

## Manual attachment

The global rule remains one manual Essence attachment from hand per player turn.

Effect-generated attachment does not consume that manual allowance unless the effect explicitly says it does.

## Temporary and borrowed Essence

Temporary/borrowed state is represented consistently on the **attached card instance**, not through one-off card IDs:

```json
{
  "attachment_state": {
    "kind": "normal | temporary | borrowed",
    "expires": "controller_aftermath | none",
    "destination_on_expire": "discard | none",
    "created_by": "source-action-id"
  }
}
```

This one lifecycle model covers current Volt designs such as:

- Coilclank temporary charge;
- Dynamozer Overcharge Engine;
- Quickcharge Cell;
- Surge Essence;
- Stormcoil borrowed Essence.

Cleanup applies across Vanguard and Reserve. It is not restricted to the current Vanguard.

---

# 9. Tactic schema

A Tactic uses:

```json
{
  "tactic": {
    "subtype": "Ally | Device | Relic | Realm",
    "play_requirements": [],
    "program": {
      "schema": "sb-tcg-effects-v0.2",
      "discard_after_resolve": true,
      "steps": []
    },
    "listeners": [],
    "continuous": []
  }
}
```

## Subtype lifecycle

- **Ally:** one Ally per player turn; resolves, then leaves play according to rules.
- **Device:** immediate resolution; normally discarded unless an explicit Realm/effect changes destination.
- **Relic:** attaches to a legal Creature and remains until discarded/replaced by rule.
- **Realm:** occupies the one shared Realm slot and remains until replaced/discarded.

Subtype lifecycle is global engine behavior. Individual cards provide only the exceptions they actually need.

---

# 10. Effect-program v0.2

## Existing v0.1 primitives retained

The existing interpreter already provides useful operations. v0.2 retains their semantics where they remain correct:

- `DRAW`
- `DRAW_FIXED`
- `DISCARD_HAND`
- `LOOK_TOP`
- `SELECT_CREATURE`
- `CHOOSE_FROM_SET`
- `CHOOSE_HAND_TO_DISCARD`
- `CHOOSE_HAND_TO_DECK_BOTTOM`
- `SEARCH_DECK`
- `SEARCH_DECK_GROUP`
- `SHUFFLE_DECK`
- `MOVE_CARDS`
- `PUT_REMAINDER_ON_DECK_BOTTOM`
- `RETURN_REMAINDER_TO_DECK_TOP`
- `RETURN_SET_TO_DECK_TOP`
- `HEAL`
- `HEAL_EACH`
- `ADD_SHIELD`
- `CLEAR_CONDITION`
- `CLEAR_CONDITION_IF_PRESENT`
- `CHOOSE_AND_CLEAR_CONDITION`
- `SWITCH_WITH_VANGUARD`
- `CHOOSE_PLAYER`
- `PROMPT_CHOSEN_PLAYER_TO_SELECT_RESERVE`
- `MOVE_ATTACHED_ESSENCE`
- `REPEAT_OPTIONAL`
- `ADD_ATTACK_DAMAGE_MODIFIER`
- `SET_WITHDRAWAL_COST`
- `ADD_CONDITION_IMMUNITY`
- `SET_ATTACK_ELIGIBILITY`
- `ATTACH_ESSENCE_FROM_ZONE`
- `CHECK_DECKOUT_AFTER_RESOLUTION`

The existing requirement primitive `RESERVE_COUNT_AT_LEAST` is preserved through the new predicate model.

## v0.2 additions required for the audited 193

The structured registry also needs generic operations that the current printed-English/card-ID engine handles inconsistently:

- `APPLY_CONDITION`
- `DIRECT_DAMAGE`
- `DISCARD_ATTACHED_ESSENCE`
- `MOVE_ATTACHED_ESSENCE` with explicit source/destination constraints
- `ATTACH_ESSENCE_FROM_ZONE` extended to the legal zones actually required by audited cards
- `ADD_INCOMING_ATTACK_DAMAGE_MODIFIER`
- `ADD_ATTACK_COST_MODIFIER`
- `SET_DEVICE_PLAY_LOCK`
- `SET_WITHDRAWAL_MODIFIER`
- `RECORD_EVENT`
- `IF`
- `TIMEFOLD`

`TIMEFOLD` is a named global rules operation because it has special turn-transition semantics and anti-chain behavior; it is not implemented by parsing Celestyr's text.

---

# 11. Predicate model

Card conditions/bonuses use structured predicates rather than specialized English recognition.

Canonical predicate composition supports:

```json
{
  "all": [],
  "any": [],
  "not": {}
}
```

Leaf predicates include at minimum:

- source/target element;
- source/target stage;
- source/target damaged;
- source/target has Shield;
- source/target has Relic;
- source/target has named condition;
- condition slot empty;
- printed HP threshold;
- withdrawal threshold;
- Reserve count;
- full Reserve;
- hand count;
- card/Device played this turn;
- source became Vanguard this turn;
- source moved Vanguard → Reserve this turn;
- deck looked at this turn;
- Reward looked at this turn/match;
- attached Essence moved this turn;
- attached Essence discarded this turn;
- temporary/borrowed Essence attached;
- damage prevented this turn;
- heal occurred this turn;
- another friendly Creature healed;
- distinct attached Essence element count;
- attached Essence count;
- legal card available in a source zone;
- target remains in play after damage.

Card-specific flags such as `freshwater_turn` or `essence_discarded_turn` must be replaced by generic event/limit data.

---

# 12. Event/listener model

Triggered Abilities, Essence, Relics and Realms use one event model.

Required event names include at minimum:

- `card_played`
- `creature_entered_play`
- `creature_evolved`
- `became_vanguard`
- `moved_to_reserve`
- `essence_attached`
- `essence_moved`
- `essence_discarded`
- `relic_attached`
- `device_resolved`
- `condition_applied`
- `condition_cleared`
- `shield_gained`
- `attack_declared`
- `before_attack_damage`
- `after_attack_damage`
- `damage_prevented`
- `healed`
- `creature_defeated`
- `reward_taken`
- `turn_started`
- `aftermath_started`
- `aftermath_finished`

A listener states:

- event;
- source-presence requirement;
- controller scope;
- optional predicate;
- usage limit;
- steps.

This replaces card-ID-specific event hooks.

---

# 13. Conditions and Shield

Card definitions apply conditions by ID; they do not reproduce the whole global condition rule.

Set One condition references are:

- Scorched
- Venomed
- Blinded
- Mindbound
- Dazed
- Stunned
- Rooted
- Silenced
- Crushed
- Drenched

Shield remains a named gameplay defensive status, but structurally it is a **numeric Shield counter** rather than a mutually exclusive condition-slot value.

## Slot-aware application

`APPLY_CONDITION` must state its mode where relevant:

```json
{
  "op": "APPLY_CONDITION",
  "condition": "Dazed",
  "target": "$target",
  "mode": "apply_if_empty | replace | refresh | increment"
}
```

The engine must not silently replace a different condition in the same slot unless the card explicitly says to replace it.

Global condition timing/recovery belongs to one condition-rules owner, not to each card definition.

---

# 14. Choice and hidden-information model

Every player decision that can affect resolution becomes a deterministic pending choice.

Canonical pending-choice data includes:

```json
{
  "id": "choice-id",
  "effect_id": "effect-id",
  "action_id": "action-id",
  "seat": 1,
  "kind": "select | order",
  "min": 0,
  "max": 1,
  "options": [],
  "context": {}
}
```

## Privacy

The server-authoritative canonical state may know both players' hidden cards, but a player's view exposes only the hidden information their current effect legally permits.

Opponent hidden information must never leak through pending-choice options, logs or match views.

## Optional hidden-zone searches

`selection` always stores explicit `min` and `max`.

Audited cards that say **up to N** use `min: 0`.

The engine must not convert a hidden-zone miss into an illegal state simply because an old prototype encoded a required `min: 1` where failure cannot be proven publicly.

---

# 15. Target selectors

Targeting uses structured selectors:

```json
{
  "controller": "self | opponent",
  "zone": "vanguard | reserve | field | hand | deck | discard | rewards | attached_essence",
  "count": {"min": 0, "max": 1},
  "filters": {}
}
```

Filters include:

- element;
- card family;
- Creature stage;
- Tactic subtype;
- Essence subtype;
- traits;
- damaged state;
- condition state;
- printed HP range;
- printed withdrawal range;
- evolves-from relationship;
- attached-state kind.

Reserve attacks or other non-Vanguard targets are granted only by explicit structured target rules.

---

# 16. Switching and withdrawal

Normal voluntary withdrawal remains a global gameplay action with its own once-per-turn use and attached-Essence payment.

Effect switching is structurally distinct and does not consume voluntary withdrawal unless a card explicitly says it does.

Switch effects must state:

- source controller;
- selected Reserve target;
- whether old/new ordinary conditions clear under global switch rules;
- whether movement events are recorded;
- whether the new Vanguard receives temporary modifiers.

The final engine must not determine movement bonuses by card ID.

---

# 17. Lifecycle expiry

Temporary effects use a common expiry vocabulary:

- `end_of_turn`
- `controller_aftermath`
- `opponent_next_turn_end`
- `after_next_attack`
- `after_preventing_damage`
- `card_leaves_play`
- `attachment_removed`
- `match`

Any effect with an expiry must carry its source action and creation turn/revision in runtime state.

Generic cleanup must work across Vanguard and Reserve.

---

# 18. Deterministic randomness

Current branch functions still call cryptographic randomness directly for coin flips, shuffles and some random choices. That is acceptable prototype evidence but not sufficient for deterministic Test Deck Battle.

Card Pass 2 requires one centralized RNG interface.

## Runtime state

The canonical match state records at minimum:

```json
{
  "rng": {
    "version": "sb-tcg-rng-v1",
    "counter": 0,
    "seed_mode": "server | test"
  }
}
```

Production may generate a private server seed at match creation.

Test Deck Battle supplies a reproducible seed.

Card resolution never calls ad-hoc randomness directly after migration; it requests randomness through the centralized RNG owner, which advances and logs the deterministic counter.

Required random operations include:

- shuffle;
- coin flip;
- random hand sample;
- random target among a legal candidate set.

The exact selected option/result is written to the match event log.

## Hidden-information fairness

The future AI Test Deck Battle receives the same seat-scoped legal-action/view interface as a human player.

It does not receive opponent hidden cards merely because the server or test harness can see them.

---

# 19. Match snapshot identity

A match must be reproducible against the exact rules it started with.

The match/deck snapshot therefore carries:

- `rules_version`;
- `card_schema`;
- `effect_schema`;
- exact card IDs/quantities;
- exact structured definitions or immutable definition hashes;
- starter/deck revision;
- engine version;
- RNG version;
- Test Deck Battle seed when in test mode.

A live registry edit must never change an already-started match's card behavior.

---

# 20. Display text and artwork are not rules authority

Artwork, card images and decorative printed text never define runtime stats/effects.

Human-readable text is generated from or checked against the structured definition.

If display text and structured rules conflict, structured rules are the gameplay authority until the display asset is corrected.

This preserves the locked rule that actual stats/effects come from the registry rather than decorative card artwork.

---

# 21. Deck-construction metadata

The schema reserves explicit `deck_limit` metadata so the server deck validator does not need obsolete global Mythic/Legendary assumptions.

The structure supports:

```json
{
  "deck_limit": {
    "scope": "identity",
    "max": 4
  }
}
```

or another explicit allowed value where the locked deck rules require it.

Card Pass 2 population must enforce the current authority:

- normal gameplay identity: max 4;
- Mythic identity: max 1 per identity;
- Essence: separate high allowance under the deck-rule authority;
- no one-Mythic-total deck cap;
- no obsolete Legendary total/duplicate cap.

The current migration that still enforces global Mythic/Legendary constraints is implementation drift and is not schema authority.

---

# 22. Validation rules before a card can become registry-ready

The future Card Pass 2 validator must fail closed when any v0.2 definition violates the schema.

At minimum validate:

1. unique card ID;
2. exactly one populated family object matching `card_family`;
3. valid Set One element;
4. explicit `pack_only` boolean;
5. Creature printed HP 40–390;
6. Creature stage is Baby/Teen/Adult/Standalone only;
7. no `stage = Mythic`;
8. valid evolution reference for Teen/Adult;
9. one named Ability for every Creature;
10. at least one structured attack for every Creature;
11. explicit Reward value;
12. explicit weakness for current SB1 creatures;
13. `resistance: null` for current SB1 unless a later reviewed exception exists;
14. no more than one Starbound action per card;
15. every Starbound action references the shared player marker;
16. legal typed/Any attack costs;
17. every effect op belongs to v0.2;
18. every target reference can be resolved deterministically;
19. hidden-choice visibility is legal;
20. listener/limit IDs are unique within the card;
21. no card-name/string parsing required to resolve the definition;
22. no unknown lifecycle expiry;
23. no unresolved card-ID special case is required for the card to function;
24. display text, if present, is non-authoritative.

---

# 23. Known prototype debt that v0.2 removes

Current exact-head source inspection confirms these are migration debts, not desired final architecture:

- `tcg-match-actions` parses attack costs/damage/effects from English strings;
- Starbound attack detection depends on a `Starbound Power —` text pattern;
- several attack bonuses are found by checking substrings such as target condition, Device played, Reserve count or attached Essence count;
- many Essence effects are hardcoded by card ID;
- several attack/evolution effects are hardcoded by card ID;
- old setup legality still accepts `stage = Mythic` for prototype compatibility;
- some pending-choice attacks fail closed because only specific cards are supported;
- temporary Essence cleanup includes a card-ID Surge Essence branch;
- current random resolution uses direct cryptographic randomness rather than one replayable RNG stream.

CP2-03 does **not** remove those branches yet. It defines the structure that makes safe removal possible after the 193-card conversion is ready.

---

# 24. Migration principle

Do not half-convert live gameplay.

The safe implementation order is:

1. freeze this schema;
2. structure audited card definitions in reviewable batches;
3. validate every candidate definition against v0.2;
4. complete all 193 identities;
5. revalidate all eight exact 60-card starters;
6. add/upgrade the engine interpreter for the complete v0.2 operation set;
7. run exact deterministic fixtures and Test Deck Battle;
8. only then replace prototype registry/runtime authority atomically under a new rules version.

Until that gate, `set-one-v0.6.1` remains prototype evidence and the audit ledgers remain design authority.

---

# CP2-03 completion state

**SHARED DETERMINISTIC CARD SCHEMA: FROZEN FOR CARD PASS 2.**

Canonical target:

- `sb-tcg-card-v0.2`
- `sb-tcg-effects-v0.2`
- one structured rules owner per concept;
- one successor effect language;
- no runtime printed-English parsing as final authority;
- no card-ID special cases as final authority;
- weakness ×2 and no current SB1 resistance;
- shared Starbound gate;
- generic temporary/borrowed Essence lifecycle;
- generic events/predicates/choices;
- centralized deterministic RNG interface.

No production registry, engine or deployment is changed by this schema freeze.

---

# Next bounded Card Pass 2 stage

## CP2-04 — structure all 193 accepted identities

Proceed in controlled batches using the completed design ledgers as authority.

Recommended order:

1. Astral 24
2. Ember 24
3. Gale 24
4. Grove 24
5. Shade 24
6. Stone 24
7. Tide 24
8. Volt 24
9. Prismatic Founder 1

For each batch:

- convert design only; do not creatively rewrite accepted card identity;
- populate the v0.2 family object;
- populate structured Ability/attacks/effects;
- apply the accepted weakness and `resistance: null`;
- preserve Starbound yes/no decisions;
- validate references and copy-limit metadata;
- record any schema gap instead of adding a card-name exception;
- run deterministic schema validation before promotion to the next batch.

Only after all 193 pass should the registry/engine implementation phase begin.