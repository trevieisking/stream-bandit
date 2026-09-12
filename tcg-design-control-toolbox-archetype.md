# Stream Bandit TCG — Control / Toolbox / Conversion Archetype Design Philosophy

**Status:** Living design guidance on PR #549. This file captures reusable gameplay principles, not copied card identities or production registry changes.

## Why this exists

Trev's preferred competitive deck style is not simple high-damage aggression. The recurring pattern is a **control/toolbox deck that deliberately creates awkward board states and then converts those states into advantage**.

The deeper design identity is therefore **conversion control**:

- self-damage becomes attack power or damage-transfer ammunition;
- self-inflicted conditions become attack bonuses or activation gates;
- opponent conditions become execution gates;
- opponent progress becomes comeback damage;
- distributed resources become scaling attack damage;
- an apparently weak one-Reward wall buys setup turns;
- a damaged board becomes a ranged/threshold knockout engine;
- defeat can become reduced Reward liability, draw or recursion;
- forced switching converts positional control into a knockout window.

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

# 1A. Conversion-control patterns to preserve

## A. Intentional self-damage as fuel

A support engine may place small damage on friendly Reserve creatures in exchange for acceleration or another benefit. That damage is not purely a drawback:

- one finisher may gain bonus attack damage while any friendly Reserve is damaged;
- another support creature may move some of that damage onto an opponent;
- the player may deliberately leave 10 damage behind rather than clear all of it because the damaged-board state remains valuable.

This creates meaningful micro-decisions rather than automatic healing.

## B. Self-condition as upside

A card may intentionally apply a condition such as Venomed to one of its controller's own Creatures in exchange for acceleration, movement or another benefit, while an attached Relic or another effect rewards the conditioned creature with extra attack damage.

This must use the same canonical condition state as opponent-applied conditions. There is no separate fake `self_poisoned` flag.

Healthy design requires:

- the self-condition is a real cost/risk;
- the deck has explicit ways to exploit it;
- the condition remains interactable by the opponent;
- clearing the condition can remove the upside where the card text depends on the creature still being conditioned;
- global condition rules are never bypassed by card-name logic.

## C. Asymmetric Realm amplification

A Realm may make a condition more dangerous for only a defined subset of Creatures while sparing another subset.

Example design pattern:

- during the normal condition-damage timing, Venomed deals an additional 20 damage to affected Creatures;
- Creatures matching an explicit element/trait/controller filter are excluded from that extra amount.

The exclusion must be registry-driven, not based on names/artwork.

This creates a powerful control interaction: a player can deliberately keep their own compatible attacker Venomed to activate an attached damage bonus while the same Realm increases Venomed pressure on the opponent.

Realm replacement remains direct counterplay: once the Realm leaves the shared slot, its asymmetric amplifier stops applying to future condition ticks.

## D. Opponent condition as execution key

A heavy finisher may defeat an opposing Vanguard if it is already affected by a Special/Control condition.

This turns minor setup cards — condition Devices, forced-switch Allies, condition attacks — into parts of a lethal sequence. The finisher is powerful because the deck has to **assemble the state first**.

## E. Exact-damage execution

A different finisher may defeat a target only at an exact damage total, e.g. exactly 60 damage.

That makes damage movement and placement precision matter. The player is rewarded for planning counters rather than simply maximizing damage.

## F. Board-wide low-HP cleanup

A separate finisher may defeat every opposing Creature below a remaining-HP threshold.

This creates a two-stage plan:

1. spread or move damage across several opposing Creatures;
2. cash in the distributed damage with one board-state payoff.

This should remain rare and high-cost so Reserve pressure does not invalidate normal combat.

## G. Reward-map manipulation

A normally high-value Creature may give reduced Rewards when defeated under a specific board condition.

This creates deliberate sacrificial attackers and lets a control deck trade tempo without losing the match race immediately.

Reward denial/reduction must remain tightly gated and tested because it changes the fundamental victory clock.

