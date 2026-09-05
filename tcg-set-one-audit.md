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
- **Starbound is an explicit prestige mechanic, not an automatic consequence of Mythic class or visual rarity.** Every Set One card audit must record whether that card is Starbound or not.
- A creature/card designated **Starbound** must print exactly one Starbound effect, which may be a **Starbound Ability** or a **Starbound Power attack**.
- Each player has exactly **one shared Starbound marker per match**. A legal Starbound Ability activation or legal Starbound attack declaration consumes that marker. Once spent, that player cannot use another Starbound Ability or Starbound attack for the rest of that match unless a later explicit rule changes the limit.
- The Starbound marker belongs to the player, not the card. Multiple Starbound cards therefore do not provide multiple uses.
- Ordinary Abilities and ordinary attacks on a Starbound card remain usable normally; only the explicitly labelled Starbound effect consumes the marker.
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
- A full active Set One text scan currently finds only **Celestyr — Dream Cartographer** with explicit Starbound wording in the first-release registry. That does not mean it is the only current-rules Starbound card; each card must now receive an explicit yes/no Starbound audit decision.

Audit consequence: every creature must receive an explicit review for stage/class, HP, named Ability, withdrawal, weakness/resistance state, attacks, reward value, Starbound designation and deterministic effect structure. “No weakness”, “no resistance” and “not Starbound” may each be valid deliberate results; an absent unreviewed field is not.

### Mythic stage/class normalization

All eight current elemental Mythics are stored with `stage = Mythic` and also carry the `Mythic` trait. The Prismatic Founder already demonstrates the cleaner model: creature stage and prestige class are separate concepts. During each Mythic redesign, the audit will normalize the current non-evolving elemental Mythics to an appropriate creature stage (currently expected to be **Standalone**) while retaining **Mythic** as a separate class/trait. Mythic must not become a fourth normal evolution stage.

Mythic and Starbound are also separate concepts. A Mythic may be Starbound only when its current-rules card definition explicitly designates it Starbound. Conversely, any future non-Mythic card may use Starbound only if its card definition explicitly carries that prestige mechanic.

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
- Prestige mechanic: **Starbound**
- HP: **340**
- Withdrawal: **2**
- Reward value: **2**
- **Ability — Dream Cartographer:** Once during your turn, look at the top 4 cards of your deck and return them in any order. You may put exactly 1 of those cards on the bottom of your deck instead.
- **Attack — Dream Ray:** `2 Astral — 80 damage. After damage, look at the top 2 cards of your deck. Put 1 into your hand and put the other on the bottom of your deck.`
- **Starbound Power — Second Horizon:** `3 Astral + 2 any — 160 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. After damage, defeat resolution, Reward resolution, replacement effects and win checks, if the match is still active, perform Timefold and take 1 additional turn.`

### Starbound / Timefold contract

- Celestyr is explicitly **Starbound**.
- Each player has **one Starbound marker per match**, shared across all of that player's Starbound cards.
- A Starbound effect may be printed as an Ability or an attack; both forms use the same shared marker.
- A legal Starbound activation/declaration consumes that player's marker immediately; cancelling or avoiding the later result cannot restore the marker unless a future explicit rule says so.
- Timefold occurs only after damage, defeats, Reward claims/resolution, mandatory replacement processing and win checks complete.
- If those checks have already ended the match, the extra turn does not occur.
- A turn created by Timefold **cannot create another extra turn**. The engine must fail closed against extra-turn chaining even if a future card effect would otherwise attempt it.
- The one-marker rule means a deck containing multiple different Starbound cards does not gain multiple Starbound uses.

### Runtime compatibility note

The current branch `rewardValue()` logic already recognises the `Mythic` trait when assigning a two-Reward defeat value, so moving Celestyr from `stage = Mythic` to `stage = Standalone` will not remove its two-Reward identity once the card registry is updated. `Standalone` is also already a legal starting stage. The later deterministic engine pass should nevertheless use the explicit `reward_value = 2` card field rather than depend on fallback inference.

The current attack path already recognises `Starbound Power —` attacks and consumes the player's shared `starbound_used` marker on legal declaration. Final STRUCTURE must replace printed-English detection with explicit Starbound metadata and must add the same generic marker-consumption path for any future Starbound Ability.

### Weakness/resistance decision

As with the other Astral creatures, Celestyr's weakness/resistance remains **pending the cross-element matchup review**. No value is guessed during the isolated Astral pass.

### Mythic decision

**ASTRAL-04 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Celestyr keeps all three defining concepts—Dream Cartographer, Dream Ray and Second Horizon—but now has a clean creature-stage/class separation, an explicit Starbound designation and a deterministic Timefold contract.

All HP, attack costs and damage remain provisional until AI Test Match and human balance testing.

---

## ASTRAL-05 — Essence package

**Package purpose:** Keep Essence as actual cards played/attached through the normal game flow while giving Astral a compact set of foresight payoffs. No detached energy meter or second resource system is introduced.

### Essence play contract

- A normal manual Essence attachment is played from the player's hand to a friendly creature and is limited by the universal one-manual-Essence-per-turn rule.
- A card effect may move or attach Essence from another legal zone only when that effect explicitly authorizes it; this does not create an external resource system.
- Each attached Essence continues to provide the element printed on that card for attack-cost and other rules checks.
- A “once while attached” effect is tracked on that specific card instance. Once used, it stays used for the remainder of that continuous attachment. If the card legally leaves play and is later attached again, that later attachment is a new attachment lifetime unless a future effect explicitly says otherwise.
- Printed wording is presentation. These triggers and usage markers must later be represented by generic deterministic effect metadata rather than card-name checks.

### Basic Astral Essence

**Current prototype**

- Subtype: Basic
- Effect: `Provides one Astral Essence. Basic Essence has no special text.`

**Audit:** **KEEP**

**Current-rules design draft v1**

- **Basic Astral Essence:** Provides **1 Astral Essence** while attached. It has no additional card effect.

**Reason:** The Basic card is intentionally simple and establishes the normal Astral attack resource without adding bookkeeping.

### Star Essence

**Current prototype**

- Subtype: Special
- Effect: `Provides Astral. When attached from hand, look at the top card of your deck; you may leave it or put it on the bottom.`

**Audit:** **KEEP** with wording normalization

**Current-rules design draft v1**

- Provides **1 Astral Essence** while attached.
- **When you attach this card from your hand to a friendly creature, look at the top card of your deck. You may leave it on top or put it on the bottom.**

**Reason:** This is the cleanest Special Essence introduction for Astral: the normal attachment itself creates a small foresight decision and naturally enables cards that reward looking at the deck.

### Orbit Essence

**Current prototype**

- Subtype: Special
- Effect: `Provides Astral. Once while attached, after you look at your own Reward Card through an effect, heal 20 from this creature.`

**Audit:** **KEEP** with explicit attachment-lifetime wording

**Current-rules design draft v1**

- Provides **1 Astral Essence** while attached.
- **The first time during this attachment that you look at one or more of your face-down Reward Cards through an effect while this creature has damage, heal 20 damage from the attached creature.**

**Reason:** Orbit Essence directly supports the Moonbit → Comettail → Nebulynx Reward-foresight family without creating repeated healing every turn. Requiring existing damage prevents the one-use trigger from being accidentally spent for no effect.

**Hidden-information rule:** Orbit Essence reacts only to the fact that a legal Reward look occurred. It never exposes the Reward Card identity to the opponent.

### Nova Essence

**Current prototype**

- Subtype: Special
- Pack-only: yes
- Effect: `Provides Astral; once while attached, after you reorder the top of your deck, the attached creature gets +20 attack damage that turn.`

**Audit:** **KEEP / TUNE wording**

**Current-rules design draft v1**

- Provides **1 Astral Essence** while attached.
- **The first time during this attachment that you reorder two or more cards on top of your deck through an effect during your turn, the attached creature's next attack that turn deals 20 more damage.**

**Reason:** Nova Essence is a suitable pack-only alternative because it turns Astral sequencing into a temporary offensive payoff without replacing Basic, Star or Orbit Essence. The “next attack that turn” wording makes expiry deterministic and prevents the bonus from leaking into a later turn.

### Engine / structure note

The current branch engine does not contain Astral Essence card-ID special cases. That is desirable. During STRUCTURE, Star, Orbit and Nova should be expressed through generic attachment, hidden-zone-look, deck-reorder, heal and temporary-attack-modifier operations. No Astral-specific runtime branch should be introduced.

### Essence package decision

**ASTRAL-05 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The package now has four distinct jobs:

1. **Basic Astral Essence:** normal resource card;
2. **Star Essence:** attachment-triggered top-card foresight;
3. **Orbit Essence:** one-use Reward-foresight healing;
4. **Nova Essence:** pack-only one-use sequencing-to-damage payoff.

All numeric bonuses/healing remain provisional until deterministic AI Test Match and human balance testing.

---

## ASTRAL-06 — Tactic package

**Package purpose:** Preserve Astral's foresight, sequencing and controlled future-reset identity while removing obsolete Reward-memory bookkeeping and keeping Shade as the stronger hand-disruption element.

### Current Tactic structure

Astral contains **9 Tactics**: 2 Allies, 4 Devices, 2 Relics and 1 Realm. The current prototype has structured `engine_effects` for Archivist Sol, Cartographer Lyra, Future Draw, Gravity Shift and Star Chart. Celestial Observatory, Dreamglass, Orbit Ring and Parallax Window are still unstructured. Because Archivist Sol is being tuned, its existing structured definition must also be replaced; therefore **5 Astral Tactic definitions need structure work later**.

### Archivist Sol

**Current prototype:** Both players discard their remaining hands, then each draws 5 cards.

**Audit:** **TUNE**

**Current-rules design draft v1:**

- **Ally — Archivist Sol:** Each player shuffles all cards from their hand into their own deck without revealing those cards. Then each player draws exactly 5 cards. After both fixed draws resolve, apply the normal deck-depletion check to either player who could not complete the draw.

**Reason:** A total hand discard overlaps Shade's deliberate disruption identity and feeds discard synergies. Shuffling both hands back preserves the symmetrical “reset both futures” idea while making the effect unmistakably Astral.

**Hidden-information rule:** Neither hand is revealed during the reset. Only public hand counts and the fact that Sol resolved are visible to the opponent.

### Cartographer Lyra

**Current prototype:** Look at the top 5 cards of your deck, return them in any order, then draw 1 card.

**Audit:** **KEEP**

**Current-rules design draft v1:** Look at the top 5 cards of your deck and return them in any order. Then draw 1 card.

**Reason:** This is a direct, strong but transparent Astral sequencing Ally and needs no mechanical redesign.

### Future Draw

**Current prototype:** Look at the top 3 cards of your deck. Put one into your hand and the other two on the bottom in either order.

**Audit:** **KEEP**

**Current-rules design draft v1:** Look at the top 3 cards of your deck. Put 1 into your hand, then put the other 2 on the bottom of your deck in either order.

**Reason:** Clean card selection that is fully aligned with Astral's identity.

### Gravity Shift

**Current prototype:** Switch either player's Vanguard with one of that player's Reserve creatures; that player chooses the Reserve creature.

**Audit:** **KEEP** with legality wording

**Current-rules design draft v1:** Choose either player who has at least 1 Reserve creature. That player chooses 1 of their Reserve creatures and switches it with their Vanguard.

**Reason:** The caster chooses whose formation changes, while the affected player retains the creature choice. This creates tactical positioning without stealing hidden control decisions.

### Star Chart

**Current prototype:** Search your deck for an Astral Ally or Astral Relic, reveal it, put it into your hand, then shuffle.

**Audit:** **KEEP**

**Current-rules design draft v1:** Search your deck for 1 Astral Ally or Astral Relic, reveal it, put it into your hand, then shuffle your deck.

**Reason:** A focused Astral consistency Device that supports both one-shot and persistent foresight tools.

### Celestial Observatory

**Current prototype:** Once during each player's turn, after that player looks at the top of their deck through an effect, they may move the top card to the bottom.

**Audit:** **KEEP** with trigger normalization

**Current-rules design draft v1:** **Realm — Celestial Observatory:** Once during each player's turn, after that player looks at one or more cards on top of their own deck through an effect, that player may put the current top card of their deck on the bottom.

