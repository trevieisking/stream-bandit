# Stream Bandit TCG — Card Pass 2 — Grove 24 v0.2 Candidate

**Status:** Branch-only structured card candidate for the 24 accepted Set One Grove identities. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

Schema: `sb-tcg-card-v0.2`  
Effect schema: `sb-tcg-effects-v0.2`  
Matchup table: `cp2-matchups-v0.1`

## Authority and batch rules

This batch uses the accepted Grove design in `tcg-set-one-audit.md`, the global matchup model in `tcg-card-pass-2-weakness-resistance.md`, the base v0.2 schema and Amendments A–I.

- Element: `Grove`.
- World matchup is global: `Ember -> Grove`. No ordinary Grove Creature stores a per-card `weakness` field.
- Current Set One Grove creatures use `creature_types: []`.
- Current Grove creatures use `resistance: null` and `matchup_override: null`.
- Every identity carries explicit Starbound yes/no metadata.
- Elderbloom — First Canopy is Standalone + Mythic and is the only Starbound Grove identity.
- Ordinary non-Essence identities use a four-copy identity limit; Elderbloom uses one copy; Essence delegates to the global Essence allowance.
- Pack-only Grove identities: Bloomhare, Symbiote Essence, Canopy Call.
- Numeric balance remains provisional until deterministic AI Test Match and human playtesting.
- Card text/art is presentation data; the structures below are the gameplay-bearing candidate data.

---

# 1. Creature definitions — 11

