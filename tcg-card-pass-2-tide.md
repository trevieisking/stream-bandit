# Stream Bandit TCG — Card Pass 2 — Tide 24 v0.2 Candidate

**Status:** Branch-only structured candidate for the 24 accepted Set One Tide identities. No production registry, migration, engine, starter recipe or deployed gameplay is changed by this file.

Schema: `sb-tcg-card-v0.2`  
Effect schema: `sb-tcg-effects-v0.2`  
Matchup table: `cp2-matchups-v0.1`

## Batch rules

- Element: `Tide`.
- Global world chain supplies `Volt -> Tide`; ordinary Tide cards store no per-card `weakness` object.
- Current Tide creatures use `creature_types: []`, `resistance: null`, `matchup_override: null`.
- Marevault — Heart of Tides is the sole Tide Starbound identity and is `Standalone + Mythic`.
- Pack-only: Lanternsquid, Brine Essence, Undertow Net.
- Tide's highest raw-force ceiling is earned through setup, Essence movement, Shield preservation and late commitment.
- Drenched is the signature Tide condition: while Drenched a creature cannot declare attacks; normal global recovery/switch-clearing rules remain the counterplay owner.

---

# 1. Creatures — 11

## 1.1 Puddlepip

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-puddlepip","name":"Puddlepip","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":70,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"freshwater-coat","name":"Freshwater Coat","mode":"triggered","event":"essence_attached","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_attachment_target_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_subject_matches","filters":{"card_family":"Essence","element":"Tide"}},{"predicate":"target_damaged","target":"$source_creature"}]},"costs":[],"steps":[{"op":"HEAL","target":"$source_creature","amount":10}]},"attacks":[{"id":"bubble-bump","name":"Bubble Bump","cost":[{"element":"Tide","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.2 Rillrunner

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-rillrunner","name":"Rillrunner","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Teen","evolves_from_id":"tide-puddlepip","hp":150,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"running-current","name":"Running Current","mode":"triggered","event":"essence_moved","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"essence_move_element_is","element":"Tide"},{"any":[{"predicate":"essence_move_source_is_self"},{"predicate":"essence_move_destination_is_self"}]},{"predicate":"source_controller_is_self"}]},"costs":[],"steps":[{"op":"ADD_ATTACK_DAMAGE_MODIFIER","target":"$source_creature","amount":10,"duration":{"expires_on":["end_of_turn"],"max_uses":1,"consume_on":"legal_attack_declared"}}]},"attacks":[{"id":"current-dash","name":"Current Dash","cost":[{"element":"Tide","amount":1}],"damage_element":"source_creature","base_damage":40,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"rushing-wake","name":"Rushing Wake","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"IF","when":{"predicate":"source_damaged"},"then":[{"op":"HEAL","target":"$source_creature","amount":10}]}]}]},"essence":null,"tactic":null}
```

## 1.3 Tideroar

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-tideroar","name":"Tideroar","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Adult","evolves_from_id":"tide-rillrunner","hp":280,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"current-keeper","name":"Current Keeper","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":[],"costs":[],"steps":[{"op":"MOVE_ATTACHED_ESSENCE","controller":"self","element":"Tide","count":{"min":0,"max":1},"source_selector":{"zone":"field","filters":{"card_family":"Creature"}},"destination_selector":{"zone":"field","filters":{"card_family":"Creature"}},"require_destination_different_creature":true,"as":"current_moves"}]},"attacks":[{"id":"breakwater-roar","name":"Breakwater Roar","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"deep-current","name":"Deep Current","cost":[{"element":"Tide","amount":3}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":110,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"event_occurred","event":"essence_moved","controller":"self","window":"current_turn","min_count":1,"filters":{"element":"Tide"}}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"damaged":true},"as":"heal_target"},{"op":"HEAL","target":"$heal_target","amount":30}]}]},"essence":null,"tactic":null}
```

## 1.4 Shellip

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-shellip","name":"Shellip","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":80,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"tidepool-shell","name":"Tidepool Shell","mode":"triggered","event":"after_heal_packet","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"heal_packet_target_is_self"},{"predicate":"heal_source_is_card_effect"},{"predicate":"heal_actual_amount_at_least","value":1}]},"costs":[],"steps":[{"op":"ADD_SHIELD","target":"$source_creature","amount":10}]},"attacks":[{"id":"shell-tap","name":"Shell Tap","cost":[{"element":"Tide","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.5 Reefback

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-reefback","name":"Reefback","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Teen","evolves_from_id":"tide-shellip","hp":170,"withdrawal":3,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"reef-guard","name":"Reef Guard","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"}]},"costs":[],"steps":[{"op":"ADD_SHIELD","target":"$source_creature","amount":20}]},"attacks":[{"id":"coral-press","name":"Coral Press","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"guarded-surge","name":"Guarded Surge","cost":[{"element":"Tide","amount":3}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"IF","when":{"predicate":"source_has_shield_at_least","value":1},"then":[{"op":"HEAL","target":"$source_creature","amount":20}]}]}]},"essence":null,"tactic":null}
```

## 1.6 Abyssalume

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-abyssalume","name":"Abyssalume","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Adult","evolves_from_id":"tide-reefback","hp":300,"withdrawal":3,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"lantern-shelter","name":"Lantern Shelter","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"source_has_shield_at_least","value":1},{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Tide","exclude_source":true}}]},"costs":[],"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Tide","exclude_source":true},"as":"shelter_target"},{"op":"TRANSFER_SHIELD","from":"$source_creature","to":"$shelter_target","amount":{"min":0,"max":20}}]},"attacks":[{"id":"lantern-pulse","name":"Lantern Pulse","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"abyssal-break","name":"Abyssal Break","cost":[{"element":"Tide","amount":4}],"damage_element":"source_creature","base_damage":140,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"IF","when":{"all":[{"predicate":"source_has_shield_at_least","value":1},{"predicate":"target_remains_in_play_after_damage"}]},"then":[{"op":"APPLY_CONDITION","target":"$attack_target","condition":"Drenched","mode":"apply_if_empty"}]}]}]},"essence":null,"tactic":null}
```