**Reason:** This is an appropriately symmetrical Realm: both players can exploit it, but Astral decks are constructed to trigger it more reliably.

**Engine note:** Requires a generic persistent Realm listener with a per-player/per-turn usage marker and an optional top-to-bottom action.

### Dreamglass

**Current prototype:** Once during your turn when you look at hidden information through the attached creature, heal 10 from it.

**Audit:** **KEEP** with trigger normalization

**Current-rules design draft v1:** **Relic — Dreamglass:** Once during your turn, after an Ability or attack of the attached creature lets you look at hidden information, heal 10 damage from that creature.

**Reason:** Dreamglass rewards creatures that personally generate foresight rather than every unrelated Tactic played by the deck.

**Engine note:** Requires a generic attached-source hidden-information listener; it must not inspect card names.

### Orbit Ring

**Current prototype:** After the attached Astral creature attacks, look at the top card of your deck; you may leave it or put it on the bottom.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Relic — Orbit Ring:** After the attached Astral creature finishes an attack, look at the top card of your deck. You may leave it on top or put it on the bottom.

**Reason:** A simple repeatable foresight Relic that naturally prepares the player's next turn.

**Engine note:** Requires a generic after-attached-creature-attack trigger plus the ordinary private top-card look/choice operation.

### Parallax Window

**Current prototype:** Pack-only Device; look at the top 3 cards of your deck and one face-down Reward Card you previously recorded as viewed; return all cards to their original zones, then draw 1 card.

**Audit:** **TUNE**

**Current-rules design draft v1:** **Device — Parallax Window:** Choose 1 of your face-down Reward Cards and look at it. Return it face-down to the same Reward position. Then look at the top 3 cards of your deck and return them in any order. Draw 1 card.

**Reason:** The pack-only Device keeps its premium two-zone foresight identity but removes the obsolete requirement to maintain a previously recorded Reward position. Ordering the top 3 immediately before drawing creates a clear, useful sequencing payoff.

**Hidden-information rule:** The inspected Reward Card and deck cards remain private to the resolving player; the opponent sees only public resolution events/counts.

### Structure consequence

During STRUCTURE, the five Astral Tactic metadata changes are:

1. **Archivist Sol:** replace discard-hand steps with generic shuffle-hand-into-own-deck operations, fixed draws and a post-resolution deck-depletion check;
2. **Celestial Observatory:** add a generic persistent Realm trigger/listener;
3. **Dreamglass:** add a generic attached-source hidden-information trigger;
4. **Orbit Ring:** add a generic after-attached-creature-attack trigger;
5. **Parallax Window:** add generic private Reward look + deck look/order + draw operations.

Cartographer Lyra, Future Draw, Gravity Shift and Star Chart already map cleanly to the current structured choice/search concepts and should not receive card-ID runtime branches.

### Tactic package decision

**ASTRAL-06 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Astral now has a coherent Tactic identity: prediction, selection, formation control, private information, top-deck sequencing and symmetrical future reset. Shade remains the stronger dedicated hand-disruption element.

---

## ASTRAL-07 — Second Sky exact 60-card starter audit

**Starter identity:** `Second Sky` remains the Astral starter for **foresight, sequencing and future information**, with **Timefold** as its signature effect.

### Exact current recipe check

- **60 cards exactly**
- **22 Creatures / 18 Essence / 20 Tactics**
- **14 legal opening creatures** after the current-rules redesign: 6 Babies, 7 normal Standalones and Celestyr as a Standalone creature carrying the Mythic trait.
- Two complete evolution lines use the same stable ratio: `3 Baby → 2 Teen → 2 Adult` for Stardot → Orbitail → Cosmarch and Moonbit → Comettail → Nebulynx.
- No evolution card is orphaned from its required predecessor.
- Essence remains `14 Basic Astral / 2 Star / 2 Orbit`; pack-only Nova Essence is excluded.
- Tactics remain `3 Star Chart / 3 Future Draw / 2 Gravity Shift / 2 Cartographer Lyra / 2 Archivist Sol / 3 Orbit Ring / 2 Dreamglass / 3 Celestial Observatory`; pack-only Parallax Window is excluded.
- Pack-only Cometmanta is also excluded, preserving the set pattern of 21 starter identities plus 3 pack-only identities per element.
- Every starter card is Astral; there is no off-element inclusion.
- Normal starter identities do not exceed the current 4-copy gameplay limit. Celestyr appears exactly once, satisfying the Mythic one-copy-per-identity rule. Basic Essence follows its separate high copy allowance.
- Celestyr is the current Astral Starbound card; no other Astral identity in this completed design pass is designated Starbound.

### Celestyr normalization inside the starter

The stored prototype recipe still labels Celestyr as `Creature — Mythic`. During the later registry/recipe STRUCTURE pass, that display/runtime classification must become **Creature — Standalone** with **Mythic** retained separately as its class/trait and **Starbound** retained as an explicit prestige designation. The physical starter count remains one Celestyr; this is a schema correction, not a deck-composition change.

### Starter decision

**ASTRAL-07 audit: KEEP THE EXACT 60-CARD RECIPE PROVISIONALLY.**

No evidence in the current-rules design pass justifies changing card counts before playtesting. The starter has sufficient legal opening creatures, complete evolution access, a coherent Essence curve, deliberate Tactic density and no illegal pack-only/copy-limit inclusions.

The following are **balance-test questions, not current defects**:

1. opening-hand/mulligan frequency with 14 legal starting creatures;
2. practical access to both evolution lines under real draw sequencing;
3. whether 18 Essence reaches Celestyr's five-Essence Starbound attack at an appropriate pace;
4. whether 2 Archivist Sol and 3 Celestial Observatory remain healthy after their current-rules wording;
5. whether Reward-foresight and top-deck-foresight packages compete for space or create useful choices;
6. whether Timefold is powerful but sufficiently rare and costly under actual match conditions.

These questions belong in deterministic AI Test Match followed by human playtesting. They do not justify speculative starter edits now.

### Astral element completion state

**ASTRAL CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES REVIEWED, STARTER RECIPE REVIEWED.**

Astral is **not registry-ready yet**. Weakness/resistance remains pending the cross-element review; all provisional numbers still require AI/human balance testing; accepted designs must later be encoded in the shared deterministic metadata grammar.

---

# EMBER audit

## Ember registry snapshot

The current active SB1 Ember pool contains **24 identities**: the 21 identities used by `Ashrush` plus 3 pack-only identities. The starter remains exactly **60 cards** with the same broad category skeleton as Second Sky: **22 Creatures / 18 Essence / 20 Tactics**.

**Locked Ember identity:** fast pressure, controlled self-damage and Scorched.

**Pack-only Ember identities:** Cinderburrow, Wildfire Essence and Ashen Gamble.

The Ember audit therefore keeps self-damage, movement and Scorched as separate but interacting subthemes instead of turning every Ember card into a generic damage bonus.

---

## EMBER-01 — Glowcub → Bristleflare → Furnacefang

**Family purpose:** Teach Ember's controlled-risk loop progressively: a damaged creature gains a small payoff → the player may accept self-damage for card value → the Adult turns existing damage into sustained offensive pressure.

### Glowcub

**Current prototype**

- Stage: Baby
- HP: 60
- Withdrawal: 1
- Ability: **missing**
- Attack: `1 Ember — Spark Pounce — 20.`

**Audit:** **TUNE**

**Reason:** Glowcub needs the mandatory named Ability and should introduce Ember's risk/reward identity without forcing a fragile Baby to damage itself on entry.

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **60**
- Withdrawal: **1**
- **Ability — Warm Blood:** While this creature has damage on it, Spark Pounce deals 10 more damage.
- **Attack — Spark Pounce:** `1 Ember — 20 damage.`

**Why this fits:** Glowcub teaches that damage is not always purely a liability for Ember. The player must still get Glowcub damaged through combat or another legal effect before receiving the small offensive payoff.

### Bristleflare

**Current prototype**

- Stage: Teen; evolves from Glowcub
- HP: 140
- Withdrawal: 1
- **Ability — Heat Up:** When this creature evolves, you may place 10 damage on it. If you do, draw 1 card.
- Attack 1: `1 Ember — Ember Claw — 40.`
- Attack 2: `2 Ember — Reckless Rush — 70; place 10 damage on this creature.`

**Audit:** **KEEP** with timing normalization

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **140**
- Withdrawal: **1**
- **Ability — Heat Up:** When this creature evolves, you may place 10 damage on it. If you do, draw 1 card.
- **Attack — Ember Claw:** `1 Ember — 40 damage.`
- **Attack — Reckless Rush:** `2 Ember — 70 damage. After damage, place 10 damage on this creature.`

**Reason:** Bristleflare cleanly escalates the family idea. Heat Up lets the player deliberately trade durability for a card, while Reckless Rush teaches that Ember can continue taking controlled damage to maintain tempo.

### Furnacefang

**Current prototype**

- Stage: Adult; evolves from Bristleflare
- HP: 260
- Withdrawal: 2
- **Ability — Controlled Burn:** Once during your turn, if this creature has damage on it, its next attack this turn deals +20 damage.
- Attack 1: `2 Ember — Furnace Bite — 80.`
- Attack 2: `3 Ember — Meltline Charge — 140; place 20 damage on this creature.`

**Audit:** **KEEP** with deterministic trigger wording

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **260**
- Withdrawal: **2**
- **Ability — Controlled Burn:** The first attack this creature declares during your turn deals 20 more damage if this creature has damage on it when that attack is declared.
- **Attack — Furnace Bite:** `2 Ember — 80 damage.`
- **Attack — Meltline Charge:** `3 Ember — 140 damage. After damage, place 20 damage on this creature.`

**Why this fits:** The Adult converts the family's accumulated risk directly into pressure. The declaration-time condition is deterministic and avoids adding an unnecessary manual Ability button to the card-first battle UI.

### Structure / engine note

The current attack interpreter already supports attack instructions that place fixed damage on the attacking creature, so Reckless Rush and Meltline Charge can later map to the shared self-damage operation. Warm Blood, Heat Up and Controlled Burn still require generic Ability metadata/listeners during STRUCTURE. They must not be implemented as Glowcub/Bristleflare/Furnacefang card-name branches.

### Weakness/resistance decision

Weakness and resistance remain **pending the cross-element matchup review**. No values are guessed during this isolated Ember family pass.

### Family decision

**EMBER-01 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The family now progresses clearly:

1. **Glowcub:** being damaged unlocks a small attack bonus;
2. **Bristleflare:** deliberately accepts damage for cards and tempo;
3. **Furnacefang:** converts existing damage into a repeatable offensive payoff while its strongest attack feeds the damaged state again.

All HP, withdrawal, attack costs, base damage and bonus values remain provisional until the whole Ember package can be compared and then exercised by deterministic AI Test Match and human playtesting.

---

## EMBER-02 — Coalfinch → Sootwing → Cindercrest

**Family purpose:** Teach Ember's movement/Scorched loop separately from the self-damage family: moving into Vanguard creates immediate pressure, attacking can pivot the Teen back to safety, and the Adult turns a Vanguard transition into a Scorched setup for its finishing attack.

### Coalfinch

**Current prototype**

- Stage: Baby
- HP: 50
- Withdrawal: 0
- Ability: **missing**
- Attack: `1 Ember — Cinder Peck — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **50**
- Withdrawal: **0**
- **Ability — Cinder Lift:** The first time during your turn this creature moves from Reserve to Vanguard, its next attack that turn deals 10 more damage.
- **Attack — Cinder Peck:** `1 Ember — 20 damage.`

**Reason:** Coalfinch introduces the family's positioning identity without self-damage or automatic Scorched. The modest bonus rewards deliberately bringing it forward and expires with the turn.

### Sootwing

**Current prototype**

- Stage: Teen; evolves from Coalfinch
- HP: 120
- Withdrawal: 0
- Ability: **missing**
- Attack 1: `1 Ember — Soot Dive — 40.`
- Attack 2: `2 Ember — Flash Wing — 60; you may switch this creature with a Reserve creature after damage.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **120**
- Withdrawal: **0**
- **Ability — Soot Glide:** Once during your turn, after this creature moves from Vanguard to Reserve because of one of its attacks, heal 10 damage from this creature.
- **Attack — Soot Dive:** `1 Ember — 40 damage.`
- **Attack — Flash Wing:** `2 Ember — 60 damage. After damage, you may switch this creature with 1 of your Reserve creatures.`

