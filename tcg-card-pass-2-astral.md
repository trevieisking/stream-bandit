# Stream Bandit TCG — Card Pass 2 — Astral 24 v0.2 Candidate

**Status:** Branch-only Card Pass 2 structured candidate. No production card registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

**Scope:** CP2-04A — all 24 accepted Set One Astral identities.

## Authority chain

This batch is derived only from the current reviewed authorities:

1. `tcg-set-one-audit.md` — accepted Astral card designs and exact Second Sky audit;
2. `tcg-card-pass-2-weakness-resistance.md` — directional Weakness ×2 and Astral per-creature assignments; all current SB1 resistance is null;
3. `tcg-card-pass-2-schema.md` — `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` base schema;
4. `tcg-card-pass-2-schema-amendment-astral.md` — hidden-zone inspection, inspection/reorder events, whole-hand shuffle-back, card-variable predicates, source-scoped Shield caps and source matching;
5. `tcg-card-pass-2-schema-amendment-b.md` — event context, non-inspecting deck movement, top-level Starbound ownership, Essence deck-limit delegation and trigger snapshots;
6. `tcg-card-pass-2-schema-amendment-c.md` — server-only hidden checks, event-history predicates, optional actions, filtered player choice, temporary modifier lifetime and hidden-search semantics;
7. fresh active Supabase SB1 Astral identity data and the exact current `Second Sky` 60-card recipe as identity/source evidence only.

The old `set-one-v0.6.1` registry remains prototype evidence. This file does not make it production authority.

---

# 1. Batch contract

All candidate records below use:

- `schema = sb-tcg-card-v0.2`
- `effect_schema = sb-tcg-effects-v0.2`
- `element = Astral`
- explicit top-level `prestige.starbound.enabled` on every identity
- ordinary identity deck limit `max = 4` unless explicitly overridden
- Mythic identity deck limit `max = 1`
- Essence deck limit delegated to `global_essence_allowance` until the global exact Essence allowance is frozen
- all current SB1 Astral creature `resistance = null`
- attack `damage_element = source_creature`
- no printed-English parsing as gameplay authority
- no Astral card-id runtime branches

The candidate record format intentionally shows the complete gameplay-bearing family object. Display/card-art data remains outside gameplay authority.

---

# 2. Creature definitions — 11

