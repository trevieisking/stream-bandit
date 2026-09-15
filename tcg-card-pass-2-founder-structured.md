# Stream Bandit TCG — Card Pass 2 — Prismatic Founder v0.2 Structured Candidate

**Status:** Branch-only structured candidate for Set One identity 193. No production registry, migration, battle-engine source, starter recipe or deployed gameplay is changed by this file.

Schema: `sb-tcg-card-v0.2`  
Effect schema: `sb-tcg-effects-v0.2`  
Matchup table: `cp2-matchups-v0.1`

## Current authority

This candidate converts the accepted current-rules Founder design into deterministic structure using:

- `tcg-card-pass-2-founder.md` for the accepted current-rules identity/Ability/attack design;
- Amendments E/I/T for global matchup ownership and Prismatic neutrality;
- Amendment U for distinct attached-Essence element queries/search;
- the shared Starbound, hidden-search, effect-generated attachment and formula grammar from the v0.2 schema/amendments.

Stale pre-correction per-creature Weakness prose in the older Founder/base-schema documents is not authority.

---

# 1. Structured identity

```json
{
  "schema":"sb-tcg-card-v0.2",
  "effect_schema":"sb-tcg-effects-v0.2",
  "id":"prismatic-stream-bandit-prismatic-founder",
  "name":"Stream Bandit — Prismatic Founder",
  "card_family":"Creature",
  "element":"Prismatic",
  "traits":["Mythic","Prismatic"],
  "pack_only":false,
  "deck_limit":{"scope":"identity","max":1},
  "prestige":{
    "starbound":{
      "enabled":true,
      "action_kind":"attack",
      "action_id":"total-convergence",
      "shared_usage_key":"starbound",
      "consume":"legal_declaration_or_activation"
    }
  },
  "creature":{
    "stage":"Standalone",
    "evolves_from_id":null,
    "hp":360,
    "withdrawal":3,
    "reward_value":2,
    "creature_types":[],
    "resistance":null,
    "matchup_override":null,
    "ability":{
      "id":"bandits-current",
      "name":"Bandit's Current",
      "mode":"active",
      "event":null,
      "timing":"own_turn",
      "limit":{"scope":"turn","count":1,"owner":"controller"},
      "requirements":[
        {"predicate":"source_is_current_friendly_vanguard"}
      ],
      "costs":[],
      "steps":[
        {
          "op":"SEARCH_DECK",
          "player":"self",
          "reveal":"public",
          "selection":{
            "min":0,
            "max":1,
            "filters":{
              "card_family":"Essence",
              "essence_subtype":"Basic",
              "element_not_in_query":{
                "query":"attached_essence_elements",
                "target":"$source_creature",
                "distinct":true,
                "allowed_elements":["Astral","Ember","Gale","Grove","Shade","Stone","Tide","Volt"]
              }
            }
          },
          "declared_target_count":1,
          "hidden_fail_allowed":true,
          "destination":"effect_owned_selection",
          "as":"founder_new_essence"
        },
        {
          "op":"ATTACH_ESSENCE_FROM_SELECTION",
          "cards":"$founder_new_essence",
          "target":"$source_creature",
          "manual_attachment":false,
          "attachment_state":{"kind":"normal","expires":"none","destination_on_expire":"none"}
        },
        {"op":"SHUFFLE_DECK","player":"self"}
      ]
    },
    "attacks":[
      {
        "id":"founders-mark",
        "name":"Founder's Mark",
        "cost":[{"element":"Any","amount":2}],
        "damage_element":"source_creature",
        "base_damage":70,
        "damage_formula":null,
        "requirements":[],
        "on_declare":[],
        "before_damage":[],
        "after_damage":[]
      },
      {
        "id":"total-convergence",
        "name":"Total Convergence",
        "cost":[{"element":"Any","amount":3}],
        "damage_element":"source_creature",
        "base_damage":null,
        "damage_formula":{
          "base":120,
          "terms":[
            {
              "kind":"count_add",
              "counter":{
                "kind":"distinct_attached_essence_elements",
                "target":"$source_creature",
                "allowed_elements":["Astral","Ember","Gale","Grove","Shade","Stone","Tide","Volt"]
              },
              "amount_per":20,
              "max_count":8
            }
          ]
        },
        "requirements":[
          {
            "predicate":"attached_essence_distinct_element_count_at_least",
            "target":"$source_creature",
            "count":3,
            "allowed_elements":["Astral","Ember","Gale","Grove","Shade","Stone","Tide","Volt"]
          }
        ],
        "on_declare":[],
        "before_damage":[],
        "after_damage":[]
      }
    ]
  },
  "essence":null,
  "tactic":null
}
```