**Reason:** Flash Wing already supplies the family's core hit-and-pivot action. Soot Glide makes that movement meaningful without becoming a generic free heal every time another effect switches the creature.

### Cindercrest

**Current prototype**

- Stage: Adult; evolves from Sootwing
- HP: 220
- Withdrawal: 1
- **Ability — Ash Mark:** Once during your turn after this creature becomes Vanguard, you may make the opposing Vanguard Scorched.
- Attack 1: `2 Ember — Fireline Sweep — 70.`
- Attack 2: `3 Ember — Cinder Spiral — 120; if the target is Scorched, +30 damage.`

**Audit:** **KEEP** with deterministic trigger wording

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **220**
- Withdrawal: **1**
- **Ability — Ash Mark:** The first time during your turn this creature becomes Vanguard, make the opposing Vanguard Scorched.
- **Attack — Fireline Sweep:** `2 Ember — 70 damage.`
- **Attack — Cinder Spiral:** `3 Ember — 120 damage. If the target is Scorched, this attack deals 30 more damage.`

**Reason:** Cindercrest cleanly completes the line: movement creates the status setup and the expensive attack converts that setup into pressure. The automatic first-transition trigger removes an unnecessary Ability-button decision while preserving counterplay through switching and normal Scorched recovery.

### Movement / Scorched engine note

The current branch already records `became_vanguard_turn` on both voluntary Vanguard/Reserve switching and forced Reserve promotion after a defeated Vanguard, so the later generic Vanguard-entry listener can behave consistently regardless of how Cindercrest arrived. The attack interpreter also already recognises the existing post-attack switch wording and `target is Scorched` damage bonus. During STRUCTURE, Cinder Lift, Soot Glide and Ash Mark must become generic movement/condition listeners rather than card-name branches.

Ordinary conditions are cleared when creatures switch between Vanguard and Reserve in the current lifecycle, while Scorched otherwise resolves during the affected player's Aftermath for 20 damage followed by its normal recovery check. That supplies real counterplay to Ash Mark rather than turning Scorched into a permanent lock.

### Weakness/resistance decision

Weakness and resistance remain **pending the cross-element matchup review**. No values are guessed during this isolated Ember family pass.

### Family decision

**EMBER-02 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The family now progresses clearly:

1. **Coalfinch:** moving forward produces a small one-turn pressure reward;
2. **Sootwing:** attacks and pivots back to Reserve, gaining a small recovery reward for its own attack-driven movement;
3. **Cindercrest:** entering Vanguard creates Scorched pressure and Cinder Spiral converts that status into a finishing bonus.

All HP, withdrawal, attack costs, damage and healing values remain provisional until the complete Ember package and later deterministic AI/human testing are available.

---

## EMBER-03 — Standalone package

**Package purpose:** Keep Ember's Standalones as four different starting-creature roles instead of repeating the evolution families: a light finisher, a self-Scorched bruiser, a risky Essence accelerator and a pack-only recovery/support creature.

### Ashcobra

**Current prototype**

- Stage: Standalone
- HP: 110
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `1 Ember — Coal Fang — 30.`
- Attack 2: `2 Ember — Ashcoil — 60.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **110**
- Withdrawal: **1**
- **Ability — Ash Scent:** The first attack this creature declares during your turn deals 10 more damage if the opposing Vanguard already has damage on it when that attack is declared.
- **Attack — Coal Fang:** `1 Ember — 30 damage.`
- **Attack — Ashcoil:** `2 Ember — 60 damage.`

**Reason:** Ashcobra becomes a low-HP pressure/finisher body that rewards attacking an opponent already softened by combat, Scorched or another legal effect. It does not copy Glowcub's self-damaged payoff and does not create another condition engine.

### Kilnback

**Current prototype**

- Stage: Standalone
- HP: 180
- Withdrawal: 2
- Ability: **missing**
- Attack 1: `2 Ember — Kiln Ram — 70.`
- Attack 2: `3 Ember — Overheat — 110; this creature becomes Scorched.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **180**
- Withdrawal: **2**
- **Ability — Furnace Hide:** While this creature is Scorched, damage dealt to it by opposing attacks is reduced by 10 before Shield and damage are applied.
- **Attack — Kiln Ram:** `2 Ember — 70 damage.`
- **Attack — Overheat:** `3 Ember — 110 damage. After damage, this creature becomes Scorched.`

**Reason:** Kilnback deliberately accepts Scorched as the price of a stronger attack, but Furnace Hide makes that state a bruiser stance rather than pure downside. Scorched still deals its ordinary Aftermath damage and can recover normally, so the Ability mitigates opponent pressure without nullifying Ember's own risk.

**Engine note:** Furnace Hide later needs a generic incoming-attack damage modifier keyed to the creature's own condition state. It must not alter direct condition damage and must not become a Kilnback-specific damage branch.

### Magmagecko

**Current prototype**

- Stage: Standalone
- HP: 90
- Withdrawal: 0
- **Ability — Ember Feed:** Once during your turn, you may attach 1 Basic Ember Essence from your hand to 1 damaged friendly Ember creature. If you do, place 10 damage on that creature. This is additional to your normal manual Essence attachment.
- Attack: `1 Ember — Lava Flick — 30.`

**Audit:** **KEEP** with rules normalization

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **90**
- Withdrawal: **0**
- **Ability — Ember Feed:** Once during your turn, you may attach 1 Basic Ember Essence from your hand to 1 damaged friendly Ember creature. If you do, place 10 damage on that creature. This attachment is additional to your normal manual Essence attachment for the turn.
- **Attack — Lava Flick:** `1 Ember — 30 damage.`

**Reason:** Magmagecko already has a distinct and useful role: it converts controlled damage into accelerated access to attack costs without creating an external energy system. The effect still consumes an actual Basic Ember Essence card from hand and explicitly sits outside the one-manual-Essence-per-turn allowance.

**Engine note:** STRUCTURE needs a generic Ability-driven extra attachment operation with card-family/element/zone/target filters and a post-attachment self/friendly damage instruction. It must not be implemented as a Magmagecko card-ID exception.

### Cinderburrow

**Current prototype**

- Stage: Standalone
- HP: 130
- Withdrawal: **missing**
- Structured Ability/attacks: **missing**
- Pack-only: yes
- Legacy `effect_text`: `130 HP. Ash Tunnel: when played to Reserve, heal 10 from a damaged Ember creature. 2 Ember — Burrow Burst — 60; if your Vanguard is Scorched, +20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **130**
- Withdrawal: **1** provisional
- Pack-only: **yes**
- **Ability — Ash Tunnel:** When you play this creature from your hand into an empty Reserve space during your Build phase, choose 1 damaged friendly Ember creature and heal 10 damage from it.
- **Attack — Burrow Burst:** `2 Ember — 60 damage. If this creature is Scorched, this attack deals 20 more damage.`

**Reason:** Cinderburrow remains the pack-only support option, but the old wording is normalized into real fields. Ash Tunnel gives immediate recovery without replacing the stronger self-damage payoffs elsewhere. Changing Burrow Burst from “if your Vanguard is Scorched” to “if this creature is Scorched” removes a redundant Vanguard-state check when Cinderburrow itself is the attacking Vanguard and makes the risk/payoff local and deterministic.

**Engine note:** Ash Tunnel needs a generic on-play-to-Reserve friendly-target heal choice. Burrow Burst can later use the generic attacking-creature-condition predicate.

### Standalone package decision

**EMBER-03 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The four Standalones now have separate jobs:

1. **Ashcobra:** light finisher against an already-damaged opposing Vanguard;
2. **Kilnback:** self-Scorched bruiser whose defensive Ability softens opposing attack damage while it accepts Scorched's own risk;
3. **Magmagecko:** risky extra Basic Ember Essence acceleration for damaged friendly Ember creatures;
4. **Cinderburrow:** pack-only recovery/support that can later convert its own Scorched state into attack pressure.

Weakness/resistance remains pending cross-element review, and all new numbers remain provisional until deterministic AI Test Match and human playtesting.

---

## EMBER-04 — Pyrohorn — Ash Crown

**Mythic purpose:** Serve as Ember's explicitly Starbound Mythic damaged-team amplifier and late-game pressure finisher without becoming a fourth evolution stage.

### Pyrohorn — Ash Crown

**Current prototype**

- Stage: Mythic
- Creature stage field: Mythic
- Recipe type: Creature — Mythic
- Trait: Mythic
- HP: 340
- Withdrawal: 3
- Reward value: implied by Mythic runtime fallback, not explicit in the card definition
- **Ability — Ash Crown:** Once during your turn, choose 1 damaged friendly Ember creature. Its next attack this turn deals +30 damage; after that attack, place 20 damage on it.
- **Attack — Crownfire:** `2 Ember — 90.`
- **Attack — Ashen Stampede:** `4 Ember — 160; each friendly damaged creature makes this attack +10 damage, maximum +40.`

**Audit:** **TUNE**

**Reason:** Pyrohorn's current gameplay identity is strong and already fits Ember, but the first-release definition omitted the Starbound designation/presentation that the current rule requires. The correction is therefore both schema and prestige normalization: Mythic is a class/trait rather than a creature stage, the two-Reward value is explicit, Pyrohorn is explicitly Starbound, and Ashen Stampede becomes its once-per-match Starbound Power.

**Current-rules design draft v2**

- Stage: **Standalone**
- Creature stage: **Standalone**
- Recipe/display type: **Creature — Standalone**
- Traits: **Mythic**
- Prestige mechanic: **Starbound**
- HP: **340**
- Withdrawal: **3**
- Reward value: **2**
- **Ability — Ash Crown:** Once during your turn, choose 1 damaged friendly Ember creature. That creature's next attack this turn deals 30 more damage. After that attack finishes resolving, place 20 damage on that creature.
- **Attack — Crownfire:** `2 Ember — 90 damage.`
- **Starbound Power — Ashen Stampede:** `4 Ember — 160 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. When this attack is declared, count your friendly damaged creatures, including Pyrohorn if it is damaged. This attack deals 10 more damage for each of them, to a maximum of 40 additional damage.`

### Mythic / Starbound decision

Pyrohorn is explicitly both **Mythic** and **Starbound**. These are separate rule fields: Mythic controls its class/copy/reward identity; Starbound controls its once-per-match prestige effect.

Therefore:

- **Ash Crown** remains an ordinary once-per-turn Ability and does not consume the Starbound marker;
- **Crownfire** remains an ordinary attack and does not consume the Starbound marker;
- **Ashen Stampede** is Pyrohorn's single Starbound Power attack;
- a legal Ashen Stampede declaration consumes the player's one shared Starbound marker immediately;
- if that marker was already spent by any other Starbound Ability or Starbound attack, Ashen Stampede cannot be declared;
- using Pyrohorn's Starbound Power prevents that player from using any other Starbound effect later in the same match, while Pyrohorn's ordinary Ability/attack remain usable normally.

### Runtime compatibility note

The current branch `rewardValue()` helper already recognises the `Mythic` trait and therefore preserves a two-Reward defeat value even after the stage is normalized from `Mythic` to `Standalone`. The later registry STRUCTURE pass should still write **`reward_value = 2` explicitly** rather than depend on fallback inference.

The current attack path already recognises `Starbound Power —` attacks and consumes `starbound_used` on legal declaration, and it already recognises the prototype phrase for “friendly damaged creature” to calculate `+10` per damaged friendly creature up to `+40`. Both are useful implementation evidence only. Final STRUCTURE must encode Starbound and damaged-friendly scaling in deterministic metadata rather than printed-English parsing.

### Ash Crown structure note

Ash Crown needs a generic once-per-turn friendly-creature selector with the following filters and lifecycle:

1. controller = self;
2. element = Ember;
3. damaged = true;
4. apply one next-attack modifier of +30 expiring at end of turn;
5. after the affected creature finishes that attack, place 20 damage on that same creature.

If the chosen creature never attacks before the turn ends, neither the attack bonus nor the post-attack 20 damage carries into a later turn. No Pyrohorn card-ID branch should be introduced.

### Starbound engine note

The final effect grammar needs one shared generic Starbound gate used by both forms:

1. confirm the card/effect carries explicit Starbound metadata;
2. confirm the player's shared Starbound marker is unused;
3. confirm the Ability activation or attack declaration is otherwise legal;
4. consume the marker atomically on the legal activation/declaration;
5. resolve the effect through normal Ability/attack timing;
6. never restore the marker merely because later damage/effect resolution is prevented, unless a future explicit rule says so.

The current attack engine already implements this concept for printed Starbound attacks. A generic Starbound Ability action path remains implementation work for later STRUCTURE.

### Weakness/resistance decision

Weakness and resistance remain **pending the cross-element matchup review**. No value is guessed during this isolated Ember Mythic pass.

### Mythic decision

**EMBER-04 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Pyrohorn keeps its three defining concepts—Ash Crown, Crownfire and Ashen Stampede—while the current-rules model cleanly separates its legal creature stage, Mythic class and Starbound prestige mechanic.

All HP, attack costs, damage and modifier values remain provisional until deterministic AI Test Match and human playtesting.

---

## EMBER-05 — Essence package

**Package purpose:** Preserve Ember's real-card Essence economy while turning damage and Scorched into deliberate risk/reward choices. Ember Essence remains attached card state; it never becomes a detached energy meter.

### Basic Ember Essence

**Current prototype**

- Subtype: Basic
- Effect: `Provides one Ember Essence. Basic Essence has no special text.`

**Audit:** **KEEP**

**Current-rules design draft v1**

- **Basic Ember Essence:** Provides **1 Ember Essence** while attached. It has no additional card effect.

### Hearth Essence

**Current prototype**

- Subtype: Special
- Effect: `Provides Ember. When attached from hand to an Ember creature with damage, heal 20 from it.`

**Audit:** **KEEP** with target/timing normalization

**Current-rules design draft v1**

- Provides **1 Ember Essence** while attached.
- **When you attach this card from your hand to a friendly Ember creature that has damage, heal 20 damage from that creature.**

**Reason:** Hearth supports controlled self-damage without erasing it. The heal occurs only when the attachment is made from hand to an already-damaged friendly Ember creature.

### Smolder Essence

**Current prototype**

- Subtype: Special
- Effect: `Provides Ember. When attached from hand to a damaged Ember creature, its next attack this turn deals +10 damage.`

**Audit:** **KEEP** with deterministic expiry wording

**Current-rules design draft v1**

- Provides **1 Ember Essence** while attached.
- **When you attach this card from your hand to a damaged friendly Ember creature, that creature's next attack that turn deals 10 more damage.**

**Reason:** Smolder rewards playing into Ember's damaged-creature state but cannot bank the bonus into a later turn.

### Wildfire Essence

**Current prototype**

- Subtype: Special
- Pack-only: yes
- Effect: `provides Ember; attached creature's Scorched attacks deal +10 damage, but Scorched placed on it deals +10.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Provides **1 Ember Essence** while attached.
- Pack-only: **yes**.
- **While the attached creature is Scorched, its attacks deal 10 more damage. When Scorched deals its normal Aftermath damage to that creature, that Scorched damage is increased by 10.**

