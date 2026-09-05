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
- A normal gameplay card may now be kept up to **4 copies**; Mythic remains **1 total** under the current collection/deck rules.
- The current economy uses exactly **Battle Pass Tokens, Trade Tokens and Shop Coins**; old Pack Ticket/Craft Dust planning is obsolete.
- Stream Bandit TCG is now planned as its own standalone product using shared Stream Bandit authentication but not the Stream Bandit shell.
- The old live TCG is a legacy prototype and is not a compatibility target.

## 2. Recovered rules still active for the Set One audit

- Creature evolution uses **Baby → Teen → Adult**.
- **Standalone** is a valid creature stage and may be a legal starting creature.
- Every creature requires **one named Ability** separate from its attacks.
- A Baby Ability should be short and introduce its family idea; Teen develops it; Adult expresses the family's signature identity; Standalone has a clear deck role.
- Only one evolution per creature stack per turn; ordinary evolution cannot occur during that player's first turn or on the same turn the creature entered play.
- Printed creature HP remains within the current **40–390** range.
- Astral's identity is foresight, card selection, prediction, sequencing and rare Timefold access.
- Printed card text is presentation/rules wording. Runtime behaviour will later come from deterministic structured registry metadata.
- All final balance values remain subject to deterministic AI Test Match and human playtesting before release.

## 3. Audit labels

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

## Next bounded audit

**ASTRAL-02 — Moonbit → Comettail → Nebulynx**

Focus: Reward-card memory/foresight, the missing Comettail Ability, hidden-information boundaries and whether the existing Reward Arc / Starfall Path effects create enough value without becoming bookkeeping-heavy.
