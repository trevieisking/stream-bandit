# Stream Bandit TCG — Card Pass 2 — Underworld 24 v0.2 Candidate

**Status:** Detached in-progress structured card candidate for the accepted Underworld package. This file is **not yet** an active package-registry source and does not change starter authority, the historical 193-card snapshot, production registry, migrations or deployed gameplay. The Underworld package must remain `designed_pending_structure` until all 24 accepted identities are structured and validated.

Schema: `sb-tcg-card-v0.2`  
Effect schema: `sb-tcg-effects-v0.2`  
Matchup table: `cp2-matchups-v0.1`

## Authority and batch rules

This batch translates the accepted current-rules design in `tcg-future-underworld-audit.md` through the existing v0.2 card/effect grammar and the binding additive schema amendments.

- Element: `Underworld`.
- Current release target: one 24-identity Underworld package and exact 60-card starter `Debtbound`.
- Package shape: 11 Creatures / 4 Essence / 9 Tactics / 3 pack-only identities.
- Global matchup data owns routine Weakness/Strength semantics; ordinary Underworld Creatures do not store a per-card `weakness` field.
- Current Underworld creatures use `creature_types: []`, `resistance: null` and `matchup_override: null` unless an accepted design explicitly says otherwise.
- Pack-only identities remain Coffincrow, Grave Essence and Wound Exchange.
- Thanavor — Debt Sovereign is the only Underworld Mythic / Starbound identity.
- Card names and display text are not runtime dispatch authority.
- Only grammar-backed operations/predicates may enter the structured candidate. If an accepted design exposes a missing generic capability, that capability must be added once to its rightful owner before the card is structured; no card-name helper is allowed.

---

# 1. Creature definitions — in progress

## 1.1 Woundling

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"underworld-woundling","name":"Woundling","card_family":"Creature","element":"Underworld",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":70,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"little-siphon","name":"Little Siphon","mode":"active","event":null,"timing":"own_turn",
      "limit":{"scope":"turn","count":1,"owner":"controller"},
      "requirements":{"all":[{"predicate":"source_damaged"}]},
      "costs":[],
      "steps":[{"op":"DRAIN_VITALITY","target":"$current_opponent_vanguard","amount":10,"heal_target":"$source_creature","heal_cap":10}]
    },
    "attacks":[
      {"id":"scratch-debt","name":"Scratch Debt","cost":[{"element":"Underworld","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

### Runtime capability note

`Little Siphon` is intentionally expressed only with already-declared generic authority: `source_damaged` and `DRAIN_VITALITY`. The Damage/Heal/Defeat program owns the drain transaction; no Woundling-specific runtime branch is permitted.

---

## Next accepted identities to structure

The next family members remain exactly the accepted designs from `tcg-future-underworld-audit.md`:

- **Scarjackal** — Blood Interest; Scar Bite; Siphon Fang.
- **Bloodbasilisk** — Paid in Blood; Debt Coil; Red Ledger.

Before their conditional self-damage history clauses are encoded, the shared Damage/Event requirement surface must prove one generic query for “source received damage from one of controller's own card effects during this turn”. Until then those clauses remain design authority only rather than being translated into guessed predicate names.