## 2.1 Stardot

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-stardot","name":"Stardot","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Baby","evolves_from_id":null,"hp":50,"withdrawal":0,"reward_value":1,
    "weakness":{"element":"Shade","multiplier":2},"resistance":null,
    "ability":{
      "id":"star-sense","name":"Star Sense","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,
      "requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"}]},
      "costs":[],
      "steps":[
        {"op":"LOOK_TOP","player":"self","count":1,"as":"looked"},
        {"op":"CHOOSE_FROM_SET","source":"$looked","min":0,"max":1,"as":"bottom"},
        {"op":"MOVE_CARDS","player":"self","cards":"$bottom","to":"deck_bottom"},
        {"op":"RETURN_REMAINDER_TO_DECK_TOP","player":"self","source":"$looked","except":"$bottom","order":"preserve"}
      ]
    },
    "attacks":[{"id":"star-ping","name":"Star Ping","cost":[{"element":"Astral","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]
  },"essence":null,"tactic":null
}
```

## 2.2 Orbitail

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-orbitail","name":"Orbitail","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Teen","evolves_from_id":"astral-stardot","hp":120,"withdrawal":1,"reward_value":1,
    "weakness":{"element":"Shade","multiplier":2},"resistance":null,
    "ability":{"id":"orbit-check","name":"Orbit Check","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"source_is_self"}]},"costs":[],"steps":[{"op":"LOOK_TOP","player":"self","count":2,"as":"looked"},{"op":"RETURN_SET_TO_DECK_TOP","player":"self","cards":"$looked","order":"player_choice"}]},
    "attacks":[
      {"id":"orbit-swipe","name":"Orbit Swipe","cost":[{"element":"Astral","amount":1}],"damage_element":"source_creature","base_damage":40,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"predicted-hit","name":"Predicted Hit","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":60,"terms":[{"kind":"conditional_add","amount":20,"when":{"any":[{"predicate":"event_occurred","event":"hidden_information_viewed","controller":"self","window":"current_turn","min_count":1,"filters":{"zone":"deck_top"}},{"predicate":"event_occurred","event":"hidden_information_viewed","controller":"self","window":"current_turn","min_count":1,"filters":{"zone":"deck"}}]}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 2.3 Cosmarch

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-cosmarch","name":"Cosmarch","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Adult","evolves_from_id":"astral-orbitail","hp":240,"withdrawal":2,"reward_value":1,
    "weakness":{"element":"Shade","multiplier":2},"resistance":null,
    "ability":{"id":"charted-future","name":"Charted Future","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":[],"costs":[],"steps":[{"op":"LOOK_TOP","player":"self","count":3,"as":"looked"},{"op":"RETURN_SET_TO_DECK_TOP","player":"self","cards":"$looked","order":"player_choice"}]},
    "attacks":[
      {"id":"constellation-claw","name":"Constellation Claw","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"known-horizon","name":"Known Horizon","cost":[{"element":"Astral","amount":3}],"damage_element":"source_creature","base_damage":110,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"INSPECT_ZONE","player":"self","zone":"deck_top","selection":{"min":1,"max":1,"filters":{}},"visibility":"server_only","return_policy":"same_position","as":"top_card"},{"op":"IF","when":{"predicate":"card_matches","card":"$top_card","filters":{"element":"Astral"}},"then":[{"op":"MOVE_CARDS","player":"self","cards":"$top_card","to":"hand"}]}]}
    ]
  },"essence":null,"tactic":null
}
```

## 2.4 Moonbit

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-moonbit","name":"Moonbit","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Baby","evolves_from_id":null,"hp":60,"withdrawal":1,"reward_value":1,
    "weakness":{"element":"Volt","multiplier":2},"resistance":null,
    "ability":{"id":"moon-glimpse","name":"Moon Glimpse","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,"requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"}]},"costs":[],"steps":[{"op":"INSPECT_ZONE","player":"self","zone":"rewards","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"inspected_rewards"}]},
    "attacks":[{"id":"moon-tap","name":"Moon Tap","cost":[{"element":"Astral","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]
  },"essence":null,"tactic":null
}
```

## 2.5 Comettail

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-comettail","name":"Comettail","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Teen","evolves_from_id":"astral-moonbit","hp":130,"withdrawal":1,"reward_value":1,
    "weakness":{"element":"Volt","multiplier":2},"resistance":null,
    "ability":{"id":"comet-survey","name":"Comet Survey","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"source_is_self"}]},"costs":[],"steps":[{"op":"INSPECT_ZONE","player":"self","zone":"rewards","selection":{"min":0,"max":2,"filters":{},"distinct":true},"visibility":"controller_private","return_policy":"same_position","as":"inspected_rewards"}]},
    "attacks":[
      {"id":"comet-swipe","name":"Comet Swipe","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"reward-arc","name":"Reward Arc","cost":[{"element":"Astral","amount":3}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":80,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"event_occurred","event":"reward_inspected","controller":"self","window":"current_turn","min_count":1}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 2.6 Nebulynx

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-nebulynx","name":"Nebulynx","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Adult","evolves_from_id":"astral-comettail","hp":260,"withdrawal":2,"reward_value":1,
    "weakness":{"element":"Volt","multiplier":2},"resistance":null,
    "ability":{"id":"nebula-memory","name":"Nebula Memory","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":[],"costs":[],"steps":[{"op":"INSPECT_ZONE","player":"self","zone":"rewards","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"inspected_reward"}]},
    "attacks":[
      {"id":"nebula-claw","name":"Nebula Claw","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"starfall-path","name":"Starfall Path","cost":[{"element":"Astral","amount":4}],"damage_element":"source_creature","base_damage":130,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"INSPECT_ZONE","player":"self","zone":"deck_top","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"inspected_top"},{"op":"INSPECT_ZONE","player":"self","zone":"rewards","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"inspected_reward"}]}
    ]
  },"essence":null,"tactic":null
}
```

## 2.7 Cometmanta — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-cometmanta","name":"Cometmanta","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Standalone","evolves_from_id":null,"hp":180,"withdrawal":2,"reward_value":1,
    "weakness":{"element":"Volt","multiplier":2},"resistance":null,
    "ability":{"id":"passing-orbit","name":"Passing Orbit","mode":"triggered","event":"moved_to_reserve","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"vanguard"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_controller_is_self"}]},"costs":[],"steps":[{"op":"LOOK_TOP","player":"self","count":2,"as":"looked"},{"op":"RETURN_SET_TO_DECK_TOP","player":"self","cards":"$looked","order":"player_choice"}]},
    "attacks":[
      {"id":"comet-ray","name":"Comet Ray","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"falling-star","name":"Falling Star","cost":[{"element":"Astral","amount":3}],"damage_element":"source_creature","base_damage":100,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 2.8 Orbitortoise

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-orbitortoise","name":"Orbitortoise","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Standalone","evolves_from_id":null,"hp":170,"withdrawal":2,"reward_value":1,
    "weakness":{"element":"Tide","multiplier":2},"resistance":null,
    "ability":{"id":"forecast-shell","name":"Forecast Shell","mode":"triggered","event":"hidden_information_viewed","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"event_controller_is_self"},{"any":[{"predicate":"event_zone_is","zone":"deck_top"},{"predicate":"event_zone_is","zone":"deck"}]}]},"costs":[],"steps":[{"op":"ADD_SHIELD","target":"$source_creature","amount":10,"source_contribution_cap":20,"source_key":"ability:forecast-shell"}]},
    "attacks":[
      {"id":"orbit-bash","name":"Orbit Bash","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"gravity-shell","name":"Gravity Shell","cost":[{"element":"Astral","amount":3}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"ADD_SHIELD","target":"$source_creature","amount":20}]}
    ]
  },"essence":null,"tactic":null
}
```

## 2.9 Prismowl

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-prismowl","name":"Prismowl","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Standalone","evolves_from_id":null,"hp":110,"withdrawal":1,"reward_value":1,
    "weakness":{"element":"Shade","multiplier":2},"resistance":null,
    "ability":{"id":"wide-eyes","name":"Wide Eyes","mode":"triggered","event":"hidden_information_viewed","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"event_controller_is_self"}]},"costs":[],"steps":[{"op":"DRAW","player":"self","count":1},{"op":"CHOOSE_HAND_TO_DISCARD","player":"self","count":1}]},
    "attacks":[
      {"id":"prism-peck","name":"Prism Peck","cost":[{"element":"Astral","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"insight-dive","name":"Insight Dive","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 2.10 Starwhale

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-starwhale","name":"Starwhale","card_family":"Creature","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "stage":"Standalone","evolves_from_id":null,"hp":200,"withdrawal":3,"reward_value":1,
    "weakness":{"element":"Volt","multiplier":2},"resistance":null,
    "ability":{"id":"star-current","name":"Star Current","mode":"triggered","event":"hidden_information_viewed","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"event_controller_is_self"},{"any":[{"predicate":"event_zone_is","zone":"deck_top"},{"predicate":"event_zone_is","zone":"deck"}]}]},"costs":[],"steps":[{"op":"SET_WITHDRAWAL_MODIFIER","target":"$source_creature","delta":-1,"minimum":0,"duration":{"expires_on":["end_of_turn"],"max_uses":null}}]},
    "attacks":[
      {"id":"gravity-song","name":"Gravity Song","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"starwake","name":"Starwake","cost":[{"element":"Astral","amount":3}],"damage_element":"source_creature","base_damage":90,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 2.11 Celestyr — Dream Cartographer

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-celestyr-dream-cartographer","name":"Celestyr — Dream Cartographer","card_family":"Creature","element":"Astral",
  "traits":["Mythic"],"pack_only":false,"deck_limit":{"scope":"identity","max":1},
  "prestige":{"starbound":{"enabled":true,"action_kind":"attack","action_id":"second-horizon","shared_usage_key":"starbound","consume":"legal_declaration_or_activation"}},
  "creature":{
    "stage":"Standalone","evolves_from_id":null,"hp":340,"withdrawal":2,"reward_value":2,
    "weakness":{"element":"Shade","multiplier":2},"resistance":null,
    "ability":{"id":"dream-cartographer","name":"Dream Cartographer","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":[],"costs":[],"steps":[{"op":"LOOK_TOP","player":"self","count":4,"as":"looked"},{"op":"CHOOSE_FROM_SET","source":"$looked","min":0,"max":1,"as":"bottom"},{"op":"MOVE_CARDS","player":"self","cards":"$bottom","to":"deck_bottom"},{"op":"RETURN_REMAINDER_TO_DECK_TOP","player":"self","source":"$looked","except":"$bottom","order":"player_choice"}]},
    "attacks":[
      {"id":"dream-ray","name":"Dream Ray","cost":[{"element":"Astral","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"LOOK_TOP","player":"self","count":2,"as":"looked"},{"op":"CHOOSE_FROM_SET","source":"$looked","min":1,"max":1,"as":"chosen"},{"op":"MOVE_CARDS","player":"self","cards":"$chosen","to":"hand"},{"op":"PUT_REMAINDER_ON_DECK_BOTTOM","player":"self","source":"$looked","except":"$chosen","order":"preserve"}]},
      {"id":"second-horizon","name":"Second Horizon","cost":[{"element":"Astral","amount":3},{"element":"Any","amount":2}],"damage_element":"source_creature","base_damage":160,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"TIMEFOLD"}]}
    ]
  },"essence":null,"tactic":null
}
```

**Timefold binding:** `TIMEFOLD` uses the already accepted global special transition: damage/instructions/defeats/Rewards/win checks resolve first; no extra turn occurs if the match ended; the extra-turn transition skips the scheduled condition-damage/recovery transition once; the extra turn is a full turn; Timefold cannot chain until the opponent completes a normal turn.

---

# 3. Essence definitions — 4

## 3.1 Basic Astral Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-basic-astral-essence","name":"Basic Astral Essence","card_family":"Essence","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},
  "prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{"subtype":"Basic","provides":[{"element":"Astral","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"listeners":[],"lifecycle":null},
  "tactic":null
}
```

## 3.2 Star Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-star-essence","name":"Star Essence","card_family":"Essence","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},
  "prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{
    "subtype":"Special","provides":[{"element":"Astral","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,
    "listeners":[{"id":"star-essence-attach","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"}]},"limit":null,"steps":[{"op":"LOOK_TOP","player":"self","count":1,"as":"looked"},{"op":"CHOOSE_FROM_SET","source":"$looked","min":0,"max":1,"as":"bottom"},{"op":"MOVE_CARDS","player":"self","cards":"$bottom","to":"deck_bottom"},{"op":"RETURN_REMAINDER_TO_DECK_TOP","player":"self","source":"$looked","except":"$bottom","order":"preserve"}]}]
  },
  "tactic":null
}
```

