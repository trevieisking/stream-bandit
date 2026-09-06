# Stream Bandit TCG — Control / Toolbox Archetype Design Philosophy

**Status:** Living design guidance on PR #549. This file captures reusable gameplay principles, not copied card identities or production registry changes.

## Why this exists

Trev's preferred competitive deck style is not simple high-damage aggression. The recurring pattern is a **control/toolbox deck** that assembles several different answers, manipulates board state and damage, then converts that setup into a finishing attack or execution effect.

Stream Bandit should support this style deliberately across sets without making any one element own every tool.

---

# 1. Core control-toolbox loop

A healthy Stream Bandit control/toolbox deck may combine some of these roles:

1. **Utility wall** — a low-HP Creature that selectively prevents attack damage from a defined attacker class.
2. **Damage manipulation** — move existing damage from friendly Creatures onto opposing Creatures, or place damage directly through a separate legal effect.
3. **Pivot / forced movement** — move your own Vanguard/Reserve efficiently or force/reward opponent movement.
4. **Condition pressure** — apply Dazed, Stunned, Venomed, Blinded, Silenced, etc. to create tactical windows.
5. **Execution / threshold payoff** — a rare attack or Ability becomes much stronger, or can defeat a target, only when an exact board condition has been earned.
6. **Defeat-response value** — draw, recover or reposition after one of your Creatures is defeated so the deck can recover tempo rather than collapse.
7. **Resource recursion** — recover selected Tactics/Devices/Essence from discard rather than relying only on raw draw.
8. **Opponent hand disruption** — rare, controlled discard/reorder effects that trade tempo for information/resource pressure.
9. **Targeted ranged pressure** — hit a specific opposing Reserve/field Creature rather than only trading Vanguard damage.
10. **Scaling finisher** — a larger attacker whose damage depends on accumulated board state such as existing friendly damage, attached resources, opponent progress or a condition already created by earlier toolbox pieces.

The deck should feel like solving a sequence, not playing one unbeatable card.

---

# 2. Engine capabilities this archetype requires

Already planned shared rules cover:

- selective attack-damage protection — Amendment O;
- layered counterplay / separate condition and damage-placement protection — Amendment P;
- damage movement / hostile transfer / direct placement — Amendment N;
- alternate targets and Reserve pressure — Amendment G;
- effect switching and voluntary withdrawal — Amendment H;
- public discard selection / healing / damage-source bindings — Amendment I;
- hidden information and delayed actions — Amendment J.

The consolidated validator/runtime must also preserve these generic capabilities:

## 2.1 Defeat-response listeners

Support deterministic listeners such as:

- `friendly_creature_defeated`
- `friendly_creature_defeated_during_opponent_turn`
- `opposing_creature_defeated`
- `previous_opponent_turn_had_friendly_defeat`

These may drive draw, recovery or optional movement with normal once-per-turn/source-instance limits.

## 2.2 Exact damage-threshold predicates

Support predicates such as:

```json
{"predicate":"target_damage_equals","amount":60}
{"predicate":"target_damage_at_least","amount":100}
{"predicate":"target_has_condition","condition":"Venomed"}
```

Exact-threshold effects must check the authoritative current damage state at the declared timing point.

## 2.3 Rare execution effects

A future high-tier attack/Ability may defeat a target without dealing ordinary attack damage when a severe setup condition is satisfied, for example:

- target has exactly N damage;
- target has a specified condition;
- target satisfies both a condition and resource/board gate.

Guardrails:

- execution effects are rare;
- the setup must be interactable;
- the target condition is checked at legal declaration and, where necessary, again before resolution;
- they cannot be disguised as ordinary Weakness damage;
- they cannot bypass the shared Starbound/once-per-turn limits when those gates apply;
- defeat still uses the shared defeat/Reward/win owner.

## 2.4 Opponent-progress formulas

Future attacks may scale from deterministic public progress such as:

