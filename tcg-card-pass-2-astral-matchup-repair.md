# Stream Bandit TCG — Astral Matchup Projection

Matchup version: `cp2-matchups-v0.1`
Card schema: `sb-tcg-card-v0.2`

This file supplies the corrected matchup projection for the 24-card Astral candidate.

The accepted card names, HP, stages, Abilities, attacks, Essence effects, Tactics, Starbound data, deck limits, pack-only status and Second Sky quantities are unchanged.

## Global matchup behavior

Astral uses the global mystical/combat chain:

`Astral -> Martial -> Shade -> Fairy -> Underworld -> Astral`

For an ordinary Astral creature:

- printed element: `Astral`
- offensive element key: `Astral`
- defensive element key: `Astral`
- Astral attacks are strong against a defender carrying the `Martial` Creature Type
- Underworld attacks are strong against an Astral defender
- normal Weakness multiplier: `2x`
- maximum Weakness applications for one attack: `1`
- no reverse Resistance is created

Fairy and Underworld remain reserved future full elements and are not added to Set One by this projection.

## Creature fields

The 11 Astral creatures use no per-card `weakness` field.

| Card ID | Creature Types | Resistance | Matchup override |
|---|---|---|---|
| `astral-stardot` | `[]` | `null` | `null` |
| `astral-orbitail` | `[]` | `null` | `null` |
| `astral-cosmarch` | `[]` | `null` | `null` |
| `astral-moonbit` | `[]` | `null` | `null` |
| `astral-comettail` | `[]` | `null` | `null` |
| `astral-nebulynx` | `[]` | `null` | `null` |
| `astral-cometmanta` | `[]` | `null` | `null` |
| `astral-orbitortoise` | `[]` | `null` | `null` |
| `astral-prismowl` | `[]` | `null` | `null` |
| `astral-starwhale` | `[]` | `null` | `null` |
| `astral-celestyr-dream-cartographer` | `[]` | `null` | `null` |

Canonical creature fragment:

```json
{
  "element": "Astral",
  "creature": {
    "creature_types": [],
    "resistance": null,
    "matchup_override": null
  }
}
```

A normal Astral Creature definition must not also contain the retired per-card shape:

```json
{
  "weakness": {
    "element": "...",
    "multiplier": 2
  }
}
```

The old Weakness objects inside the earlier Astral candidate are stale matchup metadata only and are not part of the corrected candidate projection.

## Non-Creature identities

The remaining 13 Astral identities keep their existing structured effects and do not receive Creature Types:

### Essence

- `astral-basic-astral-essence`
- `astral-star-essence`
- `astral-orbit-essence`
- `astral-nova-essence`

### Tactics

- `astral-archivist-sol`
- `astral-cartographer-lyra`
- `astral-future-draw`
- `astral-gravity-shift`
- `astral-star-chart`
- `astral-celestial-observatory`
- `astral-dreamglass`
- `astral-orbit-ring`
- `astral-parallax-window`

Their `element = Astral` value remains available to ordinary element-based card filters. `Martial` is never inferred from a Tactic or Essence card.

## Celestyr

`astral-celestyr-dream-cartographer` remains:

- Creature
- Astral
- Standalone
- Mythic trait
- HP 340
- withdrawal 2
- reward value 2
- Starbound enabled
- Starbound attack `second-horizon`
- no Creature Type
- no Resistance
- no matchup override

Timefold and all existing Celestyr attack/Ability structure are unchanged.

## Second Sky

Second Sky remains exactly 60 cards / 21 identities.

This matchup correction changes no starter quantity and adds no Fairy, Underworld or Martial card to Set One.

## Batch checks

- Astral identities: `24`
- Astral creatures: `11`
- Astral Essence: `4`
- Astral Tactics: `9`
- per-card Weakness owners in corrected projection: `0`
- Astral creatures carrying Martial: `0`
- Astral creatures with Resistance: `0`
- Astral creatures with matchup overrides: `0`
- global matchup version: `cp2-matchups-v0.1`
- Weakness multiplier: `2x` once maximum

The complete Astral candidate is read as the accepted Astral structured card data together with this corrected matchup projection. Global Weakness relationships come only from `cp2-matchups-v0.1`.