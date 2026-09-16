# Stream Bandit TCG — Card Pass 2 — Volt 24 v0.2 Candidate

**Status:** Branch-only structured candidate for the 24 accepted Set One Volt identities. No production registry, migration, engine, starter recipe or deployed gameplay is changed by this file.

Schema: `sb-tcg-card-v0.2`  
Effect schema: `sb-tcg-effects-v0.2`  
Matchup table: `cp2-matchups-v0.1`

## Batch rules

- Element: `Volt`.
- Global world chain supplies `Stone -> Volt`; ordinary Volt cards store no per-card `weakness` object.
- Current Volt creatures use `creature_types: []`, `resistance: null`, `matchup_override: null`.
- Stormcoil — Living Circuit is the sole Volt Starbound identity and is `Standalone + Mythic`.
- Pack-only: Copperkite, Pulse Essence, Blackout Pulse.
- Volt owns speed, Device sequencing, temporary/borrowed Essence acceleration, explosive attack turns, repositioning and Stunned pressure.
- Temporary/borrowed Essence remains a real attached card instance and cleans up across all friendly field zones at the declared Aftermath.

---

# 1. Creatures — 11

## 1.1 Staticub

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-staticub","name":"Staticub","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":60,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"static-primer","name":"Static Primer","mode":"triggered","event":"device_resolved","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_controller_is_self"},{"predicate":"event_controller_is_active_seat"}]},"costs":[],"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$source_creature","amount":10,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]},"attacks":[{"id":"static-nip","name":"Static Nip","cost":[{"element":"Volt","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.2 Arcprowler

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-arcprowler","name":"Arcprowler","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Teen","evolves_from_id":"volt-staticub","hp":130,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"charge-relay","name":"Charge Relay","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"}]},"costs":[],"steps":[{"op":"ATTACH_ESSENCE_FROM_ZONE","player":"self","zone":"hand","selection":{"min":0,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}},"target":"$source_creature","manual_attachment":false}]},"attacks":[{"id":"arc-pounce","name":"Arc Pounce","cost":[{"element":"Volt","amount":1}],"damage_element":"source_creature","base_damage":40,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"relay-strike","name":"Relay Strike","cost":[{"element":"Volt","amount":2}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":60,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"event_occurred","event":"device_resolved","controller":"self","window":"current_turn","min_count":1}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.3 Stormmane

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-stormmane","name":"Stormmane","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Adult","evolves_from_id":"volt-arcprowler","hp":250,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"live-circuit","name":"Live Circuit","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"event_occurred","event":"device_resolved","controller":"self","window":"current_turn","min_count":1}]},"costs":[],"steps":[{"op":"MOVE_ATTACHED_ESSENCE","controller":"self","element":"Volt","count":{"min":0,"max":1},"source_selector":{"zone":"reserve","filters":{"card_family":"Creature","exclude_source":true}},"destination_selector":{"fixed":"$source_creature"},"require_destination_different_creature":true,"as":"relay_move"}]},"attacks":[{"id":"thunder-claw","name":"Thunder Claw","cost":[{"element":"Volt","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"storm-break","name":"Storm Break","cost":[{"element":"Volt","amount":3}],"damage_element":"source_creature","base_damage":130,"damage_formula":null,"requirements":[],"on_declare":[{"op":"RECORD_EVENT","event":"storm-break-overcharged","when":{"predicate":"event_attack_source_attached_essence_count_at_least","count":4}}],"before_damage":[],"after_damage":[{"op":"IF","when":{"predicate":"event_occurred","event":"storm-break-overcharged","controller":"self","window":"current_action","min_count":1},"then":[{"op":"DISCARD_ATTACHED_ESSENCE","target":"$source_creature","selection":{"min":1,"max":1,"filters":{}}},{"op":"IF","when":{"predicate":"target_remains_in_play_after_damage"},"then":[{"op":"APPLY_CONDITION","target":"$attack_target","condition":"Stunned","mode":"apply_if_empty"}]}]}]}]},"essence":null,"tactic":null}
```

## 1.4 Tinkit

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-tinkit","name":"Tinkit","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":70,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"salvage-spark","name":"Salvage Spark","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"}]},"costs":[],"steps":[{"op":"SELECT_CARDS","player":"self","zone":"discard","selection":{"min":0,"max":1,"filters":{"card_family":"Tactic","tactic_subtype":"Device"}},"as":"salvaged"},{"op":"MOVE_CARDS","player":"self","cards":"$salvaged","to":"deck_bottom","order":"preserve"}]},"attacks":[{"id":"tiny-zap","name":"Tiny Zap","cost":[{"element":"Volt","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.5 Coilclank

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-coilclank","name":"Coilclank","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Teen","evolves_from_id":"volt-tinkit","hp":150,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"charge-capacitor","name":"Charge Capacitor","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_occurred","event":"device_resolved","controller":"self","window":"current_turn","min_count":1}]},"costs":[],"steps":[{"op":"ATTACH_ESSENCE_FROM_ZONE","player":"self","zone":"discard","selection":{"min":0,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}},"target":"$source_creature","manual_attachment":false,"attachment_state":{"kind":"temporary","expires":"controller_aftermath","destination_on_expire":"discard"}}]},"attacks":[{"id":"coil-bash","name":"Coil Bash","cost":[{"element":"Volt","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"charged-tool","name":"Charged Tool","cost":[{"element":"Volt","amount":2},{"element":"Any","amount":1}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":60,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"event_occurred","event":"device_resolved","controller":"self","window":"current_turn","min_count":1}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.6 Dynamozer

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-dynamozer","name":"Dynamozer","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Adult","evolves_from_id":"volt-coilclank","hp":280,"withdrawal":3,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"overcharge-engine","name":"Overcharge Engine","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"hand_contains","filters":{"card_family":"Tactic","tactic_subtype":"Device"}},{"predicate":"legal_card_available","controller":"self","zone":"discard","filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}}]},"costs":[{"op":"CHOOSE_HAND_TO_DISCARD","player":"self","count":1,"filters":{"card_family":"Tactic","tactic_subtype":"Device"}}],"steps":[{"op":"ATTACH_ESSENCE_FROM_ZONE","player":"self","zone":"discard","selection":{"min":1,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}},"target":"$source_creature","manual_attachment":false,"attachment_state":{"kind":"temporary","expires":"controller_aftermath","destination_on_expire":"discard"}}]},"attacks":[{"id":"dynamo-crash","name":"Dynamo Crash","cost":[{"element":"Volt","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"gridbreaker","name":"Gridbreaker","cost":[{"element":"Volt","amount":4}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":150,"terms":[{"kind":"conditional_add","amount":20,"when":{"any":[{"predicate":"event_attack_source_has_attached_essence_kind","kind":"temporary"},{"predicate":"event_attack_source_has_attached_essence_kind","kind":"borrowed"}]}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.7 Boltfang

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-boltfang","name":"Boltfang","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":140,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"live-hunt","name":"Live Hunt","mode":"triggered","event":"became_vanguard","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"reserve"},{"predicate":"event_controller_is_active_seat"}]},"costs":[],"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$source_creature","amount":20,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]},"attacks":[{"id":"quick-bite","name":"Quick Bite","cost":[{"element":"Volt","amount":1}],"damage_element":"source_creature","base_damage":40,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"lightning-hunt","name":"Lightning Hunt","cost":[{"element":"Volt","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.8 Sparkmoth

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-sparkmoth","name":"Sparkmoth","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":90,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"flash-dust","name":"Flash Dust","mode":"triggered","event":"became_vanguard","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"reserve"},{"predicate":"event_controller_is_active_seat"},{"predicate":"control_condition_slot_empty","target":"$current_opponent_vanguard"}]},"costs":[],"steps":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Dazed","mode":"apply_if_empty"}]},"attacks":[{"id":"spark-wing","name":"Spark Wing","cost":[{"element":"Volt","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.9 Railhorn

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-railhorn","name":"Railhorn","card_family":"Creature","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":190,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"power-rail","name":"Power Rail","mode":"triggered","event":"essence_attached","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_attachment_target_is_source"},{"any":[{"predicate":"event_attachment_kind_is","kind":"temporary"},{"predicate":"event_attachment_kind_is","kind":"borrowed"}]},{"predicate":"event_subject_matches","filters":{"element":"Volt"}}]},"costs":[],"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$source_creature","amount":20,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]},"attacks":[{"id":"rail-ram","name":"Rail Ram","cost":[{"element":"Volt","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"line-surge","name":"Line Surge","cost":[{"element":"Volt","amount":3}],"damage_element":"source_creature","base_damage":100,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.10 Copperkite — pack-only

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-copperkite","name":"Copperkite","card_family":"Creature","element":"Volt","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":120,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"conductive-wing","name":"Conductive Wing","mode":"triggered","event":"device_resolved","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_controller_is_self"},{"predicate":"event_controller_is_active_seat"}]},"costs":[],"steps":[{"op":"SET_WITHDRAWAL_MODIFIER","target":"$source_creature","mode":"set","amount":0,"minimum":0,"duration":{"expires_on":["end_of_turn"],"max_uses":null}}]},"attacks":[{"id":"copper-arc","name":"Copper Arc","cost":[{"element":"Volt","amount":2}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":60,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"event_occurred","event":"device_resolved","controller":"self","window":"current_turn","min_count":1}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.11 Stormcoil — Living Circuit

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-stormcoil-living-circuit","name":"Stormcoil — Living Circuit","card_family":"Creature","element":"Volt","traits":["Mythic"],"pack_only":false,"deck_limit":{"scope":"identity","max":1},"prestige":{"starbound":{"enabled":true,"action_kind":"attack","action_id":"chainstorm","shared_usage_key":"starbound","consume":"legal_declaration_or_activation"}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":330,"withdrawal":2,"reward_value":2,"resistance":null,"matchup_override":null,"ability":{"id":"living-circuit","name":"Living Circuit","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"legal_card_available","controller":"self","zone":"discard","filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}},{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Volt"}}]},"costs":[],"steps":[{"op":"SELECT_CARDS","player":"self","zone":"discard","selection":{"min":1,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}},"as":"borrowed_essence"},{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Volt"},"as":"borrowed_target"},{"op":"ATTACH_ESSENCE_FROM_ZONE","player":"self","zone":"discard","cards":"$borrowed_essence","target":"$borrowed_target","manual_attachment":false,"attachment_state":{"kind":"borrowed","expires":"controller_aftermath","destination_on_expire":"discard"}}]},"attacks":[{"id":"circuit-lash","name":"Circuit Lash","cost":[{"element":"Volt","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"chainstorm","name":"Chainstorm","cost":[{"element":"Volt","amount":4}],"damage_element":"source_creature","base_damage":160,"damage_formula":null,"requirements":[],"on_declare":[{"op":"RECORD_EVENT","event":"chainstorm-borrowed","when":{"predicate":"event_attack_source_has_attached_essence_kind","kind":"borrowed"}}],"before_damage":[],"after_damage":[{"op":"IF","when":{"all":[{"predicate":"event_occurred","event":"chainstorm-borrowed","controller":"self","window":"current_action","min_count":1},{"predicate":"target_remains_in_play_after_damage"}]},"then":[{"op":"APPLY_CONDITION","target":"$attack_target","condition":"Stunned","mode":"apply_if_empty"}]}]}]},"essence":null,"tactic":null}
```

---

# 2. Essence — 4

## 2.1 Basic Volt Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-basic-volt-essence","name":"Basic Volt Essence","card_family":"Essence","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Basic","provides":[{"element":"Volt","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"listeners":[],"lifecycle":null},"tactic":null}
```

## 2.2 Circuit Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-circuit-essence","name":"Circuit Essence","card_family":"Essence","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Volt","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"circuit-filter","event":"device_resolved","requirements":{"all":[{"predicate":"source_controller_is_self"},{"predicate":"event_controller_is_active_seat"}]},"limit":{"scope":"attachment","count":1,"owner":"attachment"},"steps":[{"op":"OPTIONAL","player":"self","steps":[{"op":"DRAW","player":"self","count":1},{"op":"CHOOSE_HAND_TO_DISCARD","player":"self","count":1}]}]}]},"tactic":null}
```

## 2.3 Surge Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-surge-essence","name":"Surge Essence","card_family":"Essence","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Volt","amount":1}],"attach_requirements":[],"on_attach":[],"listeners":[{"id":"surge-attach-burst","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Volt"}]},"limit":null,"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$attached_creature","amount":20,"duration":{"expires_on":["end_of_turn"],"max_uses":null}}]}],"continuous":[],"lifecycle":{"on_attach_set_state":{"kind":"temporary","expires":"controller_aftermath","destination_on_expire":"discard"}}},"tactic":null}
```

## 2.4 Pulse Essence — pack-only

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-pulse-essence","name":"Pulse Essence","card_family":"Essence","element":"Volt","traits":[],"pack_only":true,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Volt","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"pulse-discharge-draw","event":"essence_discarded","requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"essence_discarded_source_controller_is_self"},{"predicate":"essence_discarded_by_own_card_effect"}]},"limit":{"scope":"turn","count":1,"owner":"controller"},"steps":[{"op":"DRAW","player":"self","count":1}]}]},"tactic":null}
```

---

# 3. Tactics — 9

## 3.1 Arc Band — Relic

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-arc-band","name":"Arc Band","card_family":"Tactic","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"listeners":[],"continuous":[{"id":"arc-band-cost","kind":"attack_cost","target":"$attached_creature","when":{"predicate":"event_occurred","event":"device_resolved","controller":"self","window":"current_turn","min_count":1},"amount":-1,"typed_element":"Volt","total_cost_floor":1,"filters":{"first_attack_each_turn":true}}]}}
```

## 3.2 Blackout Pulse — pack-only Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-blackout-pulse","name":"Blackout Pulse","card_family":"Tactic","element":"Volt","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"IF","when":{"any":[{"predicate":"modifier_condition_slot_empty","target":"$current_opponent_vanguard"},{"predicate":"target_has_condition","target":"$current_opponent_vanguard","condition":"Silenced"}]},"then":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Silenced","mode":"apply_if_empty_or_same"}]},{"op":"SET_DEVICE_PLAY_LOCK","player":"self","locked":true,"duration":{"expires_on":["end_of_turn"]}}]},"listeners":[],"continuous":[]}}
```

## 3.3 Circuit Scanner — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-circuit-scanner","name":"Circuit Scanner","card_family":"Tactic","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"LOOK_TOP","player":"self","count":5,"visibility":"controller_private","as":"looked"},{"op":"CHOOSE_FROM_SET","source":"$looked","min":0,"max":1,"filters":{"any":[{"element":"Volt","card_family":"Creature"},{"card_family":"Tactic","tactic_subtype":"Device"}]},"as":"chosen"},{"op":"MOVE_CARDS","player":"self","cards":"$chosen","to":"hand"},{"op":"PUT_REMAINDER_ON_DECK_BOTTOM","player":"self","source":"$looked","except":"$chosen","order":"player_choice"}]},"listeners":[],"continuous":[]}}
```

## 3.4 Courier Jett — Ally

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-courier-jett","name":"Courier Jett","card_family":"Tactic","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Ally","play_requirements":[{"predicate":"reserve_count_at_least","controller":"self","count":1}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{"element":"Volt"},"as":"incoming"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$incoming"},{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$switch_incoming_vanguard","amount":20,"duration":{"expires_on":["end_of_turn"],"max_uses":null}}]},"listeners":[],"continuous":[]}}
```

## 3.5 Dynamo Lens — Relic

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-dynamo-lens","name":"Dynamo Lens","card_family":"Tactic","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"dynamo-lens-draw","event":"essence_discarded","requirements":{"all":[{"predicate":"event_previous_attachment_target_is_attached_creature"},{"any":[{"predicate":"essence_discarded_attachment_kind_is","kind":"temporary"},{"predicate":"essence_discarded_attachment_kind_is","kind":"borrowed"}]}]},"limit":{"scope":"turn","count":1,"owner":"attachment"},"steps":[{"op":"DRAW","player":"self","count":1}]}]}}
```

## 3.6 Engineer Vexa — Ally

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-engineer-vexa","name":"Engineer Vexa","card_family":"Tactic","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK_GROUP","player":"self","groups":[{"id":"device","selection":{"min":0,"max":1,"filters":{"card_family":"Tactic","tactic_subtype":"Device"}}},{"id":"special_essence","selection":{"min":0,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Special","element":"Volt"}}}],"reveal":"public","destination":"hand","hidden_fail_allowed":true},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}}
```

