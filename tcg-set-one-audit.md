# Stream Bandit TCG — Set One Current-Rules Audit

**Status:** Design ledger only. No production card registry, starter deck, migration or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

## 1. Authority order

Use this order whenever old material conflicts:

1. The current Stream Bandit TCG master plan and Trev's later explicit decisions.
2. Earlier locked design rules that have not been superseded.
3. The existing `set-one-v0.6.1` registry only as prototype/design evidence.

Do **not** revive superseded first-design defaults merely because they remain in an older design document or live prototype. In particular:

- Set One is now **193 cards**, not the earlier 116-card planning target.
- A normal gameplay identity may use up to **4 copies**. A **Mythic gameplay identity may use 1 copy**. The current rules do **not** impose the obsolete global one-Mythic-total deck cap. Essence follows its separate high copy allowance.
- The current economy uses exactly **Battle Pass Tokens, Trade Tokens and Shop Coins**; old Pack Ticket/Craft Dust planning is obsolete.
- Stream Bandit TCG is now planned as its own standalone product using shared Stream Bandit authentication but not the Stream Bandit shell.
- The old live TCG is a legacy prototype and is not a compatibility target.

### Known implementation drift to repair later

The branch migration `20260905105500_tcg_economy_and_copy_limit_alignment.sql` still contains the older global Mythic-total and Legendary-specific deck checks. That source is **not** the final rules authority. Before any production promotion, deck validation must be aligned to the later identity-based copy-limit decision in its own reviewed implementation step.

## 2. Recovered rules still active for the Set One audit

- Creature evolution uses **Baby → Teen → Adult**.
- **Standalone** is a valid creature stage and may be a legal starting creature.
- Every creature requires **one named Ability** separate from its attacks.
- A Baby Ability should be short and introduce the family idea; Teen develops it; Adult expresses the family's signature identity; Standalone has a clear deck role.
- Only one evolution per creature stack per turn; ordinary evolution cannot occur during that player's first turn or on the same turn the creature entered play.
- Printed creature HP remains within the current **40–390** range.
- Astral's identity is foresight, card selection, prediction, sequencing and rare Timefold access.
- Printed card text is presentation/rules wording. Runtime behaviour will later come from deterministic structured registry metadata.
- All final balance values remain subject to deterministic AI Test Match and human playtesting before release.

## 3. Prototype completeness findings

The current 193-card registry is a design source, not a finished rules registry. Read-only inventory checks found:

- **89** active Set One creatures.
- Only **44 / 89** currently have a structured `ability` field.
- **45 / 89** therefore lack the required structured Ability field, although a small subset contain ability-like wording packed into legacy `effect_text`.
- **0 / 89** currently have an explicit weakness field.
- **0 / 89** currently have an explicit resistance field.
- **81 / 89** have explicit withdrawal data.
- **8 / 89** are legacy Standalones whose HP, Ability and attacks were packed into `effect_text` and whose withdrawal value is missing.

Audit consequence: every creature must receive an explicit review for stage/class, HP, named Ability, withdrawal, weakness/resistance state, attacks, reward value and deterministic effect structure. “No weakness” or “no resistance” may be a valid deliberate result; an absent unreviewed field is not.

### Mythic stage/class normalization

All eight current elemental Mythics are stored with `stage = Mythic` and also carry the `Mythic` trait. The Prismatic Founder already demonstrates the cleaner model: creature stage and prestige class are separate concepts. During each Mythic redesign, the audit will normalize the current non-evolving elemental Mythics to an appropriate creature stage (currently expected to be **Standalone**) while retaining **Mythic** as a separate class/trait. Mythic must not become a fourth normal evolution stage.

## 4. Audit labels

- **KEEP** — current design already fits the active rules and elemental identity.
- **TUNE** — core concept survives but a missing rule, wording, number, timing or data field needs correction.
- **REWRITE** — current concept conflicts with the active game or produces unsuitable gameplay.
- **STRUCTURE** — performed only after the design is accepted; encode deterministic engine metadata.

---

# ASTRAL audit

## Astral registry snapshot

The current active SB1 Astral pool contains more cards than the `Second Sky` starter. The starter contains 21 distinct gameplay cards and totals exactly 60 cards. Additional Astral cards exist outside that starter, so the audit is performed across the whole Astral element rather than only the starter list.

### Second Sky current composition

