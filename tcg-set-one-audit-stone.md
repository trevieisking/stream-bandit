# Stream Bandit TCG — Set One Current-Rules Audit — Stone

**Status:** Design ledger only. No production card registry, starter deck, migration, engine or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

**Authority boundary:** `tcg-set-one-audit.md` remains authoritative for the global Set One audit rules plus Astral, Ember, Gale and Grove. `tcg-set-one-audit-volume-2.md` remains authoritative for Shade and the future Fairy/Underworld reservation. This dedicated file is the canonical current-rules design authority for **Stone** and supersedes only the earlier provisional sentence that Stone would be appended into Volume 2. No completed Shade definition is changed or duplicated here.

All global rules from Volume 1 remain binding: Baby → Teen → Adult evolution, Standalone legality, one named Ability per creature, printed HP 40–390, Mythic as class/trait rather than a fourth evolution stage, explicit Starbound yes/no decisions, one shared Starbound use per player per match, current copy limits, deterministic structured runtime metadata later, and weakness/resistance deferred until all eight elements can be compared together.

---

# STONE audit

## Stone registry snapshot

Fresh read-only Supabase inventory confirms Stone follows the locked Set One element template exactly:

- **24 identities**
- **11 Creatures / 4 Essence / 9 Tactics**
- **3 pack-only identities**
- `Unbroken` = **60 cards / 21 identities**

**Locked Stone identity:** defence, heavy bodies, Shield, Crushed, Relic armour and deliberate positioning.

**Pack-only Stone identities:** Obsidianox, Granite Essence and Reversal Seal.

All Stone identities in this completed pass are explicitly **not Starbound** except Crowncrag — Mountain Warden.

Stone deliberately keeps generally higher withdrawal costs than the faster elements. That is a strategic weakness, not a defect: the element's Essence, Allies and board tools let a skilled player manage that weight rather than removing it from the design.

---

## STONE-01 — Gravibble → Cragroller → Monolithorn

**Family purpose:** Teach Stone's defensive battlefield progression: build Shield on the Baby, evolve into immediate Shield plus Crushed pressure, then protect the developed Reserve while the Adult applies Stone's signature condition.

### Gravibble

**Current prototype**

- Stage: Baby
- HP: 90
- Withdrawal: 2
- Ability: **missing**
- Attack: `1 Stone — Pebble Bump — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **90**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Pebble Guard:** The first time during your turn you attach a Stone Essence from your hand to this creature, gain 10 Shield on this creature.
- **Attack — Pebble Bump:** `1 Stone — 20 damage.`

**Reason:** Gravibble introduces Shield through the normal Essence play loop without creating a separate resource system. The first-time fence prevents future extra-attachment effects from multiplying the Shield trigger uncontrollably.

### Cragroller

**Current prototype**

- Stage: Teen; evolves from Gravibble
- HP: 180
- Withdrawal: 3
- **Ability — Rolling Guard:** When this creature evolves, gain 20 Shield.
- Attack 1: `2 Stone — Crag Roll — 50.`
- Attack 2: `3 Stone — Weight Drop — 80; the target becomes Crushed.`

**Audit:** **KEEP** with rules wording normalization

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **180**
- Withdrawal: **3**
- Starbound: **no**
- **Ability — Rolling Guard:** When this creature evolves, gain 20 Shield on this creature.
- **Attack — Crag Roll:** `2 Stone — 50 damage.`
- **Attack — Weight Drop:** `3 Stone — 80 damage. After damage, make the target Crushed.`

**Engine drift note:** The current branch implements Rolling Guard through a direct `stone-cragroller` evolution branch. STRUCTURE must replace that with a generic on-evolution Shield operation.

### Monolithorn

**Current prototype**

- Stage: Adult; evolves from Cragroller
- HP: 330
- Withdrawal: 4
- **Ability — Standing Stone:** Reduce attack damage done to your Reserve Stone creatures by 20.
- Attack 1: `3 Stone — Monolith Ram — 90.`
- Attack 2: `5 Stone — Mountain Fall — 160; the target becomes Crushed.`

**Audit:** **KEEP** with damage-source normalization

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **330**
- Withdrawal: **4**
- Starbound: **no**
- **Ability — Standing Stone:** Damage dealt by opposing attacks to your other friendly Stone creatures in Reserve is reduced by 20 before Shield and damage are applied.
- **Attack — Monolith Ram:** `3 Stone — 90 damage.`
- **Attack — Mountain Fall:** `5 Stone — 160 damage. After damage, make the target Crushed.`

**Reason:** Monolithorn is the board anchor: it protects the Reserve without protecting itself and still pays for that defensive power with a five-Essence finisher and maximum normal withdrawal weight.

### Family decision

**STONE-01 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The family now develops cleanly from personal Shield → Shield plus Crushed → whole-Reserve attack protection plus Crushed.

---

## STONE-02 — Flintkin → Rampartusk → Citadelhorn

**Family purpose:** Make Relics the family's armour progression: the Baby recovers when equipped, the Teen becomes tougher while equipped, and the Adult becomes a true fortress whose strongest attack rewards successful prevention.

### Flintkin

**Current prototype**

- Stage: Baby
- HP: 80
- Withdrawal: 2
- **Ability — Layered Hide:** When you attach a Relic to this creature, heal 10 from it.
- Attack: `1 Stone — Flint Tap — 20.`

**Audit:** **KEEP** with damaged-target wording

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **80**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Layered Hide:** When you attach a Relic to this creature while it has damage, heal 10 damage from this creature.
- **Attack — Flint Tap:** `1 Stone — 20 damage.`

### Rampartusk

**Current prototype**

- Stage: Teen; evolves from Flintkin
- HP: 170
- Withdrawal: 3
- Ability: **missing**
- Attack 1: `2 Stone — Rampart Push — 50.`
- Attack 2: `3 Stone — Wall Break — 80; if this creature has a Relic, +20 damage.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **170**
- Withdrawal: **3**
- Starbound: **no**
- **Ability — Rampart Plating:** While this creature has a Relic attached, damage dealt to it by opposing attacks is reduced by 10 before Shield and damage are applied.
- **Attack — Rampart Push:** `2 Stone — 50 damage.`
- **Attack — Wall Break:** `3 Stone — 80 damage. If this creature has a Relic attached when this attack is declared, this attack deals 20 more damage.`

