# Stream Bandit TCG — Card Schema Matchup Fields

Schema: `sb-tcg-card-v0.2`
Matchup table: `cp2-matchups-v0.1`

## Card identity fields

Creature cards keep their printed game element and may also carry Creature Types.

```json
{
  "element": "Stone",
  "creature": {
    "creature_types": ["Martial"]
  }
}
```

`element` and `creature_types` are separate concepts.

- `element` controls Essence identity, element-based card effects and the world-element matchup chain.
- `creature_types` describes cross-element creature identities such as `Martial`.
- `Martial` is not an Essence element.
- Mythic and other prestige/class traits remain separate from `creature_types`.

Current Set One cards are not automatically assigned `Martial`. A creature receives that type only when its card design explicitly calls for it.

## Element values

Current Set One uses:

- Astral
- Ember
- Gale
- Grove
- Shade
- Stone
- Tide
- Volt
- Prismatic

Reserved future full elements:

- Fairy
- Underworld

The reserved elements do not create Set One cards by themselves.

## Creature Type values

Initial cross-element Creature Type used by the matchup system:

- Martial

The field is an array so future sets can introduce additional Creature Types without turning them into Essence elements.

```json
{
  "creature_types": []
}
```

is valid for a creature with no special Creature Type.

## Weakness ownership

Ordinary creature definitions do not store a per-card `weakness` object.

The following older shape is no longer used for normal cards:

```json
{
  "weakness": {
    "element": "Shade",
    "multiplier": 2
  }
}
```

Weakness is calculated from the match rules snapshot using:

- attacking creature `element`;
- attacking creature `creature_types`;
- defending creature `element`;
- defending creature `creature_types`;
- `matchup_version`.

## Match rules snapshot

A match snapshot includes the matchup table version separately from card definitions:

```json
{
  "rules_version": "set-one-card-pass-2",
  "card_schema": "sb-tcg-card-v0.2",
  "effect_schema": "sb-tcg-effects-v0.2",
  "matchup_version": "cp2-matchups-v0.1"
}
```

This keeps the global strength/weakness table in one rules owner instead of copying relationships into every creature definition.

## World matchup keys

`cp2-matchups-v0.1` uses this world chain:

```text
Tide -> Ember -> Grove -> Gale -> Stone -> Volt -> Tide
```

Each arrow means the left attacking element is strong against the right defending element.

## Mystical/combat matchup keys

`cp2-matchups-v0.1` also uses:

```text
Astral -> Martial -> Shade -> Fairy -> Underworld -> Astral
```

`Martial` participates as a Creature Type while Astral, Shade, Fairy and Underworld participate as elements.

Examples:

- Astral attacker versus a Martial defender: Weakness match.
- Martial attacker versus a Shade defender: Weakness match.
- Stone attacker versus Volt defender: Weakness match.
- Gale attacker versus Stone defender: Weakness match.

## Offensive and defensive matchup keys

For a creature, the rules resolver builds keys from both identity layers.

Example creature:

```json
{
  "element": "Stone",
  "creature": {
    "creature_types": ["Martial"]
  }
}
```

Its matchup keys are:

```json
{
  "element_keys": ["Stone"],
  "creature_type_keys": ["Martial"]
}
```

That creature:

- attacks as Stone for the world chain;
- also carries the Martial offensive key for the mystical/combat chain;
- can be attacked through its Stone defensive key;
- can also be attacked through its Martial defensive key.

## Weakness multiplier cap

If one attack matches more than one strength/weakness rule, Weakness is applied once only.

```json
{
  "weakness_multiplier": 2,
  "max_weakness_applications_per_attack": 1
}
```

A dual-match attack therefore remains `2x`, never `4x`.

## Prismatic

Prismatic has no normal edge in either chain.

A Prismatic creature uses its printed `Prismatic` element unless an explicit card effect provides a matchup override.

Different Essence colours used to pay a Prismatic attack do not change the attack element by themselves.

## Resistance

Resistance is not generated from the matchup chains.

Normal cards have no automatic Resistance.

A future exceptional card may carry explicit resistance data, for example:

```json
{
  "resistance": {
    "against": {
      "kind": "element",
      "value": "Ember"
    },
    "reduction": 30,
    "damage_scope": "attack"
  }
}
```

or a future Creature-Type-based resistance when a card design specifically requires it.

Current Set One does not require routine resistance entries.

## Matchup override

Exceptional future cards or forms may use an explicit matchup override rather than changing the global table.

```json
{
  "matchup_override": null
}
```

An override is card-specific data and does not alter `cp2-matchups-v0.1` for other cards.

## Attack damage order

For normal attack damage:

1. calculate base damage and attacker-side bonuses;
2. derive attacker matchup keys;
3. derive defender matchup keys;
4. evaluate `cp2-matchups-v0.1`;
5. apply Weakness `2x` once when one or more legal matches exist;
6. apply an explicit card Resistance if present;
7. apply defender-side attack-damage reduction or prevention;
8. apply Shield;
9. place remaining damage;
10. continue the attack's normal effects and defeat/Reward/win timing.

Non-attack damage does not use the Weakness multiplier.

## Selector/filter additions

The structured selector system can filter creatures by Creature Type:

```json
{
  "filters": {
    "creature_type": "Martial"
  }
}
```

It can also use:

```json
{
  "filters": {
    "creature_types_any": ["Martial"]
  }
}
```

This allows future cards to search, target, buff or restrict Martial creatures without treating Martial as an element.

## Validation changes

For `sb-tcg-card-v0.2`:

1. ordinary creatures must not contain the retired per-card `weakness` object;
2. `creature_types`, when present, must be an array of registered Creature Type identifiers;
3. `Martial` must not appear as an Essence element;
4. Fairy and Underworld are valid reserved element identifiers for future sets but do not appear in the current Set One inventory;
5. the match snapshot must carry a known `matchup_version`;
6. `cp2-matchups-v0.1` applies Weakness at most once per attack;
7. Resistance and matchup overrides are optional exceptional card data and are never inferred from the global chain;
8. selectors referencing a Creature Type must use `creature_type`/`creature_types_any`, not the element filter;
9. ordinary attack element remains the attacking creature's printed element unless a structured effect explicitly overrides it.

## Set One conversion note

The existing Astral structured candidate was created before `cp2-matchups-v0.1` and contains old per-creature Weakness objects.

Its card designs, Abilities, attacks, Essence and Tactic structures remain usable. The stale Weakness objects need to be removed and the batch needs to be checked against this schema before the next element batch is created.