- **22 Creatures**
- **18 Essence**
- **20 Tactics**
- **60 total**

This overall category shape is healthy enough to retain provisionally while individual cards are redesigned.

---

## ASTRAL-01 — Stardot → Orbitail → Cosmarch

**Family purpose:** Teach the core Astral loop cleanly: inspect the future → arrange the future → convert that knowledge into an attack payoff.

### Stardot

**Current prototype**

- Stage: Baby
- HP: 50
- Withdrawal: 0
- Ability: **missing**
- Attack: `1 Astral — Star Ping — 20.`

**Audit:** **TUNE**

**Reason:** The creature identity and simple starter attack are suitable, but the card violates the locked rule that every creature has one named Ability.

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **50**
- Withdrawal: **0**
- **Ability — Star Sense:** Once when you play this creature from your hand into an empty Reserve space during your Build phase, look at the top card of your deck. You may leave it on top or put it on the bottom.
- **Attack — Star Ping:** `1 Astral — 20 damage.`

**Why this fits:** Star Sense is deliberately small. It teaches Astral foresight without drawing extra cards or creating a complex opening advantage, and it gives the family a real identity before evolution.

**Balance flag:** Keep current HP, cost and damage provisionally; validate later in AI Test Match.

### Orbitail

**Current prototype**

- Stage: Teen; evolves from Stardot
- HP: 120
- Withdrawal: 1
- **Ability — Orbit Check:** When this creature evolves, look at the top 2 cards of your deck and return them in either order.
- Attack 1: `1 Astral — Orbit Swipe — 40.`
- Attack 2: `2 Astral — Predicted Hit — 60; if you looked at your deck this turn, +20 damage.`

**Audit:** **KEEP**

**Reason:** This is a strong Teen design. Orbit Check develops Stardot's one-card foresight into ordering two cards, while Predicted Hit rewards the player for sequencing an Astral information effect before attacking.

**Wording normalization for final rules text**

- **Ability — Orbit Check:** When this creature evolves, look at the top 2 cards of your deck and return them in either order.
- **Attack — Orbit Swipe:** `1 Astral — 40 damage.`
- **Attack — Predicted Hit:** `2 Astral — 60 damage. If you looked at one or more cards in your deck through an effect this turn, this attack deals 20 more damage.`

**Balance flag:** Keep current HP, withdrawal, costs and damage provisionally; validate later in AI Test Match.

### Cosmarch

**Current prototype**

- Stage: Adult; evolves from Orbitail
- HP: 240
- Withdrawal: 2
- **Ability — Charted Future:** Once during your turn, look at the top 3 cards of your deck and return them in any order.
- Attack 1: `2 Astral — Constellation Claw — 70.`
- Attack 2: `3 Astral — Known Horizon — 110; if the top card of your deck is Astral after damage, draw it.`

**Audit:** **KEEP**

**Reason:** Cosmarch completes the same mechanic rather than abandoning it for unrelated power. Charted Future lets the player deliberately prepare Known Horizon, creating the intended Astral sequencing challenge.

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **240**
- Withdrawal: **2**
- **Ability — Charted Future:** Once during your turn, look at the top 3 cards of your deck and return them in any order.
- **Attack — Constellation Claw:** `2 Astral — 70 damage.`
- **Attack — Known Horizon:** `3 Astral — 110 damage. After damage, if the top card of your deck is an Astral card, put it into your hand.`

**Rules interpretation:** The conditional top-card check is server-authoritative and does not reveal a non-Astral card to the player. Charted Future provides the intended way for the controller to know and arrange that card beforehand.

**Balance flag:** Keep current HP, withdrawal, costs and damage provisionally; validate later in AI Test Match.

### Family decision

**ASTRAL-01 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Before this family enters a card-data migration:

1. finish the remaining Astral creature/card audit so the element is balanced as a package;
2. define the final structured attack/Ability grammar used by all 193 cards;
3. run deterministic deck simulation and human playtesting;
4. only then write immutable current-rules card definitions.

---

## ASTRAL-02 — Moonbit → Comettail → Nebulynx

**Family purpose:** Teach private Reward-card foresight progressively without requiring the player or client to maintain an awkward manual “recorded Reward position” memory system.

### Moonbit

**Current prototype**

- Stage: Baby
- HP: 60
- Withdrawal: 1
- **Ability — Moon Glimpse:** Once when played from hand, choose one of your face-down Reward positions and secretly look at it, then return it face-down.
- Attack: `1 Astral — Moon Tap — 20.`

