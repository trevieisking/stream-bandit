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

# 1. Creature definitions — 3/11 structured

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

## 1.2 Scarjackal

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"underworld-scarjackal","name":"Scarjackal","card_family":"Creature","element":"Underworld",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Teen","evolves_from_id":"underworld-woundling","hp":150,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"blood-interest","name":"Blood Interest","mode":"triggered","event":"attack_declared","timing":"attack",
      "limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[
        {"predicate":"event_attack_source_is_self"},
        {"predicate":"damage_history_count_at_least","target":"$source_creature","source_controller":"self","window":"current_turn","min_actual_damage":10,"card_effect_only":true,"count":1}
      ]},
      "costs":[],
      "steps":[{"op":"MODIFY_CURRENT_ATTACK_DAMAGE","delta":20}]
    },
    "attacks":[
      {"id":"scar-bite","name":"Scar Bite","cost":[{"element":"Underworld","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"siphon-fang","name":"Siphon Fang","cost":[{"element":"Underworld","amount":2},{"element":"any","amount":1}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[
        {"op":"IF","when":{"predicate":"target_remains_in_play_after_damage"},"then":[
          {"op":"DRAIN_VITALITY","target":"$attack_target","amount":20,"heal_target":"$source_creature","heal_cap":20}
        ]}
      ]}
    ]
  },"essence":null,"tactic":null
}
```

### Runtime capability note

`Blood Interest` uses the single Damage #20 history predicate. The 10-damage threshold is evaluated per canonical current-turn damage event and excludes wound transfer. `Siphon Fang` uses the existing generic Attack after-damage vitality-drain shape; Damage owns effect damage, Heal owns recovery and Defeat owns lifecycle consequences.

---

## 1.3 Bloodbasilisk

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"underworld-bloodbasilisk","name":"Bloodbasilisk","card_family":"Creature","element":"Underworld",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Adult","evolves_from_id":"underworld-scarjackal","hp":290,"withdrawal":2,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"paid-in-blood","name":"Paid in Blood","mode":"active","event":null,"timing":"own_turn",
      "limit":{"scope":"turn","count":1,"owner":"controller"},
      "requirements":[],
      "costs":[{"kind":"damage","target":"$source_creature","amount":20}],
      "steps":[
        {"op":"SELECT_CREATURE","controller":"opponent","zone":"field","count":1,"filters":{},"as":"drain_target"},
        {"op":"DRAIN_VITALITY","target":"$drain_target","amount":40,"heal_target":"$source_creature","heal_cap":40}
      ]
    },
    "attacks":[
      {"id":"debt-coil","name":"Debt Coil","cost":[{"element":"Underworld","amount":3}],"damage_element":"source_creature","base_damage":100,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"red-ledger","name":"Red Ledger","cost":[{"element":"Underworld","amount":4}],"damage_element":"source_creature","base_damage":null,"damage_formula":{
        "base":140,"snapshot":"legal_declaration","terms":[
          {"kind":"conditional_add","amount":20,"when":{"predicate":"damage_history_count_at_least","target":"$source_creature","source_controller":"self","window":"current_turn","min_actual_damage":1,"card_effect_only":true,"count":1}}
        ]
      },"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

### Runtime capability note

`Paid in Blood` is one Ability activation: choosing to use the Ability is the player's optional decision; after activation the 20 self-damage is the required generic Payment cost, not a second optional prompt. Ability owns activation/limit/continuation, Payment owns the cost, Damage #20 owns the self-damage and drain damage, the opposing-Creature choice facade owns only target selection, Heal owns actual recovery and Defeat owns lifecycle consequences. `Red Ledger` asks the same generic Damage-history query at legal declaration and applies the ordinary Attack `conditional_add` term.

---

## Next accepted identities to structure

The next family remains exactly the accepted design from `tcg-future-underworld-audit.md`:

- **Cryptmite** — Grave Nibble; Crypt Tap.
- **Debtwing** — Owed Pain; Debt Wing; Collection Dive.
- **Revenantusk** — Final Account; Grave Charge; Debt Collector.

Before those cards are promoted into this candidate, their damage-movement and defeat-history clauses must be mapped only through the existing canonical movement/Defeat owners. Any missing generic bridge must be added once to the rightful domain rather than implemented by card identity.