## 3.3 Orbit Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-orbit-essence","name":"Orbit Essence","card_family":"Essence","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},
  "prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{
    "subtype":"Special","provides":[{"element":"Astral","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,
    "listeners":[{"id":"orbit-essence-reward-heal","event":"reward_inspected","requirements":{"all":[{"predicate":"event_controller_is_self"},{"predicate":"target_damaged","target":"$attached_creature"}]},"limit":{"scope":"attachment","count":1,"owner":"attachment"},"steps":[{"op":"HEAL","target":"$attached_creature","amount":20}]}]
  },
  "tactic":null
}
```

## 3.4 Nova Essence — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-nova-essence","name":"Nova Essence","card_family":"Essence","element":"Astral",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"global_essence_allowance","max":null},
  "prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{
    "subtype":"Special","provides":[{"element":"Astral","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,
    "listeners":[{"id":"nova-essence-reorder-burst","event":"deck_reordered","requirements":{"all":[{"predicate":"event_controller_is_self"},{"predicate":"event_count_at_least","count":2}]},"limit":{"scope":"attachment","count":1,"owner":"attachment"},"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$attached_creature","amount":20,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]}]
  },
  "tactic":null
}
```

---

# 4. Tactic definitions — 9

## 4.1 Archivist Sol — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-archivist-sol","name":"Archivist Sol","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SHUFFLE_ZONE_INTO_DECK","player":"self","zone":"hand","visibility":"owner_private"},{"op":"SHUFFLE_ZONE_INTO_DECK","player":"opponent","zone":"hand","visibility":"owner_private"},{"op":"DRAW_FIXED","player":"self","count":5,"deckout_on_incomplete":true},{"op":"DRAW_FIXED","player":"opponent","count":5,"deckout_on_incomplete":true},{"op":"CHECK_DECKOUT_AFTER_RESOLUTION"}]},"listeners":[],"continuous":[]}
}
```

## 4.2 Cartographer Lyra — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-cartographer-lyra","name":"Cartographer Lyra","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"LOOK_TOP","player":"self","count":5,"as":"looked"},{"op":"RETURN_SET_TO_DECK_TOP","player":"self","cards":"$looked","order":"player_choice"},{"op":"DRAW","player":"self","count":1}]},"listeners":[],"continuous":[]}
}
```

