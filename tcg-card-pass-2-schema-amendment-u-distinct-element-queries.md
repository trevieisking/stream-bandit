# Stream Bandit TCG — Card Pass 2 — Schema Amendment U — Distinct Attached-Element Queries

**Status:** Binding additive schema amendment. Branch design only. No production registry, migration, deployed engine or live gameplay is changed by this file.

**Purpose:** Provide one generic rules shape for effects that count, test or search against the set of Essence elements already represented on a Creature. This is required by Prismatic Founder but is reusable by future multi-element cards.

---

## U-01 — Canonical represented-element set

For a Creature instance, define:

```json
{
  "query":"attached_essence_elements",
  "target":"$source_creature",
  "distinct":true,
  "allowed_elements":["Astral","Ember","Gale","Grove","Shade","Stone","Tide","Volt"]
}
```

Semantics:

1. inspect actual attached Essence card instances on the target;
2. read each Essence instance's currently supplied element(s) from structured registry data;
3. include each allowed element at most once when `distinct=true`;
4. duplicate attached Essence of the same element do not increase the distinct count;
5. temporary/borrowed Essence count while legally attached unless the querying card explicitly excludes them;
6. no client-supplied summary is authoritative.

---

## U-02 — Distinct element count predicate

Add/normalize:

```json
{
  "predicate":"attached_essence_distinct_element_count_at_least",
  "target":"$source_creature",
  "count":3,
  "allowed_elements":["Astral","Ember","Gale","Grove","Shade","Stone","Tide","Volt"]
}
```

Also support `equals` and `at_most` variants.

---

## U-03 — Distinct element count formula

Normalize the existing formula counter as:

```json
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
```

The counter is snapshotted at the attack's declared formula timing unless an accepted card explicitly specifies another timing.

---

## U-04 — Search for an unrepresented element

Extend ordinary hidden-deck search filters with a structured set-exclusion query:

```json
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
  "as":"chosen_essence"
}
```

The selected card must satisfy both the ordinary static filters and the dynamic set-exclusion filter at resolution.

---

## U-05 — Attach selected Essence

A following generic step may attach that exact selected Essence:

```json
{
  "op":"ATTACH_ESSENCE_FROM_SELECTION",
  "cards":"$chosen_essence",
  "target":"$source_creature",
  "manual_attachment":false,
  "attachment_state":{"kind":"normal","expires":"none","destination_on_expire":"none"}
}
```

Then the owning deck is shuffled through the ordinary shared shuffle operation.

`ATTACH_ESSENCE_FROM_SELECTION` is a convenience specialization of the existing effect-generated attachment path; it does not create a second attachment system.

---

## U-06 — Search legality and hidden information

Because deck contents are hidden:

- the player may legally fail to find a matching card when `hidden_fail_allowed=true`;
- the client is not told whether a qualifying element exists before the choice;
- if a card is selected it is revealed as required by the search effect;
- the dynamic exclusion set is computed server-side from public attached Essence state;
- a failed search cannot leak the remaining element composition of the deck.

---

## U-07 — Multi-supply Essence

If a future Essence supplies more than one element simultaneously, all currently supplied allowed elements contribute to the represented-element set unless that Essence's rules explicitly define a single chosen supplied element.

The query reads the Essence's canonical current supplied-element state rather than printed prose.

---

## U-08 — Prismatic neutrality

These distinct-element queries are resource queries only. They do **not** create Weakness keys for Prismatic or alter matchup ownership.

A Prismatic Creature remains neutral by default under Amendment T unless explicit `matchup_override` metadata says otherwise.

---

## U-09 — Validator guards

Reject:

1. card-name-specific checks for attached Essence elements;
2. counting duplicate copies of one element as multiple distinct elements;
3. client-supplied distinct-element counts;
4. searching for “a new colour” through printed-English parsing;
5. search availability leaking hidden deck composition;
6. an allowed-element set containing undeclared current elements for a Set One formula unless explicitly future-versioned;
7. resource-element counting being reused as an implicit Weakness rule.

---

## Amendment U conclusion

The v0.2 grammar now has a generic, deterministic way to:

- count distinct attached Essence elements;
- require a minimum number of distinct elements;
- search for a Basic Essence whose element is not already represented;
- attach that selected Essence without consuming the normal manual attachment.

This removes the last schema-specific blocker to a fully structured Prismatic Founder candidate.