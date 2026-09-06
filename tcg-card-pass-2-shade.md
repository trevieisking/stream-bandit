# Stream Bandit TCG — Card Pass 2 — Shade 24 v0.2 Candidate

**Status:** Branch-only structured card candidate for the 24 accepted Set One Shade identities. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

Schema: `sb-tcg-card-v0.2`  
Effect schema: `sb-tcg-effects-v0.2`  
Matchup table: `cp2-matchups-v0.1`

## Authority and batch rules

This batch uses the accepted Shade design in `tcg-set-one-audit-volume-2.md`, the global matchup model in `tcg-card-pass-2-weakness-resistance.md`, the base v0.2 schema and Amendments A–J.

- Element: `Shade`.
- Weakness is global, never copied per ordinary card.
- Mystical/combat chain: `Astral -> Martial -> Shade -> Fairy -> Underworld -> Astral`.
- Shade is attacked for Weakness by the `Martial` offensive Creature Type when both sides exist in legal play.
- Current Set One Shade creatures use `creature_types: []`.
- Current Shade creatures use `resistance: null` and `matchup_override: null`.
- Every identity carries explicit Starbound yes/no metadata.
- Umbravale — Thought Hunter is Standalone + Mythic and is the only Starbound Shade identity.
- Ordinary non-Essence identities use a four-copy identity limit; Umbravale uses one copy; Essence delegates to the global Essence allowance.
- Pack-only Shade identities: Graveglider, Eclipse Essence, False Memory.
- Numeric balance remains provisional until deterministic AI Test Match and human playtesting.

---

# 1. Creature definitions — 11

## 1.1 Gloamkin

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-gloamkin","name":"Gloamkin","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":60,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"gloom-glimpse","name":"Gloom Glimpse","mode":"triggered","event":"creature_entered_play","timing":"build","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"event_destination_zone_is","zone":"reserve"},{"predicate":"event_phase_is","phase":"build"}]},"costs":[],"steps":[{"op":"INSPECT_ZONE","player":"opponent","zone":"deck_top","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"glimpse"}]},
    "attacks":[{"id":"gloom-tap","name":"Gloom Tap","cost":[{"element":"Shade","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null
}
```

## 1.2 Duskstalker

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-duskstalker","name":"Duskstalker","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Teen","evolves_from_id":"shade-gloamkin","hp":130,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"hidden-tell","name":"Hidden Tell","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"hand_count_at_least","player":"opponent","count":1}]},"costs":[],"steps":[{"op":"RANDOM_SAMPLE_HIDDEN_ZONE","player":"opponent","zone":"hand","count":{"min":1,"max":1},"rng_owner":"match","visibility":"controller_private","as":"sampled"}]},
    "attacks":[
      {"id":"dusk-claw","name":"Dusk Claw","cost":[{"element":"Shade","amount":1}],"damage_element":"source_creature","base_damage":40,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"hidden-step","name":"Hidden Step","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":60,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"hand_count_at_least","player":"opponent","count":5}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]},"essence":null,"tactic":null
}
```

## 1.3 Noctivane

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-noctivane","name":"Noctivane","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Adult","evolves_from_id":"shade-duskstalker","hp":250,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"night-reading","name":"Night Reading","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":[],"costs":[],"steps":[
      {"op":"INSPECT_ZONE","player":"opponent","zone":"deck_top","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"looked"},
      {"op":"CHOOSE_FROM_SET","source":"$looked","min":0,"max":1,"as":"bottom"},
      {"op":"MOVE_CARDS","player":"opponent","cards":"$bottom","to":"deck_bottom"},
      {"op":"IF","when":{"predicate":"selected_count_at_least","set":"$bottom","count":1},"then":[{"op":"SCHEDULE_ACTION","owner":"self","trigger":"controller_aftermath_finished","match_must_be_active":true,"steps":[{"op":"DRAW_FIXED","player":"opponent","count":1,"deckout_on_incomplete":true}]}]}
    ]},
    "attacks":[
      {"id":"nocturne-slash","name":"Nocturne Slash","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"dark-forecast","name":"Dark Forecast","cost":[{"element":"Shade","amount":3}],"damage_element":"source_creature","base_damage":110,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Silenced","mode":"apply_if_empty"}]}
    ]},"essence":null,"tactic":null
}
```

## 1.4 Murkmite

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-murkmite","name":"Murkmite","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Baby","evolves_from_id":null,"hp":50,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"murk-sense","name":"Murk Sense","mode":"continuous","event":null,"timing":"passive","limit":null,"requirements":[],"costs":[],"steps":[],"continuous":[{"id":"murk-sense-murk-nip","kind":"attack_damage","target":"$source_creature","when":{"predicate":"control_condition_present","target":"$current_opponent_vanguard"},"amount":10,"filters":{"attack_id":"murk-nip"}}]},
    "attacks":[{"id":"murk-nip","name":"Murk Nip","cost":[{"element":"Shade","amount":1}],"damage_element":"source_creature","base_damage":20,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null
}
```

