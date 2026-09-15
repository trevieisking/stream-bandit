# Stream Bandit TCG — Card Pass 2 — Gale 24 v0.2 Candidate

Status: branch-only structured card candidate for the 24 Set One Gale identities.

Schema: `sb-tcg-card-v0.2`
Effect schema: `sb-tcg-effects-v0.2`
Matchup table: `cp2-matchups-v0.1`

## Batch rules

- Element: `Gale`.
- Global world matchup applies `Grove -> Gale -> Stone`; individual Gale cards do not store a Weakness field.
- Current Gale creatures use `creature_types: []`. No Set One Gale creature is assigned `Martial` in this batch.
- Current Gale creatures use `resistance: null` and `matchup_override: null`.
- Every identity carries explicit Starbound yes/no metadata.
- Aeralith — Storm Shepherd is Standalone + Mythic and is the only Starbound Gale identity in this batch.
- Ordinary non-Essence identities use a four-copy identity limit; Aeralith uses one copy; Essence delegates to the shared Essence allowance.
- Pack-only Gale identities are Zephyrhare, Jetstream Essence and Cyclone Route.
- Movement, withdrawal, alternate attack targeting and post-attack condition timing use shared schema primitives from Amendments A–H; no Gale card-name runtime branch is authoritative.
- Card text/art is presentation data; the structures below contain the gameplay-bearing candidate data.

---

# 1. Creature definitions — 11