## 1.7 Reefshell

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-reefshell","name":"Reefshell","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":160,"withdrawal":3,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"breakwater-current","name":"Breakwater Current","mode":"triggered","event":"essence_moved","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"essence_move_destination_is_self"},{"predicate":"essence_move_element_is","element":"Tide"},{"predicate":"source_controller_is_self"}]},"costs":[],"steps":[{"op":"ADD_SHIELD","target":"$source_creature","amount":20}]},"attacks":[{"id":"tidal-push","name":"Tidal Push","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.8 Mistmarten

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-mistmarten","name":"Mistmarten","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":100,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"mist-recovery","name":"Mist Recovery","mode":"triggered","event":"moved_to_reserve","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_action_kind_is","action_kind":"attack"},{"predicate":"target_damaged","target":"$source_creature"}]},"costs":[],"steps":[{"op":"HEAL","target":"$source_creature","amount":20}]},"attacks":[{"id":"mist-dart","name":"Mist Dart","cost":[{"element":"Tide","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"vanish-wake","name":"Vanish Wake","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"OPTIONAL","player":"self","steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target"}]}]}]},"essence":null,"tactic":null}
```

## 1.9 Surgefin

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-surgefin","name":"Surgefin","card_family":"Creature","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":130,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"undertow-supply","name":"Undertow Supply","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"legal_card_available","controller":"self","zone":"discard","filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Tide"}},{"predicate":"reserve_count_at_least","controller":"self","count":1}]},"costs":[],"steps":[{"op":"SELECT_CARDS","player":"self","zone":"discard","selection":{"min":0,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Tide"}},"as":"supply_essence"},{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{"element":"Tide"},"as":"supply_target"},{"op":"ATTACH_ESSENCE_FROM_ZONE","player":"self","zone":"discard","cards":"$supply_essence","target":"$supply_target","manual_attachment":false},{"op":"IF","when":{"predicate":"target_damaged","target":"$supply_target"},"then":[{"op":"HEAL","target":"$supply_target","amount":10}]}]},"attacks":[{"id":"fin-slash","name":"Fin Slash","cost":[{"element":"Tide","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"surge-cut","name":"Surge Cut","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.10 Lanternsquid — pack-only

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-lanternsquid","name":"Lanternsquid","card_family":"Creature","element":"Tide","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":150,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"deep-signal","name":"Deep Signal","mode":"triggered","event":"became_vanguard","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_controller_is_active_seat"}]},"costs":[],"steps":[{"op":"MOVE_ATTACHED_ESSENCE","controller":"self","element":"Tide","count":{"min":0,"max":1},"source_selector":{"zone":"reserve","filters":{"card_family":"Creature","exclude_source":true}},"destination_selector":{"fixed":"$source_creature"},"require_destination_different_creature":true,"as":"signal_move"}]},"attacks":[{"id":"lantern-jet","name":"Lantern Jet","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{"damaged":true},"as":"reserve_heal"},{"op":"HEAL","target":"$reserve_heal","amount":10}]}]},"essence":null,"tactic":null}
```

## 1.11 Marevault — Heart of Tides

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-marevault-heart-of-tides","name":"Marevault — Heart of Tides","card_family":"Creature","element":"Tide","traits":["Mythic"],"pack_only":false,"deck_limit":{"scope":"identity","max":1},"prestige":{"starbound":{"enabled":true,"action_kind":"attack","action_id":"tidal-vault","shared_usage_key":"starbound","consume":"legal_declaration_or_activation"}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":350,"withdrawal":3,"reward_value":2,"resistance":null,"matchup_override":null,"ability":{"id":"heart-of-tides","name":"Heart of Tides","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":[],"costs":[],"steps":[{"op":"MOVE_ATTACHED_ESSENCE","controller":"self","element":"Tide","count":{"min":0,"max":2},"source_selector":{"zone":"field","filters":{"card_family":"Creature"}},"destination_selector":{"zone":"field","filters":{"card_family":"Creature"}},"require_destination_different_creature":true,"as":"heart_moves"},{"op":"IF","when":{"predicate":"essence_move_count_at_least","moves":"$heart_moves","count":2},"then":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Tide","damaged":true,"participated_in_moves":"$heart_moves"},"as":"heart_heal"},{"op":"HEAL","target":"$heart_heal","amount":20}]}]},"attacks":[{"id":"mooncurrent","name":"Mooncurrent","cost":[{"element":"Tide","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"tidal-vault","name":"Tidal Vault","cost":[{"element":"Tide","amount":5}],"damage_element":"source_creature","base_damage":180,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage_finished":[{"op":"MOVE_ATTACHED_ESSENCE","controller":"self","element":"Tide","count":{"min":0,"max":3},"source_selector":{"zone":"field","filters":{"card_family":"Creature","element":"Tide"}},"destination_selector":{"zone":"field","filters":{"card_family":"Creature","element":"Tide"}},"require_destination_different_creature":true,"as":"vault_moves"},{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":{"min":0,"max":2},"filters":{"element":"Tide","damaged":true,"participated_in_moves":"$vault_moves"},"as":"vault_heals"},{"op":"HEAL_EACH","targets":"$vault_heals","amount":30},{"op":"OPTIONAL","player":"self","steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"vault_switch"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$vault_switch"}]}]}]},"essence":null,"tactic":null}
```

---

# 2. Essence — 4

## 2.1 Basic Tide Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-basic-tide-essence","name":"Basic Tide Essence","card_family":"Essence","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Basic","provides":[{"element":"Tide","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"listeners":[],"lifecycle":null},"tactic":null}
```