## 4.3 Future Draw — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-future-draw","name":"Future Draw","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"LOOK_TOP","player":"self","count":3,"as":"looked"},{"op":"CHOOSE_FROM_SET","source":"$looked","min":1,"max":1,"as":"chosen"},{"op":"MOVE_CARDS","player":"self","cards":"$chosen","to":"hand"},{"op":"PUT_REMAINDER_ON_DECK_BOTTOM","player":"self","source":"$looked","except":"$chosen","order":"player_choice"}]},"listeners":[],"continuous":[]}
}
```

## 4.4 Gravity Shift — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-gravity-shift","name":"Gravity Shift","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"CHOOSE_PLAYER","allowed":["self","opponent"],"where":{"predicate":"reserve_count_at_least","count":1},"as":"chosen_player"},{"op":"PROMPT_CHOSEN_PLAYER_TO_SELECT_RESERVE","player":"$chosen_player","count":1,"as":"target"},{"op":"SWITCH_WITH_VANGUARD","player":"$chosen_player","target":"$target"}]},"listeners":[],"continuous":[]}
}
```

## 4.5 Star Chart — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-star-chart","name":"Star Chart","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":1,"filters":{"element":"Astral","card_family":"Tactic","tactic_subtype":["Ally","Relic"]}},"declared_target_count":1,"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}
}
```

## 4.6 Celestial Observatory — Realm

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-celestial-observatory","name":"Celestial Observatory","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{
    "subtype":"Realm","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],
    "listeners":[{"id":"celestial-observatory-topshift","event":"hidden_information_viewed","controller_scope":"any","requirements":{"all":[{"predicate":"event_zone_is","zone":"deck_top"}]},"limit":{"scope":"turn","count":1,"owner":"event_controller"},"steps":[{"op":"OPTIONAL","player":"$event_controller","steps":[{"op":"MOVE_ZONE_POSITION","player":"$event_controller","zone":"deck","from":"top","to":"bottom","count":1,"visibility":"no_additional_reveal"}]}]}]
  }
}
```

