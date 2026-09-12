# Stream Bandit TCG — Set One Current-Rules Audit — Volt

**Status:** Design ledger only. No production card registry, starter deck, migration, engine or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

**Authority boundary:** `tcg-set-one-audit.md` remains authoritative for the global Set One audit rules plus Astral, Ember, Gale and Grove. `tcg-set-one-audit-volume-2.md` remains authoritative for Shade and the future Fairy/Underworld reservation. `tcg-set-one-audit-stone.md` remains authoritative for Stone. `tcg-set-one-audit-tide.md` remains authoritative for Tide. This dedicated file is the canonical current-rules design authority for **Volt**.

All global rules from the prior audit volumes remain binding: Baby → Teen → Adult evolution, Standalone legality, one named Ability per creature, printed HP 40–390, Mythic as class/trait rather than a fourth evolution stage, explicit Starbound yes/no decisions, one shared Starbound use per player per match, current copy limits, deterministic structured runtime metadata later, and weakness/resistance deferred until all eight Set One elements can be compared together.

---

# VOLT audit

## Volt registry snapshot

Fresh read-only Supabase inventory confirms Volt follows the locked Set One element template exactly:

- **24 identities**
- **11 Creatures / 4 Essence / 9 Tactics**
- **3 pack-only identities**
- `Live Wire` = **60 cards / 21 identities**

**Locked Volt identity:** speed, Device sequencing, temporary/borrowed Essence acceleration, explosive attack turns, rapid repositioning and **Stunned** as the signature condition.

Volt is intentionally different from Tide. Tide owns the strongest fully-developed late-game current and largest raw Starbound attack package. Volt instead wins tempo: it borrows power, sequences Devices, creates short-lived Essence, attacks before slower decks finish setting up and converts correctly timed electrical bursts into Stunned pressure.

**Pack-only Volt identities:** Copperkite, Pulse Essence and Blackout Pulse.

All Volt identities in this completed pass are explicitly **not Starbound** except Stormcoil — Living Circuit.

### Stunned current-rules role

The current branch already treats Stunned as a strong but temporary control condition:

- a Stunned Vanguard cannot declare an attack;
- a Stunned Vanguard cannot use normal voluntary withdrawal;
- Stunned clears during that Vanguard controller's Aftermath;
- ordinary condition-clearing and legal effect-switching remain available where a card explicitly permits them.

Card Pass 2 must encode Stunned as explicit deterministic condition metadata rather than rely on card-name or printed-English special cases.

---

## VOLT-01 — Staticub → Arcprowler → Stormmane

**Family purpose:** Build the fast relay line. Staticub converts Device sequencing into a small burst, Arcprowler gains a free evolution charge, and Stormmane moves Reserve charge forward to produce an explosive Stunned attack turn.

### Staticub

**Current prototype**