## 3.7 Quickcharge Cell — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-quickcharge-cell","name":"Quickcharge Cell","card_family":"Tactic","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"discard","filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}},{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Volt"}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CARDS","player":"self","zone":"discard","selection":{"min":1,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}},"as":"charge"},{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Volt"},"as":"charge_target"},{"op":"ATTACH_ESSENCE_FROM_ZONE","player":"self","zone":"discard","cards":"$charge","target":"$charge_target","manual_attachment":false,"attachment_state":{"kind":"temporary","expires":"controller_aftermath","destination_on_expire":"discard"}}]},"listeners":[],"continuous":[]}}
```

## 3.8 Static Reset — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-static-reset","name":"Static Reset","card_family":"Tactic","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"condition_any_of":["Stunned","Dazed"]}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"condition_any_of":["Stunned","Dazed"]},"as":"reset_target"},{"op":"CHOOSE_AND_CLEAR_CONDITION","target":"$reset_target","allowed":["Stunned","Dazed"]},{"op":"DRAW","player":"self","count":1}]},"listeners":[],"continuous":[]}}
```

## 3.9 Stormgrid City — Realm

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"volt-stormgrid-city","name":"Stormgrid City","card_family":"Tactic","element":"Volt","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Realm","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"stormgrid-recycle","event":"device_resolved","controller_scope":"any","requirements":{"all":[{"predicate":"event_controller_is_active_seat"}]},"limit":{"scope":"turn","count":1,"owner":"event_controller"},"steps":[{"op":"OPTIONAL","player":"$event_controller","steps":[{"op":"SET_RESOLVING_CARD_DESTINATION","card":"$resolving_card","destination":"deck_bottom"}]}]}]}}
```

---

# 4. Validation

- Volt identities: **24** = 11 Creature / 4 Essence / 9 Tactic.
- Pack-only: Copperkite / Pulse Essence / Blackout Pulse.
- Starbound: Stormcoil only.
- Evolution lines: Staticub → Arcprowler → Stormmane; Tinkit → Coilclank → Dynamozer.
- Every Volt Creature uses `creature_types: []`, `resistance: null`, `matchup_override: null`.
- **Per-card ordinary Weakness fields: 0.** Global `cp2-matchups-v0.1` supplies `Stone -> Volt`.
- Temporary/borrowed Essence cleanup is field-wide and lifecycle-driven, not Vanguard-only or card-id driven.

# 5. Live Wire exact 60 preservation

The accepted `Live Wire` recipe remains 60 cards / 21 identities: 22 Creature / 18 Essence / 20 Tactic. Essence remains 14 Basic Volt / 2 Surge / 2 Circuit. Tactics remain 3 Circuit Scanner / 3 Quickcharge Cell / 2 Static Reset / 2 Engineer Vexa / 2 Courier Jett / 3 Arc Band / 2 Dynamo Lens / 3 Stormgrid City. Pack-only Copperkite, Pulse Essence and Blackout Pulse remain excluded. Stormcoil remains exactly one copy.

# 6. Completion

**VOLT STRUCTURED CANDIDATE: COMPLETE — 24 / 24 IDENTITIES.**

All eight current Set One elements now have accepted deterministic Card Pass 2 candidate ledgers. Next bounded action: consolidate the stale pre-correction Astral Weakness source, then consolidate the v0.2 schema/amendments into one machine-readable validator/specification.