## 4.7 Dreamglass — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-dreamglass","name":"Dreamglass","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{
    "subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],
    "listeners":[{"id":"dreamglass-foresight-heal","event":"hidden_information_viewed","requirements":{"all":[{"predicate":"source_is_attached_creature"},{"predicate":"source_controller_is_self"},{"any":[{"predicate":"event_action_kind_is","action_kind":"ability"},{"predicate":"event_action_kind_is","action_kind":"attack"}]}]},"limit":{"scope":"turn","count":1,"owner":"controller"},"steps":[{"op":"HEAL","target":"$attached_creature","amount":10}]}]
  }
}
```

## 4.8 Orbit Ring — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-orbit-ring","name":"Orbit Ring","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{
    "subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],
    "listeners":[{"id":"orbit-ring-after-attack","event":"attack_finished","requirements":{"all":[{"predicate":"source_is_attached_creature"},{"predicate":"source_controller_is_self"},{"predicate":"source_element_is","element":"Astral"}]},"limit":null,"steps":[{"op":"LOOK_TOP","player":"self","count":1,"as":"looked"},{"op":"CHOOSE_FROM_SET","source":"$looked","min":0,"max":1,"as":"bottom"},{"op":"MOVE_CARDS","player":"self","cards":"$bottom","to":"deck_bottom"},{"op":"RETURN_REMAINDER_TO_DECK_TOP","player":"self","source":"$looked","except":"$bottom","order":"preserve"}]}]
  }
}
```