- Stage: Baby
- HP: 60
- Withdrawal: 0
- Ability: **missing**
- Attack: `1 Volt — Static Nip — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **60**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Static Primer:** The first time during your turn you play a Device, Staticub's next attack during that turn deals 10 more damage.
- **Attack — Static Nip:** `1 Volt — 20 damage.`

**Reason:** The smallest Volt creature teaches the element's Device-before-attack sequencing without granting additional cards or permanent resources.

### Arcprowler

**Current prototype**

- Stage: Teen; evolves from Staticub
- HP: 130
- Withdrawal: 1
- **Ability — Charge Relay:** When this creature evolves, you may attach 1 Basic Volt Essence from your hand to it; this does not use your manual attachment.
- Attack 1: `1 Volt — Arc Pounce — 40.`
- Attack 2: `2 Volt — Relay Strike — 60; if you played a Device this turn, +20 damage.`

**Audit:** **KEEP** with attachment-source wording

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **130**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Charge Relay:** When this creature evolves, you may attach 1 Basic Volt Essence from your hand to this creature. This Ability-generated attachment is additional to your normal manual Essence attachment for the turn.
- **Attack — Arc Pounce:** `1 Volt — 40 damage.`
- **Attack — Relay Strike:** `2 Volt — 60 damage. If you played at least 1 Device during this turn, this attack deals 20 more damage.`

### Stormmane

**Current prototype**

- Stage: Adult; evolves from Arcprowler
- HP: 250
- Withdrawal: 1
- **Ability — Live Circuit:** Once during your turn after you play a Device, you may move 1 Volt Essence from a Reserve creature to this creature.
- Attack 1: `2 Volt — Thunder Claw — 80.`
- Attack 2: `3 Volt — Storm Break — 130; if 4 or more Essence are attached to this creature, the target becomes Stunned and discard 1 Essence from this creature.`

**Audit:** **KEEP / TUNE exact overcharge resolution**

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **250**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Live Circuit:** Once during your turn, after you play a Device, you may move 1 attached Volt Essence from one of your friendly Reserve creatures to Stormmane.
- **Attack — Thunder Claw:** `2 Volt — 80 damage.`
- **Attack — Storm Break:** `3 Volt — 130 damage. If Stormmane has at least 4 attached Essence when this attack is legally declared, after damage discard 1 attached Essence from Stormmane. If the opposing Vanguard remains in play, make it Stunned.`

**Power/counterplay:** 130 for three Volt plus Stunned is deliberately explosive, but the Stunned payoff requires the player to overcharge to four attached Essence and discharge one after the hit. Pressureing Reserve batteries or forcing inefficient Essence placement interrupts the line.

**Engine drift note:** The current branch already has direct Stormmane Essence-discard handling. Card Pass 2 must replace the card-ID branch with generic declaration predicates, post-damage attached-Essence selection/discard and condition application.

### Family decision

**VOLT-01 status: DESIGN PASS — READY FOR CARD PASS 2 STRUCTURE, NOT YET REGISTRY-READY.**

---

## VOLT-02 — Tinkit → Coilclank → Dynamozer

**Family purpose:** Build Volt's temporary overcharge engine. Tinkit recycles used tools, Coilclank converts a correctly sequenced Device/evolution turn into temporary power, and Dynamozer deliberately burns a Device card to borrow enough Essence for a major attack.

### Tinkit

**Current prototype**

- Stage: Baby
- HP: 70
- Withdrawal: 1
- Ability: **missing**
- Attack: `1 Volt — Tiny Zap — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **70**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Salvage Spark:** When you play this creature from your hand into an empty Reserve space during your Build phase, you may put up to 1 Device card from your discard pile on the bottom of your deck.
- **Attack — Tiny Zap:** `1 Volt — 20 damage.`

**Reason:** Tinkit supports the Device engine without drawing extra cards immediately or creating permanent Essence acceleration.

### Coilclank

**Current prototype**

- Stage: Teen; evolves from Tinkit
- HP: 150
- Withdrawal: 2
- Ability: **missing**
- Attack 1: `2 Volt — Coil Bash — 50.`
- Attack 2: `2 Volt + 1 any — Charged Tool — 80 if you played a Device this turn.`

**Audit:** **TUNE** Ability plus deterministic attack baseline

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **150**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Charge Capacitor:** When this creature evolves, if you played a Device earlier during this turn, you may attach 1 Basic Volt Essence from your discard pile to Coilclank. Mark that Essence temporary; discard it during your Aftermath. This attachment is additional to your normal manual Essence attachment.
- **Attack — Coil Bash:** `2 Volt — 50 damage.`
- **Attack — Charged Tool:** `2 Volt + 1 any — 60 damage. If you played at least 1 Device during this turn, this attack deals 20 more damage.`

**Reason:** The prototype wording made Charged Tool's non-Device damage ambiguous. The current-rules version has a clear 60 baseline and an earned 80 ceiling.

### Dynamozer

**Current prototype**

