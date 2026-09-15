# Stream Bandit TCG — v0.2 Runtime Interpreter Parity Plan

**Status:** Branch-only implementation plan on PR #549. No production function, migration or registry is changed by this document.

## Goal

Make `sb-tcg-effects-v0.2` the single deterministic runtime language for attacks, Abilities, Essence, Relics, Realms and Tactics. Remove card-name/card-id branches and printed-English parsing from battle resolution.

The current structural authority is now green:

- 193 unique Set One structured candidates;
- eight exact 60-card starters reconciled;
- `tcg-card-pass-2-effect-grammar-v0.2.json` declares every opcode and predicate currently used by those 193 candidates;
- TCG Card Pass 2 Validation #11 passed at `b04b7009646bc85a1b704aa27ece7af8960c9e2c`.

Runtime parity is the next gate. Registry freeze remains later, after deterministic simulations and human balance.

---

# 1. Current split runtime

## `tcg-tactic-actions`

The branch already contains a server-authoritative structured effect runner with:

- pending effect state;
- private pending choices;
- hidden-zone handling;
- deterministic variable bindings;
- generic creature/card selectors;
- generic step dispatch;
- lifecycle effects;
- nonce/revision command discipline.

It is still labelled `sb-tcg-effects-v0.1` and does not yet cover the complete v0.2 grammar.

## `tcg-match-actions`

The branch attack path still contains legacy prototype behavior:

1. parses printed attack strings through `parseAttack`;
2. inspects lower-cased English effect text with `includes(...)` / regular expressions;
3. contains card-id branches for alternate targeting, unsupported pending-choice attacks and specific post-damage effects;
4. contains Essence card-id branches inside withdrawal and attack-damage calculation;
5. carries a special `volt-surge-essence` lifecycle cleanup branch;
6. uses old prototype fields such as `attack_1`, `attack_2`, `withdraw`, `stage=Mythic` compatibility.

This is not acceptable final authority.

---

# 2. Confirmed card-specific / text-specific debt in `tcg-match-actions`

## Card-id behavior

Current examples include:

- `gale-breeze-essence` / `grove-root-essence` withdrawal reduction;
- `stone-anchor-essence` withdrawal increase and incoming-damage reduction;
- `stone-granite-essence` withdrawal interaction lock;
- `shade-whisper-essence` condition-based attack bonus;
- `volt-surge-essence` special Aftermath cleanup;
- `gale-skyrend` Reserve-target exception;
- `astral-cosmarch` post-attack top-card behavior;
- `tide-tideroar` healing target request;
- explicit pending-choice blocks keyed to Astral/Grove card identities.

All of these now have or must use structured v0.2 metadata instead.

## Printed-English behavior

The attack path currently searches English phrases such as:

- `target is scorched`;
- `target is venomed`;
- `target has a condition`;
- `3 or more reserve`;
- `reserve is full`;
- `5 or more cards in hand`;
- `has a relic`;
- `played a device this turn`;
- `4 or more essence`;
- `became vanguard this turn`;
- `friendly damaged creature`;
- `prevented damage this turn`;
- condition-application text;
- healing text;
- deck-discard text.

This must be deleted as runtime authority once v0.2 attack metadata is wired in.

---

# 3. Single-owner architecture

The runtime should converge on one shared interpreter core with thin action adapters.

```text
client command
  ↓
match command validation / nonce / revision
  ↓
resolve source card + structured action
  ↓
sb-tcg-effects-v0.2 interpreter
  ↓
pending choice when necessary
  ↓
shared damage / condition / movement / defeat / Reward / win owners
  ↓
atomic canonical state commit
```

`tcg-match-actions` remains the battle-command boundary. It should not become a second card interpreter.

`tcg-tactic-actions` may temporarily remain a separate HTTP function during migration, but its generic effect-running machinery should be treated as the prototype of the shared v0.2 core, not as Tactic-only game logic.

---

# 4. Runtime contracts

## 4.1 Structured action lookup

Attacks are read from current structured Creature data:

```text
creature.attacks[attack_slot]
```

not from `attack_1` / `attack_2` English strings.

The attack object owns:

- id;
- cost;
- target permissions;
- base damage / damage formula;
- declaration requirements;
- on-declare steps;
- before-damage steps;
- after-damage steps;
- after-attack-finished steps;
- Starbound designation through top-level prestige metadata.

## 4.2 Ability lookup

Abilities use `creature.ability` structured data. Active Abilities become explicit battle commands; triggered/continuous Abilities are event/listener registrations, never name checks.