## 4.9 Parallax Window — pack-only Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"astral-parallax-window","name":"Parallax Window","card_family":"Tactic","element":"Astral",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"INSPECT_ZONE","player":"self","zone":"rewards","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"inspected_reward"},{"op":"LOOK_TOP","player":"self","count":3,"as":"looked"},{"op":"RETURN_SET_TO_DECK_TOP","player":"self","cards":"$looked","order":"player_choice"},{"op":"DRAW","player":"self","count":1}]},"listeners":[],"continuous":[]}
}
```

---

# 5. Batch validation

## Identity/reference validation

Fresh active SB1 Astral source evidence contains exactly these **24 unique ids** and every id above matches that active inventory.

- Creature: **11**
- Essence: **4**
- Tactic: **9**
- Total: **24**

Evolution references resolve internally:

- Stardot → Orbitail → Cosmarch
- Moonbit → Comettail → Nebulynx

No Adult/Teen candidate points to a missing predecessor.

## Creature validation

All 11 creatures now have:

- valid stage from Baby / Teen / Adult / Standalone only;
- explicit HP within 40–390;
- explicit withdrawal;
- explicit reward value;
- exactly one named Ability;
- at least one structured attack;
- accepted per-creature Weakness ×2;
- `resistance: null`;
- explicit Starbound yes/no.

Celestyr is normalized to **Standalone + Mythic trait**, reward value 2 and one-copy identity limit. It is the only Astral Starbound identity and references exactly one Starbound action: `second-horizon`.

## Pack-only validation

Exactly three Astral identities are pack-only:

1. `astral-cometmanta`
2. `astral-nova-essence`
3. `astral-parallax-window`

These are absent from the exact current `Second Sky` starter recipe.

## Effect-language validation

Every operation/predicate used by this batch is provided by the v0.2 base schema or Amendments A/B/C. The batch introduces **no new Astral-only operation** and no card-id runtime conditional.

Key former prototype debt now has a data-driven representation:

- Stardot/Moonbit play-from-hand Reserve/Build triggers use event context;
- Reward inspection uses private `INSPECT_ZONE`;
- Predicted Hit/Reward Arc use generic event-history predicates;
- Known Horizon uses `server_only` inspection plus `card_matches`;
- Forecast Shell uses a source-scoped Shield contribution cap;
- Prismowl uses `hidden_information_viewed` rather than a card-name flag;
- Starwhale uses a temporary withdrawal modifier;
- Celestyr uses explicit top-level Starbound metadata and generic `TIMEFOLD`;
- Star/Orbit/Nova Essence use generic attachment/listener semantics;
- Archivist Sol shuffles entire hidden hands back rather than discarding them;
- Gravity Shift uses filtered player choice plus chosen-player Reserve choice;
- Celestial Observatory uses a persistent shared Realm listener and non-inspecting top-to-bottom movement;
- Dreamglass uses attached-source hidden-information matching;
- Orbit Ring uses `attack_finished`;
- Parallax Window uses generic private Reward inspection plus ordinary top-deck ordering.

---

# 6. Second Sky exact 60 validation

Fresh Supabase source evidence confirms the active `Second Sky` recipe remains **60 cards / 21 identities**. The accepted recipe is preserved; this batch does not change quantities.

| Identity | Qty |
|---|---:|
| Stardot | 3 |
| Orbitail | 2 |
| Cosmarch | 2 |
| Moonbit | 3 |
| Comettail | 2 |
| Nebulynx | 2 |
| Starwhale | 3 |
| Prismowl | 2 |
| Orbitortoise | 2 |
| Celestyr — Dream Cartographer | 1 |
| Basic Astral Essence | 14 |
| Star Essence | 2 |
| Orbit Essence | 2 |
| Star Chart | 3 |
| Future Draw | 3 |
| Gravity Shift | 2 |
| Cartographer Lyra | 2 |
| Archivist Sol | 2 |
| Orbit Ring | 3 |
| Dreamglass | 2 |
| Celestial Observatory | 3 |

Checks:

- total = **60**;
- 21 distinct starter identities;
- 22 Creature / 18 Essence / 20 Tactic;
- 14 legal starting-creature copies after Celestyr Standalone normalization;
- two complete 3→2→2 evolution lines;
- no pack-only identities;
- Celestyr quantity 1 satisfies Mythic one-copy-per-identity;
- ordinary non-Essence identities remain within max 4;
- Essence remains under the separate global Essence allowance authority.

The stored prototype recipe label `Creature — Mythic` for Celestyr is implementation/display drift only; the accepted structural candidate is `Creature — Standalone` plus Mythic trait. Recipe quantities do not change.

---

# 7. CP2-04A completion state

**ASTRAL STRUCTURED CANDIDATE: COMPLETE — 24 / 24 IDENTITIES.**

This is a **candidate ledger**, not a production registry mutation. It proves that the accepted Astral package can be represented under the shared v0.2 grammar without card-name runtime branches.

Still intentionally deferred:

- production `tcg_card_definitions` updates;
- the exact new production rules-version identifier;
- machine-readable consolidated v0.2 validator/specification;
- engine interpreter conversion/removal of printed-English and card-id prototype branches;
- final exact numeric global Essence deck allowance;
- deterministic AI Test Match balance tuning;
- human playtesting;
- PR merge and live promotion.

No provisional balance number is silently changed here.

---

# 8. Next bounded action

After this Astral ledger's **new exact head** passes the same migration replay + functional-smoke gate:

**CP2-04B — Ember 24 read-only structure pass.**

Use the accepted Ember audit, corrected weakness matrix and the exact same v0.2 schema authorities. If Ember exposes a genuinely generic schema gap, amend the shared schema before writing the Ember card ledger. Do not add an Ember-specific runtime exception and do not start registry/engine writes yet.