- Stage: Adult; evolves from Coilclank
- HP: 280
- Withdrawal: 3
- **Ability — Overcharge Engine:** Once during your turn, you may discard a Device from your hand. If you do, attach 1 Basic Volt Essence from your discard to this creature; discard that Essence during Aftermath.
- Attack 1: `2 Volt — Dynamo Crash — 80.`
- Attack 2: `4 Volt — Gridbreaker — 150; if an Essence is discarded from this creature during this turn, +20 damage.`

**Audit:** **TUNE** unreachable prototype payoff

**Prototype defect:** Overcharge Engine creates its temporary Essence and schedules that Essence to be discarded during Aftermath. The prototype Gridbreaker asks whether an Essence has **already been discarded from Dynamozer during the current turn**, so Dynamozer's own signature Ability does not naturally satisfy its signature attack before the attack is declared. In the Live Wire starter, pack-only Pulse Essence is absent, making the intended bonus especially unreliable.

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **280**
- Withdrawal: **3**
- Starbound: **no**
- **Ability — Overcharge Engine:** Once during your turn, you may discard 1 Device card from your hand. If you do, choose 1 Basic Volt Essence from your discard pile and attach it to Dynamozer. Mark that Essence temporary; discard it during your Aftermath. This attachment is additional to your normal manual Essence attachment.
- **Attack — Dynamo Crash:** `2 Volt — 80 damage.`
- **Attack — Gridbreaker:** `4 Volt — 150 damage. If Dynamozer has at least 1 temporary or borrowed Essence attached when this attack is declared, this attack deals 20 more damage.`

**Power ceiling:** Gridbreaker reaches **170 damage** only on a turn where Dynamozer is actually using temporary/borrowed electrical power. That is a major normal-attack payoff, but it costs four attached Essence and usually a discarded Device or another temporary-charge effect.

### Family decision

**VOLT-02 status: DESIGN PASS — READY FOR CARD PASS 2 STRUCTURE, NOT YET REGISTRY-READY.**

Card Pass 2 needs one generic model for temporary/borrowed attached Essence and controller-Aftermath cleanup so Coilclank, Dynamozer, Quickcharge Cell, Surge Essence and Stormcoil do not each invent separate lifecycle code.

---

## VOLT-03 — Standalone package

**Package purpose:** Give Volt four different starting roles: Vanguard-entry burst, Dazed tempo, temporary-charge bruiser and pack-only Device mobility.

### Boltfang

**Current prototype**

- Stage: Standalone
- HP: 140
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `1 Volt — Quick Bite — 40.`
- Attack 2: `2 Volt — Lightning Hunt — 70.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **140**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Live Hunt:** The first time during your turn Boltfang becomes Vanguard from Reserve, its next attack during that turn deals 20 more damage.
- **Attack — Quick Bite:** `1 Volt — 40 damage.`
- **Attack — Lightning Hunt:** `2 Volt — 70 damage.`

**Reason:** Boltfang becomes the straightforward fast attacker and rewards Volt's effect-switch tools without adding another condition.

### Sparkmoth

**Current prototype**

- Stage: Standalone
- HP: 90
- Withdrawal: 0
- **Ability — Flash Dust:** When this creature becomes Vanguard from Reserve, the opposing Vanguard becomes Dazed.
- Attack: `1 Volt — Spark Wing — 30.`

**Audit:** **TUNE** repeat-trigger fence

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **90**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Flash Dust:** The first time during your turn Sparkmoth becomes Vanguard from Reserve, if the opposing Vanguard's control-condition slot is empty, make that Vanguard Dazed.
- **Attack — Spark Wing:** `1 Volt — 30 damage.`

**Reason:** The once-per-turn fence prevents repeated effect-switch loops from repeatedly reapplying Dazed in a single turn.

### Railhorn

**Current prototype**

- Stage: Standalone
- HP: 190
- Withdrawal: 2
- Ability: **missing**
- Attack 1: `2 Volt — Rail Ram — 60.`
- Attack 2: `3 Volt — Line Surge — 100.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **190**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Power Rail:** The first time during your turn a temporary or borrowed Volt Essence becomes attached to Railhorn, Railhorn's next attack during that turn deals 20 more damage.
- **Attack — Rail Ram:** `2 Volt — 60 damage.`
- **Attack — Line Surge:** `3 Volt — 100 damage.`

