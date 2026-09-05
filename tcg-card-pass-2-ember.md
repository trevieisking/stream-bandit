# Stream Bandit TCG — Card Pass 2 — Ember 24 v0.2 Candidate

Status: branch-only structured card candidate for the 24 Set One Ember identities.

Schema: `sb-tcg-card-v0.2`
Effect schema: `sb-tcg-effects-v0.2`
Matchup table: `cp2-matchups-v0.1`

## Batch rules

- Element: `Ember`
- Global world matchup applies `Tide -> Ember`; individual Ember cards do not store a Weakness field.
- Current Ember creatures use `creature_types: []`. No Set One Ember creature is assigned `Martial` in this batch.
- Current Ember creatures use `resistance: null` and `matchup_override: null`.
- Every identity carries explicit Starbound yes/no metadata.
- Pyrohorn — Ash Crown is Standalone + Mythic and is the only Starbound Ember identity in this batch.
- Ordinary non-Essence identities use a four-copy identity limit; Pyrohorn uses one copy; Essence delegates to the shared Essence allowance.
- Pack-only Ember identities are Cinderburrow, Wildfire Essence and Ashen Gamble.
- Card text/art is presentation data; the structures below contain the gameplay-bearing candidate data.

---

# 1. Creature definitions — 11

## 1.1 Glowcub

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-glowcub","name":"Glowcub","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":60,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"warm-blood","name":"Warm Blood","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],
      "continuous":[{
        "id":"warm-blood-spark-pounce","kind":"attack_damage","target":"$source_creature",
        "when":{"predicate":"source_damaged"},"amount":10,"filters":{"attack_id":"spark-pounce"}
      }]
    },
    "attacks":[
      {"id":"spark-pounce","name":"Spark Pounce","cost":[{"element":"Ember","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.2 Bristleflare

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-bristleflare","name":"Bristleflare","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Teen","evolves_from_id":"ember-glowcub","hp":140,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"heat-up","name":"Heat Up","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,
      "requirements":{"all":[{"predicate":"event_subject_is_source"}]},"costs":[],
      "steps":[{"op":"OPTIONAL","player":"self","steps":[{"op":"DIRECT_DAMAGE","target":"$source_creature","amount":10,"damage_class":"effect"},{"op":"DRAW","player":"self","count":1}]}]
    },
    "attacks":[
      {"id":"ember-claw","name":"Ember Claw","cost":[{"element":"Ember","amount":1}],"damage_element":"source_creature","base_damage":40,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"reckless-rush","name":"Reckless Rush","cost":[{"element":"Ember","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"DIRECT_DAMAGE","target":"$source_creature","amount":10,"damage_class":"recoil","source_attack_id":"reckless-rush"}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.3 Furnacefang

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-furnacefang","name":"Furnacefang","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Adult","evolves_from_id":"ember-bristleflare","hp":260,"withdrawal":2,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"controlled-burn","name":"Controlled Burn","mode":"triggered","event":"attack_declared","timing":"attack",
      "limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_attack_source_is_self"}]},"costs":[],
      "steps":[{"op":"IF","when":{"predicate":"source_damaged"},"then":[{"op":"MODIFY_CURRENT_ATTACK_DAMAGE","delta":20}]}]
    },
    "attacks":[
      {"id":"furnace-bite","name":"Furnace Bite","cost":[{"element":"Ember","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"meltline-charge","name":"Meltline Charge","cost":[{"element":"Ember","amount":3}],"damage_element":"source_creature","base_damage":140,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"DIRECT_DAMAGE","target":"$source_creature","amount":20,"damage_class":"recoil","source_attack_id":"meltline-charge"}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.4 Coalfinch

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-coalfinch","name":"Coalfinch","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":50,"withdrawal":0,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"cinder-lift","name":"Cinder Lift","mode":"triggered","event":"became_vanguard","timing":"own_turn",
      "limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"reserve"},{"predicate":"event_destination_zone_is","zone":"vanguard"},{"predicate":"event_controller_is_active_seat"}]},
      "costs":[],
      "steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$source_creature","amount":10,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]
    },
    "attacks":[
      {"id":"cinder-peck","name":"Cinder Peck","cost":[{"element":"Ember","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.5 Sootwing

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-sootwing","name":"Sootwing","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Teen","evolves_from_id":"ember-coalfinch","hp":120,"withdrawal":0,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"soot-glide","name":"Soot Glide","mode":"triggered","event":"moved_to_reserve","timing":"own_turn",
      "limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"vanguard"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_action_kind_is","action_kind":"attack"},{"predicate":"event_controller_is_active_seat"}]},
      "costs":[],"steps":[{"op":"HEAL","target":"$source_creature","amount":10}]
    },
    "attacks":[
      {"id":"soot-dive","name":"Soot Dive","cost":[{"element":"Ember","amount":1}],"damage_element":"source_creature","base_damage":40,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"flash-wing","name":"Flash Wing","cost":[{"element":"Ember","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"OPTIONAL","player":"self","steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target"}]}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.6 Cindercrest

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-cindercrest","name":"Cindercrest","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Adult","evolves_from_id":"ember-sootwing","hp":220,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"ash-mark","name":"Ash Mark","mode":"triggered","event":"became_vanguard","timing":"own_turn",
      "limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_controller_is_active_seat"}]},"costs":[],
      "steps":[{"op":"APPLY_CONDITION","target":{"controller":"opponent","zone":"vanguard"},"condition":"Scorched","mode":"apply_if_empty"}]
    },
    "attacks":[
      {"id":"fireline-sweep","name":"Fireline Sweep","cost":[{"element":"Ember","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"cinder-spiral","name":"Cinder Spiral","cost":[{"element":"Ember","amount":3}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":120,"terms":[{"kind":"conditional_add","amount":30,"when":{"predicate":"target_has_condition","condition":"Scorched"}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.7 Ashcobra

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-ashcobra","name":"Ashcobra","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":110,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"ash-scent","name":"Ash Scent","mode":"triggered","event":"attack_declared","timing":"attack",
      "limit":{"scope":"turn","count":1,"owner":"card_instance"},
      "requirements":{"all":[{"predicate":"event_attack_source_is_self"}]},"costs":[],
      "steps":[{"op":"IF","when":{"predicate":"event_attack_target_damaged"},"then":[{"op":"MODIFY_CURRENT_ATTACK_DAMAGE","delta":10}]}]
    },
    "attacks":[
      {"id":"coal-fang","name":"Coal Fang","cost":[{"element":"Ember","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"ashcoil","name":"Ashcoil","cost":[{"element":"Ember","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.8 Kilnback

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-kilnback","name":"Kilnback","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":180,"withdrawal":2,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"furnace-hide","name":"Furnace Hide","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],
      "continuous":[{"id":"furnace-hide-reduction","kind":"incoming_attack_damage","target":"$source_creature","when":{"predicate":"source_has_condition","condition":"Scorched"},"amount":-10,"filters":{"source_controller":"opponent"}}]
    },
    "attacks":[
      {"id":"kiln-ram","name":"Kiln Ram","cost":[{"element":"Ember","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"overheat","name":"Overheat","cost":[{"element":"Ember","amount":3}],"damage_element":"source_creature","base_damage":110,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"APPLY_CONDITION","target":"$source_creature","condition":"Scorched","mode":"apply_if_empty"}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.9 Magmagecko

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-magmagecko","name":"Magmagecko","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":90,"withdrawal":0,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"ember-feed","name":"Ember Feed","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},
      "requirements":{"all":[
        {"predicate":"legal_card_available","controller":"self","zone":"hand","filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Ember"}},
        {"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Ember","damaged":true}}
      ]},"costs":[],
      "steps":[
        {"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Ember","damaged":true},"as":"feed_target"},
        {"op":"ATTACH_ESSENCE_FROM_ZONE","player":"self","zone":"hand","selection":{"min":1,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Ember"}},"target":"$feed_target"},
        {"op":"DIRECT_DAMAGE","target":"$feed_target","amount":10,"damage_class":"effect"}
      ]
    },
    "attacks":[
      {"id":"lava-flick","name":"Lava Flick","cost":[{"element":"Ember","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.10 Cinderburrow — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-cinderburrow","name":"Cinderburrow","card_family":"Creature","element":"Ember",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":130,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"ash-tunnel","name":"Ash Tunnel","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,
      "requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"}]},"costs":[],
      "steps":[{"op":"IF","when":{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Ember","damaged":true}},"then":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Ember","damaged":true},"as":"heal_target"},{"op":"HEAL","target":"$heal_target","amount":10}]}]
    },
    "attacks":[
      {"id":"burrow-burst","name":"Burrow Burst","cost":[{"element":"Ember","amount":2}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":60,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"source_has_condition","condition":"Scorched"}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.11 Pyrohorn — Ash Crown

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-pyrohorn-ash-crown","name":"Pyrohorn — Ash Crown","card_family":"Creature","element":"Ember",
  "traits":["Mythic"],"pack_only":false,"deck_limit":{"scope":"identity","max":1},
  "prestige":{"starbound":{"enabled":true,"action_kind":"attack","action_id":"ashen-stampede","shared_usage_key":"starbound","consume":"legal_declaration_or_activation"}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":340,"withdrawal":3,"reward_value":2,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"ash-crown","name":"Ash Crown","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},
      "requirements":{"all":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Ember","damaged":true}}]},"costs":[],
      "steps":[
        {"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Ember","damaged":true},"as":"crown_target"},
        {"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$crown_target","amount":30,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"},"on_consume":{"bind_to_consuming_action":true,"timing":"after_attack_effects_before_defeat_scan","steps":[{"op":"DIRECT_DAMAGE","target":"$modifier_target","amount":20,"damage_class":"effect"}]}}
      ]
    },
    "attacks":[
      {"id":"crownfire","name":"Crownfire","cost":[{"element":"Ember","amount":2}],"damage_element":"source_creature","base_damage":90,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"ashen-stampede","name":"Ashen Stampede","cost":[{"element":"Ember","amount":4}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":160,"snapshot":"legal_declaration","terms":[{"kind":"count_add","counter":{"kind":"count_cards","controller":"self","zone":"field","filters":{"card_family":"Creature","damaged":true}},"amount_per":10,"max_count":4}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

---

# 2. Essence definitions — 4

## 2.1 Basic Ember Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-basic-ember-essence","name":"Basic Ember Essence","card_family":"Essence","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},
  "prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{"subtype":"Basic","provides":[{"element":"Ember","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"listeners":[],"lifecycle":null},
  "tactic":null
}
```

## 2.2 Hearth Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-hearth-essence","name":"Hearth Essence","card_family":"Essence","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},
  "prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{
    "subtype":"Special","provides":[{"element":"Ember","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,
    "listeners":[{"id":"hearth-attach-heal","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Ember"},{"predicate":"target_damaged","target":"$attached_creature"}]},"limit":null,"steps":[{"op":"HEAL","target":"$attached_creature","amount":20}]}]
  },
  "tactic":null
}
```

## 2.3 Smolder Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-smolder-essence","name":"Smolder Essence","card_family":"Essence","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},
  "prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{
    "subtype":"Special","provides":[{"element":"Ember","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,
    "listeners":[{"id":"smolder-attach-pressure","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Ember"},{"predicate":"target_damaged","target":"$attached_creature"}]},"limit":null,"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$attached_creature","amount":10,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]}]
  },
  "tactic":null
}
```

## 2.4 Wildfire Essence — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-wildfire-essence","name":"Wildfire Essence","card_family":"Essence","element":"Ember",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"global_essence_allowance","max":null},
  "prestige":{"starbound":{"enabled":false}},
  "creature":null,
  "essence":{
    "subtype":"Special","provides":[{"element":"Ember","amount":1}],"attach_requirements":[],"on_attach":[],"listeners":[],"lifecycle":null,
    "continuous":[
      {"id":"wildfire-attack-pressure","kind":"attack_damage","target":"$attached_creature","when":{"predicate":"target_has_condition","target":"$attached_creature","condition":"Scorched"},"amount":10,"filters":{}},
      {"id":"wildfire-scorched-risk","kind":"damage_packet_amount","target":"$attached_creature","when":{"predicate":"target_has_condition","target":"$attached_creature","condition":"Scorched"},"amount":10,"filters":{"damage_class":"condition","condition":"Scorched","target":"attached_creature"}}
    ]
  },
  "tactic":null
}
```

---

# 3. Tactic definitions — 9

## 3.1 Ashen Gamble — pack-only Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-ashen-gamble","name":"Ashen Gamble","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Ember"}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Ember"},"as":"target"},{"op":"DIRECT_DAMAGE","target":"$target","amount":20,"damage_class":"effect"},{"op":"DRAW","player":"self","count":3},{"op":"CHOOSE_HAND_TO_DISCARD","player":"self","count":1}]},"listeners":[],"continuous":[]}
}
```

## 3.2 Cinder Charm — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-cinder-charm","name":"Cinder Charm","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{
    "subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"listeners":[],
    "continuous":[{"id":"cinder-charm-pressure","kind":"attack_damage","target":"$attached_creature","when":{"predicate":"target_element_is","target":"$attached_creature","element":"Ember"},"value":{"default":10,"cases":[{"when":{"predicate":"target_printed_hp_at_least","target":"$attached_creature","value":200},"amount":20}]},"filters":{}}]
  }
}
```

## 3.3 Ember Salve — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-ember-salve","name":"Ember Salve","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Ember"}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Ember"},"as":"target"},{"op":"HEAL","target":"$target","amount":30},{"op":"CLEAR_CONDITION_IF_PRESENT","target":"$target","condition":"Scorched"}]},"listeners":[],"continuous":[]}
}
```

## 3.4 Flash Forge — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-flash-forge","name":"Flash Forge","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"DRAW","player":"self","count":2},{"op":"CHOOSE_HAND_TO_DISCARD","player":"self","count":1}]},"listeners":[],"continuous":[]}
}
```

## 3.5 Forgekeeper Bram — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-forgekeeper-bram","name":"Forgekeeper Bram","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":1,"filters":{"element":"Ember","card_family":"Creature","creature_stage":["Teen","Adult"],"must_evolve_from_in_play":true}},"declared_target_count":1,"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}
}
```

## 3.6 Heatguard Bracer — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-heatguard-bracer","name":"Heatguard Bracer","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{
    "subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],
    "listeners":[{"id":"heatguard-first-risk-reduction","event":"before_damage_packet","requirements":{"all":[{"predicate":"damage_packet_target_is_attached_creature"},{"any":[{"predicate":"damage_packet_class_is","damage_class":"recoil"},{"all":[{"predicate":"damage_packet_class_is","damage_class":"condition"},{"predicate":"damage_packet_condition_is","condition":"Scorched"}]}]}]},"limit":{"scope":"turn","count":1,"owner":"attachment"},"steps":[{"op":"MODIFY_CURRENT_DAMAGE_PACKET","delta":-10,"minimum":0}]}]
  }
}
```

## 3.7 Kindling Cache — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-kindling-cache","name":"Kindling Cache","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":2,"filters":{"element":"Ember","card_family":"Essence","essence_subtype":"Basic"}},"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}
}
```

## 3.8 Rhea Ashrunner — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-rhea-ashrunner","name":"Rhea Ashrunner","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"reserve","filters":{"card_family":"Creature","element":"Ember","damaged":true}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{"element":"Ember","damaged":true},"as":"target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$target"},{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$target","amount":20,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]},"listeners":[],"continuous":[]}
}
```

## 3.9 Volcanic Caldera — Realm

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"ember-volcanic-caldera","name":"Volcanic Caldera","card_family":"Tactic","element":"Ember",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":null,"essence":null,
  "tactic":{
    "subtype":"Realm","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],
    "listeners":[
      {"id":"caldera-ember-vanguard-pressure","event":"became_vanguard","controller_scope":"any","requirements":{"all":[{"predicate":"event_controller_is_active_seat"},{"predicate":"event_subject_matches","filters":{"card_family":"Creature","element":"Ember"}}]},"limit":{"scope":"turn","count":1,"owner":"event_controller"},"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$event_subject","amount":10,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]},
      {"id":"caldera-nonember-withdrawal-damage","event":"moved_to_reserve","controller_scope":"any","requirements":{"all":[{"predicate":"event_action_kind_is","action_kind":"voluntary_withdrawal"},{"not":{"predicate":"event_subject_matches","filters":{"element":"Ember"}}}]},"limit":null,"steps":[{"op":"DIRECT_DAMAGE","target":"$event_subject","amount":10,"damage_class":"effect"}]}
    ]
  }
}
```

---

# 4. Batch validation

## Identity and family counts

Fresh active Set One source inventory contains exactly:

- Creature: 11
- Essence: 4
- Tactic: 9
- Total: 24

Every candidate id above matches the active Ember identity inventory.

Evolution references resolve internally:

- Glowcub -> Bristleflare -> Furnacefang
- Coalfinch -> Sootwing -> Cindercrest

Pyrohorn is normalized from the prototype `stage = Mythic` representation to `stage = Standalone` with `traits = ["Mythic"]`.

## Global matchup validation

No Ember creature above contains a per-card Weakness field.

The match rules snapshot supplies `matchup_version = cp2-matchups-v0.1`, where the world chain includes:

```text
Tide -> Ember -> Grove -> Gale -> Stone -> Volt -> Tide
```

A Tide attack therefore exploits an ordinary Ember creature's Weakness through the global rules table and applies the single global x2 multiplier. No reverse Resistance is inferred.

All 11 current Ember creatures use:

```json
{"creature_types":[],"resistance":null,"matchup_override":null}
```

No current Ember card is labelled Martial merely to populate the future mystical/combat chain.

## Starbound validation

Only Pyrohorn — Ash Crown is Starbound in Ember Set One.

Its Starbound action is `ashen-stampede` and uses the player's single shared Starbound marker. Its ordinary Ability and Crownfire attack do not consume that marker.

## Pack-only validation

Exactly three Ember identities are pack-only:

1. `ember-cinderburrow`
2. `ember-wildfire-essence`
3. `ember-ashen-gamble`

They are not part of the Ashrush starter.

## Structured mechanic coverage

The batch uses shared v0.2 mechanics for:

- damaged-creature continuous attack bonuses;
- evolution-triggered optional self-damage plus draw;
- attack-owned recoil packets;
- first-attack declaration modifiers;
- Reserve/Vanguard movement listeners;
- Scorched application and conditional damage bonuses;
- incoming attack reduction while Scorched;
- extra Essence attachment from hand without consuming the normal manual attachment;
- on-entry damaged-friendly healing;
- Pyrohorn's next-attack modifier plus post-attack damage rider;
- counted damaged-friendly creatures in Ashen Stampede;
- attachment-triggered healing/attack bonuses;
- Wildfire's Scorched attack/risk modifiers;
- Relic continuous modifiers;
- first-per-turn recoil/Scorched packet reduction;
- Reserve-only Ally switching;
- Realm event-subject listeners for Vanguard entry and voluntary withdrawal.

No Ember card-name-specific runtime branch is required by the candidate representation.

---

# 5. Ashrush exact 60 validation

Fresh active starter source data contains 60 cards across 21 identities:

| Identity | Qty |
|---|---:|
| Glowcub | 3 |
| Bristleflare | 2 |
| Furnacefang | 2 |
| Coalfinch | 3 |
| Sootwing | 2 |
| Cindercrest | 2 |
| Ashcobra | 3 |
| Magmagecko | 2 |
| Kilnback | 2 |
| Pyrohorn — Ash Crown | 1 |
| Basic Ember Essence | 14 |
| Smolder Essence | 2 |
| Hearth Essence | 2 |
| Kindling Cache | 3 |
| Flash Forge | 3 |
| Ember Salve | 2 |
| Rhea Ashrunner | 2 |
| Forgekeeper Bram | 2 |
| Cinder Charm | 3 |
| Heatguard Bracer | 2 |
| Volcanic Caldera | 3 |

Checks:

- total = 60;
- 21 distinct starter identities;
- 22 Creature / 18 Essence / 20 Tactic;
- 14 legal opening creature copies after Pyrohorn Standalone normalization;
- two complete 3 -> 2 -> 2 evolution lines;
- no pack-only identities;
- Pyrohorn quantity 1 satisfies the Mythic one-copy-per-identity rule;
- ordinary non-Essence identities remain at or below four copies;
- Essence remains delegated to the separate shared Essence allowance.

The stored prototype recipe label `Creature — Mythic` for Pyrohorn is display/implementation drift only; this candidate uses Standalone + Mythic trait without changing the recipe quantity.

---

# 6. Candidate state

**EMBER STRUCTURED CANDIDATE: 24 / 24 IDENTITIES.**

This file does not update `tcg_card_definitions`, the battle engine, migrations or live gameplay.

Remaining later work includes consolidated machine-readable schema validation, all remaining element batches, exact global Essence copy allowance, registry/engine conversion, deterministic Test Deck Battle, human testing and final promotion gates.

Next element after this candidate's exact-head checks is Gale.