**Reason:** Rampartusk develops Flintkin's equipment lesson into persistent armour while preserving the prototype Relic-powered attack payoff.

### Citadelhorn

**Current prototype**

- Stage: Adult; evolves from Rampartusk
- HP: 320
- Withdrawal: 4
- **Ability — Fortress Heart:** While this creature has a Relic, reduce attack damage it receives by 20.
- Attack 1: `3 Stone — Citadel Charge — 90.`
- Attack 2: `5 Stone — Bastion Quake — 150; if you prevented damage this turn, +20 damage.`

**Audit:** **KEEP** with deterministic prevention marker

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **320**
- Withdrawal: **4**
- Starbound: **no**
- **Ability — Fortress Heart:** While this creature has a Relic attached, damage dealt to it by opposing attacks is reduced by 20 before Shield and damage are applied.
- **Attack — Citadel Charge:** `3 Stone — 90 damage.`
- **Attack — Bastion Quake:** `5 Stone — 150 damage. If one or more damage was prevented from this creature by Shield, a Relic or one of its Abilities during this turn, this attack deals 20 more damage.`

**Reason:** The Adult turns defence into offence without making the damage bonus automatic merely for carrying a Relic.

### Family decision

**STONE-02 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Final STRUCTURE needs a generic attached-Relic predicate, incoming attack-damage modifiers and a turn-scoped `damage_prevented` event marker.

---

## STONE-03 — Standalone package

**Package purpose:** Give Stone four different legal starting roles: threshold tank, Shield grower, Shield-to-offence bruiser and pack-only anti-burst wall.

### Shalejaw

**Current prototype**

- Stage: Standalone
- HP: 150
- Withdrawal: 2
- **Ability — Tough Bite:** The first time each turn an attack would deal 100 or more damage to this creature, reduce that attack damage by 20.
- Attack: `2 Stone — Shale Crunch — 60.`

**Audit:** **KEEP** with source wording

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **150**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Tough Bite:** The first time during each turn an opposing attack would deal 100 or more damage to this creature before Shield, reduce that attack damage by 20.
- **Attack — Shale Crunch:** `2 Stone — 60 damage.`

### Boulderbug

**Current prototype**