**Reason:** Railhorn turns Volt's temporary-resource system into direct pressure without copying the evolution families' Device-specific triggers.

### Copperkite

**Current prototype**

- Stage: Standalone
- HP: 120
- Withdrawal: **missing**
- Pack-only: yes
- Structured Ability/attacks: **missing**
- Legacy `effect_text`: `120 HP. Conductive Wing: after you play a Device, this creature has withdrawal cost 0 that turn. 2 Volt — Copper Arc — 60; if you played a Device this turn, +20.`

**Audit:** **TUNE** structure and withdrawal baseline

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **120**
- Withdrawal: **1** provisional
- Pack-only: **yes**
- Starbound: **no**
- **Ability — Conductive Wing:** After you play your first Device during your turn, Copperkite's withdrawal cost becomes 0 for the rest of that turn.
- **Attack — Copper Arc:** `2 Volt — 60 damage. If you played at least 1 Device during this turn, this attack deals 20 more damage.`

### Standalone package decision

**VOLT-03 status: DESIGN PASS — READY FOR CARD PASS 2 STRUCTURE, NOT YET REGISTRY-READY.**

Weakness/resistance remains pending the cross-element pass for all Volt creatures.

---

## VOLT-04 — Stormcoil — Living Circuit

**Mythic purpose:** Serve as Volt's explicit Starbound apex. Stormcoil turns discard-pile Basic Volt Essence into one-turn borrowed charge and converts that temporary electrical network into a powerful Stunned Starbound attack.

### Stormcoil — Living Circuit

**Current prototype**

- Stage: Mythic
- Trait: Mythic
- HP: 330
- Withdrawal: 2
- Reward value: implicit by Mythic fallback
- **Ability — Living Circuit:** Once during your turn, attach 1 Basic Volt Essence from your discard to one friendly Volt creature. Mark it borrowed; discard it during that creature's Aftermath.
- Attack 1: `2 Volt — Circuit Lash — 80.`
- Attack 2: `4 Volt — Chainstorm — 150; if a borrowed Essence paid this attack, the opposing Vanguard becomes Stunned.`

**Audit:** **TUNE** stage/prestige and explicit Starbound gate

**Current-rules design draft v1**

- Stage: **Standalone**
- Creature stage: **Standalone**
- Recipe/display type: **Creature — Standalone**
- Traits: **Mythic**
- Prestige mechanic: **Starbound**
- HP: **330**
- Withdrawal: **2**
- Reward value: **2**
- **Ability — Living Circuit:** Once during your turn, choose 1 Basic Volt Essence in your discard pile and 1 friendly Volt creature. Attach that Essence to the chosen creature and mark it borrowed. Discard that borrowed Essence during that creature controller's Aftermath. This Ability-generated attachment is additional to the normal manual Essence attachment for the turn.
- **Attack — Circuit Lash:** `2 Volt — 80 damage.`
- **Starbound Power — Chainstorm:** `4 Volt — 160 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. After damage, if Stormcoil had at least 1 borrowed Essence attached when Chainstorm was declared and the opposing Vanguard remains in play, make that Vanguard Stunned.`

### Starbound decision

Stormcoil is explicitly **Mythic + Starbound**. Chainstorm is its single Starbound effect.

- Living Circuit remains an ordinary once-per-turn Ability.
- Circuit Lash remains an ordinary attack.
- Chainstorm consumes the player's one shared Starbound marker immediately on legal declaration.
- Chainstorm reaches **160 damage at four Volt**, below Tide's deliberately larger five-Tide / 180 Marevault apex, but Volt can reach its ceiling faster through temporary charge.
- Borrowed power turns Chainstorm into a Stunned attack, matching Volt's tempo identity rather than Tide's raw late-game supremacy.
- Using Chainstorm prevents that player from using any other Starbound Ability or Starbound attack later in the match; Stormcoil's ordinary Ability and attack remain usable.