**Rules result:** Under the current universal Scorched rule, the normal 20-damage Aftermath hit becomes **30 damage** while Wildfire is attached. The ordinary Scorched recovery check still follows that damage.

**Reason:** Wildfire becomes the purest Ember risk/reward Essence: it turns a dangerous condition into pressure but makes carrying that condition materially more dangerous. The old phrase “Scorched attacks” is removed because attacks themselves are not Scorched; the creature is.

### Engine / structure note

The current branch still handles Hearth and Smolder through direct `card_id` checks inside the manual Essence attachment action, and those shortcuts do not represent the final generic effect grammar. During STRUCTURE:

- Hearth becomes a generic `ATTACH_FROM_HAND` trigger with `friendly + Ember + damaged` filters and a 20-heal operation;
- Smolder becomes the same trigger shape with a one-use, end-of-turn attack-damage modifier;
- Wildfire becomes a persistent attached-condition listener that modifies outgoing attack damage while Scorched and incoming Scorched-source Aftermath damage;
- no Ember Essence card-ID branch survives in the final engine.

### Essence package decision

**EMBER-05 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The four Essence identities are now distinct:

1. **Basic Ember Essence:** ordinary Ember resource card;
2. **Hearth Essence:** damaged-creature recovery on attachment;
3. **Smolder Essence:** damaged-creature tempo boost on attachment;
4. **Wildfire Essence:** pack-only Scorched power/risk amplifier.

All numeric values remain provisional until deterministic AI Test Match and human playtesting.

---

## EMBER-06 — Tactic package

**Package purpose:** Support Ember's self-damage, mobility and Scorched pressure without replacing the creature package. The nine Tactics should create setup, recovery, movement and risk decisions rather than become unconditional burn cards.

### Current Tactic structure

Ember contains **9 Tactics**: 2 Allies, 4 Devices, 2 Relics and 1 Realm.

The prototype already has structured `engine_effects` for Ember Salve, Flash Forge, Forgekeeper Bram, Kindling Cache and Rhea Ashrunner. Ashen Gamble, Cinder Charm, Heatguard Bracer and Volcanic Caldera are unstructured. Bram and Rhea also require current-rules metadata corrections, so **6 Ember Tactic definitions require STRUCTURE work later**.

### Ashen Gamble

**Current prototype:** Pack-only Device; place 20 damage on one friendly Ember creature, draw 3 cards, then discard 1.

**Audit:** **KEEP** with sequencing normalization

**Current-rules design draft v1:** **Device — Ashen Gamble:** Choose 1 friendly Ember creature. Place 20 damage on it. Then draw 3 cards, then discard 1 card.

**Reason:** This is a strong pack-only expression of Ember's identity: deliberately accept board risk for hand velocity. It is not included in the starter, so it can be slightly more specialised without becoming mandatory onboarding material.

### Cinder Charm

**Current prototype:** Relic; attached Ember creature deals +10 attack damage, or +20 instead if it has at least 200 printed HP.

**Audit:** **KEEP** with wording normalization

**Current-rules design draft v1:** **Relic — Cinder Charm:** The attached creature's attacks deal 10 more damage while that creature is Ember. If that creature has **200 or more printed HP**, its attacks deal 20 more damage instead.

**Reason:** Cinder Charm gives larger Ember bodies a meaningful Relic payoff while still offering a smaller bonus to lighter Ember creatures. Printed HP is checked from the authoritative card definition, not temporary HP effects.

### Ember Salve

**Current prototype:** Heal 30 from one friendly Ember creature; if it is Scorched, clear Scorched.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Ember Salve:** Choose 1 friendly Ember creature. Heal 30 damage from it. If that creature is Scorched, clear Scorched.

**Reason:** Ember needs one clean recovery valve so the self-damage archetype does not become pure attrition against itself.

### Flash Forge

**Current prototype:** Draw 2 cards, then discard 1 card.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Flash Forge:** Draw 2 cards, then discard 1 card.

**Reason:** Simple hand velocity suits a fast-pressure starter and creates discard decisions without becoming Shade-style opponent disruption.

### Forgekeeper Bram

**Current prototype:** Search your deck for an Ember Teen or Adult that evolves from a creature you have in play, reveal it, put it into your hand, then shuffle. The current structured metadata requires exactly one result.

**Audit:** **TUNE**

**Current-rules design draft v1:** **Ally — Forgekeeper Bram:** Search your deck for **up to 1** Ember Teen or Adult creature that evolves from a creature you have in play, reveal it, put it into your hand, then shuffle your deck.

**Reason:** Search effects into a hidden deck should not require the engine to prove a valid target exists before the Ally can resolve. `Up to 1` keeps the intended evolution consistency while allowing a legal zero-result search.

### Heatguard Bracer

**Current prototype:** The first recoil or Scorched damage placed on the attached creature each turn is reduced by 10.

**Audit:** **KEEP** with source normalization

**Current-rules design draft v1:** **Relic — Heatguard Bracer:** The first time during each turn the attached creature would take damage **from one of its own attacks or from Scorched**, reduce that damage by 10.

**Reason:** Heatguard protects specifically against Ember's self-created attack recoil and Scorched risk. It does not reduce arbitrary Ability damage, ordinary opposing attack damage or unrelated direct-damage effects.

### Kindling Cache

**Current prototype:** Search your deck for up to 2 Basic Ember Essence, reveal them, put them into your hand, then shuffle.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Kindling Cache:** Search your deck for up to 2 Basic Ember Essence cards, reveal them, put them into your hand, then shuffle your deck.

**Reason:** A starter with 14 Basic Ember Essence benefits from a clean consistency Device, especially because Magmagecko and several higher-cost attacks care about actual attached Essence cards.

### Rhea Ashrunner

**Current prototype:** Choose a damaged friendly Ember creature, switch it with your Vanguard, then its next attack that turn deals +20. The current structured selector can also choose the Vanguard itself.

**Audit:** **TUNE**

**Current-rules design draft v1:** **Ally — Rhea Ashrunner:** Choose 1 damaged friendly Ember creature **in your Reserve**. Switch it with your Vanguard. The creature that becomes Vanguard has its next attack that turn deal 20 more damage.

**Reason:** Rhea is a movement Ally. Restricting the chosen creature to Reserve makes the switch real and deterministic, avoids a no-op Vanguard target, and intentionally combines with Ember's Vanguard-entry creatures and Volcanic Caldera.

### Volcanic Caldera

**Current prototype:** Once each turn when an Ember creature becomes Vanguard, its next attack that turn deals +10. Non-Ember creatures take 10 damage when they voluntarily withdraw.

**Audit:** **TUNE**

**Current-rules design draft v1:** **Realm — Volcanic Caldera:** Once during each player's turn, the first time an **Ember creature controlled by the active player** becomes Vanguard, that creature's next attack that turn deals 10 more damage. Whenever a non-Ember creature voluntarily withdraws while this Realm is active, after the switch place 10 damage on the creature that moved to Reserve.

**Reason:** The active-player wording prevents an opponent's forced promotion during your attack turn from receiving a bonus that cannot sensibly be used. The second clause makes Caldera symmetrical: both players can use the Realm, but non-Ember movement carries a real environmental cost.

### Structure consequence

During STRUCTURE, the six Ember Tactic metadata changes are:

1. **Ashen Gamble:** generic friendly-Ember select → direct damage → draw → discard sequence;
2. **Cinder Charm:** persistent attached-creature attack modifier using element and printed-HP predicates;
3. **Forgekeeper Bram:** change hidden-deck selection from exactly 1 to `0..1` while retaining reveal/shuffle;
4. **Heatguard Bracer:** persistent first-per-turn damage-source reduction listener;
5. **Rhea Ashrunner:** require a damaged friendly Ember **Reserve** target before switching and applying the temporary bonus;
6. **Volcanic Caldera:** persistent shared Realm listeners for active-player Ember Vanguard entry and non-Ember voluntary withdrawal damage.

Ember Salve, Flash Forge and Kindling Cache already map cleanly to generic current structured operations and should remain card-name agnostic.

### Tactic package decision

**EMBER-06 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The package now has clear jobs:

- **Bram / Kindling Cache:** consistency;
- **Flash Forge / Ashen Gamble:** hand velocity, with Ashen Gamble carrying greater risk;
- **Ember Salve / Heatguard Bracer:** recovery and risk management;
- **Rhea Ashrunner:** damaged-creature mobility and tempo;
- **Cinder Charm:** persistent attack pressure;
- **Volcanic Caldera:** shared battlefield pressure centred on Vanguard movement.

---

## EMBER-07 — Ashrush exact 60-card starter audit

**Starter identity:** `Ashrush` remains the Ember starter for **fast pressure, controlled self-damage and Scorched**, with **Scorched** as its signature condition and Pyrohorn — Ash Crown as its Starbound/Mythic finisher.

### Exact current recipe check

Fresh starter inventory confirms:

- **60 cards exactly**
- **22 Creatures / 18 Essence / 20 Tactics**
- **21 distinct starter identities**
- **14 legal opening creatures** after Pyrohorn normalization: 6 Babies plus 8 Standalone copies across Ashcobra, Magmagecko, Kilnback and Pyrohorn
- Two complete evolution lines at `3 Baby → 2 Teen → 2 Adult`: Glowcub → Bristleflare → Furnacefang and Coalfinch → Sootwing → Cindercrest
- No orphan evolution cards
- Essence remains `14 Basic Ember / 2 Smolder / 2 Hearth`
- Tactics remain `3 Kindling Cache / 3 Flash Forge / 2 Ember Salve / 2 Rhea Ashrunner / 2 Forgekeeper Bram / 3 Cinder Charm / 2 Heatguard Bracer / 3 Volcanic Caldera`
- Pack-only **Cinderburrow, Wildfire Essence and Ashen Gamble** are excluded
- Every starter card is Ember; there is no off-element inclusion
- Normal starter identities stay within the 4-copy gameplay limit; Pyrohorn appears exactly once and therefore satisfies the Mythic one-copy-per-identity rule
- Pyrohorn is the current Ember **Starbound** card; no other Ember identity in this completed design pass is designated Starbound

### Pyrohorn normalization inside the starter

The stored prototype recipe still labels Pyrohorn as `Creature — Mythic`. During the later registry/recipe STRUCTURE pass, that display/runtime classification becomes **Creature — Standalone**, while **Mythic** remains its class/trait and **Starbound** remains its explicit prestige mechanic. The starter still contains exactly one physical Pyrohorn.

### Starter decision

**EMBER-07 audit: KEEP THE EXACT 60-CARD RECIPE PROVISIONALLY.**

The corrected package has enough legal openers, two complete evolution lines, practical Essence access, recovery tools and multiple distinct ways to exploit damaged creatures without requiring the pack-only cards.

The following are balance-test questions, not current defects:

1. whether 14 legal starting-creature copies produce the desired opening consistency;
2. whether the self-damage line survives often enough to reach Furnacefang without becoming trivial to remove;
3. whether Coalfinch/Sootwing/Cindercrest plus Rhea and 3 Volcanic Caldera create too much Vanguard-entry stacking;
4. whether 3 Cinder Charm produces excessive persistent damage on the 200+ HP creatures;
5. whether 2 Heatguard Bracer plus 2 Ember Salve reduce Ember's intended risk too efficiently;
6. whether 18 Essence reaches Pyrohorn's four-Ember Starbound attack at an appropriate pace;
7. whether Pyrohorn's Ash Crown and Starbound Ashen Stampede can combine for unhealthy one-turn burst when several friendly creatures are already damaged.

These questions belong in deterministic AI Test Match followed by human playtesting. They do not justify speculative count changes before the engine can exercise the corrected card definitions.

### Ember element completion state

**EMBER CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES REVIEWED, STARTER RECIPE REVIEWED.**

Ember is **not registry-ready yet**. Weakness/resistance remains pending the later cross-element review, all numeric values remain provisional until AI/human testing, and accepted designs still need to be encoded in the shared deterministic metadata grammar. The current registry remains prototype evidence only until that STRUCTURE pass.

---

# GALE audit

## Gale registry snapshot

The current active SB1 Gale pool contains **24 identities**: the 21 identities used by `Skyshift` plus 3 pack-only identities. Fresh inventory confirms the same Set One element skeleton: **11 Creatures / 4 Essence / 9 Tactics**.

**Locked Gale identity:** switching, low withdrawal, positional attacks and Blinded pressure.

**Pack-only Gale identities:** Zephyrhare, Jetstream Essence and Cyclone Route.

The Gale audit keeps movement as the core engine, but distinguishes entry-to-Vanguard rewards, hit-and-relay positioning, Reserve pressure and Blinded control so the element does not collapse into repeated generic switching.

---

## GALE-01 — Driftlet → Skyweaver → Tempestalon

**Family purpose:** Teach the Gale reward for moving from Reserve into Vanguard: a small attack payoff at Baby, hand filtering at Teen and a larger attack burst plus repositioning at Adult.

### Driftlet

**Current prototype**

- Stage: Baby
- HP: 50
- Withdrawal: 0
- Ability: **missing**
- Attack: `1 Gale — Puff Strike — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **50**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Rising Draft:** The first time during your turn this creature moves from Reserve to Vanguard, its next attack that turn deals 10 more damage.
- **Attack — Puff Strike:** `1 Gale — 20 damage.`

**Reason:** Rising Draft is a small, visible introduction to Gale's Vanguard-entry payoff without adding hand advantage or a second switch by itself.

### Skyweaver

**Current prototype**

- Stage: Teen; evolves from Driftlet
- HP: 120
- Withdrawal: 0
- **Ability — Crosswind:** When this creature becomes Vanguard from Reserve, draw 1 card then discard 1 card.
- Attack 1: `1 Gale — Crosswind Cut — 40.`
- Attack 2: `2 Gale — Lift Away — 50; you may switch this creature with a Reserve creature.`

**Audit:** **TUNE** timing only

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **120**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Crosswind:** The first time during your turn this creature moves from Reserve to Vanguard, draw 1 card, then discard 1 card.
- **Attack — Crosswind Cut:** `1 Gale — 40 damage.`
- **Attack — Lift Away:** `2 Gale — 50 damage. After damage, you may switch this creature with 1 of your Reserve creatures.`

**Reason:** The first-time/your-turn fence prevents Pilot Sera, forced promotion or repeated movement from farming hand filtering while preserving the intended Gale sequencing reward.

### Tempestalon

**Current prototype**

- Stage: Adult; evolves from Skyweaver
- HP: 230
- Withdrawal: 1
- **Ability — Storm Entry:** The first time each turn this creature becomes Vanguard from Reserve, its next attack deals +30 damage.
- Attack 1: `2 Gale — Talon Gust — 70.`
- Attack 2: `3 Gale — Tempest Dive — 110; after damage, you may switch this creature with a Reserve creature.`

**Audit:** **KEEP** with active-turn normalization

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **230**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Storm Entry:** The first time during your turn this creature moves from Reserve to Vanguard, its next attack that turn deals 30 more damage.
- **Attack — Talon Gust:** `2 Gale — 70 damage.`
- **Attack — Tempest Dive:** `3 Gale — 110 damage. After damage, you may switch this creature with 1 of your Reserve creatures.`

**Reason:** Tempestalon becomes the family's mature burst-and-pivot creature while keeping the same movement language as Driftlet and Skyweaver.

### Family decision

**GALE-01 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

STRUCTURE later needs generic `Reserve → Vanguard` listeners, first-use-per-turn markers, temporary attack modifiers, hand draw/discard and post-attack switching. No card-name branch is required.

---

## GALE-02 — Whiffin → Slipwing → Skyrend

**Family purpose:** Develop Gale's other movement direction: help the Vanguard withdraw, relay momentum after an attack-driven switch, then punish opposing Reserve positioning at Adult.

### Whiffin

**Current prototype**

- Stage: Baby
- HP: 60
- Withdrawal: 0
- Ability: **missing**
- Attack: `1 Gale — Breeze Peck — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **60**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Featherdraft:** When you play this creature from your hand into an empty Reserve space during your Build phase, your current Vanguard's next voluntary withdrawal that turn costs 1 less Essence, minimum 0.
- **Attack — Breeze Peck:** `1 Gale — 20 damage.`

**Reason:** Whiffin helps the existing Vanguard move without becoming another Quickstep creature itself. The bonus applies only to the next normal voluntary withdrawal that turn.

### Slipwing

**Current prototype**

- Stage: Teen; evolves from Whiffin
- HP: 110
- Withdrawal: 0
- Ability: **missing**
- Attack 1: `1 Gale — Slip Cut — 30.`
- Attack 2: `2 Gale — Backdraft — 60; switch this creature with a Reserve creature after damage.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **110**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Slipstream Relay:** The first time during your turn this creature moves from Vanguard to Reserve because of one of its attacks, the friendly creature that becomes Vanguard has withdrawal cost 1 less for the rest of that turn, minimum 0.
- **Attack — Slip Cut:** `1 Gale — 30 damage.`
- **Attack — Backdraft:** `2 Gale — 60 damage. After damage, if you have at least 1 Reserve creature, switch this creature with 1 of them.`

**Reason:** Backdraft remains the deliberate hit-and-run attack. Slipstream Relay lets the new Vanguard continue Gale's positional play after the attack rather than giving Slipwing a generic heal borrowed from another element.

### Skyrend

**Current prototype**

- Stage: Adult; evolves from Slipwing
- HP: 210
- Withdrawal: 1
- **Ability — Open Sky Hunter:** This creature can target opposing Reserve creatures with attacks that explicitly allow a target; if it does, attack damage is -20.
- Attack 1: `2 Gale — Razorwind — 70.`
- Attack 2: `3 Gale — Sky Rend — 110; you may target an opposing Reserve creature.`

**Audit:** **KEEP** with deterministic targeting wording

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **210**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Open Sky Hunter:** When one of this creature's attacks explicitly allows an opposing Reserve target and you choose a Reserve creature, that attack deals 20 less damage to that Reserve target.
- **Attack — Razorwind:** `2 Gale — 70 damage.`
- **Attack — Sky Rend:** `3 Gale — 110 damage. You may choose 1 opposing Reserve creature as this attack's target instead of the opposing Vanguard.`

**Reason:** Skyrend is Gale's positional hunter. The Adult does not gain unrestricted bench attacks; only an attack that explicitly grants the alternate target can use Open Sky Hunter.

**Engine drift note:** The current branch has a Skyrend card-ID target exception but does not encode the printed `-20` Reserve-target modifier through a generic attack-target rule. STRUCTURE must replace that special case with explicit alternate-target metadata and the Reserve-target damage modifier.

### Family decision

**GALE-02 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The line now progresses from withdrawal assistance → attack-driven relay movement → controlled Reserve targeting.

---

## GALE-03 — Standalone package

**Package purpose:** Give Gale four distinct starting roles: voluntary-withdrawal tempo, immediate entry switching, Blinded-linked repositioning and pack-only formation support.

### Cloudray

**Current prototype**

- Stage: Standalone
- HP: 130
- Withdrawal: 0
- Ability: **missing**
- Attack 1: `1 Gale — Wing Sweep — 30.`
- Attack 2: `2 Gale — Cloud Crash — 60.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **130**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Cloudwake:** The first time during your turn this creature voluntarily withdraws, the friendly creature that becomes Vanguard has its next attack that turn deal 10 more damage.
- **Attack — Wing Sweep:** `1 Gale — 30 damage.`
- **Attack — Cloud Crash:** `2 Gale — 60 damage.`

**Reason:** Cloudray converts its free withdrawal into a small tempo reward for the incoming Vanguard, making the otherwise blank Standalone a purposeful movement enabler.

### Gustfox

**Current prototype**

- Stage: Standalone
- HP: 100
- Withdrawal: 0
- **Ability — Quickstep:** When played from hand to Reserve, you may switch it with your Vanguard.
- Attack 1: `1 Gale — Gust Bite — 30.`
- Attack 2: `2 Gale — Tailwind Strike — 60; if this creature became Vanguard this turn, +20.`

**Audit:** **KEEP** with play-zone wording

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **100**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Quickstep:** When you play this creature from your hand into an empty Reserve space during your Build phase, you may switch this creature with your Vanguard. This effect switch does not use your normal voluntary withdrawal for the turn.
- **Attack — Gust Bite:** `1 Gale — 30 damage.`
- **Attack — Tailwind Strike:** `2 Gale — 60 damage. If this creature became Vanguard during this turn, this attack deals 20 more damage.`

### Pinionserpent

**Current prototype**

- Stage: Standalone
- HP: 160
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `2 Gale — Coil Gust — 50.`
- Attack 2: `3 Gale — Blindside Spiral — 80; the opposing Vanguard becomes Blinded.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **160**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Wind Coil:** The first time during your turn this creature makes the opposing Vanguard Blinded, this creature's withdrawal cost becomes 0 for the rest of that turn.
- **Attack — Coil Gust:** `2 Gale — 50 damage.`
- **Attack — Blindside Spiral:** `3 Gale — 80 damage. After damage, make the opposing Vanguard Blinded.`

**Reason:** Pinionserpent owns Gale's ordinary Blinded pressure but turns successful status application into repositioning rather than a second damage bonus.

### Zephyrhare

**Current prototype**