- Stage: Standalone
- HP: 120
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `1 Stone — Stone Pinch — 30.`
- Attack 2: `2 Stone — Boulder Roll — 60.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **120**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Compact Shell:** The first time during your turn a card effect gives this creature Shield, gain 10 additional Shield on this creature.
- **Attack — Stone Pinch:** `1 Stone — 30 damage.`
- **Attack — Boulder Roll:** `2 Stone — 60 damage.`

**Reason:** Boulderbug becomes the lighter Stone starter that gets extra value from Mason's Kit, Reinforce and other Shield effects without copying Shalejaw's threshold defence.

### Quartzram

**Current prototype**

- Stage: Standalone
- HP: 200
- Withdrawal: 3
- Ability: **missing**
- Attack 1: `2 Stone — Quartz Bash — 60.`
- Attack 2: `3 Stone — Prism Ram — 100.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **200**
- Withdrawal: **3**
- Starbound: **no**
- **Ability — Prismatic Bulwark:** While this creature has at least 1 Shield, Prism Ram deals 20 more damage.
- **Attack — Quartz Bash:** `2 Stone — 60 damage.`
- **Attack — Prism Ram:** `3 Stone — 100 damage.`

**Reason:** Quartzram is the straightforward defence-to-offence Standalone: maintaining Shield creates a meaningful attack payoff, but taking enough damage to consume that Shield switches the bonus off.

### Obsidianox

**Current prototype**

- Stage: Standalone
- HP: 230
- Withdrawal: **missing**
- Pack-only: yes
- Structured Ability/attacks: **missing**
- Legacy `effect_text`: `230 HP. Glass Armour: the first attack each match that would deal 120 or more damage to this creature deals 30 less. 3 Stone — Obsidian Charge — 90.`

**Audit:** **TUNE** structure only

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **230**
- Withdrawal: **3** provisional
- Pack-only: **yes**
- Starbound: **no**
- **Ability — Glass Armour:** The first opposing attack during the match that would deal 120 or more damage to this creature before Shield has that attack damage reduced by 30. Once this Ability prevents damage, it is spent for that card instance for the rest of the match.
- **Attack — Obsidian Charge:** `3 Stone — 90 damage.`

**Reason:** Obsidianox stays a specialised pack-only anti-burst wall rather than becoming simply the highest-HP Standalone.

### Standalone package decision

**STONE-03 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Weakness/resistance remains pending the cross-element review for all Stone creatures.

---

## STONE-04 — Crowncrag — Mountain Warden

**Mythic purpose:** Serve as Stone's explicit Starbound defensive apex: ordinary turns can protect another friendly Stone creature from one major attack, while the once-per-match Starbound Power turns Crowncrag's successful strike into a multi-creature fortification event.

### Crowncrag — Mountain Warden

**Current prototype**

- Stage: Mythic
- Trait: Mythic
- HP: 390
- Withdrawal: 4
- Reward value: implicit by Mythic fallback
- **Ability — Mountain Warden:** Once during your turn, choose another friendly Stone creature. Until the end of the opponent's next turn, the first attack that would damage it deals 40 less damage.
- Attack 1: `3 Stone — Warden Slam — 100.`
- Attack 2: `5 Stone — Crown of Stone — 160; gain 30 Shield after damage.`

**Audit:** **TUNE** stage/prestige and Starbound payoff

**Current-rules design draft v1**

- Stage: **Standalone**
- Creature stage: **Standalone**
- Recipe/display type: **Creature — Standalone**
- Traits: **Mythic**
- Prestige mechanic: **Starbound**
- HP: **390**
- Withdrawal: **4**
- Reward value: **2**
- **Ability — Mountain Warden:** Once during your turn, choose 1 other friendly Stone creature. Until the end of your opponent's next turn, the first opposing attack that would deal damage to that creature has its attack damage reduced by 40 before Shield and damage are applied. The protection is consumed when it reduces one or more damage.
- **Attack — Warden Slam:** `3 Stone — 100 damage.`
- **Starbound Power — Crown of Stone:** `5 Stone — 160 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. After damage, if the match is still active, gain 30 Shield on Crowncrag. Then choose up to 2 other friendly Stone creatures; each chosen creature gains 20 Shield.`

### Starbound decision

Crowncrag is explicitly **Mythic + Starbound**. Crown of Stone is its single Starbound effect.