## 4.3 Tactic lookup

Tactics use `tactic.program`, `tactic.listeners` and `tactic.continuous` from the v0.2 candidate shape. Legacy `engine_effects` remains compatibility-only until source registry migration is ready.

## 4.4 Essence / Relic / Realm lookup

Use structured `essence` and `tactic` metadata. Withdrawal, damage, condition and lifecycle changes are generic continuous/listener effects.

No Essence identity may be recognized by card id in shared battle math.

---

# 5. Damage pipeline owner

Ordinary attack damage must follow the current locked order:

1. base damage + formula terms;
2. temporary attacker bonuses;
3. attacker matchup keys;
4. defender matchup keys;
5. global matchup table;
6. Weakness ×2 once maximum;
7. explicit Resistance;
8. defender attack reduction/prevention;
9. Shield;
10. HP damage;
11. after-damage effects;
12. defeat / Reward / win.

Effect damage, placement, movement and execution remain distinct damage/effect classes as defined by Amendments N/Q/R/S.

---

# 6. Pending-choice owner

Any structured step that requires player input must suspend through one generic pending-choice model.

Examples:

- choose Creature;
- choose cards from hand/discard/deck;
- choose hidden Reward position;
- choose player;
- choose Reserve target;
- order looked-at cards;
- choose amount where effect says `up to`;
- choose alternate legal attack target.

The client never supplies hidden candidates or authoritative legal-option lists.

---

# 7. Migration sequence

## Runtime Pass A — shared v0.2 contract and parity tests

1. Treat `tcg-card-pass-2-effect-grammar-v0.2.json` as the operation/predicate inventory.
2. Add a runtime capability manifest that reports which v0.2 operations/predicates are executable.
3. CI must fail if a Set One candidate uses a grammar primitive that the runtime capability manifest does not cover.
4. This is a capability gate, not a claim that every interaction is balance-tested.

## Runtime Pass B — generic battle math

Replace card-id Essence handling in:

- withdrawal calculation;
- incoming attack damage modifiers;
- outgoing attack damage modifiers;
- generated/temporary Essence cleanup.

Use structured continuous/lifecycle metadata.

## Runtime Pass C — attack metadata

Replace `parseAttack` and English `effect.includes(...)` behavior with structured attack objects and generic v0.2 steps.

Alternate target permissions become generic, removing the Skyrend ID branch.

## Runtime Pass D — attack pending choices

Move attack/Ability player selections through the same pending-choice mechanism already proven by the Tactic interpreter.

Remove the hard-coded unsupported-card list.

## Runtime Pass E — events/listeners/continuous effects

Register and resolve generic:

- Ability listeners;
- Essence listeners;
- Relic listeners;
- Realm listeners;
- continuous modifiers;
- lifecycle expiry.

## Runtime Pass F — prototype compatibility removal

Once the v0.2 registry is the tested source for private alpha:

- remove printed attack parser;
- remove card-name/card-id branches;
- remove `stage=Mythic` compatibility;
- remove obsolete old field aliases that are no longer needed.

---

# 8. Runtime parity gates

Before runtime parity may be marked complete:

- [ ] all Set One used v0.2 opcodes have an executable runtime owner or an intentionally fail-closed future-only classification;
- [ ] all used predicates have executable server-owned evaluation;
- [ ] zero card-id/name branches determine ordinary Set One gameplay;
- [ ] zero printed-English parsing determines gameplay;
- [ ] alternate targeting is metadata-driven;
- [ ] Weakness is global table-driven only;
- [ ] hidden choices are server-owned;
- [ ] retry/reconnect cannot duplicate effects;
- [ ] defeat/Reward/win remains one shared owner;
- [ ] dedicated runtime tests pass;
- [ ] full two-player setup → victory path succeeds without manual DB intervention.

---

# 9. Safety boundary

This runtime migration stays on PR #549 and remains branch-only until the later promotion gate.

It does not:

- deploy functions;
- apply migrations;
- mutate production card definitions;
- insert Fairy/Underworld into Set One;
- freeze provisional balance numbers;
- touch unrelated Stream Bandit systems.

---

## Conclusion

Card Pass 2 structure is now sufficiently consolidated to stop designing around prototype runtime exceptions. The next implementation owner is **one v0.2 interpreter**, with the existing deterministic Tactic runner used as the migration foundation and `tcg-match-actions` reduced to command validation, generic battle sequencing and shared state commit.