- opponent Reward cards already taken;
- friendly Creatures defeated this match;
- damaged friendly Reserve count;
- number of friendly Creatures carrying damage;
- number of attached Essence / temporary resources.

These counts must be read from canonical state, never client summaries.

## 2.5 Discard recursion

Support generic public-discard recovery for selected card classes, e.g. up to N Devices/Tactics/Essence from discard to hand, deck bottom or attached destination.

No card-name-specific recovery code.

## 2.6 Hand disruption

Support rare opponent-hand effects such as:

- random discard 1;
- chosen discard under explicit visibility rules;
- shuffle hand into deck then redraw fixed count;
- delayed hand pressure.

Random opponent-hand selection must be server-owned and auditable.

---

# 3. Element distribution

The control/toolbox archetype is **cross-element**, not a single-element identity.

Natural homes:

- **Shade:** hand/information disruption, Silenced/Mindbound-style control, delayed choices.
- **Underworld:** vitality drain, hostile wound transfer, pain-as-cost, defeat-linked recovery/value and execution-style payoffs.
- **Fairy:** selective wards, damage redistribution, condition protection and reversal.
- **Tide:** ranged/Reserve pressure, damage placement and patient setup.
- **Astral:** prediction, top-deck/reward information, temporary protection and timing manipulation.
- **Volt/Gale:** pivoting, tempo switching and attack sequencing.
- **Stone/Grove:** defensive support pieces that can be included in future mixed-element formats without becoming hard-lock engines.

No element should receive every one of these tools at premium efficiency.

---

# 4. Utility over raw stats

A Creature can be excellent with low HP and low attack output when its Ability changes the matchup.

Examples of healthy utility value include:

- selectively walling a prestige attacker class;
- moving 10–30 existing damage each turn;
- recovering one Device after a defeat;
- forcing a switch under a clear gate;
- drawing after a friendly defeat;
- setting up an exact-damage execution threshold.

This is intentional design space. Card evaluation must not treat HP and base attack damage as the only measure of strength.

---

# 5. Layered combo examples

A valid future control line might look like:

1. low-HP utility wall slows a Mythic attacker;
2. attached Relic blocks key conditions;
3. active Realm blocks damage placement;
4. opponent replaces/removes Realm to expose placement route;
5. passive placement aura begins adding damage;
6. another card moves that damage to a key opposing Creature;
7. forced switch exposes the damaged target;
8. execution or scaling finisher converts the setup into a defeat.

Every layer must have an answer. The goal is **interaction density**, not permanent denial.

---

# 6. Balance guardrails

1. No one card should wall attacks, block conditions, block placement and act as the main finisher by itself.
2. Broad permanent protection requires multiple practical counter routes in the environment.
3. Exact-damage or condition-based instant defeats require significant setup and must be rare.
4. Prize/Reward denial or reduction is especially sensitive and should be tightly limited if introduced.
5. Repeated defeat-trigger draw/recursion must use once-per-turn/source-instance limits where needed.
6. Bench/Reserve sniping and direct placement should not routinely invalidate the Vanguard/Reserve structure.
7. Damage moved from a friendly Creature to an opponent is not healing and does not trigger ordinary heal bonuses.
8. Damage placement does not receive Weakness multiplication and is not absorbed by Shield unless a separate protection rule says so.
9. Toolbox decks must retain a route to win; pure indefinite stalling is not a desired archetype.
10. AI Test Match must specifically test hard-lock combinations, recursion loops and execution consistency before release.

---

# 7. Design target

Stream Bandit should support players who enjoy winning through **sequencing, disruption, board manipulation and clever utility**, not only through the highest attack number.

The ideal control/toolbox deck makes the opponent think:

- which protection layer do I remove first?
- which Creature is the real threat?
- should I switch now or hold position?
- can I stop the damage-transfer setup before the execution turn?
- do I spend resources answering the wall or race the finisher?

That strategic texture is now a deliberate master-plan objective.