- Stage: Standalone
- HP: 100
- Withdrawal: **missing**
- Pack-only: yes
- Structured Ability/attacks: **missing**
- Legacy `effect_text`: `100 HP. Windbound Leap: when played to Reserve, you may move another friendly Reserve Gale creature to Vanguard. 1 Gale — Zephyr Kick — 30; if it became Vanguard this turn, +20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **100**
- Withdrawal: **0** provisional
- Pack-only: **yes**
- Starbound: **no**
- **Ability — Windbound Leap:** When you play this creature from your hand into an empty Reserve space during your Build phase, you may choose another friendly Gale creature in your Reserve and switch that creature with your Vanguard. This effect switch does not use your normal voluntary withdrawal.
- **Attack — Zephyr Kick:** `1 Gale — 30 damage. If this creature became Vanguard during this turn, this attack deals 20 more damage.`

**Reason:** The old “move to Vanguard” wording is normalized into a proper Vanguard/Reserve switch so no creature disappears from the board state. Zephyrhare stays a pack-only formation tool rather than a stronger Gustfox duplicate.

### Standalone package decision

**GALE-03 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Cloudray, Gustfox, Pinionserpent and Zephyrhare now have separate deck roles while all remain recognisably Gale.

---

## GALE-04 — Aeralith — Storm Shepherd

**Mythic purpose:** Act as Gale's explicit Starbound formation master: ordinary turns gain controlled extra movement, while the once-per-match Starbound attack combines pressure, repositioning and Blinded.

### Aeralith — Storm Shepherd

**Current prototype**

- Stage: Mythic
- Creature stage field: Mythic
- Recipe type: Creature — Mythic
- Trait: Mythic
- HP: 310
- Withdrawal: 1
- Reward value: implied by Mythic runtime fallback, not explicit
- **Ability — Storm Shepherd:** Once during your turn, switch your Vanguard with a Reserve Gale creature. This does not use your normal withdrawal.
- Attack 1: `2 Gale — Shepherd Wind — 80.`
- Attack 2: `4 Gale — Eye of the Storm — 140; after damage, switch this creature with a Reserve creature and the opposing Vanguard becomes Blinded.`

**Audit:** **TUNE** schema/prestige/timing

**Current-rules design draft v1**

- Stage: **Standalone**
- Creature stage: **Standalone**
- Recipe/display type: **Creature — Standalone**
- Traits: **Mythic**
- Prestige mechanic: **Starbound**
- HP: **310**
- Withdrawal: **1**
- Reward value: **2**
- **Ability — Storm Shepherd:** Once during your turn, while this creature is in play, you may switch your Vanguard with 1 friendly Gale creature in your Reserve. This is an effect switch and does not use your normal voluntary withdrawal for the turn.
- **Attack — Shepherd Wind:** `2 Gale — 80 damage.`
- **Starbound Power — Eye of the Storm:** `4 Gale — 140 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. After damage, you may switch this creature with 1 friendly Gale creature in your Reserve. Then make the opposing Vanguard Blinded.`

### Starbound decision

Aeralith is explicitly **Mythic + Starbound**. Eye of the Storm is its single Starbound effect.

- Storm Shepherd remains an ordinary once-per-turn Ability.
- Shepherd Wind remains an ordinary attack.
- Eye of the Storm consumes the player's one shared Starbound marker on legal declaration.
- The post-attack switch is optional so the Starbound attack remains legal when no Reserve creature exists.
- Blinded is applied after the optional switch and only if the match remains in a state where the opposing Vanguard still exists after ordinary damage/defeat resolution.

### Runtime note

The current branch already has an Aeralith card-ID switch requirement in the printed-English attack path. Final STRUCTURE must remove that special case and encode Eye of the Storm as generic Starbound metadata plus optional post-attack switch and condition application.

### Mythic decision

**GALE-04 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Weakness/resistance remains pending cross-element review, and all numbers remain provisional for AI/human testing.

---

## GALE-05 — Essence package

**Package purpose:** Let attached Gale Essence reduce movement friction or convert the normal voluntary withdrawal into a card-driven repositioning choice without creating any external energy resource.

### Basic Gale Essence

**Audit:** **KEEP**

- Provides **1 Gale Essence** while attached and has no additional effect.

### Breeze Essence

**Current prototype:** Provides Gale; attached creature has withdrawal cost 1 less, minimum 0.

**Audit:** **KEEP**

**Current-rules design draft v1:** Provides **1 Gale Essence** while attached. The attached creature's withdrawal cost is 1 less, minimum 0.

**Engine drift note:** The current branch implements Breeze through a direct `gale-breeze-essence` card-ID check in `withdrawalCost()`. STRUCTURE must replace that shortcut with a generic attached withdrawal-cost modifier.

### Draft Essence

**Current prototype:** Provides Gale. When attached from hand to a Reserve Gale creature, you may switch that creature with your Vanguard; this uses your normal withdrawal for the turn.

**Audit:** **TUNE** for exact voluntary-withdrawal semantics

**Current-rules design draft v1:** Provides **1 Gale Essence** while attached. **When you attach this card from your hand to a friendly Gale creature in your Reserve, if your normal voluntary withdrawal for the turn is still available and legal, you may immediately perform that withdrawal choosing the attached creature as the incoming Vanguard. Pay the current Vanguard's withdrawal cost normally. If you do, your voluntary withdrawal is used for the turn.**

**Reason:** This preserves the old statement that Draft uses the normal withdrawal instead of silently turning it into a free effect switch. Rooted/Stunned and any other universal withdrawal restrictions therefore still apply to the outgoing Vanguard.

### Jetstream Essence

**Current prototype:** Pack-only; provides Gale; when attached from hand to a Reserve Gale creature, that creature's next withdrawal this turn costs 0.

**Audit:** **TUNE** timing clarity

**Current-rules design draft v1:** Provides **1 Gale Essence** while attached. Pack-only: **yes**. **When you attach this card from your hand to a friendly Gale creature in your Reserve, until the end of that turn, if that creature becomes Vanguard, its next voluntary withdrawal that turn costs 0.**

**Reason:** Jetstream remains the higher-combo pack-only Essence. It does not move the creature itself and the zero-cost window expires if the creature never becomes Vanguard that turn.

### Essence package decision

**GALE-05 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Breeze, Draft and Jetstream will later use generic attachment/withdrawal metadata, never Gale card-ID branches.

---

## GALE-06 — Tactic package

**Package purpose:** Give Gale reliable formation tools, low-withdrawal consistency and a controlled amount of Blinded recovery/pressure while leaving the actual damage plan on creatures.

### Clear Skies

**Current prototype:** Clear Blinded or Dazed from one friendly creature; draw 1 card.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Clear Skies:** Choose 1 friendly creature that is Blinded or Dazed. Clear 1 of those conditions from it, then draw 1 card.

### Cyclone Route

**Current prototype:** Pack-only Device; switch your Vanguard with a Reserve creature, then you may switch the opponent's Vanguard with a Reserve creature chosen by that opponent.

**Audit:** **KEEP / TUNE legality wording**

**Current-rules design draft v1:** **Device — Cyclone Route:** Choose 1 of your Reserve creatures and switch it with your Vanguard. Then, if the opponent has at least 1 Reserve creature, you may have that opponent choose 1 of their Reserve creatures and switch it with their Vanguard. These are effect switches and do not use either player's normal voluntary withdrawal.

### Featherstep

**Current prototype:** Switch your Vanguard with a Reserve creature. The new Vanguard has withdrawal cost 0 this turn.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Featherstep:** Choose 1 of your Reserve creatures and switch it with your Vanguard. The creature that becomes Vanguard has withdrawal cost 0 for the rest of that turn. This effect switch does not use your normal voluntary withdrawal.

### Highwind Spires

**Current prototype:** Realm; the first voluntary withdrawal each player makes during their turn costs 1 fewer Essence, minimum 0.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Realm — Highwind Spires:** The first voluntary withdrawal each player makes during their own turn costs 1 less Essence, minimum 0.

### Pilot Sera

**Current prototype:** Ally; switch up to two pairs of your friendly Vanguard/Reserve positions one at a time; only the final Vanguard may attack this turn.

**Audit:** **KEEP** with effect-switch wording

**Current-rules design draft v1:** **Ally — Pilot Sera:** You may perform up to 2 switches, one at a time. For each switch, choose 1 of your Reserve creatures and switch it with your Vanguard. These switches do not use your normal voluntary withdrawal. Only the creature that is your Vanguard after the final chosen switch may attack during that turn.

**Rules note:** Normal `becomes Vanguard` triggers still see these switches, but each card's first-time-per-turn fences apply normally. Sera therefore enables Gale sequencing without multiplying Skyweaver/Tempestalon triggers indefinitely.

### Pressure Compass

**Current prototype:** Relic; when attached Gale creature moves to Reserve, draw 1 card, maximum once per turn.

**Audit:** **KEEP** with zone wording

**Current-rules design draft v1:** **Relic — Pressure Compass:** The first time during each turn the attached Gale creature moves from Vanguard to Reserve, draw 1 card.

**Reason:** The trigger may occur on either player's turn if an effect legally moves the attached creature, but it can produce only one draw during that turn.

### Scout Zeph

**Current prototype:** Ally; look at top 5 cards, put up to 2 Gale creatures among them into hand, put rest on bottom.

**Audit:** **KEEP** with bottom-order decision

**Current-rules design draft v1:** **Ally — Scout Zeph:** Look at the top 5 cards of your deck. Choose up to 2 Gale Creature cards among them and put those cards into your hand. Put the remaining cards on the bottom of your deck in any order.

**Hidden-information rule:** Because Zeph looks at a known-size private deck slice rather than searching the entire deck, the chosen card identities are not automatically revealed to the opponent unless a later universal rule explicitly requires it.

### Tailwind Map

**Current prototype:** Search your deck for a Gale creature with withdrawal cost 0 or 1, reveal it, put it into hand, shuffle. Current structured selection requires exactly one result.

**Audit:** **TUNE** hidden-deck selection

**Current-rules design draft v1:** **Device — Tailwind Map:** Search your deck for **up to 1** Gale Creature card with printed withdrawal cost 0 or 1, reveal it, put it into your hand, then shuffle your deck.

**Reason:** As with Forgekeeper Bram, a hidden-deck search must allow zero legal results rather than requiring the engine to prove a target exists.

### Wingclip Charm

**Current prototype:** Relic; attached Gale creature deals +20 damage if it became Vanguard this turn.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Relic — Wingclip Charm:** While attached to a Gale creature, that creature's attacks deal 20 more damage during a turn in which that creature became Vanguard.

### Structure consequence

The Gale Tactic STRUCTURE pass must support:

1. optional player/opponent switching in Cyclone Route;
2. persistent Realm withdrawal discount in Highwind Spires;
3. Pressure Compass's once-per-turn movement listener;
4. Tailwind Map's `0..1` hidden-deck search;
5. Wingclip Charm's `became_vanguard_turn` static attack modifier.

Clear Skies, Featherstep, Pilot Sera and Scout Zeph already map closely to generic operations but must remain card-name agnostic.

### Tactic package decision

**GALE-06 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## GALE-07 — Skyshift exact 60-card starter audit

**Starter identity:** `Skyshift` remains the Gale starter for **switching, low withdrawal and positional attacks**, with **Blinded** as its signature condition and Aeralith — Storm Shepherd as its Starbound/Mythic formation finisher.

### Exact current recipe check

Fresh starter inventory confirms:

- **60 cards exactly**
- **22 Creatures / 18 Essence / 20 Tactics**
- **21 distinct starter identities**
- **14 legal opening creature copies** after Aeralith normalization: 6 Babies plus 8 Standalone copies across Cloudray, Gustfox, Pinionserpent and Aeralith
- Two complete evolution lines at `3 Baby → 2 Teen → 2 Adult`: Driftlet → Skyweaver → Tempestalon and Whiffin → Slipwing → Skyrend
- No orphan evolution cards
- Essence remains `14 Basic Gale / 2 Breeze / 2 Draft`
- Tactics remain `3 Tailwind Map / 3 Featherstep / 2 Clear Skies / 2 Pilot Sera / 2 Scout Zeph / 3 Wingclip Charm / 2 Pressure Compass / 3 Highwind Spires`
- Pack-only **Zephyrhare, Jetstream Essence and Cyclone Route** are excluded
- Every starter card is Gale; there is no off-element inclusion
- Normal identities remain within the 4-copy gameplay limit; Aeralith appears exactly once and satisfies the Mythic one-copy-per-identity rule
- Aeralith is the current Gale **Starbound** card; no other Gale identity in this completed design pass is designated Starbound

### Aeralith normalization inside the starter

The prototype recipe still labels Aeralith as `Creature — Mythic`. During STRUCTURE, that becomes **Creature — Standalone** with **Mythic** retained as class/trait, **Starbound** retained as prestige metadata and explicit `reward_value = 2`.

### Starter decision

**GALE-07 audit: KEEP THE EXACT 60-CARD RECIPE PROVISIONALLY.**

The composition already gives Gale sufficient opening creatures, two complete evolution families, heavy access to low-withdrawal bodies and a Tactic package that exercises the intended movement identity without requiring the pack-only cards.

The following are balance-test questions, not current defects:

1. whether Driftlet/Skyweaver/Tempestalon plus Wingclip Charm creates excessive Vanguard-entry burst;
2. whether Pilot Sera, Featherstep, Draft Essence and Aeralith together create too many free or near-free formation changes;
3. whether repeated 0-cost withdrawal bodies make positional counterplay too difficult;
4. whether Pressure Compass draws too efficiently when Gale is switching on both players' turns;
5. whether Skyrend's Reserve-target access remains fair at the explicit 20-damage penalty;
6. whether Blinded's current random-target effect is too swingy when Aeralith and Pinionserpent can apply it reliably;
7. whether 18 Essence reaches Aeralith's four-Gale Starbound attack at an appropriate pace;
8. whether 3 Highwind Spires makes the starter's already-low withdrawal values effectively free too often.

These questions belong in deterministic AI Test Match followed by human playtesting rather than speculative deck-count changes now.

### Gale element completion state

**GALE CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES REVIEWED, STARTER RECIPE REVIEWED.**

Gale is **not registry-ready yet**. Weakness/resistance remains pending the cross-element review, all numeric values remain provisional until AI/human testing, and accepted designs still need deterministic structured metadata. The current first-release registry remains prototype evidence only.

---

# GROVE audit

## Grove registry snapshot

Fresh read-only inventory confirms Grove follows the locked Set One element template exactly:

- **24 identities**
- **11 Creatures / 4 Essence / 9 Tactics**
- **3 pack-only identities**
- `Wildgrowth` = **60 cards / 21 identities**

**Locked Grove identity:** evolution, Reserve development, growing pressure, healing, Venomed and Rooted control.

**Pack-only Grove identities:** Bloomhare, Symbiote Essence and Canopy Call.

All Grove cards in this completed pass are explicitly **not Starbound** except Elderbloom — First Canopy.

---

## GROVE-01 — Budburrow → Briarback → Verdantusk

**Family purpose:** Reward building a healthy Reserve: Baby becomes easier to reposition once the board grows, Teen converts Reserve development into healing, and Adult protects the developed board and rewards a full canopy.

### Budburrow

**Current prototype**

- Stage: Baby
- HP: 80
- Withdrawal: 1
- Ability: **missing**
- Attack: `1 Grove — Sprout Jab — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **80**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Root Nest:** While you have at least 2 friendly creatures in your Reserve, this creature's withdrawal cost is 0.
- **Attack — Sprout Jab:** `1 Grove — 20 damage.`