## H. Opponent-progress comeback scaling

A late-game attacker may scale with how many Rewards the opponent has already claimed. This converts an opponent's progress into comeback pressure and gives toolbox decks a real finishing route after spending early turns setting up.

## I. Distributed-resource scaling

A finisher may count resources attached across the whole friendly field rather than only itself. That lets acceleration spread across several Creatures while still contributing to one attacker's damage ceiling.

This is especially interesting when the same acceleration engine also places small self-damage, creating two linked state variables: **resource total + damaged-board state**.

## J. Pivoting as an engine, not just withdrawal

Switching should be able to:

- choose the correct attacker for the board state;
- activate entry conditions;
- convert a self-condition into a bonus;
- protect a damaged finisher;
- bring an execution attacker Vanguard only when its condition is already satisfied.

Free or reduced withdrawal should therefore be strategically meaningful, not just convenience.

## K. Tactical recursion

A once-per-match or tightly limited recursion effect that retrieves condition/setup Devices from discard can make the deck's control package repeatable without creating infinite loops.

This is stronger design than simple raw draw because the player chooses **which tactical answer** to reuse.

## L. Search by role enables one-of toolbox cards

The deck can support many one-of attackers because its search engine finds cards by broad role/class rather than exact name.

Stream Bandit should support similar deckbuilding through generic searches such as:

- up to N Mythic/Standalone Creatures;
- up to N Devices;
- one Evolution + one Essence;
- one Creature matching a trait/withdrawal/element filter.

This lets a 60-card deck contain situational answers without becoming inconsistent.

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
- setting up an exact-damage execution threshold;
- deliberately remaining Venomed because an attached Relic converts the condition into attack power while a compatible Realm exempts that creature from the Realm's extra condition penalty.

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

A second valid line may deliberately use a condition:

1. self-apply Venomed as the cost of acceleration or movement;
2. attach a Relic that gives +40 attack damage while the creature remains Venomed;
3. use an asymmetric Realm that adds extra Venomed damage to opposing non-matching Creatures but exempts the controller's matching element/trait;
4. force or maintain Venomed on the opponent;
5. pivot to a condition-execution finisher.

Every layer must have an answer. The goal is **interaction density**, not permanent denial.

---

# 6. Balance guardrails

1. No one card should wall attacks, block conditions, block placement and act as the main finisher by itself.
2. Broad permanent protection requires multiple practical counter routes in the environment.
3. Exact-damage or condition-based instant defeats require significant setup and must be rare.
4. Reward denial/reduction is especially sensitive and should be tightly limited if introduced.
5. Repeated defeat-trigger draw/recursion must use once-per-turn/source-instance limits where needed.
6. Reserve sniping and direct placement should not routinely invalidate the Vanguard/Reserve structure.
7. Damage moved from a friendly Creature to an opponent is not healing and does not trigger ordinary heal bonuses.
8. Damage placement does not receive Weakness multiplication and is not absorbed by Shield unless a separate protection rule says so.
9. Self-condition bonuses must never erase the genuine downside of carrying that condition unless another explicit card effect does so.
10. Asymmetric Realm condition amplification must use explicit selectors/exclusions and end immediately when that Realm is replaced.
11. Toolbox decks must retain a route to win; pure indefinite stalling is not a desired archetype.
12. AI Test Match must specifically test hard-lock combinations, recursion loops, condition-conversion loops and execution consistency before release.

---

# 7. Design target

Stream Bandit should support players who enjoy winning through **sequencing, disruption, board manipulation, state conversion and clever utility**, not only through the highest attack number.

The ideal control/toolbox deck makes the opponent think:

- which protection layer do I remove first?
- which Creature is the real threat?
- should I clear that condition or does that help my opponent?
- should I replace the Realm now?
- can I stop the damage-transfer setup before the execution turn?
- do I spend resources answering the wall or race the finisher?

That strategic texture is now a deliberate master-plan objective.