## 1.5 Veiljaw

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-veiljaw","name":"Veiljaw","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Teen","evolves_from_id":"shade-murkmite","hp":140,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"frayed-thought","name":"Frayed Thought","mode":"triggered","event":"creature_evolved","timing":"own_turn","limit":null,"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"control_condition_slot_empty","target":"$current_opponent_vanguard"}]},"costs":[],"steps":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Dazed","mode":"apply_if_empty"}]},
    "attacks":[
      {"id":"veil-bite","name":"Veil Bite","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"thought-rend","name":"Thought Rend","cost":[{"element":"Shade","amount":3}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":80,"terms":[{"kind":"conditional_add","amount":20,"when":{"predicate":"target_has_any_condition"}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]},"essence":null,"tactic":null
}
```

## 1.6 Hollowcrown

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-hollowcrown","name":"Hollowcrown","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Adult","evolves_from_id":"shade-veiljaw","hp":270,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"hollow-command","name":"Hollow Command","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"control_condition_present","target":"$current_opponent_vanguard","exclude_condition":"Mindbound"}]},"costs":[],"steps":[{"op":"REPLACE_CONTROL_CONDITION","target":"$current_opponent_vanguard","condition":"Mindbound","allow_if_empty":false,"replace_existing":true}]},
    "attacks":[
      {"id":"hollow-lash","name":"Hollow Lash","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":70,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"crowned-nightmare","name":"Crowned Nightmare","cost":[{"element":"Shade","amount":4}],"damage_element":"source_creature","base_damage":null,"damage_formula":{"base":130,"terms":[{"kind":"conditional_add","amount":30,"when":{"predicate":"target_has_condition","condition":"Mindbound"}}]},"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}
    ]},"essence":null,"tactic":null
}
```

## 1.7 Wispbat

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-wispbat","name":"Wispbat","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":90,"withdrawal":0,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"fade-echo","name":"Fade Echo","mode":"triggered","event":"moved_to_reserve","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_action_kind_is","action_kind":"attack"},{"predicate":"event_controller_is_active_seat"}]},"costs":[],"steps":[{"op":"INSPECT_ZONE","player":"opponent","zone":"deck_top","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"echo"}]},
    "attacks":[
      {"id":"wisp-bite","name":"Wisp Bite","cost":[{"element":"Shade","amount":1}],"damage_element":"source_creature","base_damage":30,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"fade-strike","name":"Fade Strike","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"OPTIONAL","player":"self","steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{},"as":"switch_target"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$switch_target"}]}]}
    ]},"essence":null,"tactic":null
}
```

## 1.8 Umbraspider

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-umbraspider","name":"Umbraspider","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":130,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"web-of-doubt","name":"Web of Doubt","mode":"triggered","event":"became_vanguard","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_controller_is_active_seat"},{"predicate":"control_condition_slot_empty","target":"$current_opponent_vanguard"}]},"costs":[],"steps":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Dazed","mode":"apply_if_empty"}]},
    "attacks":[{"id":"shadow-fang","name":"Shadow Fang","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":50,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null
}
```