**Reason:** Root Nest introduces Reserve-count gameplay without giving a Baby free cards or extra healing. It becomes easier to reposition only after the player has actually developed the board.

### Briarback

**Current prototype**

- Stage: Teen; evolves from Budburrow
- HP: 160
- Withdrawal: 2
- **Ability — Growing Wall:** When this creature evolves while you have at least 2 Reserve creatures, heal 30 from it.
- Attack 1: `2 Grove — Briar Ram — 50.`
- Attack 2: `3 Grove — Thorn Rush — 80; if you have 3 or more Reserve creatures, +20 damage.`

**Audit:** **KEEP** with wording normalization

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **160**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Growing Wall:** When this creature evolves, if you have at least 2 friendly creatures in your Reserve, heal 30 damage from this creature.
- **Attack — Briar Ram:** `2 Grove — 50 damage.`
- **Attack — Thorn Rush:** `3 Grove — 80 damage. If you have at least 3 friendly creatures in your Reserve, this attack deals 20 more damage.`

**Engine drift note:** The current branch implements Growing Wall through a direct Briarback card-ID branch in the evolution action. STRUCTURE must replace it with a generic on-evolution Reserve-count predicate plus heal operation.

### Verdantusk

**Current prototype**

- Stage: Adult; evolves from Briarback
- HP: 300
- Withdrawal: 3
- **Ability — Full Canopy:** Your other Grove creatures in Reserve take 10 less attack damage.
- Attack 1: `2 Grove — Rooted Charge — 80.`
- Attack 2: `4 Grove — Canopy Crash — 140; if your Reserve is full, heal 20 from each friendly Reserve creature.`

**Audit:** **KEEP** with explicit friendly wording

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **300**
- Withdrawal: **3**
- Starbound: **no**
- **Ability — Full Canopy:** Damage dealt by opposing attacks to your **other friendly Grove creatures in Reserve** is reduced by 10 before Shield and damage are applied.
- **Attack — Rooted Charge:** `2 Grove — 80 damage.`
- **Attack — Canopy Crash:** `4 Grove — 140 damage. After damage, if all 4 of your Reserve spaces are occupied, heal 20 damage from each friendly Reserve creature.`

**Reason:** Verdantusk becomes the completed-board guardian. The protection applies only to opposing attack damage and never to condition/direct/recoil damage.

### Family decision

**GROVE-01 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The family now progresses cleanly from Reserve-enabled mobility → Reserve-enabled healing/pressure → full-board protection and recovery.

---

## GROVE-02 — Sporeling → Capscout → Myceliarch

**Family purpose:** Combine Grove's Venomed pressure with Device-fed growth and recycling: Baby benefits from Device play, Teen develops the discard-recovery loop, and Adult converts Devices into team healing while recycling them through an attack.

### Sporeling

**Current prototype**

- Stage: Baby
- HP: 50
- Withdrawal: 1
- Ability: **missing**
- Attack: `1 Grove — Puff Tap — 10; the opposing Vanguard becomes Venomed.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **50**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Spore Feed:** The first time during your turn you play a Device, heal 10 damage from this creature.
- **Attack — Puff Tap:** `1 Grove — 10 damage. After damage, make the opposing Vanguard Venomed.`

**Reason:** Spore Feed gives the Baby a simple taste of the family's Device-growth loop while Puff Tap establishes the Venomed half of the identity.

### Capscout

**Current prototype**

- Stage: Teen; evolves from Sporeling
- HP: 120
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `1 Grove — Spore Shot — 30.`
- Attack 2: `2 Grove — Fungal Burst — 50; if the target is Venomed, +20 damage.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **120**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Fungal Forage:** When this creature evolves, you may choose up to 1 Device in your discard and put it on the bottom of your deck.
- **Attack — Spore Shot:** `1 Grove — 30 damage.`
- **Attack — Fungal Burst:** `2 Grove — 50 damage. If the target is Venomed, this attack deals 20 more damage.`

**Reason:** The Teen now develops both halves of the family: Device recovery through Fungal Forage and a direct Venomed payoff through Fungal Burst.

### Myceliarch

**Current prototype**

- Stage: Adult; evolves from Capscout
- HP: 240
- Withdrawal: 2
- **Ability — Networked Growth:** Once during your turn, if you played a Device this turn, heal 20 from one friendly Grove creature.
- Attack 1: `2 Grove — Colony Pulse — 70.`
- Attack 2: `3 Grove — Mycelial Bloom — 110; put 1 Device from your discard on the bottom of your deck.`

**Audit:** **KEEP / TUNE optional discard target**

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **240**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Networked Growth:** Once during your turn, if you played a Device during that turn, choose 1 damaged friendly Grove creature and heal 20 damage from it.
- **Attack — Colony Pulse:** `2 Grove — 70 damage.`
- **Attack — Mycelial Bloom:** `3 Grove — 110 damage. After damage, you may choose up to 1 Device in your discard and put it on the bottom of your deck.`

**Reason:** Making the Device recovery optional prevents the attack from depending on a discard target being available. Myceliarch remains the family's mature engine: play Device → heal team → attack → recycle Device.

**Engine drift note:** The current attack engine explicitly fails Myceliarch into a card-ID `pending_choice_engine` path. STRUCTURE must replace that with a generic optional public-discard selection and deck-bottom move.

### Family decision

**GROVE-02 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## GROVE-03 — Standalone package

**Package purpose:** Give Grove four distinct starting roles: condition-pressure attacker, Rooted bruiser, condition cleanser and pack-only Reserve healing support.

### Thornmantis

**Current prototype**

- Stage: Standalone
- HP: 120
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `1 Grove — Vine Lash — 30.`
- Attack 2: `2 Grove — Thorn Cut — 60.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **120**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Briar Instinct:** The first attack this creature declares during your turn deals 10 more damage if the opposing Vanguard is Venomed or Rooted when that attack is declared.
- **Attack — Vine Lash:** `1 Grove — 30 damage.`
- **Attack — Thorn Cut:** `2 Grove — 60 damage.`

**Reason:** Thornmantis becomes a lightweight payoff creature for Grove's two signature pressure conditions without creating another status source itself.

### Mossram

**Current prototype**

- Stage: Standalone
- HP: 180
- Withdrawal: 2
- Ability: **missing**
- Attack 1: `2 Grove — Moss Bash — 60.`
- Attack 2: `3 Grove — Ramroot — 90; the opposing Vanguard becomes Rooted.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **180**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Moss Guard:** While the opposing Vanguard is Rooted, damage dealt to this creature by that Vanguard's attacks is reduced by 10 before Shield and damage are applied.
- **Attack — Moss Bash:** `2 Grove — 60 damage.`
- **Attack — Ramroot:** `3 Grove — 90 damage. After damage, make the opposing Vanguard Rooted.`

**Reason:** Mossram becomes a Rooted bruiser rather than another pure damage card. Rooting the opponent can establish its defensive stance for the following exchange.

### Vinecoil

**Current prototype**

- Stage: Standalone
- HP: 140
- Withdrawal: 1
- **Ability — Binding Growth:** When this creature is played from hand to Reserve, you may clear Rooted or Crushed from your Vanguard.
- Attack: `2 Grove — Coil Snap — 50.`

**Audit:** **KEEP** with play-zone wording

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **140**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Binding Growth:** When you play this creature from your hand into an empty Reserve space during your Build phase, you may clear Rooted or Crushed from your Vanguard.
- **Attack — Coil Snap:** `2 Grove — 50 damage.`

### Bloomhare

**Current prototype**