- Mountain Warden remains an ordinary once-per-turn Ability.
- Warden Slam remains an ordinary attack.
- Crown of Stone consumes the player's one shared Starbound marker immediately on legal declaration.
- Its defensive aftermath is intentionally broad enough to feel once-per-match: Crowncrag gains 30 Shield and may fortify up to two teammates for 20 Shield each.
- All Shield gained remains subject to the universal Shield cap and normal Shield consumption rules.
- Using Crown of Stone prevents that player from using any other Starbound Ability or Starbound attack later in the match, while Crowncrag's ordinary Ability and attack remain usable.

### Runtime note

The current branch's Mythic reward fallback will still recognise Crowncrag's Mythic trait after stage normalization, but final STRUCTURE must write `reward_value = 2` explicitly. Starbound must be explicit metadata rather than printed-English detection.

### Mythic decision

**STONE-04 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## STONE-05 — Essence package

**Package purpose:** Use attached Stone Essence to trade mobility for defence, cleanse Crushed and protect heavy bodies from hostile withdrawal manipulation.

All four Stone Essence identities are explicitly **not Starbound**.

### Basic Stone Essence

**Audit:** **KEEP**

- Provides **1 Stone Essence** while attached and has no additional card effect.

### Anchor Essence

**Current prototype:** Provides Stone. Attached creature has withdrawal cost +1 but receives 10 less attack damage.

**Audit:** **KEEP** with source normalization

**Current-rules design draft v1:** Provides **1 Stone Essence** while attached. The attached creature's withdrawal cost is 1 higher. Damage dealt to that creature by opposing attacks is reduced by 10 before Shield and damage are applied.

**Reason:** Anchor is a pure Stone trade: give up mobility for persistent armour.

**Engine drift note:** The current branch implements both halves of Anchor through direct card-ID checks. STRUCTURE must replace those shortcuts with generic attached withdrawal and incoming-attack modifiers.

### Fault Essence

**Current prototype:** Provides Stone. When attached from hand, clear Crushed from the receiving Stone creature.

**Audit:** **KEEP** with target wording

**Current-rules design draft v1:** Provides **1 Stone Essence** while attached. When you attach this card from your hand to a friendly Stone creature, if that creature is Crushed, clear Crushed from it.

### Granite Essence

**Current prototype:** Pack-only; provides Stone; attached Stone creature's printed withdrawal cost cannot be increased by opposing effects.

**Audit:** **TUNE** exact protection scope

**Current-rules design draft v1:** Provides **1 Stone Essence** while attached. Pack-only: **yes**. While attached to a Stone creature, **opposing card effects and opponent-applied conditions cannot increase that creature's withdrawal cost**. This protection does not stop withdrawal-cost changes created by cards you control or by the active shared Realm.

**Reason:** Granite becomes clean pack-only counter-tech against hostile movement tax without nullifying Stone's own deliberate mobility costs.

**Engine drift note:** The current branch uses Granite only to stop the Crushed withdrawal increase. Final STRUCTURE must encode the broader current-rules source-aware protection generically.

### Essence package decision

**STONE-05 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## STONE-06 — Tactic package

**Package purpose:** Support Stone's fortification, Relic armour, comeback resilience, Crushed pressure and deliberate positioning without turning the element into general hand disruption.

Stone contains **9 Tactics**: 2 Allies, 4 Devices, 2 Relics and 1 Realm. All nine are explicitly **not Starbound**.

### Bastion Plate

**Current prototype:** Attached creature receives 20 less attack damage. After preventing damage three times, discard this Relic.

**Audit:** **KEEP** with deterministic use counter

**Current-rules design draft v1:** **Relic — Bastion Plate:** Damage dealt to the attached creature by opposing attacks is reduced by up to 20. Each time this Relic prevents at least 1 damage from an attack, add 1 prevention use to that card instance. After it records its third prevention use, discard Bastion Plate after that attack finishes resolving.

### Faultstone

**Current prototype:** When attached Stone creature deals 100 or more attack damage, the opposing Vanguard becomes Crushed.

**Audit:** **TUNE** target/damage wording

**Current-rules design draft v1:** **Relic — Faultstone:** After an attack from the attached Stone creature deals at least 100 damage to the opposing Vanguard after damage prevention and Shield, if that Vanguard remains in play, make it Crushed.

**Reason:** Faultstone now keys off actual attack damage received, so strong defensive play can stop the Crushed trigger.