## 2.2 Calm Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-calm-essence","name":"Calm Essence","card_family":"Essence","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Tide","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"calm-attach-heal","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Tide"},{"predicate":"target_damaged","target":"$attached_creature"}]},"limit":null,"steps":[{"op":"HEAL","target":"$attached_creature","amount":20}]}]},"tactic":null}
```

## 2.3 Flow Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-flow-essence","name":"Flow Essence","card_family":"Essence","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Tide","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"flow-redistribute","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Tide"}]},"limit":null,"steps":[{"op":"MOVE_ATTACHED_ESSENCE","controller":"self","element":"Tide","count":{"min":0,"max":1},"source_selector":{"fixed":"$attached_creature","exclude_card_uid":"$source_card"},"destination_selector":{"zone":"field","filters":{"card_family":"Creature","element":"Tide","exclude":"$attached_creature"}},"require_destination_different_creature":true,"as":"flow_move"}]}]},"tactic":null}
```

## 2.4 Brine Essence — pack-only

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-brine-essence","name":"Brine Essence","card_family":"Essence","element":"Tide","traits":[],"pack_only":true,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Tide","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"brine-cleanse","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Tide"},{"any":[{"predicate":"target_has_condition","target":"$attached_creature","condition":"Scorched"},{"predicate":"target_has_condition","target":"$attached_creature","condition":"Venomed"}]}]},"limit":null,"steps":[{"op":"CHOOSE_AND_CLEAR_CONDITION","target":"$attached_creature","allowed":["Scorched","Venomed"],"min":0,"max":1}]}]},"tactic":null}
```

---

# 3. Tactics — 9

## 3.1 Current Map — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-current-map","name":"Current Map","card_family":"Tactic","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK_GROUP","player":"self","groups":[{"id":"creature","selection":{"min":0,"max":1,"filters":{"element":"Tide","card_family":"Creature"}}},{"id":"basic_essence","selection":{"min":0,"max":1,"filters":{"element":"Tide","card_family":"Essence","essence_subtype":"Basic"}}}],"reveal":"public","destination":"hand","hidden_fail_allowed":true},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}}
```