### Mythic decision

**VOLT-04 status: DESIGN PASS — READY FOR CARD PASS 2 STRUCTURE, NOT YET REGISTRY-READY.**

Final STRUCTURE needs one generic Starbound gate plus explicit borrowed-Essence state that can be tested at attack declaration and cleaned up during controller Aftermath.

---

## VOLT-05 — Essence package

**Package purpose:** Make Volt's Special Essence cards short-lived electrical tools rather than permanent ramp: Circuit filters a hand after a Device, Surge creates a one-turn attack spike, and pack-only Pulse rewards intentionally discharging attached power.

All four Volt Essence identities are explicitly **not Starbound**.

### Basic Volt Essence

**Audit:** **KEEP**

- Provides **1 Volt Essence** while attached and has no additional card effect.

### Circuit Essence

**Current prototype:** Provides Volt. Once while attached, after you play a Device, you may draw 1 card then discard 1 card.

**Audit:** **KEEP** with card-instance usage marker

**Current-rules design draft v1:** Provides **1 Volt Essence** while attached. **Once while this card instance remains attached**, after you play a Device during your turn, you may draw 1 card. If you draw this way, choose 1 card from your hand and discard it. Mark this Circuit Essence as used so it cannot trigger again unless a future rule explicitly resets the card instance.

### Surge Essence

**Current prototype:** Provides Volt. When attached from hand, receiving Volt creature gets +20 attack damage this turn; discard this Essence during Aftermath.

**Audit:** **KEEP / TUNE lifecycle wording**

**Current-rules design draft v1:** Provides **1 Volt Essence** while attached. When you attach this card from your hand to a friendly Volt creature, that creature's attacks deal 20 more damage for the rest of your current turn. **Discard this Surge Essence during your Aftermath whether the creature is Vanguard or Reserve.**

**Engine drift note:** The current branch only auto-discards Surge Essence from the Vanguard in the relevant Aftermath path. Card Pass 2 must use generic controller-turn temporary-Essence cleanup across all friendly zones.

### Pulse Essence

**Current prototype:** Pack-only; provides Volt; when discarded from a creature by your own effect, draw 1 card, maximum once per turn.

**Audit:** **KEEP** with controller fence

**Current-rules design draft v1:** Provides **1 Volt Essence** while attached. Pack-only: **yes**. The first time during each of your turns a Pulse Essence attached to one of your creatures is discarded by one of your own card effects, draw 1 card. Multiple Pulse Essence do not increase this draw beyond once during that turn.

### Essence package decision

**VOLT-05 status: DESIGN PASS — READY FOR CARD PASS 2 STRUCTURE, NOT YET REGISTRY-READY.**

---

## VOLT-06 — Tactic package

**Package purpose:** Make Volt's Device turns fast and skill-sequenced: find the next tool, temporarily charge a creature, switch attackers, recycle the first Device through the Realm and use Relics to turn Device timing into attack efficiency.

Volt contains **9 Tactics**: 2 Allies, 4 Devices, 2 Relics and 1 Realm. All nine are explicitly **not Starbound**.

### Arc Band

**Current prototype:** Attached Volt creature's first attack each turn costs 1 fewer Volt Essence if you played a Device that turn; minimum attack cost 1.

**Audit:** **KEEP** with exact cost floor

**Current-rules design draft v1:** **Relic — Arc Band:** If you played at least 1 Device during your turn, the first attack declared by the attached Volt creature during that turn requires 1 fewer Volt Essence. Reduce only the Volt portion of the requirement and never reduce the attack's total Essence requirement below 1.

### Blackout Pulse

**Current prototype:** Pack-only Device; opposing Vanguard becomes Silenced until its Aftermath; you cannot play another Device after this resolves this turn.

**Audit:** **TUNE** modifier-slot safety and sequence lock

