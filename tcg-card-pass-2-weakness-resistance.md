# Stream Bandit TCG — Weakness, Matchups and Creature Types

Version: `cp2-matchups-v0.1`

## Weakness multiplier

A matching weakness doubles attack damage once.

- Weakness multiplier: `2x`
- Weakness applies to attack damage only.
- Recoil, Scorched, Venomed, Ability damage, Tactic damage and other non-attack damage are not doubled by Weakness.
- Weakness never grants an automatic Resistance in the opposite direction.
- If more than one matchup rule matches the same attack, the attack is still multiplied only once. Weakness never becomes `4x` through stacked type matches.

## World elements

The physical/world elements form one cyclic matchup chain:

`Tide -> Ember -> Grove -> Gale -> Stone -> Volt -> Tide`

The arrow means the left side is strong against the right side.

| Attacker | Strong against |
|---|---|
| Tide | Ember |
| Ember | Grove |
| Grove | Gale |
| Gale | Stone |
| Stone | Volt |
| Volt | Tide |

### World identities

- Tide suppresses Ember.
- Ember burns Grove.
- Grove obstructs and binds Gale.
- Gale overcomes Stone through airborne movement, erosion and pressure.
- Stone acts as the grounded/world element and grounds Volt.
- Volt is dangerous to Tide.

Stone belongs to the world-element chain. It is not part of the mystical chain.

## Mystical and combat chain

The mystical/combat system forms a separate cyclic matchup chain:

`Astral -> Martial -> Shade -> Fairy -> Underworld -> Astral`

| Attacking key | Strong against defensive key |
|---|---|
| Astral | Martial |
| Martial | Shade |
| Shade | Fairy |
| Fairy | Underworld |
| Underworld | Astral |

### Martial

`Martial` is a Creature Type/trait, not an Essence element.

A Martial creature keeps its normal printed element and can also carry the `Martial` Creature Type.

Examples of future combinations include:

- Stone + Martial heavyweight
- Ember + Martial brawler
- Gale + Martial duelist
- Tide + Martial grappler
- Grove + Martial guardian
- Volt + Martial striker

This allows future sets to explore fighting styles and physical archetypes without creating another Essence colour.

### Martial matchup behavior

- An Astral attack is strong against a creature carrying the Martial type.
- An attack made by a Martial creature is strong against a Shade creature.
- A Martial creature still participates normally in the world chain through its printed element.
- Carrying Martial does not remove or replace the creature's element.

## Fairy and Underworld

`Fairy` and `Underworld` are reserved future full elements.

They are not added to Set One simply to complete the mystical chain.

When introduced, each can support a full card ecosystem such as creatures, evolution families, Standalones, Essence, Tactics, starter construction and prestige cards.

### Fairy identity

Fairy can focus on enchantment, cleansing, protection, transformation, repositioning and elegant trick effects.

### Underworld identity

Underworld can focus on high-cost/high-risk power, sacrifice, defeat-linked value, damaged-creature payoffs and recovery from discard or other death-themed zones when a card explicitly allows it.

## Shade and Astral

Astral and Shade remain full elements.

The mystical chain does not require every adjacent future element to exist in the current set. A matchup edge becomes relevant whenever both sides of that edge exist in a legal match.

## Prismatic

Prismatic sits outside the normal world and mystical chains by default.

A normal Prismatic attack is neutral unless a card or future ruleset explicitly gives it a matchup override.

Using differently coloured Essence to pay for a Prismatic attack does not change that attack's element by itself.

## Matchup keys

For ordinary cards, matchup resolution uses two kinds of information:

1. the creature's printed `element`;
2. optional Creature Types/traits such as `Martial`.

An attack can therefore have one or more offensive matchup keys derived from the attacking creature, while the defender can have one or more defensive matchup keys derived from its element and relevant Creature Types.

A match in the global table produces one Weakness result at most.

### Example

A future `Stone + Martial` creature:

- is a Stone creature for Essence, card effects and the world chain;
- can be hit for Weakness by Gale because `Gale -> Stone`;
- can also be hit for Weakness by Astral because `Astral -> Martial`;
- attacks Shade for Weakness because it carries Martial and `Martial -> Shade`;
- never takes `4x` damage if two weakness conditions somehow match the same attack.

## Resistance

Resistance is separate from the global matchup chains.

Normal cards do not receive Resistance merely because their element or Creature Type is strong against something else.

Resistance is reserved for explicit special-card designs such as unusual forms, dual identities, exceptional armour, Prismatic-style variants or another deliberately designed card effect.

A Resistance entry must state its own target element/type and reduction behavior.

## Attack element

Unless an attack explicitly overrides its damage element, attack element comes from the attacking creature's printed element.

Essence used to pay an attack cost does not change the attack element by itself.

The `Martial` Creature Type adds a combat matchup key; it does not convert the attack into a new Essence element.

## Damage order

For normal attack damage:

1. calculate base damage and attack-side bonuses;
2. determine the attacker's matchup keys;
3. determine the defender's matchup keys;
4. check the global matchup tables;
5. if any legal Weakness match exists, apply `2x` once;
6. apply any explicit Resistance on the defending card;
7. apply defender-side attack-damage reduction or prevention;
8. apply Shield;
9. place remaining damage;
10. resolve the remaining attack effects and normal defeat/Reward/win timing.

## Global matchup data shape

```json
{
  "version": "cp2-matchups-v0.1",
  "weakness_multiplier": 2,
  "max_weakness_applications_per_attack": 1,
  "world_chain": [
    "Tide",
    "Ember",
    "Grove",
    "Gale",
    "Stone",
    "Volt"
  ],
  "mystical_combat_chain": [
    "Astral",
    "Martial",
    "Shade",
    "Fairy",
    "Underworld"
  ],
  "prismatic_default": "neutral"
}
```

Each chain is cyclic: every entry is strong against the next entry, and the final entry is strong against the first.

## Set One compatibility note

Set One currently contains the eight printed elements:

- Astral
- Ember
- Gale
- Grove
- Shade
- Stone
- Tide
- Volt

Fairy and Underworld are future elements.

Martial is a Creature Type that can be assigned to suitable creatures in future card-design/type passes without becoming an Essence element.

The existing Astral v0.2 candidate was created before this global matchup model and still contains individual creature Weakness fields. Those fields are stale under `cp2-matchups-v0.1`; the card's element and Creature Types should be the ordinary matchup inputs instead.