## 1.9 Nightmaw

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-nightmaw","name":"Nightmaw","card_family":"Creature","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":180,"withdrawal":2,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"dread-hunger","name":"Dread Hunger","mode":"triggered","event":"deck_cards_discarded","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_controller_is_opponent"},{"predicate":"source_controller_is_self"},{"predicate":"target_damaged","target":"$source_creature"}]},"costs":[],"steps":[{"op":"HEAL","target":"$source_creature","amount":10}]},
    "attacks":[
      {"id":"night-bite","name":"Night Bite","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"dread-crush","name":"Dread Crush","cost":[{"element":"Shade","amount":3}],"damage_element":"source_creature","base_damage":90,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"IF","when":{"predicate":"target_has_any_condition"},"then":[{"op":"DISCARD_DECK_TOP","player":"opponent","count":2,"reveal":"public"}]}]}
    ]},"essence":null,"tactic":null
}
```

## 1.10 Graveglider — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-graveglider","name":"Graveglider","card_family":"Creature","element":"Shade","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},
  "creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":140,"withdrawal":1,"reward_value":1,"resistance":null,"matchup_override":null,
    "ability":{"id":"cold-read","name":"Cold Read","mode":"triggered","event":"became_vanguard","timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"card_instance"},"requirements":{"all":[{"predicate":"event_subject_is_source"},{"predicate":"event_controller_is_active_seat"}]},"costs":[],"steps":[{"op":"INSPECT_ZONE","player":"opponent","zone":"deck_top","selection":{"min":2,"max":2,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"looked"},{"op":"RETURN_SET_TO_DECK_TOP","player":"opponent","cards":"$looked","order":"controller_choice"}]},
    "attacks":[{"id":"gloom-glide","name":"Gloom Glide","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":60,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]}]},"essence":null,"tactic":null
}
```

