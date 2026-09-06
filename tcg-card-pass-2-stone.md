# Stream Bandit TCG — Card Pass 2 — Stone 24 v0.2 Candidate

**Status:** Branch-only structured candidate for the 24 accepted Set One Stone identities. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

Schema: `sb-tcg-card-v0.2`  
Effect schema: `sb-tcg-effects-v0.2`  
Matchup table: `cp2-matchups-v0.1`

## Batch rules

- Element: `Stone`.
- Global world chain supplies `Gale -> Stone`; ordinary Stone cards store no per-card `weakness` object.
- Current Stone creatures use `creature_types: []`, `resistance: null`, `matchup_override: null`.
- Crowncrag — Mountain Warden is the sole Stone Starbound identity and is `Standalone + Mythic`, not a Mythic stage.
- Pack-only: Obsidianox, Granite Essence, Reversal Seal.
- Normal non-Essence identities max 4; Crowncrag max 1; Essence delegates to the global Essence allowance.
- Stone retains deliberately high withdrawal values. Those values are strategic design, not implementation drift.

---

# 1. Creatures — 11

## 1.1 Gravibble

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-gravibble","name":"Gravibble","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":90,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"pebble-guard","name":"Pebble Guard","mode":"triggered","event":"essence_attached","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_attachment_target_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_subject_matches","filters":{"card_family":"Essence","element":"Stone"}},{"predicate":"event_controller_is_active_seat"}]},"costs":[],"steps":[{"op":"ADD_SHIELD","target":"$source_creature","amount":10}]},"attacks":[{"id":"pebble-bump","name":"Pebble Bump","cost":[{"element":"Stone","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.2 Cragroller

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-cragroller","name":"Cragroller","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Teen","evolves_from_id":"stone-gravibble","hp":180,"withdrawal":3,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"rolling-guard","name":"Rolling Guard","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"}]},"costs":[],"steps":[{"op":"ADD_SHIELD","target":"$source_creature","amount":20}]},"attacks":[{"id":"crag-roll","name":"Crag Roll","cost":[{"element":"Stone","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"weight-drop","name":"Weight Drop","cost":[{"element":"Stone","amount":3}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"APPLY_CONDITION","target":"$attack_target","condition":"Crushed","mode":"apply_if_empty"}]}]},"essence":null,"tactic":null}
```

## 1.3 Monolithorn

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-monolithorn","name":"Monolithorn","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Adult","evolves_from_id":"stone-cragroller","hp":330,"withdrawal":4,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"standing-stone","name":"Standing Stone","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],"continuous":[{"id":"standing-stone-reserve-guard","kind":"incoming_attack_damage","target_selector":{"controller":"self","zone":"reserve","filters":{"card_family":"Creature","element":"Stone","exclude_source":true}},"when":null,"amount":-20,"filters":{"source_controller":"opponent"}}]},"attacks":[{"id":"monolith-ram","name":"Monolith Ram","cost":[{"element":"Stone","amount":3}],"damage_element":"source_creature","base_damage":90,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"mountain-fall","name":"Mountain Fall","cost":[{"element":"Stone","amount":5}],"damage_element":"source_creature","base_damage":160,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"APPLY_CONDITION","target":"$attack_target","condition":"Crushed","mode":"apply_if_empty"}]}]},"essence":null,"tactic":null}
```