## 3.2 Deepwater Search — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-deepwater-search","name":"Deepwater Search","card_family":"Tactic","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":1,"filters":{"element":"Tide","card_family":"Tactic","tactic_subtype":["Ally","Relic"]}},"declared_target_count":1,"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}}
```

## 3.3 Marina Wayfinder — Ally

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-marina-wayfinder","name":"Marina Wayfinder","card_family":"Tactic","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"MOVE_ATTACHED_ESSENCE","controller":"self","element":"Tide","count":{"min":0,"max":2},"source_selector":{"zone":"field","filters":{"card_family":"Creature","element":"Tide"}},"destination_selector":{"zone":"field","filters":{"card_family":"Creature","element":"Tide"}},"require_destination_different_creature":true,"as":"wayfinder_moves"},{"op":"DRAW","player":"self","count":1}]},"listeners":[],"continuous":[]}}
```

## 3.4 Moonlit Reef — Realm

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-moonlit-reef","name":"Moonlit Reef","card_family":"Tactic","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Realm","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"moonlit-reef-filter","event":"after_heal_packet","controller_scope":"any","requirements":{"all":[{"predicate":"heal_actual_amount_at_least","value":1},{"predicate":"heal_target_element_is","element":"Tide"},{"predicate":"heal_controller_is_active_seat"},{"predicate":"heal_source_is_card_effect"}]},"limit":{"scope":"turn","count":1,"owner":"event_controller"},"steps":[{"op":"OPTIONAL","player":"$event_controller","steps":[{"op":"DRAW","player":"$event_controller","count":1},{"op":"CHOOSE_HAND_TO_DISCARD","player":"$event_controller","count":1}]}]}]}}
```

## 3.5 Recovery Spray — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-recovery-spray","name":"Recovery Spray","card_family":"Tactic","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature"}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{},"as":"spray_target"},{"op":"IF","when":{"predicate":"target_has_condition","target":"$spray_target","condition":"Drenched"},"then":[{"op":"CLEAR_CONDITION","target":"$spray_target","condition":"Drenched"},{"op":"HEAL","target":"$spray_target","amount":20}],"else":[{"op":"HEAL","target":"$spray_target","amount":40}]}]},"listeners":[],"continuous":[]}}
```