## 1.11 Umbravale — Thought Hunter

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-umbravale-thought-hunter","name":"Umbravale — Thought Hunter","card_family":"Creature","element":"Shade","traits":["Mythic"],"pack_only":false,"deck_limit":{"scope":"identity","max":1},
  "prestige":{"starbound":{"enabled":true,"action_kind":"attack","action_id":"mind-eclipse","shared_usage_key":"starbound","consume":"legal_declaration_or_activation"}},
  "creature":{"creature_types":[],"stage":"Standalone","evolves_from_id":null,"hp":330,"withdrawal":2,"reward_value":2,"resistance":null,"matchup_override":null,
    "ability":{"id":"thought-hunter","name":"Thought Hunter","mode":"active","event":null,"timing":"own_turn","limit":{"scope":"turn","count":1,"owner":"controller"},"requirements":{"all":[{"predicate":"control_condition_present","target":"$current_opponent_vanguard"},{"predicate":"hand_count_at_least","player":"opponent","count":1}]},"costs":[],"steps":[{"op":"RANDOM_SAMPLE_HIDDEN_ZONE","player":"opponent","zone":"hand","count":{"min":1,"max":2},"rng_owner":"match","visibility":"controller_private","as":"sampled"}]},
    "attacks":[
      {"id":"veil-pierce","name":"Veil Pierce","cost":[{"element":"Shade","amount":2}],"damage_element":"source_creature","base_damage":80,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[]},
      {"id":"mind-eclipse","name":"Mind Eclipse","cost":[{"element":"Shade","amount":4}],"damage_element":"source_creature","base_damage":140,"damage_formula":null,"requirements":[],"on_declare":[],"before_damage":[],"after_damage":[{"op":"IF","when":{"predicate":"target_remains_in_play_after_damage"},"then":[{"op":"REPLACE_CONTROL_CONDITION","target":"$attack_target","condition":"Mindbound","allow_if_empty":true,"replace_existing":true}]}]}
    ]},"essence":null,"tactic":null
}
```

---

# 2. Essence definitions — 4

## 2.1 Basic Shade Essence

```json
{"schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-basic-shade-essence","name":"Basic Shade Essence","card_family":"Essence","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":{"subtype":"Basic","provides":[{"element":"Shade","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"listeners":[],"lifecycle":null},"tactic":null}
```

## 2.2 Veil Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-veil-essence","name":"Veil Essence","card_family":"Essence","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,
  "essence":{"subtype":"Special","provides":[{"element":"Shade","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"veil-essence-read","event":"essence_attached","requirements":{"all":[{"predicate":"source_is_self"},{"predicate":"event_origin_zone_is","zone":"hand"},{"predicate":"target_element_is","target":"$attached_creature","element":"Shade"}]},"limit":null,"steps":[{"op":"INSPECT_ZONE","player":"opponent","zone":"deck_top","selection":{"min":1,"max":1,"filters":{}},"visibility":"controller_private","return_policy":"same_position","as":"looked"}]}]},"tactic":null
}
```

## 2.3 Whisper Essence

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-whisper-essence","name":"Whisper Essence","card_family":"Essence","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,
  "essence":{"subtype":"Special","provides":[{"element":"Shade","amount":1}],"attach_requirements":[],"on_attach":[],"listeners":[],"lifecycle":null,"continuous":[{"id":"whisper-conditioned-pressure","kind":"attack_damage","target":"$attached_creature","when":{"predicate":"target_has_any_condition","target":"$current_opponent_vanguard"},"amount":10,"filters":{"target_zone":"vanguard","target_controller":"opponent"}}]},"tactic":null
}
```

## 2.4 Eclipse Essence — pack-only

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-eclipse-essence","name":"Eclipse Essence","card_family":"Essence","element":"Shade","traits":[],"pack_only":true,"deck_limit":{"scope":"global_essence_allowance","max":null},"prestige":{"starbound":{"enabled":false}},"creature":null,
  "essence":{"subtype":"Special","provides":[{"element":"Shade","amount":1}],"attach_requirements":[],"on_attach":[],"continuous":[],"lifecycle":null,"listeners":[{"id":"eclipse-condition-heal","event":"condition_changed","requirements":{"all":[{"predicate":"source_is_attached_creature"},{"predicate":"source_controller_is_self"},{"predicate":"event_controller_is_opponent"},{"predicate":"event_change_kind_in","values":["apply","replace"]},{"predicate":"target_damaged","target":"$attached_creature"}]},"limit":{"scope":"turn","count":1,"owner":"attachment"},"steps":[{"op":"HEAL","target":"$attached_creature","amount":10}]}]},"tactic":null
}
```

---

# 3. Tactic definitions — 9

## 3.1 Broker Vale — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-broker-vale","name":"Broker Vale","card_family":"Tactic","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"DISCARD_HAND","player":"self"},{"op":"DISCARD_HAND","player":"opponent"},{"op":"DRAW_FIXED","player":"self","count":5,"deckout_on_incomplete":true},{"op":"DRAW_FIXED","player":"opponent","count":4,"deckout_on_incomplete":true},{"op":"CHECK_DECKOUT_AFTER_RESOLUTION"}]},"listeners":[],"continuous":[]}
}
```

## 3.2 False Memory — pack-only Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-false-memory","name":"False Memory","card_family":"Tactic","element":"Shade","traits":[],"pack_only":true,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"IF","when":{"predicate":"hand_count_at_least","player":"opponent","count":1},"then":[{"op":"RANDOM_SAMPLE_HIDDEN_ZONE","player":"opponent","zone":"hand","count":{"min":1,"max":1},"rng_owner":"match","visibility":"server_only","as":"random_discard"},{"op":"MOVE_CARDS","player":"opponent","cards":"$random_discard","to":"discard","visibility":"public_on_destination"}]},{"op":"OPTIONAL","player":"self","steps":[{"op":"CHOOSE_HAND_TO_DISCARD","player":"self","count":1},{"op":"DRAW","player":"self","count":2}],"else_steps":[{"op":"DRAW","player":"self","count":1}]}]},"listeners":[],"continuous":[]}
}
```

## 3.3 Gloom Locket — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-gloom-locket","name":"Gloom Locket","card_family":"Tactic","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"listeners":[],"continuous":[{"id":"gloom-locket-reduction","kind":"incoming_attack_damage","target":"$attached_creature","when":null,"amount":-10,"filters":{"source_controller":"opponent","attacker_has_any_condition":true,"target_element":"Shade"}}]}
}
```

## 3.4 Hollow Midnight — Realm

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-hollow-midnight","name":"Hollow Midnight","card_family":"Tactic","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Realm","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"listeners":[],"continuous":[{"id":"hollow-midnight-pressure","kind":"attack_damage","target_selector":{"controller":"any","zone":"vanguard","filters":{"card_family":"Creature","has_any_condition":true,"exclude_element":"Shade"}},"when":null,"amount":-10,"filters":{}}]}
}
```

## 3.5 Mind Cleanse — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-mind-cleanse","name":"Mind Cleanse","card_family":"Tactic","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[{"predicate":"legal_card_available","controller":"self","zone":"field","filters":{"card_family":"Creature","condition_any_of":["Mindbound","Dazed","Silenced"]}}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"field","count":1,"filters":{"condition_any_of":["Mindbound","Dazed","Silenced"]},"as":"cleanse_target"},{"op":"CHOOSE_AND_CLEAR_CONDITION","target":"$cleanse_target","allowed":["Mindbound","Dazed","Silenced"]},{"op":"DRAW","player":"self","count":1}]},"listeners":[],"continuous":[]}
}
```

## 3.6 Mirror Fang — Relic

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-mirror-fang","name":"Mirror Fang","card_family":"Tactic","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Relic","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":false,"steps":[]},"continuous":[],"listeners":[{"id":"mirror-fang-reflection","event":"condition_changed","requirements":{"all":[{"predicate":"event_subject_is_attached_creature"},{"predicate":"event_condition_slot_is","slot":"control"},{"predicate":"event_change_kind_in","values":["apply","replace"]},{"predicate":"control_condition_slot_empty","target":"$current_opponent_vanguard"}]},"limit":{"scope":"turn","count":1,"owner":"attachment"},"steps":[{"op":"APPLY_CONDITION","target":"$current_opponent_vanguard","condition":"Dazed","mode":"apply_if_empty"}]}]}
}
```