### Ironcliff Citadel

**Current prototype:** Realm; Stone creatures receive 10 less attack damage. Their withdrawal costs are 1 higher, maximum 4.

**Audit:** **KEEP** with shared-Realm ordering note

**Current-rules design draft v1:** **Realm — Ironcliff Citadel:** All Stone creatures receive 10 less damage from opposing attacks. When determining a Stone creature's withdrawal cost, this Realm adds 1, but this Realm's own increase cannot raise that cost above 4. Other legal modifiers are resolved through the universal withdrawal-modifier order.

**Reason:** The Realm is symmetrical and intentionally makes Stone safer but heavier.

### Keeper Tor

**Current prototype:** Choose one friendly Stone creature. Until Aftermath, its withdrawal cost is 0 and it cannot become Crushed.

**Audit:** **KEEP** with lifecycle wording

**Current-rules design draft v1:** **Ally — Keeper Tor:** Choose 1 friendly Stone creature. Until your Aftermath begins, that creature's withdrawal cost is 0 and it cannot newly become Crushed.

**Engine note:** The current structured lifecycle shape is useful evidence and should later be represented by the same generic temporary withdrawal override and condition-immunity operations.

### Mason's Kit

**Current prototype:** Gain 30 Shield on one friendly Stone creature.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Mason's Kit:** Choose 1 friendly Stone creature and gain 30 Shield on that creature.

### Quarry Search

**Current prototype:** Search your deck for a Stone creature or Stone Relic, reveal it, hand, shuffle. Current structured metadata requires exactly 1 result.

**Audit:** **TUNE** hidden-deck selection

**Current-rules design draft v1:** **Device — Quarry Search:** Search your deck for **up to 1** Stone Creature card or Stone Relic card, reveal it, put it into your hand, then shuffle your deck.

**Reason:** As with the corrected searches in the other elements, a hidden-deck search must allow zero legal results rather than require the engine to prove a target exists.

### Reinforce

**Current prototype:** Heal 20 from a Stone creature and gain 20 Shield on it.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Reinforce:** Choose 1 friendly Stone creature. Heal 20 damage from it, then gain 20 Shield on that creature.

**Rules note:** A creature with no damage remains a legal target because the Shield portion still resolves meaningfully.

### Reversal Seal

**Current prototype:** Pack-only Device; play only if one of your creatures was defeated during the opponent's previous turn. Both players discard their remaining hands; you draw 6 and opponent draws 3.

**Audit:** **REWRITE**

**Reason:** The trigger is a good Stone comeback concept, but asymmetric mass hand destruction belongs to Shade's established information/disruption identity. Stone's version should reward surviving and rebuilding a fortress instead.

**Current-rules design draft v1:** **Device — Reversal Seal:** Pack-only. You may play this card only if one or more of your creatures were defeated during your opponent's previous turn. Draw 3 cards. Then, if you control a friendly Stone creature, choose up to 1 of those creatures and gain 30 Shield on it.

**Why this fits:** Stone receives a meaningful recovery swing after losing board position without borrowing Shade's hand-reset mechanic or future Underworld's sacrifice/death-payoff identity.

### Surveyor Mina

**Current prototype:** Draw 2 cards. If your Vanguard has 200 or more printed HP, draw 1 additional card then discard 1.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Ally — Surveyor Mina:** Draw 2 cards. If your Vanguard has at least 200 printed HP, draw 1 additional card, then choose 1 card from your hand and discard it.

### Structure consequence

The Stone Tactic STRUCTURE pass must support or correct:

1. **Bastion Plate:** persistent incoming attack reduction plus three-use instance counter and self-discard;
2. **Faultstone:** actual post-prevention attack-damage threshold listener plus Crushed;
3. **Ironcliff Citadel:** shared Realm incoming-damage and withdrawal modifiers;
4. **Quarry Search:** change hidden-deck search from exactly 1 to `0..1`;
5. **Reversal Seal:** replace the obsolete hand-reset prototype with previous-opponent-turn defeat tracking, draw 3 and optional Stone Shield target.

Keeper Tor, Mason's Kit, Reinforce and Surveyor Mina already map closely to generic structured operations and should remain card-name agnostic.

### Tactic package decision

**STONE-06 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## STONE-07 — Unbroken exact 60-card starter audit