---

# 2. Matchup validation

The Founder uses:

```json
{"creature_types":[],"resistance":null,"matchup_override":null}
```

There is **no routine per-card Weakness field**.

Prismatic contributes no automatic Weakness key under the current global table. The Founder is therefore neutral by default unless a later explicit reviewed `matchup_override` is introduced.

Distinct attached Essence elements are resource/query state only and never create Prismatic Weakness keys.

---

# 3. Starbound validation

- Mythic: yes.
- Stage: Standalone.
- Reward value: 2.
- Deck limit: exactly 1 identity copy.
- Starbound: yes.
- Exactly one Starbound action: `total-convergence`.
- `Bandit's Current` is an ordinary once-per-turn Ability.
- `Founder's Mark` is an ordinary attack.
- `Total Convergence` consumes the player's shared Starbound marker on legal declaration through the normal global Starbound owner.

No Founder-specific Starbound runtime branch is required.

---

# 4. Bandit's Current validation

The Ability:

- requires Founder to be the friendly Vanguard;
- may activate once per controller turn;
- searches for up to one Basic Essence;
- the chosen Essence element must not already be represented on Founder;
- hidden-deck failure remains legal and non-leaking;
- attaches only to Founder;
- does not consume the normal manual attachment;
- shuffles after the search;
- uses shared distinct-element query and effect-generated attachment grammar only.

If no card is selected, the attachment step resolves with an empty selection and does nothing; the deck is still shuffled as the search effect requires.

---

# 5. Total Convergence validation

Legal declaration requires at least three distinct current Set One Essence elements attached to Founder.

Damage formula:

```text
120 + 20 × distinct attached Set One Essence elements
```

Current Set One range:

- 3 elements → 180
- 4 → 200
- 5 → 220
- 6 → 240
- 7 → 260
- 8 → 280

Duplicate Essence of one element do not increase the count.

The formula counts Founder's own attached Essence only. Opponent resources and other friendly Creatures do not contribute.

Total Convergence remains ordinary attack damage after formula construction, so the global attack pipeline applies normally. Prismatic currently has no automatic Weakness relationship of its own.

---

# 6. Set One inventory consequence

The Set One structured-candidate inventory is now:

- 24 Astral
- 24 Ember
- 24 Gale
- 24 Grove
- 24 Shade
- 24 Stone
- 24 Tide
- 24 Volt
- 1 Prismatic Founder

**Total structured candidate identities: 193.**

Founder is not in any starter recipe and does not change any of the eight exact 60-card starter quantities.

---

# 7. Completion state

**PRISMATIC FOUNDER STRUCTURED CANDIDATE: COMPLETE — IDENTITY 193 / 193 NOW HAS A v0.2 STRUCTURED CANDIDATE.**

This does **not** yet mean all 193 are machine-schema validated or registry-frozen. Remaining gates are:

1. consolidate the full opcode/predicate/parameter schema into the machine-readable validator;
2. mechanically validate every structured candidate against that one owner;
3. reconcile all eight exact starter recipes against candidate ids/limits;
4. remove old base-schema stale Weakness examples or mark that source legacy;
5. reconcile runtime/interpreter and remove card-id/name shortcuts;
6. only then consider deterministic registry freeze after AI/human balance.