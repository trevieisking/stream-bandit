# Stream Bandit TCG — Card Pass 2 — v0.2 Schema Amendment M

**Status:** Binding additive amendment to Card Pass 2 v0.2. Design/schema only. No production registry, migration, engine, starter recipe or deployed gameplay is changed by this file.

**Scope:** Generic typed attack-cost reduction floors, temporary/borrowed Essence lifecycle/discard events and post-resolution Device destination overrides exposed by the complete Volt mapping.

## Authority rule

This file extends the base schema plus Amendments A–L inside the same `sb-tcg-card-v0.2` / `sb-tcg-effects-v0.2` system. No Volt-specific runtime owner is introduced.

---

# CP2-03M-01 — Temporary / borrowed Essence lifecycle normalization

The base `attachment_state` is binding:

```json
{
  "kind":"normal | temporary | borrowed",
  "expires":"controller_aftermath | none",
  "destination_on_expire":"discard | none",
  "created_by":"source-action-id"
}
```

Rules:

1. temporary/borrowed state belongs to the attached Essence card instance;
2. cleanup scans all friendly field creatures, not only Vanguard;
3. cleanup runs at the attached creature controller's Aftermath as declared;
4. movement between friendly creatures preserves the attachment-state kind/expiry unless an explicit effect changes it;
5. cleanup discard emits the normal `essence_discarded` event with attachment-state kind and source action attribution;
6. effect-generated attachments do not consume the normal manual attachment allowance unless explicitly stated.

---

# CP2-03M-02 — Attach from discard with attachment state

`ATTACH_ESSENCE_FROM_ZONE` may declare:

```json
{
  "op":"ATTACH_ESSENCE_FROM_ZONE",
  "player":"self",
  "zone":"discard",
  "selection":{"min":1,"max":1,"filters":{"card_family":"Essence","essence_subtype":"Basic","element":"Volt"}},
  "target":"$target",
  "manual_attachment":false,
  "attachment_state":{"kind":"temporary","expires":"controller_aftermath","destination_on_expire":"discard"}
}
```

The selected card is an existing discard-zone Essence instance.

---

# CP2-03M-03 — Attachment-state predicates

Add predicates:

- `source_has_attached_essence_kind`
- `target_has_attached_essence_kind`
- `event_attachment_kind_is`
- `essence_discarded_attachment_kind_is`
- `essence_discarded_source_controller_is_self`
- `essence_discarded_by_own_card_effect`

Allowed attachment kinds: `normal`, `temporary`, `borrowed`.

---

# CP2-03M-04 — Typed attack-cost modifier

Normalize `ADD_ATTACK_COST_MODIFIER` / continuous attack-cost modification:

```json
{
  "kind":"attack_cost",
  "target":"$attached_creature",
  "when":{"predicate":"event_occurred","event":"device_resolved","controller":"self","window":"current_turn","min_count":1},
  "amount":-1,
  "typed_element":"Volt",
  "total_cost_floor":1,
  "filters":{"first_attack_each_turn":true}
}
```

Rules:

1. `typed_element` reduces only that typed component;
2. a typed component cannot fall below 0;
3. `total_cost_floor` is checked after all typed reductions and prevents the attack's total required Essence from falling below the stated floor;
4. a modifier may carry normal turn/attack use limits;
5. attack-cost modifiers never discard Essence by themselves.

---

# CP2-03M-05 — Device play lock

Normalize `SET_DEVICE_PLAY_LOCK`:

```json
{
  "op":"SET_DEVICE_PLAY_LOCK",
  "player":"self",
  "locked":true,
  "duration":{"expires_on":["end_of_turn"]}
}
```

A locked player cannot legally play another Device while the lock is active. Already resolving Device effects finish normally.

---

# CP2-03M-06 — Post-resolution destination override

Add a generic destination-override listener for a resolving card:

```json
{
  "op":"SET_RESOLVING_CARD_DESTINATION",
  "card":"$resolving_card",
  "destination":"deck_bottom"
}
```

Semantics:

1. legal only before the normal subtype cleanup sends the resolving Tactic to discard;
2. replaces that one card's normal post-resolution destination;
3. does not replay or immediately redraw the card;
4. movement is public when the resolving card was public;
5. a once-per-player-turn Realm listener may offer this as an `OPTIONAL` choice for the first Device that player resolves during their own turn.

---

# CP2-03M-07 — Resolving-card event context

`device_resolved` exposes:

- resolving card uid/id/controller;
- active seat;
- normal destination before overrides;
- whether a destination override is already present;
- source Realm/listener when an override is proposed.

Expose `$resolving_card` during the post-resolution destination decision window.

---

# CP2-03M-08 — Successful Essence-discard listener

`essence_discarded` includes:

- Essence uid/element;
- attachment-state kind before discard;
- previous attached creature uid/controller;
- discard cause `card_effect | lifecycle_cleanup | cost | rule`;
- source action/card controller.

This allows listeners such as “first temporary/borrowed Essence actually discarded from this creature each turn” and “Pulse Essence discarded by your own card effect” without card-name branches.

---

# CP2-03M-09 — Attack declaration attached-state snapshot

Attack context can snapshot whether the attacking creature had at least one attached Essence with a requested attachment-state kind at legal declaration.

Predicates:

- `event_attack_source_has_attached_essence_kind`
- `event_attack_source_attached_essence_count_at_least`

The snapshot prevents later post-damage cleanup/movement from changing whether a declaration-time bonus/condition qualified.

---

# CP2-03M-10 — Validation additions

A v0.2 validator must reject:

1. temporary/borrowed Essence cleanup restricted only to Vanguard;
2. an attachment-state predicate on a non-Essence attachment;
3. typed attack-cost reduction that lowers total required Essence below its declared floor;
4. a Device lock with no deterministic expiry;
5. resolving-card destination override outside the post-resolution cleanup window;
6. a Device returned to deck bottom and also discarded in the same resolution;
7. temporary/borrowed discard listeners triggered when no Essence actually moved to discard;
8. Volt-specific runtime branching where the generic structures above suffice.

---

## Amendment M conclusion

The shared v0.2 grammar now covers Volt's tempo engine generically: temporary/borrowed charge, controller-Aftermath cleanup, typed attack-cost reduction, Device sequence locks, discard listeners and first-Device destination override.