## 3.6 Reef Medic Olan — Ally

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-reef-medic-olan","name":"Reef Medic Olan","card_family":"Tactic","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":{"min":0,"max":2},"filters":{"element":"Tide","damaged":true},"as":"olan_targets"},{"op":"HEAL_EACH","targets":"$olan_targets","amount":30}]},"listeners":[],"continuous":[]}}
```

## 3.7 Shellguard Pendant — Relic

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-shellguard-pendant","name":"Shellguard Pendant","card_family":"Tactic","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[{"id":"shellguard-next-hit","kind":"incoming_attack_damage","target":"$attached_creature","when":null,"amount":-20,"filters":{"source_controller":"opponent"},"limit":{"scope":"attachment","count":1,"owner":"attachment"},"consume_when":"prevention_amount_at_least_1"}],"listeners":[{"id":"shellguard-break","event":"damage_prevented","requirements":{"all":[{"predicate":"prevention_target_is_attached_creature"},{"predicate":"prevention_source_is_attached_card"},{"predicate":"prevention_amount_at_least","value":1}]},"limit":{"scope":"attachment","count":1,"owner":"attachment"},"steps":[{"op":"SCHEDULE_SOURCE_DISCARD","timing":"after_attack_finished","source":"$listener_source"}]}]}}
```

## 3.8 Tidal Lens — Relic

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-tidal-lens","name":"Tidal Lens","card_family":"Tactic","element":"Tide","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"tidal-lens-heal","event":"essence_moved","requirements":{"all":[{"predicate":"essence_move_source_is_attached_creature"},{"predicate":"essence_move_element_is","element":"Tide"},{"predicate":"source_controller_is_self"},{"predicate":"target_damaged","target":"$attached_creature"}]},"limit":{"scope":"turn","count":1,"owner":"attachment"},"steps":[{"op":"HEAL","target":"$attached_creature","amount":10}]}]}}
```

## 3.9 Undertow Net — pack-only Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"tide-undertow-net","name":"Undertow Net","card_family":"Tactic","element":"Tide","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SET_WITHDRAWAL_MODIFIER","target":"$current_opponent_vanguard","mode":"delta","amount":{"default":1,"cases":[{"when":{"predicate":"target_has_condition","target":"$current_opponent_vanguard","condition":"Drenched"},"amount":2}]},"minimum":0,"maximum_after_this_source":4,"duration":{"expires_on":["target_controller_aftermath_started"],"max_uses":null},"source_category":"self_card_effect"}]},"listeners":[],"continuous":[]}}
```

---

# 4. Validation

- Tide identities: **24** = 11 Creature / 4 Essence / 9 Tactic.
- Pack-only: Lanternsquid / Brine Essence / Undertow Net.
- Starbound: Marevault only.
- Evolution lines: Puddlepip → Rillrunner → Tideroar; Shellip → Reefback → Abyssalume.
- Every Tide Creature uses `creature_types: []`, `resistance: null`, `matchup_override: null`.
- **Per-card ordinary Weakness fields: 0.** Global `cp2-matchups-v0.1` supplies `Volt -> Tide`.
- Tide movement uses actual attached Essence instances and stable source/destination records. No detached energy meter exists.

# 5. Deep Current exact 60 preservation

The accepted `Deep Current` recipe remains 60 cards / 21 identities: 22 Creature / 18 Essence / 20 Tactic. Essence remains 14 Basic Tide / 2 Flow / 2 Calm. Tactics remain 3 Current Map / 3 Recovery Spray / 2 Deepwater Search / 2 Marina Wayfinder / 2 Reef Medic Olan / 3 Tidal Lens / 2 Shellguard Pendant / 3 Moonlit Reef. Pack-only Lanternsquid, Brine Essence and Undertow Net remain excluded. Marevault remains exactly one copy.

# 6. Completion

**TIDE STRUCTURED CANDIDATE: COMPLETE — 24 / 24 IDENTITIES.**

Numeric balance remains provisional. Next bounded action: **Volt 24 Card Pass 2 STRUCTURE** under the same global Weakness rule.