## 1.4 Flintkin

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-flintkin","name":"Flintkin","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":80,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"layered-hide","name":"Layered Hide","mode":"triggered","event":"relic_attached","timing":"any_turn","limit":null,"requirements":{"all":[{"predicate":"event_attachment_target_is_source"},{"predicate":"target_damaged","target":"$source_creature"}]},"costs":[],"steps":[{"op":"HEAL","target":"$source_creature","amount":10}]},"attacks":[{"id":"flint-tap","name":"Flint Tap","cost":[{"element":"Stone","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.5 Rampartusk

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-rampartusk","name":"Rampartusk","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Teen","evolves_from_id":"stone-flintkin","hp":170,"withdrawal":3,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"rampart-plating","name":"Rampart Plating","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],"continuous":[{"id":"rampart-plating-reduction","kind":"incoming_attack_damage","target":"$source_creature","when":{"predicate":"source_has_relic"},"amount":-10,"filters":{"source_controller":"opponent"}}]},"attacks":[{"id":"rampart-push","name":"Rampart Push","cost":[{"element":"Stone","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"wall-break","name":"Wall Break","cost":[{"element":"Stone","amount":3}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":80,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"source_has_relic"}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.6 Citadelhorn

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-citadelhorn","name":"Citadelhorn","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Adult","evolves_from_id":"stone-rampartusk","hp":320,"withdrawal":4,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"fortress-heart","name":"Fortress Heart","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],"continuous":[{"id":"fortress-heart-reduction","kind":"incoming_attack_damage","target":"$source_creature","when":{"predicate":"source_has_relic"},"amount":-20,"filters":{"source_controller":"opponent"}}]},"attacks":[{"id":"citadel-charge","name":"Citadel Charge","cost":[{"element":"Stone","amount":3}],"damage_element":"source_creature","base_damage":90,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"bastion-quake","name":"Bastion Quake","cost":[{"element":"Stone","amount":5}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":150,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"event_occurred","event":"damage_prevented","window":"current_turn","min_count":1,"filters":{"target":"source_creature","prevention_kind_any":["ability","relic","shield"]}}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.7 Shalejaw

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-shalejaw","name":"Shalejaw","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":150,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"tough-bite","name":"Tough Bite","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],"continuous":[{"id":"tough-bite-threshold","kind":"incoming_attack_damage","target":"$source_creature","when":{"predicate":"current_attack_damage_at_least","value":100,"stage":"before_shield"},"amount":-20,"filters":{"source_controller":"opponent"},"limit":{"scope":"turn","count":1,"owner":"card_instance"},"consume_when":"prevention_amount_at_least_1"}]},"attacks":[{"id":"shale-crunch","name":"Shale Crunch","cost":[{"element":"Stone","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.8 Boulderbug

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-boulderbug","name":"Boulderbug","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":120,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"compact-shell","name":"Compact Shell","mode":"triggered","event":"shield_gained","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"shield_target_is_self"},{"predicate":"shield_source_is_card_effect"},{"predicate":"shield_actual_gain_at_least","value":1},{"not":{"predicate":"event_source_action_is","action_id":"ability:compact-shell"}}]},"costs":[],"steps":[{"op":"ADD_SHIELD","target":"$source_creature","amount":10,"source_key":"ability:compact-shell"}]},"attacks":[{"id":"stone-pinch","name":"Stone Pinch","cost":[{"element":"Stone","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"boulder-roll","name":"Boulder Roll","cost":[{"element":"Stone","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.9 Quartzram

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-quartzram","name":"Quartzram","card_family":"Creature","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":200,"withdrawal":3,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"prismatic-bulwark","name":"Prismatic Bulwark","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],"continuous":[{"id":"prismatic-bulwark-prism-ram","kind":"attack_damage","target":"$source_creature","when":{"predicate":"source_has_shield_at_least","value":1},"amount":20,"filters":{"attack_id":"prism-ram"}}]},"attacks":[{"id":"quartz-bash","name":"Quartz Bash","cost":[{"element":"Stone","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"prism-ram","name":"Prism Ram","cost":[{"element":"Stone","amount":3}],"damage_element":"source_creature","base_damage":100,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.10 Obsidianox — pack-only

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-obsidianox","name":"Obsidianox","card_family":"Creature","element":"Stone","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":230,"withdrawal":3,"reward_value":1,"resistance":null,"matchup_override":null,"ability":{"id":"glass-armour","name":"Glass Armour","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],"continuous":[{"id":"glass-armour-threshold","kind":"incoming_attack_damage","target":"$source_creature","when":{"predicate":"current_attack_damage_at_least","value":120,"stage":"before_shield"},"amount":-30,"filters":{"source_controller":"opponent"},"limit":{"scope":"match","count":1,"owner":"card_instance"},"consume_when":"prevention_amount_at_least_1"}]},"attacks":[{"id":"obsidian-charge","name":"Obsidian Charge","cost":[{"element":"Stone","amount":3}],"damage_element":"source_creature","base_damage":90,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null}
```

## 1.11 Crowncrag — Mountain Warden

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-crowncrag-mountain-warden","name":"Crowncrag — Mountain Warden","card_family":"Creature","element":"Stone","traits":["Mythic"],"pack_only":false,"deck_limit":{"scope":"identity","max":1},"prestige":{"starbound":{"enabled":true,"action_kind":"attack","action_id":"crown-of-stone","shared_usage_key":"starbound","consume":"legal_declaration_or_activation"}},"creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":390,"withdrawal":4,"reward_value":2,"resistance":null,"matchup_override":null,"ability":{"id":"mountain-warden","name":"Mountain Warden","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Stone","exclude_source":true}}]},"costs":[],"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Stone","exclude_source":true},"as":"warden_target"},{"op":"ADD_INCOMING_ATTACK_DAMAGE_MODIFIER","target":"$warden_target","amount":-40,"filters":{"source_controller":"opponent"},"duration":{"expires_on":["opponent_next_turn_end"],"max_uses":1,"consume_on":"successful_prevention"},"minimum_prevention_to_consume":1}]},"attacks":[{"id":"warden-slam","name":"Warden Slam","cost":[{"element":"Stone","amount":3}],"damage_element":"source_creature","base_damage":100,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},{"id":"crown-of-stone","name":"Crown of Stone","cost":[{"element":"Stone","amount":5}],"damage_element":"source_creature","base_damage":160,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"ADD_SHIELD","target":"$source_creature","amount":30},{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":{"min":0,"max":2},"filters":{"element":"Stone","exclude_source":true},"as":"fortify_targets"},{"op":"ADD_SHIELD_EACH","targets":"$fortify_targets","amount":20}]}]},"essence":null,"tactic":null}
```

---

# 2. Essence — 4

## 2.1 Basic Stone Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-basic-stone-essence","name":"Basic Stone Essence","card_family":"Essence","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Basic","provides":[{"element":"Stone","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"listeners":[],"lifecycle":null},"tactic":null}
```

## 2.2 Anchor Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-anchor-essence","name":"Anchor Essence","card_family":"Essence","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Stone","amount":1}],"attach_requirements":[],"on_attach":[],"listeners":[],"lifecycle":null,"continuous":[{"id":"anchor-weight","kind":"withdrawal","target":"$attached_creature","mode":"delta","amount":1,"minimum":0,"when":null,"filters":{}},{"id":"anchor-armour","kind":"incoming_attack_damage","target":"$attached_creature","when":null,"amount":-10,"filters":{"source_controller":"opponent"}}]},"tactic":null}
```

## 2.3 Fault Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-fault-essence","name":"Fault Essence","card_family":"Essence","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Stone","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"fault-essence-cleanse","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Stone"},{"predicate":"target_has_condition","target":"$attached_creature","condition":"Crushed"}]},"limit":null,"steps":[{"op":"CLEAR_CONDITION","target":"$attached_creature","condition":"Crushed"}]}]},"tactic":null}
```

## 2.4 Granite Essence — pack-only

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-granite-essence","name":"Granite Essence","card_family":"Essence","element":"Stone","traits":[],"pack_only":true,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Special","provides":[{"element":"Stone","amount":1}],"attach_requirements":[],"on_attach":[],"listeners":[],"lifecycle":null,"continuous":[{"id":"granite-tax-immunity","kind":"withdrawal_increase_immunity","target":"$attached_creature","when":{"predicate":"target_element_is","target":"$attached_creature","element":"Stone"},"filters":{"blocked_sources":["opponent_card_effect","opponent_condition"]}}]},"tactic":null}
```

---

# 3. Tactics — 9

## 3.1 Bastion Plate — Relic

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-bastion-plate","name":"Bastion Plate","card_family":"Tactic","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"counters":[{"id":"prevention_uses","initial":0,"max":3,"owner":"card_instance"}],"continuous":[{"id":"bastion-plate-reduction","kind":"incoming_attack_damage","target":"$attached_creature","when":null,"amount":-20,"filters":{"source_controller":"opponent"}}],"listeners":[{"id":"bastion-plate-use","event":"damage_prevented","requirements":{"all":[{"predicate":"prevention_target_is_attached_creature"},{"predicate":"prevention_source_is_attached_card"},{"predicate":"prevention_amount_at_least","value":1}]},"limit":null,"steps":[{"op":"INCREMENT_SOURCE_COUNTER","counter_id":"prevention_uses","amount":1},{"op":"IF","when":{"predicate":"source_counter_at_least","counter_id":"prevention_uses","value":3},"then":[{"op":"SCHEDULE_SOURCE_DISCARD","timing":"after_attack_finished","source":"$listener_source"}]}]}]}}
```

## 3.2 Faultstone — Relic

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-faultstone","name":"Faultstone","card_family":"Tactic","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"faultstone-crush","event":"after_attack_damage","requirements":{"all":[{"predicate":"attack_source_is_attached_creature"},{"predicate":"attack_target_is_opponent_vanguard"},{"predicate":"attack_actual_damage_at_least","value":100},{"predicate":"target_remains_in_play_after_damage"}]},"limit":null,"steps":[{"op":"APPLY_CONDITION","target":"$attack_target","condition":"Crushed","mode":"apply_if_empty"}]}]}}
```

## 3.3 Ironcliff Citadel — Realm

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-ironcliff-citadel","name":"Ironcliff Citadel","card_family":"Tactic","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Realm","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"listeners":[],"continuous":[{"id":"ironcliff-armour","kind":"incoming_attack_damage","target_selector":{"controller":"any","zone":"field","filters":{"card_family":"Creature","element":"Stone"}},"when":null,"amount":-10,"filters":{"source_controller":"opponent_relative_to_target"}},{"id":"ironcliff-weight","kind":"withdrawal","target_selector":{"controller":"any","zone":"field","filters":{"card_family":"Creature","element":"Stone"}},"mode":"delta","amount":1,"minimum":0,"maximum_after_this_source":4,"source_category":"shared_realm","when":null,"filters":{}}]}}
```

## 3.4 Keeper Tor — Ally

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-keeper-tor","name":"Keeper Tor","card_family":"Tactic","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Ally","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Stone"}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Stone"},"as":"tor_target"},{"op":"SET_WITHDRAWAL_MODIFIER","target":"$tor_target","mode":"set","amount":0,"minimum":0,"duration":{"expires_on":["controller_aftermath"],"max_uses":null}},{"op":"ADD_CONDITION_IMMUNITY","target":"$tor_target","condition":"Crushed","duration":{"expires_on":["controller_aftermath"],"max_uses":null}}]},"listeners":[],"continuous":[]}}
```

## 3.5 Mason's Kit — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-masons-kit","name":"Mason's Kit","card_family":"Tactic","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Stone"}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Stone"},"as":"kit_target"},{"op":"ADD_SHIELD","target":"$kit_target","amount":30}]},"listeners":[],"continuous":[]}}
```

## 3.6 Quarry Search — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-quarry-search","name":"Quarry Search","card_family":"Tactic","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":1,"filters":{"element":"Stone","any":[{"card_family":"Creature"},{"card_family":"Tactic","tactic_subtype":"Relic"}]}},"declared_target_count":1,"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}}
```

## 3.7 Reinforce — Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-reinforce","name":"Reinforce","card_family":"Tactic","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Stone"}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"element":"Stone"},"as":"reinforce_target"},{"op":"HEAL","target":"$reinforce_target","amount":20},{"op":"ADD_SHIELD","target":"$reinforce_target","amount":20}]},"listeners":[],"continuous":[]}}
```

## 3.8 Reversal Seal — pack-only Device

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-reversal-seal","name":"Reversal Seal","card_family":"Tactic","element":"Stone","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Device","play_requirements":[{"predicate":"event_occurred","event":"creature_defeated","controller":"self","window":"previous_opponent_turn","min_count":1}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"DRAW","player":"self","count":3},{"op":"IF","when":{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","element":"Stone"}},"then":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":{"min":0,"max":1},"filters":{"element":"Stone"},"as":"seal_target"},{"op":"ADD_SHIELD_EACH","targets":"$seal_target","amount":30}]}]},"listeners":[],"continuous":[]}}
```

## 3.9 Surveyor Mina — Ally

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"stone-surveyor-mina","name":"Surveyor Mina","card_family":"Tactic","element":"Stone","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,"tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"DRAW","player":"self","count":2},{"op":"IF","when":{"predicate":"target_printed_hp_at_least","target":"$current_friendly_vanguard","value":200},"then":[{"op":"DRAW","player":"self","count":1},{"op":"CHOOSE_HAND_TO_DISCARD","player":"self","count":1}]}]},"listeners":[],"continuous":[]}}
```

---

# 4. Validation

- Stone identities: **24** = 11 Creature / 4 Essence / 9 Tactic.
- Pack-only: Obsidianox / Granite Essence / Reversal Seal.
- Starbound: Crowncrag only.
- Evolution lines resolve: Gravibble → Cragroller → Monolithorn; Flintkin → Rampartusk → Citadelhorn.
- Every Stone Creature uses `creature_types: []`, `resistance: null`, `matchup_override: null`.
- **Per-card ordinary Weakness fields: 0.** Global `cp2-matchups-v0.1` supplies `Gale -> Stone`.
- Old card-id branches for Cragroller, Anchor, Granite and related prototype behaviour are not authority; their accepted rules now have generic schema representations.

# 5. Unbroken exact 60 preservation

The accepted `Unbroken` recipe remains 60 cards / 21 identities: 22 Creature / 18 Essence / 20 Tactic. Essence remains 14 Basic Stone / 2 Anchor / 2 Fault. Tactics remain 3 Mason's Kit / 3 Quarry Search / 2 Reinforce / 2 Keeper Tor / 2 Surveyor Mina / 3 Bastion Plate / 2 Faultstone / 3 Ironcliff Citadel. Pack-only Obsidianox, Granite Essence and Reversal Seal remain excluded. Crowncrag remains exactly one copy.

# 6. Completion

**STONE STRUCTURED CANDIDATE: COMPLETE — 24 / 24 IDENTITIES.**

This is branch-only candidate data. Numeric balance remains provisional. Next bounded action: **Tide 24 Card Pass 2 STRUCTURE** under the same global Weakness rule.