## 1.1 Driftlet

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-driftlet","name":"Driftlet","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":50,"withdrawal":0,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"rising-draft","name":"Rising Draft","mode":"triggered","event":"became_vanguard","timing":"own_turn",
      "limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"reserve"},{"predicate":"event_destination_zone_is","zone":"vanguard"},{"predicate":"event_controller_is_active_seat"}]},
      "costs":[],"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$source_creature","amount":10,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]
    },
    "attacks":[{"id":"puff-strike","name":"Puff Strike","cost":[{"element":"Gale","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]
  },"essence":null,"tactic":null
}
```

## 1.2 Skyweaver

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-skyweaver","name":"Skyweaver","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Teen","evolves_from_id":"gale-driftlet","hp":120,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"crosswind","name":"Crosswind","mode":"triggered","event":"became_vanguard","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"reserve"},{"predicate":"event_destination_zone_is","zone":"vanguard"},{"predicate":"event_controller_is_active_seat"}]},
      "costs":[],"steps":[{"op":"DRAW","player":"self","count":1},{"op":"CHOOSE_HAND_TO_DISCARD","player":"self","count":1}]
    },
    "attacks":[
      {"id":"crosswind-cut","name":"Crosswind Cut","cost":[{"element":"Gale","amount":1}],"damage_element":"source_creature","base_damage":40,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"lift-away","name":"Lift Away","cost":[{"element":"Gale","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"OPTIONAL","player":"self","steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target","action_kind":"attack"}]}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.3 Tempestalon

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-tempestalon","name":"Tempestalon","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Adult","evolves_from_id":"gale-skyweaver","hp":230,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"storm-entry","name":"Storm Entry","mode":"triggered","event":"became_vanguard","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"reserve"},{"predicate":"event_destination_zone_is","zone":"vanguard"},{"predicate":"event_controller_is_active_seat"}]},
      "costs":[],"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$source_creature","amount":30,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]
    },
    "attacks":[
      {"id":"talon-gust","name":"Talon Gust","cost":[{"element":"Gale","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"tempest-dive","name":"Tempest Dive","cost":[{"element":"Gale","amount":3}],"damage_element":"source_creature","base_damage":110,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"OPTIONAL","player":"self","steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target","action_kind":"attack"}]}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.4 Whiffin

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-whiffin","name":"Whiffin","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":60,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"featherdraft","name":"Featherdraft","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"}]},
      "costs":[],"steps":[{"op":"SET_WITHDRAWAL_MODIFIER","target":"$current_friendly_vanguard","mode":"delta","amount":-1,"minimum":0,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_voluntary_withdrawal_declared"}}]
    },
    "attacks":[{"id":"breeze-peck","name":"Breeze Peck","cost":[{"element":"Gale","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]
  },"essence":null,"tactic":null
}
```

## 1.5 Slipwing

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-slipwing","name":"Slipwing","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Teen","evolves_from_id":"gale-whiffin","hp":110,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"slipstream-relay","name":"Slipstream Relay","mode":"triggered","event":"moved_to_reserve","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_action_kind_is","action_kind":"attack"},{"predicate":"event_controller_is_active_seat"}]},
      "costs":[],"steps":[{"op":"SET_WITHDRAWAL_MODIFIER","target":"$switch_incoming_vanguard","mode":"delta","amount":-1,"minimum":0,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_voluntary_withdrawal_declared"}}]
    },
    "attacks":[
      {"id":"slip-cut","name":"Slip Cut","cost":[{"element":"Gale","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"backdraft","name":"Backdraft","cost":[{"element":"Gale","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"IF","when":{"predicate":"reserve_count_at_least","controller":"self","count":1},"then":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target","action_kind":"attack"}]}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.6 Skyrend

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-skyrend","name":"Skyrend","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Adult","evolves_from_id":"gale-slipwing","hp":210,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"open-sky-hunter","name":"Open Sky Hunter","mode":"triggered","event":"attack_declared","timing":"attack","limit":null,
      "requirements":{"all":[{"predicate":"event_attack_source_is_self"},{"predicate":"event_attack_id_is","attack_id":"sky-rend"},{"predicate":"event_attack_target_zone_is","zone":"reserve"},{"predicate":"event_attack_target_controller_is_opponent"}]},
      "costs":[],"steps":[{"op":"MODIFY_CURRENT_ATTACK_DAMAGE","delta":-20}]
    },
    "attacks":[
      {"id":"razorwind","name":"Razorwind","cost":[{"element":"Gale","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"target_permissions":[],"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"sky-rend","name":"Sky Rend","cost":[{"element":"Gale","amount":3}],"damage_element":"source_creature","base_damage":110,"damage_formula":null,"target_permissions":[{"controller":"opponent","zone":"reserve","card_family":"Creature","selection":"one"}],"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.7 Cloudray

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-cloudray","name":"Cloudray","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":130,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"cloudwake","name":"Cloudwake","mode":"triggered","event":"moved_to_reserve","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_action_kind_is","action_kind":"voluntary_withdrawal"},{"predicate":"event_controller_is_active_seat"}]},
      "costs":[],"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$switch_incoming_vanguard","amount":10,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]
    },
    "attacks":[
      {"id":"wing-sweep","name":"Wing Sweep","cost":[{"element":"Gale","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"cloud-crash","name":"Cloud Crash","cost":[{"element":"Gale","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.8 Gustfox

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-gustfox","name":"Gustfox","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":100,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"quickstep","name":"Quickstep","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"}]},
      "costs":[],"steps":[{"op":"OPTIONAL","player":"self","steps":[{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$source_creature","action_kind":"effect_switch"}]}]
    },
    "attacks":[
      {"id":"gust-bite","name":"Gust Bite","cost":[{"element":"Gale","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"tailwind-strike","name":"Tailwind Strike","cost":[{"element":"Gale","amount":2}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":60,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"source_became_vanguard_this_turn"}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.9 Pinionserpent

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-pinionserpent","name":"Pinionserpent","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":160,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"wind-coil","name":"Wind Coil","mode":"triggered","event":"condition_applied","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_condition_is","condition":"Blinded"},{"predicate":"event_target_controller_is_opponent"},{"predicate":"event_controller_is_active_seat"}]},
      "costs":[],"steps":[{"op":"SET_WITHDRAWAL_MODIFIER","target":"$source_creature","mode":"set","amount":0,"minimum":0,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_voluntary_withdrawal_declared"}}]
    },
    "attacks":[
      {"id":"coil-gust","name":"Coil Gust","cost":[{"element":"Gale","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"blindside-spiral","name":"Blindside Spiral","cost":[{"element":"Gale","amount":3}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"APPLY_CONDITION","target":"$bound_attack_target","condition":"Blinded","mode":"apply_if_empty"}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.10 Zephyrhare — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-zephyrhare","name":"Zephyrhare","card_family":"Creature","element":"Gale",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":100,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"windbound-leap","name":"Windbound Leap","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"},{"predicate":"reserve_count_at_least","controller":"self","count":2}]},
      "costs":[],"steps":[{"op":"OPTIONAL","player":"self","steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{"element":"Gale","exclude_source":true},"as":"leap_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$leap_target","action_kind":"effect_switch"}]}]
    },
    "attacks":[{"id":"zephyr-kick","name":"Zephyr Kick","cost":[{"element":"Gale","amount":1}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":30,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"source_became_vanguard_this_turn"}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]
  },"essence":null,"tactic":null
}
```

## 1.11 Aeralith — Storm Shepherd

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-aeralith-storm-shepherd","name":"Aeralith — Storm Shepherd","card_family":"Creature","element":"Gale",
  "traits":["Mythic"],"pack_only":false,"deck_limit":{"scope":"identity","max":1},
  "prestige":{"starbound":{"enabled":true,"action_kind":"attack","action_id":"eye-of-the-storm","shared_usage_key":"starbound","consume":"legal_declaration_or_activation"}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":310,"withdrawal":1,"reward_value":2,"resistance":null,"matchup_override":null,
    "ability":{
      "id":"storm-shepherd","name":"Storm Shepherd","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},
      "requirements":{"all":[{"predicate":"source_in_play"},{"predicate":"legal_card_available","controller":"self","zone":"reserve","filters":{"card_family":"Creature","element":"Gale"}}]},
      "costs":[],"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{"element":"Gale"},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target","action_kind":"effect_switch"}]
    },
    "attacks":[
      {"id":"shepherd-wind","name":"Shepherd Wind","cost":[{"element":"Gale","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"eye-of-the-storm","name":"Eye of the Storm","cost":[{"element":"Gale","amount":4}],"damage_element":"source_creature","base_damage":140,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"OPTIONAL","player":"self","steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{"element":"Gale"},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target","action_kind":"attack"}]}],"after_attack_finished":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Blinded","mode":"apply_if_empty"}]}
    ]
  },"essence":null,"tactic":null
}
```

---

# 2. Essence definitions — 4

## 2.1 Basic Gale Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-basic-gale-essence","name":"Basic Gale Essence","card_family":"Essence","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":{"subtype":"Basic","provides":[{"element":"Gale","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"listeners":[],"lifecycle":null},"tactic":null
}
```

## 2.2 Breeze Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-breeze-essence","name":"Breeze Essence","card_family":"Essence","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{"subtype":"Special","provides":[{"element":"Gale","amount":1}],"attach_requirements":[],"on_attach":[],"listeners":[],"lifecycle":null,
    "continuous":[{"id":"breeze-withdrawal","kind":"withdrawal","target":"$attached_creature","when":null,"amount":-1,"minimum":0,"filters":{"action_kind":"voluntary_withdrawal"}}]},
  "tactic":null
}
```

## 2.3 Draft Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-draft-essence","name":"Draft Essence","card_family":"Essence","element":"Gale",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{
    "subtype":"Special","provides":[{"element":"Gale","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,
    "listeners":[{"id":"draft-attach-withdrawal","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Gale"},{"predicate":"target_zone_is","target":"$attached_creature","zone":"reserve"},{"predicate":"voluntary_withdrawal_legal_with_incoming","player":"self","incoming_target":"$attached_creature"}]},"limit":null,"steps":[{"op":"OPTIONAL","player":"self","steps":[{"op":"PERFORM_VOLUNTARY_WITHDRAWAL","player":"self","incoming_target":"$attached_creature"}]}]}]
  },"tactic":null
}
```

## 2.4 Jetstream Essence — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-jetstream-essence","name":"Jetstream Essence","card_family":"Essence","element":"Gale",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{
    "subtype":"Special","provides":[{"element":"Gale","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,
    "listeners":[{"id":"jetstream-vanguard-window","event":"became_vanguard","requirements":{"all":[{"predicate":"event_subject_is_attached_creature"},{"predicate":"event_occurred","event":"essence_attached","controller":"self","window":"current_turn","filters":{"source_card_uid":"self","origin_zone":"hand"},"min_count":1}]},"limit":{"scope":"attachment","count":1,"owner":"attachment"},"steps":[{"op":"SET_WITHDRAWAL_MODIFIER","target":"$attached_creature","mode":"set","amount":0,"minimum":0,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_voluntary_withdrawal_declared"}}]}]
  },"tactic":null
}
```

---

# 3. Tactic definitions — 9

## 3.1 Clear Skies — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-clear-skies","name":"Clear Skies","card_family":"Tactic","element":"Gale","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","conditions_any":["Blinded","Dazed"]}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"conditions_any":["Blinded","Dazed"]},"as":"target"},{"op":"CHOOSE_AND_CLEAR_CONDITION","target":"$target","allowed":["Blinded","Dazed"],"count":1},{"op":"DRAW","player":"self","count":1}]},"listeners":[],"continuous":[]}
}
```

## 3.2 Cyclone Route — pack-only Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-cyclone-route","name":"Cyclone Route","card_family":"Tactic","element":"Gale","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[{"predicate":"reserve_count_at_least","controller":"self","count":1}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"self_switch"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$self_switch","action_kind":"effect_switch"},{"op":"IF","when":{"predicate":"reserve_count_at_least","controller":"opponent","count":1},"then":[{"op":"OPTIONAL","player":"self","steps":[{"op":"PROMPT_CHOSEN_PLAYER_TO_SELECT_RESERVE","player":"opponent","as":"opp_switch"},{"op":"SWITCH_WITH_VANGUARD","player":"opponent","target":"$opp_switch","action_kind":"effect_switch"}]}]}]},"listeners":[],"continuous":[]}
}
```

## 3.3 Featherstep — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-featherstep","name":"Featherstep","card_family":"Tactic","element":"Gale","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[{"predicate":"reserve_count_at_least","controller":"self","count":1}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target","action_kind":"effect_switch"},{"op":"SET_WITHDRAWAL_MODIFIER","target":"$switch_incoming_vanguard","mode":"set","amount":0,"minimum":0,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_voluntary_withdrawal_declared"}}]},"listeners":[],"continuous":[]}
}
```

## 3.4 Highwind Spires — Realm

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-highwind-spires","name":"Highwind Spires","card_family":"Tactic","element":"Gale","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Realm","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},
    "listeners":[{"id":"highwind-first-withdrawal","event":"before_voluntary_withdrawal_cost","controller_scope":"any","requirements":{"all":[{"predicate":"event_active_seat_is_controller"}]},"limit":{"scope":"turn","count":1,"owner":"event_controller"},"steps":[{"op":"MODIFY_CURRENT_WITHDRAWAL_COST","delta":-1,"minimum":0}]}],"continuous":[]}
}
```

## 3.5 Pilot Sera — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-pilot-sera","name":"Pilot Sera","card_family":"Tactic","element":"Gale","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"REPEAT_OPTIONAL","player":"self","max":2,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"sera_switch"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$sera_switch","action_kind":"effect_switch"}]},{"op":"SET_ATTACK_ELIGIBILITY","scope":"controller_turn","rule":"only_final_vanguard_may_attack"}]},"listeners":[],"continuous":[]}
}
```

## 3.6 Pressure Compass — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-pressure-compass","name":"Pressure Compass","card_family":"Tactic","element":"Gale","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},
    "listeners":[{"id":"pressure-compass-draw","event":"moved_to_reserve","requirements":{"all":[{"predicate":"event_subject_is_attached_creature"},{"predicate":"event_origin_zone_is","zone":"vanguard"},{"predicate":"event_destination_zone_is","zone":"reserve"}]},"limit":{"scope":"turn","count":1,"owner":"attachment"},"steps":[{"op":"DRAW","player":"self","count":1}]}],"continuous":[]}
}
```

## 3.7 Scout Zeph — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-scout-zeph","name":"Scout Zeph","card_family":"Tactic","element":"Gale","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"LOOK_TOP","player":"self","count":5,"visibility":"controller_private","as":"looked"},{"op":"CHOOSE_FROM_SET","player":"self","set":"$looked","selection":{"min":0,"max":2,"filters":{"card_family":"Creature","element":"Gale"}},"as":"chosen"},{"op":"MOVE_CARDS","cards":"$chosen","destination":"hand"},{"op":"PUT_REMAINDER_ON_DECK_BOTTOM","set":"$looked","exclude":"$chosen","order":"player_choice"}]},"listeners":[],"continuous":[]}
}
```

## 3.8 Tailwind Map — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-tailwind-map","name":"Tailwind Map","card_family":"Tactic","element":"Gale","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":1,"filters":{"card_family":"Creature","element":"Gale","printed_withdrawal_max":1}},"declared_target_count":1,"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}
}
```

## 3.9 Wingclip Charm — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"gale-wingclip-charm","name":"Wingclip Charm","card_family":"Tactic","element":"Gale","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"listeners":[],
    "continuous":[{"id":"wingclip-vanguard-pressure","kind":"attack_damage","target":"$attached_creature","when":{"predicate":"target_became_vanguard_this_turn","target":"$attached_creature"},"amount":20,"filters":{"target_element":"Gale"}}]}
}
```

---

# 4. Gale batch integrity

- Identities: **24**.
- Creatures: **11**.
- Essence: **4**.
- Tactics: **9**.
- Pack-only: **Zephyrhare, Jetstream Essence, Cyclone Route**.
- Mythic identities: **Aeralith — Storm Shepherd only**, one-copy identity limit.
- Starbound identities: **Aeralith — Storm Shepherd only**.
- All ordinary Gale creature definitions use `creature_types: []`, `resistance: null`, `matchup_override: null`.
- Weakness is absent from individual card data and comes from `cp2-matchups-v0.1`.
- Skyrend's Reserve access exists only on `Sky Rend`; Razorwind remains Vanguard-only.
- Skyrend's Reserve-target penalty is a generic current-attack target-zone modifier, not a card-ID damage branch.
- Draft Essence invokes the real voluntary-withdrawal owner and therefore still pays the outgoing Vanguard's legal cost and consumes the normal once-per-turn allowance.
- Breeze Essence, Featherstep, Whiffin, Slipwing, Jetstream Essence and Highwind Spires all use shared withdrawal-cost machinery.
- Cloudray/Slipwing movement rewards use switch counterpart bindings, not creature-name handoffs.
- Aeralith's Eye of the Storm uses shared Starbound metadata and post-attack completion timing.

## Skyshift exact starter compatibility

The existing exact Skyshift recipe remains the provisional 60-card starter target:

- 22 Creatures
- 18 Essence
- 20 Tactics
- 60 total
- 21 distinct starter identities
- pack-only Zephyrhare, Jetstream Essence and Cyclone Route excluded
- Aeralith exactly one copy

No starter-count change is made by this structure batch.

## Balance status

All HP, withdrawal costs, attack costs, damage values and effect magnitudes remain the accepted current-rules candidates and are **not declared final balance** until deterministic AI Test Match and human playtesting are complete.

## Runtime consequence

When the v0.2 registry becomes runtime authority, the battle engine must remove Gale card-ID/name shortcuts including the current Skyrend and Breeze Essence exceptions and resolve these cards through the shared schema only.

---

## Gale Card Pass 2 conclusion

**GALE 24 STRUCTURE CANDIDATE: COMPLETE ON BRANCH.**

This file is not a production registry migration. It is the deterministic structured candidate used to prove that the accepted Gale designs can be represented through the shared Card Pass 2 grammar without a Gale-specific rules engine.