**Starter identity:** `Unbroken` remains the Stone starter for **defence, heavy bodies and deliberate positioning**, with **Crushed** as its signature condition and Crowncrag — Mountain Warden as its Starbound/Mythic defensive apex.

### Exact current recipe check

Fresh Supabase inventory confirms:

- **60 cards exactly**
- **22 Creatures / 18 Essence / 20 Tactics**
- **21 distinct starter identities**
- **14 legal opening creature copies** after Crowncrag normalization: 6 Babies plus 8 Standalone copies across Shalejaw, Boulderbug, Quartzram and Crowncrag
- Two complete evolution lines at `3 Baby → 2 Teen → 2 Adult`: Gravibble → Cragroller → Monolithorn and Flintkin → Rampartusk → Citadelhorn
- No orphan evolution cards
- Essence remains `14 Basic Stone / 2 Anchor / 2 Fault`
- Tactics remain `3 Mason's Kit / 3 Quarry Search / 2 Reinforce / 2 Keeper Tor / 2 Surveyor Mina / 3 Bastion Plate / 2 Faultstone / 3 Ironcliff Citadel`
- Pack-only **Obsidianox, Granite Essence and Reversal Seal** are excluded
- Every starter card is Stone; there is no off-element inclusion
- Normal identities remain within the 4-copy gameplay limit; Crowncrag appears exactly once and satisfies the Mythic one-copy-per-identity rule
- Crowncrag is the current Stone **Starbound** card; no other Stone identity in this completed design pass is designated Starbound

### Crowncrag normalization inside the starter

The prototype recipe still labels Crowncrag as `Creature — Mythic`. During STRUCTURE, that becomes **Creature — Standalone** with **Mythic** retained as class/trait, **Starbound** retained as prestige metadata and explicit `reward_value = 2`.

### Starter decision

**STONE-07 audit: KEEP THE EXACT 60-CARD RECIPE PROVISIONALLY.**

The current recipe has sufficient legal opening creatures, two complete evolution lines, a real Relic subtheme, enough Shield access and deliberate mobility tools to make Stone's heavy withdrawal values a strategic problem rather than a non-game.

The following are balance-test questions, not current defects:

1. whether Gravibble/Cragroller plus 3 Mason's Kit and 2 Reinforce creates too much early Shield;
2. whether Rampartusk/Citadelhorn plus 3 Bastion Plate and 2 Faultstone makes the Relic line too durable while still dealing enough damage;
3. whether Monolithorn's Reserve reduction plus Crowncrag's Mountain Warden makes protected Reserve creatures too difficult for positional attackers to remove;
4. whether Quartzram converts common Shield access into too much reliable 120-damage pressure at three Essence;
5. whether Anchor Essence plus Ironcliff Citadel makes Stone's already-high withdrawal values unreasonably punishing to the Stone player;
6. whether Keeper Tor at 2 copies provides enough deliberate mobility counterplay without erasing Stone's weight;
7. whether Faultstone applies Crushed too reliably when the starter's larger attacks begin resolving;
8. whether 18 Essence reaches the five-Stone attacks on Monolithorn, Citadelhorn and Crowncrag at a healthy pace;
9. whether Crowncrag's Starbound `160 + 30 Shield + up to 40 teammate Shield` is suitably powerful once per match without producing an unwinnable defensive lock;
10. whether 3 Ironcliff Citadel's symmetrical defensive environment slows Stone mirrors excessively.

These questions belong in deterministic AI Test Match followed by human playtesting rather than speculative starter-count edits now.

### Stone element completion state

**STONE CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES REVIEWED, STARTER RECIPE REVIEWED.**

Stone is **not registry-ready yet**. Weakness/resistance remains pending the cross-element review, all numeric values remain provisional until deterministic AI/human testing, and accepted designs still need deterministic structured metadata. The current `set-one-v0.6.1` Stone registry remains prototype evidence only.

---

## Next bounded audit

**TIDE — complete element audit**

Audit all 24 active Tide identities as one coherent element package, including both evolution families, Standalones, Marevault, all four Tide Essence cards, all nine Tide Tactics and the exact 60-card `Deep Current` starter. Apply the locked Starbound yes/no rule, normalize Mythic stage/class separation, keep weakness/resistance pending cross-element review and only STRUCTURE after the whole Tide design pass is accepted.