**Audit:** **TUNE**

**Reason:** The identity is strong and appropriate for Astral, but the trigger needs the same explicit play-zone/timing language used by the current rules.

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **60**
- Withdrawal: **1**
- **Ability — Moon Glimpse:** When you play this creature from your hand into an empty Reserve space during your Build phase, choose 1 of your face-down Reward Cards. Look at it, then return it face-down to the same Reward position.
- **Attack — Moon Tap:** `1 Astral — 20 damage.`

**Hidden-information rule:** The Reward Card identity is visible only to Moonbit's controller. The opponent may receive the public event that Moon Glimpse resolved, but never the hidden identity.

### Comettail

**Current prototype**

- Stage: Teen; evolves from Moonbit
- HP: 130
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `2 Astral — Comet Swipe — 50.`
- Attack 2: `3 Astral — Reward Arc — 80; if you have looked at a Reward Card this match, +20 damage.`

**Audit:** **TUNE**

**Reason:** The Reward-card attack theme is useful, but the card violates the mandatory named-Ability rule and the old match-long Reward Arc condition becomes nearly automatic after Moonbit. The Teen should develop the family's foresight and reward sequencing in the current turn instead.

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **130**
- Withdrawal: **1**
- **Ability — Comet Survey:** When this creature evolves, choose up to 2 different face-down Reward Cards you own. Look at them, then return each one face-down to the same Reward position.
- **Attack — Comet Swipe:** `2 Astral — 50 damage.`
- **Attack — Reward Arc:** `3 Astral — 80 damage. If you looked at one or more of your Reward Cards through an effect this turn, this attack deals 20 more damage.`

**Why this fits:** Moonbit introduces one private Reward peek. Comettail broadens that information on evolution and makes the attack bonus a sequencing payoff rather than a permanent match-long switch.

### Nebulynx

**Current prototype**

- Stage: Adult; evolves from Comettail
- HP: 260
- Withdrawal: 2
- **Ability — Nebula Memory:** Once during your turn, if you previously looked at one of your Reward Cards, you may reveal that recorded Reward position to yourself again.
- Attack 1: `2 Astral — Nebula Claw — 70.`
- Attack 2: `4 Astral — Starfall Path — 130; after damage, look at the top card of your deck and one of your Reward Cards.`

**Audit:** **TUNE**

**Reason:** The Adult should own reliable Reward foresight, but “previously looked at” and “recorded Reward position” create unnecessary bookkeeping. The server already owns the hidden Reward zone and can safely authorize a fresh private look without preserving a manual memory marker.

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **260**
- Withdrawal: **2**
- **Ability — Nebula Memory:** Once during your turn, choose 1 of your face-down Reward Cards. Look at it, then return it face-down to the same Reward position.
- **Attack — Nebula Claw:** `2 Astral — 70 damage.`
- **Attack — Starfall Path:** `4 Astral — 130 damage. After damage, look at the top card of your deck and 1 of your face-down Reward Cards, then return both cards to their original zones and positions.`

**Hidden-information rule:** Both inspected identities remain private to Nebulynx's controller. No opponent response or public match view may contain those identities.

**Engine note:** Starfall Path will require the generic private pending-choice/look engine because the controller chooses a Reward position after the attack resolves. It must not be implemented as a Nebulynx-specific name check.

### Family decision

**ASTRAL-02 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The family now has a clear progression:

1. **Moonbit:** one Reward peek on entry;
2. **Comettail:** broader Reward survey on evolution plus a same-turn attack payoff;
3. **Nebulynx:** repeatable Adult Reward foresight plus a combined deck/Reward inspection attack.

All HP, withdrawal, attack costs and base damage remain provisional until AI Test Match and human balance testing.

---

## ASTRAL-03 — Standalone package

**Package purpose:** Keep Standalone as a real starting-creature class while giving each Astral Standalone a distinct role that reinforces foresight and sequencing rather than acting as an unevolved filler body.

### Cometmanta

**Current prototype**

- Stage: Standalone
- HP: 180
- Withdrawal: **missing**
- Structured Ability: **missing**
- Legacy `effect_text`: `Passing Orbit: when this creature moves to Reserve, look at the top 2 cards of your deck and return them in either order.`
- Legacy attacks: `2 Astral — Comet Ray — 60; 3 Astral — Falling Star — 100.`