## 3.7 Quiet Step — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-quiet-step","name":"Quiet Step","card_family":"Tactic","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[{"predicate":"reserve_count_at_least","controller":"self","count":1}],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SELECT_CREATURE","controller":"self","zone":"reserve","count":1,"filters":{"element":"Shade"},"as":"incoming"},{"op":"SWITCH_WITH_VANGUARD","player":"self","target":"$incoming","as_switch":"quiet_step_switch"},{"op":"OPTIONAL","player":"self","steps":[{"op":"CHOOSE_AND_CLEAR_CONTROL_CONDITION","target":"$switch_outgoing_vanguard"}]}]},"listeners":[],"continuous":[]}
}
```

## 3.8 Seer Nyx — Ally

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-seer-nyx","name":"Seer Nyx","card_family":"Tactic","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Ally","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"INSPECT_ZONE","player":"opponent","zone":"deck_top","selection":{"min":3,"max":3,"filters":{}},"visibility":"controller_private","return_policy":"effect_owned_set","as":"looked"},{"op":"CHOOSE_FROM_SET","source":"$looked","min":1,"max":1,"as":"discarded"},{"op":"MOVE_CARDS","player":"opponent","cards":"$discarded","to":"discard","visibility":"public_on_destination"},{"op":"RETURN_REMAINDER_TO_DECK_TOP","player":"opponent","source":"$looked","except":"$discarded","order":"controller_choice"}]},"listeners":[],"continuous":[]}
}
```

## 3.9 Veil Search — Device

```json
{
  "schema":"sb-tcg-card-v0.2","effect_schema":"sb-tcg-effects-v0.2","id":"shade-veil-search","name":"Veil Search","card_family":"Tactic","element":"Shade","traits":[],"pack_only":false,"deck_limit":{"scope":"identity","max":4},"prestige":{"starbound":{"enabled":false}},"creature":null,"essence":null,
  "tactic":{"subtype":"Device","play_requirements":[],"program":{"schema":"sb-tcg-effects-v0.2","discard_after_resolve":true,"steps":[{"op":"SEARCH_DECK","player":"self","reveal":"public","selection":{"min":0,"max":1,"filters":{"element":"Shade","any":[{"card_family":"Creature"},{"card_family":"Essence","essence_subtype":"Special"}]}},"declared_target_count":1,"hidden_fail_allowed":true,"destination":"hand"},{"op":"SHUFFLE_DECK","player":"self"}]},"listeners":[],"continuous":[]}
}
```

---

# 4. Batch validation

- Creatures: **11**
- Essence: **4**
- Tactics: **9**
- Total Shade identities: **24**
- Pack-only: Graveglider, Eclipse Essence, False Memory
- Starbound: Umbravale — Thought Hunter only

Evolution references resolve:

- Gloamkin → Duskstalker → Noctivane
- Murkmite → Veiljaw → Hollowcrown

All 11 Shade Creatures use:

```json
{"creature_types":[],"resistance":null,"matchup_override":null}
```

There are **zero ordinary per-card `weakness` fields**.

Former prototype runtime debt now has generic structure paths for opponent-deck looks, random opponent-hand sampling, delayed compensation draws, control-condition replacement, deck-top discard, condition-change listeners and conditioned attacker/target modifiers.

---

# 5. Nightbind exact 60 starter preservation

The accepted Nightbind recipe remains **60 cards / 21 identities**:

- 22 Creature
- 18 Essence
- 20 Tactic

The two complete evolution lines and all recipe quantities remain unchanged. Pack-only Graveglider, Eclipse Essence and False Memory remain excluded. Umbravale appears exactly once.

---

# 6. Completion state

**SHADE STRUCTURED CANDIDATE: COMPLETE — 24 / 24 IDENTITIES.**

This is not a production registry mutation. Numeric tuning remains provisional and runtime promotion remains blocked until the shared v0.2 interpreter/validator and branch engine are reconciled.

## Next bounded action

Proceed to **Stone 24 Card Pass 2 structure** using the accepted Stone audit and the same global Weakness-only rule.