## 1.1 Budburrow

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-budburrow","name":"Budburrow","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":80,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"root-nest","name":"Root Nest","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],
      "continuous":[{"id":"root-nest-withdrawal","kind":"withdrawal","target":"$source_creature","mode":"set","amount":0,"minimum":0,"when":{"predicate":"reserve_count_at_least","controller":"self","count":2},"filters":{}}]
    },
    "attacks":[{"id":"sprout-jab","name":"Sprout Jab","cost":[{"element":"Grove","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]
  },"essence":null,"tactic":null
}
```

## 1.2 Briarback

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-briarback","name":"Briarback","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Teen","evolves_from_id":"grove-budburrow","hp":160,"withdrawal":2,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"growing-wall","name":"Growing Wall","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"}]},"costs":[],"steps":[{"op":"IF","when":{"predicate":"reserve_count_at_least","controller":"self","count":2},"then":[{"op":"HEAL","target":"$source_creature","amount":30}]}]},
    "attacks":[
      {"id":"briar-ram","name":"Briar Ram","cost":[{"element":"Grove","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"thorn-rush","name":"Thorn Rush","cost":[{"element":"Grove","amount":3}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":80,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"reserve_count_at_least","controller":"self","count":3}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.3 Verdantusk

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-verdantusk","name":"Verdantusk","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Adult","evolves_from_id":"grove-briarback","hp":300,"withdrawal":3,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{
      "id":"full-canopy","name":"Full Canopy","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],
      "continuous":[{"id":"full-canopy-guard","kind":"incoming_attack_damage","target_selector":{"controller":"self","zone":"reserve","filters":{"card_family":"Creature","element":"Grove","exclude_source":true}},"when":null,"amount":-10,"filters":{"source_controller":"opponent"}}]
    },
    "attacks":[
      {"id":"rooted-charge","name":"Rooted Charge","cost":[{"element":"Grove","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"canopy-crash","name":"Canopy Crash","cost":[{"element":"Grove","amount":4}],"damage_element":"source_creature","base_damage":140,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"IF","when":{"predicate":"reserve_count_at_least","controller":"self","count":4},"then":[{"op":"HEAL_EACH","controller":"self","zone":"reserve","filters":{"card_family":"Creature"},"amount":20}]}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.4 Sporeling

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-sporeling","name":"Sporeling","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":50,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"spore-feed","name":"Spore Feed","mode":"triggered","event":"device_resolved","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_controller_is_self"},{"predicate":"event_controller_is_active_seat"}]},"costs":[],"steps":[{"op":"HEAL","target":"$source_creature","amount":10}]},
    "attacks":[{"id":"puff-tap","name":"Puff Tap","cost":[{"element":"Grove","amount":1}],"damage_element":"source_creature","base_damage":10,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Venomed","mode":"apply_if_empty"}]}]
  },"essence":null,"tactic":null
}
```

## 1.5 Capscout

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-capscout","name":"Capscout","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Teen","evolves_from_id":"grove-sporeling","hp":120,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"fungal-forage","name":"Fungal Forage","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"}]},"costs":[],"steps":[{"op":"SELECT_CARDS","player":"self","zone":"discard","selection":{"min":0,"max":1,"filters":{"card_family":"Tactic","tactic_subtype":"Device"}},"as":"foraged"},{"op":"MOVE_CARDS","player":"self","cards":"$foraged","to":"deck_bottom","order":"preserve"}]},
    "attacks":[
      {"id":"spore-shot","name":"Spore Shot","cost":[{"element":"Grove","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"fungal-burst","name":"Fungal Burst","cost":[{"element":"Grove","amount":2}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":50,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"target_has_condition","condition":"Venomed"}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.6 Myceliarch

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-myceliarch","name":"Myceliarch","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Adult","evolves_from_id":"grove-capscout","hp":240,"withdrawal":2,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"networked-growth","name":"Networked Growth","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"event_occurred","event":"device_resolved","controller":"self","window":"current_turn","min_count":1},{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Grove","damaged":true}}]},"costs":[],"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Grove","damaged":true},"as":"growth_target"},{"op":"HEAL","target":"$growth_target","amount":20}]},
    "attacks":[
      {"id":"colony-pulse","name":"Colony Pulse","cost":[{"element":"Grove","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"mycelial-bloom","name":"Mycelial Bloom","cost":[{"element":"Grove","amount":3}],"damage_element":"source_creature","base_damage":110,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"SELECT_CARDS","player":"self","zone":"discard","selection":{"min":0,"max":1,"filters":{"card_family":"Tactic","tactic_subtype":"Device"}},"as":"recycled"},{"op":"MOVE_CARDS","player":"self","cards":"$recycled","to":"deck_bottom","order":"preserve"}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.7 Thornmantis

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-thornmantis","name":"Thornmantis","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":120,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"briar-instinct","name":"Briar Instinct","mode":"triggered","event":"attack_declared","timing":"attack","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_attack_source_is_self"}]},"costs":[],"steps":[{"op":"IF","when":{"any":[{"predicate":"event_attack_target_has_condition","condition":"Venomed"},{"predicate":"event_attack_target_has_condition","condition":"Rooted"}]},"then":[{"op":"MODIFY_CURRENT_ATTACK_DAMAGE","delta":10}]}]},
    "attacks":[
      {"id":"vine-lash","name":"Vine Lash","cost":[{"element":"Grove","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"thorn-cut","name":"Thorn Cut","cost":[{"element":"Grove","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.8 Mossram

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-mossram","name":"Mossram","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":180,"withdrawal":2,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"moss-guard","name":"Moss Guard","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],"continuous":[{"id":"moss-guard-reduction","kind":"incoming_attack_damage","target":"$source_creature","when":{"predicate":"target_has_condition","target":"$current_opponent_vanguard","condition":"Rooted"},"amount":-10,"filters":{"source_controller":"opponent","source_zone":"vanguard"}}]},
    "attacks":[
      {"id":"moss-bash","name":"Moss Bash","cost":[{"element":"Grove","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"ramroot","name":"Ramroot","cost":[{"element":"Grove","amount":3}],"damage_element":"source_creature","base_damage":90,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Rooted","mode":"apply_if_empty"}]}
    ]
  },"essence":null,"tactic":null
}
```

## 1.9 Vinecoil

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-vinecoil","name":"Vinecoil","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":140,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"binding-growth","name":"Binding Growth","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"}]},"costs":[],"steps":[{"op":"OPTIONAL","player":"self","steps":[{"op":"CHOOSE_AND_CLEAR_CONDITION","target":"$current_friendly_vanguard","allowed":["Rooted","Crushed"]}]}]},
    "attacks":[{"id":"coil-snap","name":"Coil Snap","cost":[{"element":"Grove","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]
  },"essence":null,"tactic":null
}
```

## 1.10 Bloomhare — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-bloomhare","name":"Bloomhare","card_family":"Creature","element":"Grove",
  "traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},
  "prestige":{"starbound":{"enabled":false}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":110,"withdrawal":1,"reward_value":1,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"spring-growth","name":"Spring Growth","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"}]},"costs":[],"steps":[{"op":"IF","when":{"all":[{"predicate":"friendly_other_creature_matches","filters":{"element":"Grove"}},{"predicate":"target_damaged","target":"$current_friendly_vanguard"}]},"then":[{"op":"HEAL","target":"$current_friendly_vanguard","amount":20}]}]},
    "attacks":[{"id":"petal-kick","name":"Petal Kick","cost":[{"element":"Grove","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]
  },"essence":null,"tactic":null
}
```

## 1.11 Elderbloom — First Canopy

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2",
  "id":"grove-elderbloom-first-canopy","name":"Elderbloom — First Canopy","card_family":"Creature","element":"Grove",
  "traits":["Mythic"],"pack_only":false,"deck_limit":{"scope":"identity","max":1},
  "prestige":{"starbound":{"enabled":true,"action_kind":"attack","action_id":"forest-awakening","shared_usage_key":"starbound","consume":"legal_declaration_or_activation"}},
  "creature":{
    "creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":360,"withdrawal":4,"reward_value":2,
    "resistance":null,"matchup_override":null,
    "ability":{"id":"first-canopy","name":"First Canopy","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"reserve_count_at_least","controller":"self","count":3}]},"costs":[],"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":{"min":0,"max":2},"filters":{"damaged":true},"as":"canopy_targets"},{"op":"HEAL_EACH","targets":"$canopy_targets","amount":20}]},
    "attacks":[
      {"id":"ancient-bough","name":"Ancient Bough","cost":[{"element":"Grove","amount":3}],"damage_element":"source_creature","base_damage":100,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"forest-awakening","name":"Forest Awakening","cost":[{"element":"Grove","amount":5}],"damage_element":"source_creature","base_damage":160,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"IF","when":{"all":[{"predicate":"reserve_count_at_least","controller":"self","count":4},{"predicate":"target_remains_in_play_after_damage"}]},"then":[{"op":"APPLY_CONDITION","target":"$attack_target","condition":"Venomed","mode":"apply_if_empty"},{"op":"IF","when":{"predicate":"control_condition_slot_empty","target":"$attack_target"},"then":[{"op":"APPLY_CONDITION","target":"$attack_target","condition":"Rooted","mode":"apply_if_empty"}]}]}]}
    ]
  },"essence":null,"tactic":null
}
```

---

# 2. Essence definitions — 4

## 2.1 Basic Grove Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-basic-grove-essence","name":"Basic Grove Essence","card_family":"Essence","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Basic","provides":[{"element":"Grove","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"listeners":[],"lifecycle":null},"tactic":null}
```

## 2.2 Bloom Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-bloom-essence","name":"Bloom Essence","card_family":"Essence","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,
  "essence":{"subtype":"Special","provides":[{"element":"Grove","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"bloom-attach-heal","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Grove"},{"predicate":"target_stage_in","target":"$attached_creature","stages":["Teen","Adult"]},{"predicate":"target_damaged","target":"$attached_creature"}]},"limit":null,"steps":[{"op":"HEAL","target":"$attached_creature","amount":20}]}]},"tactic":null
}
```

## 2.3 Root Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-root-essence","name":"Root Essence","card_family":"Essence","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,
  "essence":{"subtype":"Special","provides":[{"element":"Grove","amount":1}],"attach_requirements":[],"on_attach":[],"listeners":[],"lifecycle":null,"continuous":[{"id":"root-essence-withdrawal","kind":"withdrawal","target":"$attached_creature","mode":"delta","amount":-1,"minimum":0,"when":null,"filters":{}}]},"tactic":null
}
```

## 2.4 Symbiote Essence — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-symbiote-essence","name":"Symbiote Essence","card_family":"Essence","element":"Grove","traits":[],"pack_only":true,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,
  "essence":{"subtype":"Special","provides":[{"element":"Grove","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"symbiote-reciprocal-heal","event":"after_heal_packet","requirements":{"all":[{"predicate":"heal_packet_source_is_attached_creature"},{"predicate":"heal_packet_target_controller_is_self"},{"predicate":"heal_packet_target_is_not_source"},{"any":[{"predicate":"heal_packet_source_action_kind_is","action_kind":"ability"},{"predicate":"heal_packet_source_action_kind_is","action_kind":"attack"}]},{"predicate":"target_stage_in","target":"$attached_creature","stages":["Teen","Adult"]},{"predicate":"target_element_is","target":"$attached_creature","element":"Grove"}]},"limit":{"scope":"turn","count":1,"owner":"attachment"},"steps":[{"op":"HEAL","target":"$attached_creature","amount":10}]}]},"tactic":null
}
```

---

# 3. Tactic definitions — 9

## 3.1 Canopy Call — pack-only Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-canopy-call","name":"Canopy Call","card_family":"Tactic","element":"Grove","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":2,"filters":{"element":"Grove","card_family":"Creature","creature_stage":["Teen","Adult"],"must_evolve_from_in_play":true},"distinct_identity":true},"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}
}
```

## 3.2 Elderwood Glade — Realm

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-elderwood-glade","name":"Elderwood Glade","card_family":"Tactic","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Realm","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"elderwood-aftermath-heal","event":"aftermath_started","controller_scope":"any","requirements":{"all":[{"predicate":"reserve_count_at_least","controller":"event_controller","count":3},{"predicate":"target_damaged","target":"$event_controller_vanguard"}]},"limit":null,"steps":[{"op":"HEAL","target":"$event_controller_vanguard","amount":10}]}]}
}
```

## 3.3 Forager Nia — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-forager-nia","name":"Forager Nia","card_family":"Tactic","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CARDS","player":"self","zone":"discard","selection":{"min":0,"max":2,"filters":{"card_family":"Tactic","tactic_subtype":"Device"}},"as":"foraged"},{"op":"MOVE_CARDS","player":"self","cards":"$foraged","to":"deck_bottom","order":"player_choice"},{"op":"DRAW","player":"self","count":1}]},"listeners":[],"continuous":[]}
}
```

## 3.4 Rootway Map — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-rootway-map","name":"Rootway Map","card_family":"Tactic","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":1,"filters":{"element":"Grove","any":[{"card_family":"Creature","creature_stage":"Adult"},{"card_family":"Tactic","tactic_subtype":"Realm"}]}},"declared_target_count":1,"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}
}
```

## 3.5 Sapstone Charm — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-sapstone-charm","name":"Sapstone Charm","card_family":"Tactic","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"sapstone-heal-amplifier","event":"before_heal_packet","requirements":{"all":[{"predicate":"heal_packet_target_is_attached_creature"},{"not":{"predicate":"heal_packet_source_action_kind_is","action_kind":"rule"}}]},"limit":{"scope":"turn","count":1,"owner":"attachment"},"steps":[{"op":"MODIFY_CURRENT_HEAL","delta":10,"minimum":0}]}]}
}
```

## 3.6 Seed Satchel — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-seed-satchel","name":"Seed Satchel","card_family":"Tactic","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":2,"filters":{"element":"Grove","card_family":"Creature","creature_stage":"Baby"}},"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}
}
```

## 3.7 Spore Remedy — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-spore-remedy","name":"Spore Remedy","card_family":"Tactic","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Grove","has_any_condition":true}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Grove","has_any_condition":true},"as":"remedy_target"},{"op":"CHOOSE_AND_CLEAR_CONDITION","target":"$remedy_target"},{"op":"HEAL","target":"$remedy_target","amount":10}]},"listeners":[],"continuous":[]}
}
```

## 3.8 Thorn Crown — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-thorn-crown","name":"Thorn Crown","card_family":"Tactic","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"thorn-crown-reflect","event":"after_damage_packet","requirements":{"all":[{"predicate":"damage_packet_class_is","damage_class":"attack"},{"predicate":"damage_packet_target_is_attached_creature"},{"predicate":"damage_packet_target_zone_is","zone":"vanguard"},{"predicate":"damage_packet_source_controller_is_opponent"},{"predicate":"damage_packet_amount_at_least","value":1}]},"limit":null,"steps":[{"op":"DIRECT_DAMAGE","target":"$damage_packet_source_creature","amount":10,"damage_class":"effect"}]}]}
}
```

## 3.9 Warden Fern — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"grove-warden-fern","name":"Warden Fern","card_family":"Tactic","element":"Grove","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[{"predicate":"reserve_count_at_least","controller":"self","count":2}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"DRAW","player":"self","count":3},{"op":"CHOOSE_HAND_TO_DECK_BOTTOM","player":"self","count":1}]},"listeners":[],"continuous":[]}
}
```

---

# 4. Batch validation

## Identity counts

- Creatures: **11**
- Essence: **4**
- Tactics: **9**
- Total Grove identities: **24**
- Pack-only identities: **3**
- Starbound identities: **1** (`grove-elderbloom-first-canopy`)

## Evolution references

- Budburrow → Briarback → Verdantusk
- Sporeling → Capscout → Myceliarch

All Teen/Adult references resolve inside the batch.

## Matchup validation

All 11 Grove Creatures use:

```json
{
  "creature_types": [],
  "resistance": null,
  "matchup_override": null
}
```

There are **zero ordinary per-card `weakness` fields** in this candidate. Weakness comes only from match snapshot `cp2-matchups-v0.1`; under the world chain, Ember attacks are strong against Grove.

## Starbound / Mythic validation

Elderbloom is normalized to:

- stage `Standalone`;
- trait `Mythic`;
- reward value `2`;
- deck identity limit `1`;
- Starbound action `forest-awakening`.

No other Grove identity is Starbound.

## No card-name runtime owners

Former prototype special cases now have shared structure paths:

- Briarback evolution heal → `creature_evolved` + Reserve-count predicate + `HEAL`;
- Myceliarch discard choice → `SELECT_CARDS` + `MOVE_CARDS`;
- Bloom Essence → generic attachment listener;
- Root Essence → continuous withdrawal modifier;
- Symbiote Essence → healing-packet source/listener semantics;
- Sapstone Charm → `before_heal_packet` + `MODIFY_CURRENT_HEAL`;
- Thorn Crown → attack damage packet source binding + reflected effect damage;
- Verdantusk → multi-target continuous aura selector;
- Elderbloom → structured Starbound + full-Reserve + condition-slot rules.

---

# 5. Wildgrowth exact 60 starter preservation

The accepted Wildgrowth recipe remains **60 cards / 21 identities**:

- 22 Creature
- 18 Essence
- 20 Tactic

Creature lines remain `3 Baby → 2 Teen → 2 Adult` for both evolution families. Pack-only Bloomhare, Symbiote Essence and Canopy Call remain excluded. Elderbloom appears exactly once. Recipe quantities are unchanged by this structure batch.

---

# 6. Completion state

**GROVE STRUCTURED CANDIDATE: COMPLETE — 24 / 24 IDENTITIES.**

This is not yet a production registry mutation. Numeric tuning remains provisional until AI/human balance testing, and runtime promotion remains blocked until the shared v0.2 interpreter/validator and branch engine are reconciled.

## Next bounded action

Proceed to **Shade 24 Card Pass 2 structure**, using the accepted Shade audit and the same rule that ordinary Weakness is resolved only through the two global matchup chains.