**Audit:** **TUNE**

**Reason:** The movement/foresight identity is good, but the whole card is packed into legacy free text, has no explicit withdrawal value and the movement trigger is broad enough to invite repeated-trigger ambiguity.

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **180**
- Withdrawal: **2** provisional
- **Ability — Passing Orbit:** Once during your turn, when this creature moves from Vanguard to Reserve, look at the top 2 cards of your deck and return them in either order.
- **Attack — Comet Ray:** `2 Astral — 60 damage.`
- **Attack — Falling Star:** `3 Astral — 100 damage.`

**Why this fits:** Cometmanta becomes the Astral movement scout: it rewards a deliberate withdrawal or switch without creating a repeatable loop from every zone movement.

### Orbitortoise

**Current prototype**

- Stage: Standalone
- HP: 170
- Withdrawal: 2
- Ability: **missing**
- Attack 1: `2 Astral — Orbit Bash — 50.`
- Attack 2: `3 Astral — Gravity Shell — 80; gain 20 Shield.`

**Audit:** **TUNE**

**Reason:** Gravity Shell already gives this creature a defensive Astral identity, but the card violates the mandatory named-Ability rule.

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **170**
- Withdrawal: **2**
- **Ability — Forecast Shell:** The first time during your turn you look at one or more cards in your deck through an effect, gain 10 Shield on this creature. This Ability can contribute no more than 20 Shield to this creature at one time.
- **Attack — Orbit Bash:** `2 Astral — 50 damage.`
- **Attack — Gravity Shell:** `3 Astral — 80 damage. After damage, gain 20 Shield on this creature.`

**Why this fits:** Orbitortoise is the Astral stabilizer. It converts successful foresight into modest protection while Gravity Shell remains its larger defensive payoff.

**Engine note:** Final Shield cap/consumption semantics must come from the universal Shield rule, not from Orbitortoise-specific runtime code.

### Prismowl

**Current prototype**

- Stage: Standalone
- HP: 110
- Withdrawal: 1
- **Ability — Wide Eyes:** The first time each turn you look at one or more cards in a hidden zone through an effect, draw 1 card then discard 1 card.
- Attack 1: `1 Astral — Prism Peck — 30.`
- Attack 2: `2 Astral — Insight Dive — 60.`

**Audit:** **KEEP** with wording normalization

**Reason:** Prismowl already has a clear low-HP utility role and rewards Astral's hidden-information play without creating raw unconditional draw advantage.

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **110**
- Withdrawal: **1**
- **Ability — Wide Eyes:** The first time during your turn you look at one or more cards in a hidden zone through an effect, draw 1 card, then discard 1 card.
- **Attack — Prism Peck:** `1 Astral — 30 damage.`
- **Attack — Insight Dive:** `2 Astral — 60 damage.`

**Engine note:** “Hidden zone” must be a defined selector/category in the shared effect grammar, covering only zones the resolving effect legally permits the controller to inspect.

### Starwhale

**Current prototype**

- Stage: Standalone
- HP: 200
- Withdrawal: 3
- Ability: **missing**
- Attack 1: `2 Astral — Gravity Song — 60.`
- Attack 2: `3 Astral — Starwake — 90.`

**Audit:** **TUNE**

**Reason:** The bulky body is useful, but without an Ability it has no special deck role and its high withdrawal is simply a penalty rather than an Astral sequencing decision.

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **200**
- Withdrawal: **3**
- **Ability — Star Current:** Once during your turn, after you look at one or more cards in your deck through an effect, this creature's withdrawal cost is 1 less for the rest of that turn.
- **Attack — Gravity Song:** `2 Astral — 60 damage.`
- **Attack — Starwake:** `3 Astral — 90 damage.`

**Why this fits:** Starwhale remains the heavier Astral Standalone but can be repositioned more efficiently when the player first performs the element's core foresight action.

### Weakness/resistance decision for ASTRAL-03

No Astral Standalone receives a guessed weakness or resistance during this isolated element pass. Those fields remain **explicitly pending cross-element matchup review**. The eventual decision must compare all eight elements together, assign deliberate per-creature values where they improve gameplay, and record an explicit reviewed “none” where no weakness/resistance is appropriate.

### Standalone package decision

**ASTRAL-03 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The four Standalones now have separate reasons to exist:

1. **Cometmanta:** movement + deck-order scouting;
2. **Orbitortoise:** foresight converted into Shield protection;
3. **Prismowl:** hidden-information hand filtering;
4. **Starwhale:** bulky Vanguard/pivot whose mobility improves after foresight.

All new numbers and existing attack values remain provisional until the whole Astral package can be exercised by deterministic AI Test Match and human playtesting.

---

## ASTRAL-04 — Celestyr — Dream Cartographer

**Mythic purpose:** Carry Astral's rare signature mechanic, Timefold, while remaining a legal non-evolving starting creature and obeying the shared one-Starbound-per-player-per-match rule.

### Celestyr — Dream Cartographer

**Current prototype**

- Stage: Mythic
- Trait: Mythic
- HP: 340
- Withdrawal: 2
- Reward value: implied by Mythic runtime fallback, not explicit in the card definition
- **Ability — Dream Cartographer:** Once during your turn, look at the top 4 cards of your deck and return them in any order. You may put exactly one of them on the bottom.
- **Attack — Dream Ray:** `2 Astral — 80; look at the top 2 cards of your deck and draw 1 of them, putting the other on the bottom.`
- **Starbound Power — Second Horizon:** `3 Astral + 2 any — 160; after damage, defeats, Reward resolution and win checks, perform Timefold and take one additional turn. Consumes your one Starbound marker for the match.`

**Audit:** **TUNE**

**Reason:** Celestyr already expresses Astral's signature identity well. The necessary changes are schema/timing corrections rather than a mechanical replacement: Mythic must be a trait rather than a fourth creature stage, reward value should be explicit, and Timefold needs fail-closed timing around match completion and extra-turn chaining.

**Current-rules design draft v1**

- Stage: **Standalone**
- Traits: **Mythic**
- HP: **340**
- Withdrawal: **2**
- Reward value: **2**
- **Ability — Dream Cartographer:** Once during your turn, look at the top 4 cards of your deck and return them in any order. You may put exactly 1 of those cards on the bottom of your deck instead.
- **Attack — Dream Ray:** `2 Astral — 80 damage. After damage, look at the top 2 cards of your deck. Put 1 into your hand and put the other on the bottom of your deck.`
- **Starbound Power — Second Horizon:** `3 Astral + 2 any — 160 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. After damage, defeat resolution, Reward resolution, replacement effects and win checks, if the match is still active, perform Timefold and take 1 additional turn.`

### Starbound / Timefold contract

- Each player has **one Starbound marker per match**, shared across all of that player's cards that can use a Starbound Power.
- A legal Starbound declaration consumes that player's marker immediately; cancelling or avoiding the later Timefold result cannot restore the marker unless a future explicit rule says so.
- Timefold occurs only after damage, defeats, Reward claims/resolution, mandatory replacement processing and win checks complete.
- If those checks have already ended the match, the extra turn does not occur.
- A turn created by Timefold **cannot create another extra turn**. The engine must fail closed against extra-turn chaining even if a future card effect would otherwise attempt it.
- The one-marker rule also means a deck containing multiple different Mythic identities does not gain multiple Starbound uses.

### Runtime compatibility note

The current branch `rewardValue()` logic already recognises the `Mythic` trait when assigning a two-Reward defeat value, so moving Celestyr from `stage = Mythic` to `stage = Standalone` will not remove its two-Reward identity once the card registry is updated. `Standalone` is also already a legal starting stage. The later deterministic engine pass should nevertheless use the explicit `reward_value = 2` card field rather than depend on fallback inference.

### Weakness/resistance decision

As with the other Astral creatures, Celestyr's weakness/resistance remains **pending the cross-element matchup review**. No value is guessed during the isolated Astral pass.

### Mythic decision

**ASTRAL-04 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Celestyr keeps all three defining concepts—Dream Cartographer, Dream Ray and Second Horizon—but now has a clean creature-stage/class separation and an explicit, deterministic Timefold contract.

All HP, attack costs and damage remain provisional until AI Test Match and human balance testing.

---

## Next bounded audit

**ASTRAL-05 — Essence package**

Review Basic Astral Essence, Star Essence, Orbit Essence and pack-only Nova Essence. Preserve the existing foresight identity where sound, normalize “once while attached” into explicit attachment-state usage, and avoid introducing a second energy/resource system outside cards played from hand.