**Current-rules design draft v1:** **Device — Blackout Pulse:** Pack-only. Choose the opposing Vanguard. If its modifier-condition slot is empty, make it Silenced. If it is already Silenced, leave it Silenced. Do not replace a different modifier condition with Silenced. After Blackout Pulse resolves, **you cannot play another Device for the rest of your current turn**.

**Reason:** Blackout Pulse is a powerful end-of-sequence disruption tool but does not silently erase a different modifier condition and cannot be used early to continue a Device chain afterward.

### Circuit Scanner

**Current prototype:** Look at top 5; put a Volt creature or Device among them into hand; rest bottom any order.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Circuit Scanner:** Look at the top 5 cards of your deck. Choose up to 1 Volt Creature card or Device card among them and put it into your hand. Put the remaining looked-at cards on the bottom of your deck in any order.

### Courier Jett

**Current prototype:** Switch your Vanguard with a Reserve Volt creature. The new Vanguard gets +20 attack damage this turn.

**Audit:** **KEEP** with effect-switch wording

**Current-rules design draft v1:** **Ally — Courier Jett:** Choose 1 friendly Volt creature in Reserve and switch it with your Vanguard. This is an effect switch and does not use your normal voluntary withdrawal. The creature that becomes Vanguard gets +20 attack damage for the rest of your current turn.

### Dynamo Lens

**Current prototype:** Whenever an attached temporary/borrowed Essence is discarded from this creature, draw 1 card, maximum once per turn.

**Audit:** **KEEP** with actual-discard trigger

**Current-rules design draft v1:** **Relic — Dynamo Lens:** The first time during each turn at least 1 temporary or borrowed Essence attached to this creature is actually discarded, draw 1 card.

### Engineer Vexa

**Current prototype:** Search your deck for a Device and a Special Volt Essence, reveal them, hand, shuffle. Current structured groups require exactly 1 of each.

**Audit:** **TUNE** hidden-deck selection

**Current-rules design draft v1:** **Ally — Engineer Vexa:** Search your deck for **up to 1 Device card and up to 1 Special Volt Essence card**. Reveal the chosen cards, put them into your hand, then shuffle your deck. Each category is optional independently.

### Quickcharge Cell

**Current prototype:** Attach 1 Basic Volt Essence from discard to a friendly Volt creature; discard it during that creature's Aftermath.

**Audit:** **KEEP** with legal-resource requirement

**Current-rules design draft v1:** **Device — Quickcharge Cell:** Choose 1 Basic Volt Essence in your discard pile and 1 friendly Volt creature. Attach that Essence to the chosen creature and mark it temporary. Discard that Essence during that creature controller's Aftermath. This is an effect-generated attachment and is additional to the normal manual Essence attachment.

**Legality:** Quickcharge Cell requires both a legal friendly Volt creature and at least 1 Basic Volt Essence in the discard pile when played.

### Static Reset

**Current prototype:** Clear Stunned or Dazed from one friendly creature, then draw 1.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Static Reset:** Choose 1 friendly creature that is Stunned or Dazed. Choose and clear 1 of those conditions from it, then draw 1 card.

### Stormgrid City

**Current prototype:** Realm; first Device each player plays during their turn may be returned to bottom of deck instead of discarded after resolving.

**Audit:** **KEEP** with per-player-turn fence

**Current-rules design draft v1:** **Realm — Stormgrid City:** The first Device each player resolves during their own turn may be put on the bottom of that player's deck instead of being discarded after it finishes resolving. Each player makes this choice for their own first Device independently each turn.

**Power note:** Stormgrid City creates Volt's long-form Device engine but does not replay a Device immediately; the card returns to the bottom of the deck and must be found/drawn again.

### Structure consequence

The Volt Tactic STRUCTURE pass must support or correct:

1. **Arc Band:** conditional attack-cost reduction with typed-Volt reduction and a total-cost floor of 1;
2. **Blackout Pulse:** modifier-slot predicate, Silenced application and a remainder-of-turn Device-play lock;
3. **Circuit Scanner:** top-5 public/private choice grammar already closely represented by the prototype;
4. **Courier Jett:** effect switch plus temporary attack modifier;
5. **Dynamo Lens:** temporary/borrowed Essence discard listener, once per turn;
6. **Engineer Vexa:** two independent `0..1` hidden-deck search groups;
7. **Quickcharge Cell:** discard-zone Basic Volt attachment, temporary lifecycle flag and required-resource legality;
8. **Static Reset:** condition-filtered friendly target plus clear/draw;
9. **Stormgrid City:** first-Device-per-player-own-turn post-resolution destination override.

### Tactic package decision

**VOLT-06 status: DESIGN PASS — READY FOR CARD PASS 2 STRUCTURE, NOT YET REGISTRY-READY.**

---

## VOLT-07 — Live Wire exact 60-card starter audit

**Starter identity:** `Live Wire` remains the Volt starter for **speed, temporary acceleration and Device sequencing**, with **Stunned** as its signature condition and Stormcoil — Living Circuit as its Starbound/Mythic apex.

### Exact current recipe check

Fresh Supabase inventory confirms:

- **60 cards exactly**
- **22 Creatures / 18 Essence / 20 Tactics**
- **21 distinct starter identities**
- **14 legal opening creature copies** after Stormcoil normalization: 6 Babies plus 8 Standalone copies across Boltfang, Sparkmoth, Railhorn and Stormcoil
- Two complete evolution lines at `3 Baby → 2 Teen → 2 Adult`: Staticub → Arcprowler → Stormmane and Tinkit → Coilclank → Dynamozer
- No orphan evolution cards
- Essence remains `14 Basic Volt / 2 Surge / 2 Circuit`
- Tactics remain `3 Circuit Scanner / 3 Quickcharge Cell / 2 Static Reset / 2 Engineer Vexa / 2 Courier Jett / 3 Arc Band / 2 Dynamo Lens / 3 Stormgrid City`
- Pack-only **Copperkite, Pulse Essence and Blackout Pulse** are excluded
- Every starter card is Volt; there is no off-element inclusion
- Normal identities remain within the 4-copy gameplay limit; Stormcoil appears exactly once and satisfies the Mythic one-copy-per-identity rule
- Stormcoil is the current Volt **Starbound** card; no other Volt identity in this completed design pass is designated Starbound

### Stormcoil normalization inside the starter

The prototype recipe still labels Stormcoil as `Creature — Mythic`. During Card Pass 2 STRUCTURE, that becomes **Creature — Standalone** with **Mythic** retained as class/trait, **Starbound** retained as prestige metadata and explicit `reward_value = 2`.

### Starter decision

**VOLT-07 audit: KEEP THE EXACT 60-CARD RECIPE PROVISIONALLY.**

Live Wire already has the intended high-tempo skeleton: 14 legal openers, two complete evolution lines, 18 permanent/temporary resource cards, strong Device consistency, effect switching and enough discard-zone temporary charge to make its explosive turns real without simply granting free permanent Essence.

### Balance-test questions

The following are deliberate Card Pass 2 / deterministic AI Test Match targets, not current defects:

1. whether **3 Circuit Scanner + 2 Engineer Vexa** makes Device/Special-Essence sequencing too consistent;
2. whether **3 Quickcharge Cell + Stormcoil + Arcprowler + Coilclank + Dynamozer** creates too much additional Essence access in a normal match;
3. whether Arc Band at 3 copies combines with temporary Essence to make high-damage attacks available too early;
4. whether Stormmane's conditional **130 + Stunned at three Volt** is an appropriate tempo spike once the four-attached-Essence discharge requirement is enforced;
5. whether Sparkmoth plus Courier Jett can apply Dazed too repeatedly despite the once-per-turn Flash Dust fence;
6. whether Dynamozer's corrected **170 Gridbreaker** is appropriately expensive given the Device-card discard/temporary-charge setup;
7. whether Surge Essence's +20 attack turns are too explosive when stacked with Courier Jett or other turn-scoped attack modifiers;
8. whether Circuit Essence at 2 copies plus Stormgrid City produces too much hand filtering across a long game;
9. whether Stormgrid City recycling Quickcharge Cell or Static Reset gives Volt too much late-game recursion despite returning cards only to deck bottom;
10. whether Dynamo Lens draws too freely from temporary-Essence cleanup that would happen anyway;
11. whether Stunned's combined attack + voluntary-withdrawal lock remains healthy when Live Wire can access both Stormmane and Starbound Stormcoil;
12. whether Stormcoil's **4 Volt / 160 + conditional Stunned** is sufficiently exciting while remaining below Tide's intentionally larger Marevault raw-force apex;
13. whether Volt's overall win rate becomes too front-loaded against slower Stone/Tide/Grove decks before their defensive engines are established;
14. whether fast Gale/Ember matchups give Volt enough counterpressure that Live Wire is not simply the universal best aggressive starter.

These questions belong in deterministic AI Test Match followed by human playtesting rather than speculative recipe-count changes now.

### Volt element completion state

**VOLT CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES REVIEWED, STARTER RECIPE REVIEWED.**

Volt is **not registry-ready yet**. Weakness/resistance remains pending the cross-element review, numeric values remain provisional until deterministic AI/human testing, temporary/borrowed Essence needs one shared lifecycle model, and accepted designs still need deterministic structured metadata. The current `set-one-v0.6.1` Volt registry remains prototype evidence only.

---

# Eight-element audit milestone

With Volt complete, all **eight SB1 elemental packages** have now completed their current-rules design audit:

1. Astral — Second Sky
2. Ember — Ashrush
3. Gale — Skyshift
4. Grove — Wildgrowth
5. Shade — Nightbind
6. Stone — Unbroken
7. Tide — Deep Current
8. Volt — Live Wire

That covers **192 elemental identities**: 24 per element × 8 elements.

Set One contains **193 total identities**, so the remaining global card before the complete Set One registry can be called audited is the non-element-package **Prismatic Founder**, followed by the deliberately deferred cross-element weakness/resistance assignment.

---

## Next bounded pass — Card Pass 2 foundation

**CARD PASS 2 is now the next design/implementation stage.** It is not another uncontrolled creative rewrite. It converts the completed current-rules audit into deterministic, testable game data.

The bounded order is:

1. **Audit/normalize Prismatic Founder** against the same current rules, including explicit Starbound yes/no and its existing Standalone + Mythic class separation.
2. **Cross-element weakness/resistance matrix:** compare all eight SB1 elements and assign weakness/resistance per creature, never by a simplistic fixed element circle.
3. **Freeze the shared deterministic card schema** for Abilities, attacks, Essence, Tactics, conditions, Starbound, temporary/borrowed Essence, Shield, healing, switching, searches and pending choices.
4. **Structure all 193 corrected identities** from the audit ledgers into that schema without parsing printed English at runtime.
5. **Revalidate all eight exact 60-card starters** against the corrected identities, Mythic one-copy-per-identity rule, normal four-copy rule and Essence allowance.
6. **Correct the known engine/schema drift** only after the structured registry is authoritative: obsolete Mythic-stage compatibility, card-ID specials, copy-limit drift, incomplete generic Starbound Ability path, condition lifecycle inconsistencies and pending-choice special cases.
7. **Build deterministic Test Deck Battle / AI Test Match** on the same server-authoritative legal-action APIs and run the eight starter decks against each other with seeded randomness and no reward progression.
8. Use those deterministic results plus human battles to tune numbers while preserving each element's locked identity — especially Tide's intentionally highest late-game ceiling and Volt's intentionally explosive tempo ceiling.

**Card Pass 2 begins only after this Volt audit commit itself passes exact-head CI. No production registry, engine or live deployment is authorized by this ledger milestone.**