- Stage: Standalone
- HP: 110
- Withdrawal: **missing**
- Pack-only: yes
- Structured Ability/attacks: **missing**
- Legacy `effect_text`: `110 HP. Spring Growth: when played to Reserve while you have another Grove creature, heal 20 from your Vanguard. 1 Grove — Petal Kick — 30.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **110**
- Withdrawal: **1** provisional
- Pack-only: **yes**
- Starbound: **no**
- **Ability — Spring Growth:** When you play this creature from your hand into an empty Reserve space during your Build phase, if you control another friendly Grove creature and your Vanguard has damage, heal 20 damage from your Vanguard.
- **Attack — Petal Kick:** `1 Grove — 30 damage.`

**Reason:** Bloomhare stays the pack-only Reserve-development healer but is normalized into proper fields and a clear legal trigger.

### Standalone package decision

**GROVE-03 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Weakness/resistance remains pending the cross-element review for every Grove creature.

---

## GROVE-04 — Elderbloom — First Canopy

**Mythic purpose:** Serve as Grove's explicit Starbound Mythic culmination: ordinary turns reward a developed Reserve with distributed healing, while the once-per-match Starbound attack turns a full canopy into Venomed + Rooted battlefield control.

### Elderbloom — First Canopy

**Current prototype**

- Stage: Mythic
- Trait: Mythic
- HP: 360
- Withdrawal: 4
- Reward value: implicit by Mythic fallback
- **Ability — First Canopy:** Once during your turn, if you have 3 or more Reserve creatures, heal 20 from each of up to 2 friendly creatures.
- Attack 1: `3 Grove — Ancient Bough — 100.`
- Attack 2: `5 Grove — Forest Awakening — 160; if your Reserve is full, the opposing Vanguard becomes Venomed and Rooted is applied only if its control slot is empty.`

**Audit:** **TUNE** schema/prestige/timing

**Current-rules design draft v1**

- Stage: **Standalone**
- Creature stage: **Standalone**
- Recipe/display type: **Creature — Standalone**
- Traits: **Mythic**
- Prestige mechanic: **Starbound**
- HP: **360**
- Withdrawal: **4**
- Reward value: **2**
- **Ability — First Canopy:** Once during your turn, if you have at least 3 friendly creatures in your Reserve, choose up to 2 damaged friendly creatures and heal 20 damage from each chosen creature.
- **Attack — Ancient Bough:** `3 Grove — 100 damage.`
- **Starbound Power — Forest Awakening:** `5 Grove — 160 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. After damage, if all 4 of your Reserve spaces are occupied and the attack target remains in play, make that creature Venomed. If its control-condition slot is empty, also make it Rooted.`

### Starbound decision

Elderbloom is explicitly **Mythic + Starbound** and Forest Awakening is its single Starbound effect.

- First Canopy remains an ordinary once-per-turn Ability.
- Ancient Bough remains an ordinary attack.
- Forest Awakening consumes the player's one shared Starbound marker on legal declaration.
- The attack remains legal without a full Reserve; the full-canopy state controls only the post-damage condition package.
- Rooted is applied only if the target's control-condition slot is empty; Venomed uses its separate condition track.

### Runtime note

The current branch can already parse ordinary Venomed/Rooted application phrases, but final STRUCTURE must encode Forest Awakening's Starbound gate, full-Reserve predicate and ordered condition application as metadata rather than printed-English parsing.

### Mythic decision

**GROVE-04 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## GROVE-05 — Essence package

**Package purpose:** Support Grove's healing, evolution and board-development identity while keeping Essence as actual attached cards.

All four Grove Essence identities are explicitly **not Starbound**.

### Basic Grove Essence

**Audit:** **KEEP**

- Provides **1 Grove Essence** while attached and has no additional card effect.

### Bloom Essence

**Current prototype:** Provides Grove; when attached from hand to an evolved Grove creature, heal 20 from it.

**Audit:** **KEEP** with damaged/friendly wording

**Current-rules design draft v1:** Provides **1 Grove Essence** while attached. **When you attach this card from your hand to a damaged friendly evolved Grove creature, heal 20 damage from that creature.**

**Engine drift note:** The current branch implements Bloom through a direct `grove-bloom-essence` card-ID branch in the manual Essence action. STRUCTURE must replace it with generic attachment metadata plus evolved/Grove/damaged predicates.

### Root Essence

**Current prototype:** Provides Grove; attached creature has withdrawal cost 1 less, minimum 0.

**Audit:** **KEEP**

**Current-rules design draft v1:** Provides **1 Grove Essence** while attached. The attached creature's withdrawal cost is 1 less, minimum 0.

**Engine drift note:** The current branch implements Root through a direct `grove-root-essence` card-ID check in `withdrawalCost()`. Final STRUCTURE must use a generic static withdrawal-cost modifier.

### Symbiote Essence

**Current prototype:** Pack-only; provides Grove; while attached to an evolved Grove creature, the first healing it receives each turn is +10.

**Audit:** **TUNE** to remove duplication with Sapstone Charm and strengthen the symbiotic identity

**Current-rules design draft v1:** Provides **1 Grove Essence** while attached. Pack-only: **yes**. **The first time during each turn an Ability or attack of the attached evolved Grove creature heals one or more other friendly creatures, heal 10 damage from the attached creature.**

**Reason:** The prototype duplicated Sapstone Charm almost exactly. The corrected pack-only Essence now rewards evolved Grove creatures that actively heal teammates, creating reciprocal healing rather than another generic incoming-heal amplifier.

### Essence package decision

**GROVE-05 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## GROVE-06 — Tactic package

**Package purpose:** Supply evolution consistency, Device recycling, condition recovery, healing amplification and full-board sustain without replacing the creature package.

All nine Grove Tactics are explicitly **not Starbound**.

### Canopy Call

**Current prototype:** Pack-only Ally; search your deck for up to 2 different Grove evolution cards that evolve from creatures you have in play; reveal them, hand, shuffle.

**Audit:** **KEEP** with deterministic search wording

**Current-rules design draft v1:** **Ally — Canopy Call:** Search your deck for up to 2 Grove Teen or Adult Creature cards with different card identities, each of which evolves from a creature you currently have in play. Reveal the chosen cards, put them into your hand, then shuffle your deck.

### Elderwood Glade

**Current prototype:** Realm; a player with at least 3 Reserve creatures heals 10 from their Vanguard during their Aftermath.

**Audit:** **TUNE** timing clarity

**Current-rules design draft v1:** **Realm — Elderwood Glade:** At the start of each player's Aftermath, if that player has at least 3 friendly creatures in Reserve and their Vanguard has damage, heal 10 damage from that Vanguard. Then continue normal Aftermath condition damage and recovery.

**Reason:** Start-of-Aftermath timing is deterministic and prevents the Realm from ambiguously healing after a creature has already been defeated by condition damage.

### Forager Nia

**Current prototype:** Put up to 2 Devices from your discard on the bottom of your deck, then draw 1 card.

**Audit:** **KEEP** with bottom-order wording

**Current-rules design draft v1:** **Ally — Forager Nia:** Choose up to 2 Device cards in your discard and put them on the bottom of your deck in any order. Then draw 1 card.

### Rootway Map

**Current prototype:** Search your deck for a Grove Adult or Grove Realm, reveal it, hand, shuffle. Current structured search uses exactly 1.

**Audit:** **TUNE** hidden-deck selection

**Current-rules design draft v1:** **Device — Rootway Map:** Search your deck for **up to 1** Grove Adult Creature card or Grove Realm card, reveal it, put it into your hand, then shuffle your deck.

### Sapstone Charm

**Current prototype:** Whenever the attached Grove creature is healed by a card effect, heal 10 additional damage, maximum once per turn.

**Audit:** **KEEP** with deterministic first-trigger wording

**Current-rules design draft v1:** **Relic — Sapstone Charm:** The first time during each turn the attached Grove creature would be healed by a card effect, increase that healing amount by 10.

**Reason:** Sapstone remains the general incoming-healing amplifier, while pack-only Symbiote now has a distinct reciprocal-healing role.

### Seed Satchel

**Current prototype:** Search your deck for up to 2 Grove Baby creatures, reveal them, hand, shuffle.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Seed Satchel:** Search your deck for up to 2 Grove Baby Creature cards, reveal them, put them into your hand, then shuffle your deck.

### Spore Remedy

**Current prototype:** Clear one condition from a friendly Grove creature and heal 10 from it.

**Audit:** **TUNE** target legality

**Current-rules design draft v1:** **Device — Spore Remedy:** Choose 1 friendly Grove creature that has at least 1 condition. Choose and clear 1 condition from that creature, then heal 10 damage from it.

**Reason:** The current structured selector can choose a condition-free creature before asking the player to clear a condition. The corrected target filter keeps the action legal and meaningful.

### Thorn Crown

**Current prototype:** When the attached Grove creature receives attack damage while Vanguard, place 10 damage on the attacking creature.

**Audit:** **KEEP** with damage-event timing

**Current-rules design draft v1:** **Relic — Thorn Crown:** After the attached Grove creature, while Vanguard, receives 1 or more damage from an opposing attack, place 10 damage on the attacking creature. Resolve resulting defeats through the normal post-attack defeat flow.

### Warden Fern

**Current prototype:** If you have at least 2 Reserve creatures, draw 3 cards, then put 1 card from your hand on the bottom of your deck.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Ally — Warden Fern:** You may play this Ally only if you have at least 2 friendly creatures in Reserve. Draw 3 cards, then choose 1 card from your hand and put it on the bottom of your deck.

### Structure consequence

The Grove Tactic STRUCTURE pass must support:

1. **Canopy Call:** public `0..2` hidden-deck search with different-identity and evolves-from-in-play predicates;
2. **Elderwood Glade:** persistent start-of-Aftermath Realm listener;
3. **Rootway Map:** change hidden-deck selection to `0..1`;
4. **Sapstone Charm:** first-per-turn healing-amount modifier;
5. **Spore Remedy:** creature target predicate `has_any_condition` before condition choice;
6. **Thorn Crown:** post-opposing-attack-damage reflection listener.

Forager Nia, Seed Satchel and Warden Fern already map closely to generic structured operations.

### Tactic package decision

**GROVE-06 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## GROVE-07 — Wildgrowth exact 60-card starter audit

**Starter identity:** `Wildgrowth` remains the Grove starter for **evolution, Reserve development and growing pressure**, with **Venomed** as its signature condition and Elderbloom — First Canopy as its Starbound/Mythic culmination.

### Exact current recipe check

Fresh Supabase inventory confirms:

- **60 cards exactly**
- **22 Creatures / 18 Essence / 20 Tactics**
- **21 distinct starter identities**
- **14 legal opening creature copies** after Elderbloom normalization: 6 Babies plus 8 Standalone copies across Thornmantis, Mossram, Vinecoil and Elderbloom
- Two complete evolution lines at `3 Baby → 2 Teen → 2 Adult`: Budburrow → Briarback → Verdantusk and Sporeling → Capscout → Myceliarch
- No orphan evolution cards
- Essence remains `14 Basic Grove / 2 Root / 2 Bloom`
- Tactics remain `3 Seed Satchel / 3 Spore Remedy / 2 Rootway Map / 2 Warden Fern / 2 Forager Nia / 3 Thorn Crown / 2 Sapstone Charm / 3 Elderwood Glade`
- Pack-only **Bloomhare, Symbiote Essence and Canopy Call** are excluded
- Every starter card is Grove; there is no off-element inclusion
- Normal identities remain within the 4-copy gameplay limit; Elderbloom appears exactly once and satisfies the Mythic one-copy-per-identity rule
- Elderbloom is the current Grove **Starbound** card; no other Grove identity in this completed design pass is designated Starbound

### Elderbloom normalization inside the starter

The prototype recipe still labels Elderbloom as `Creature — Mythic`. During STRUCTURE, that becomes **Creature — Standalone** with **Mythic** retained as class/trait, **Starbound** retained as prestige metadata and explicit `reward_value = 2`.

### Starter decision

**GROVE-07 audit: KEEP THE EXACT 60-CARD RECIPE PROVISIONALLY.**

The recipe already gives Grove enough legal opening creatures, both complete evolution families, strong Reserve-development support and a coherent mixture of healing, conditions and Device recursion without relying on its pack-only identities.

The following are balance-test questions, not current defects:

1. whether 3 Seed Satchel plus 2 Rootway Map makes both evolution lines too consistent;
2. whether Briarback, Bloom Essence, Spore Remedy, Sapstone Charm, Elderwood Glade and Elderbloom stack into excessive sustain;
3. whether Verdantusk's Reserve damage reduction makes a full Grove board too difficult to dismantle through positional attacks;
4. whether Sporeling/Capscout plus Elderbloom produce too much Venomed pressure for an onboarding deck;
5. whether Mossram's Rooted pressure plus Vinecoil's self-cleansing makes Grove disproportionately strong in condition matchups;
6. whether Thorn Crown's reflected damage is healthy at 3 starter copies;
7. whether Myceliarch plus Forager Nia creates an overly recursive Device loop;
8. whether 18 Essence reaches Elderbloom's five-Grove Starbound Power at the intended pace.

These questions belong in deterministic AI Test Match followed by human playtesting rather than speculative starter-count changes now.

### Grove element completion state

**GROVE CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES REVIEWED, STARTER RECIPE REVIEWED.**

Grove is **not registry-ready yet**. Weakness/resistance remains pending cross-element review, all numeric values remain provisional until deterministic AI/human testing, and the accepted designs still need deterministic structured metadata. The current `set-one-v0.6.1` Grove registry remains prototype evidence only.

---

## Next bounded audit

**SHADE — complete element audit**

Audit all 24 active Shade identities as one coherent element package, including both evolution families, Standalones, Umbravale, all four Shade Essence cards, all nine Shade Tactics and the exact 60-card `Nightbind` starter. Apply the locked Starbound yes/no rule, normalize Mythic stage/class separation, keep weakness/resistance pending cross-element review and only STRUCTURE after the whole Shade design pass is accepted.