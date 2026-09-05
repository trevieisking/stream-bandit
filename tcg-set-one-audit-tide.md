# Stream Bandit TCG — Set One Current-Rules Audit — Tide

**Status:** Design ledger only. No production card registry, starter deck, migration, engine or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

**Authority boundary:** `tcg-set-one-audit.md` remains authoritative for the global Set One audit rules plus Astral, Ember, Gale and Grove. `tcg-set-one-audit-volume-2.md` remains authoritative for Shade and the future Fairy/Underworld reservation. `tcg-set-one-audit-stone.md` remains authoritative for Stone. This dedicated file is the canonical current-rules design authority for **Tide**.

All global rules from the prior audit volumes remain binding: Baby → Teen → Adult evolution, Standalone legality, one named Ability per creature, printed HP 40–390, Mythic as class/trait rather than a fourth evolution stage, explicit Starbound yes/no decisions, one shared Starbound use per player per match, current copy limits, deterministic structured runtime metadata later, and weakness/resistance deferred until all eight Set One elements can be compared together.

---

# TIDE audit

## Tide registry snapshot

Fresh read-only Supabase inventory confirms Tide follows the locked Set One element template exactly:

- **24 identities**
- **11 Creatures / 4 Essence / 9 Tactics**
- **3 pack-only identities**
- `Deep Current` = **60 cards / 21 identities**

**Current starter identity:** healing, Essence movement and patient control.

**Current-rules Tide identity:** healing, Essence movement, Shield transfer, Drenched control and **the highest raw-force / payoff ceiling in Set One once the player has successfully built the current**.

Tide is intentionally designed to feel like the most powerful natural force in the game without becoming an automatic-win element. Its power is earned through setup, correct Essence placement, movement timing, preserving Shield and deciding when to commit its late-game attacks. Other elements must retain viable counterplay through pressure before setup, switching, condition clearing, Shield removal, defeating support creatures and forcing Tide to commit Essence inefficiently.

**Pack-only Tide identities:** Lanternsquid, Brine Essence and Undertow Net.

All Tide identities in this completed pass are explicitly **not Starbound** except Marevault — Heart of Tides.

### Drenched current-rules role

Drenched remains Tide's signature modifier condition and is deliberately powerful:

- A Drenched creature cannot declare an attack while Drenched.
- At that creature controller's Aftermath, Drenched attempts its normal recovery check.
- Normal effect-switch / withdrawal condition-clearing rules remain available as counterplay where otherwise legal.
- Tide therefore applies Drenched selectively rather than turning every card into attack denial.

The current branch already treats Drenched as an attack lock with Aftermath recovery; final STRUCTURE must encode the condition explicitly rather than rely on scattered printed-English interpretation.

---

## TIDE-01 — Puddlepip → Rillrunner → Tideroar

**Family purpose:** Represent the living current. The Baby heals through ordinary Essence attachment, the Teen converts moved Essence into momentum, and the Adult actively redirects Essence to create a high-power attack turn while healing the board.

### Puddlepip

**Current prototype**

- Stage: Baby
- HP: 70
- Withdrawal: 1
- **Ability — Freshwater Coat:** The first time each turn you attach Tide Essence to this creature from hand, heal 10 from it.
- Attack: `1 Tide — Bubble Bump — 20.`

**Audit:** **KEEP** with exact trigger wording

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **70**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Freshwater Coat:** The first time during your turn you attach a Tide Essence from your hand to this creature, if it has damage, heal 10 damage from it.
- **Attack — Bubble Bump:** `1 Tide — 20 damage.`

**Engine note:** The current branch already has a direct Puddlepip attachment trigger. STRUCTURE must replace the card-ID special with generic first-per-turn attachment metadata.

### Rillrunner

**Current prototype**

- Stage: Teen; evolves from Puddlepip
- HP: 150
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `1 Tide — Current Dash — 40.`
- Attack 2: `2 Tide — Rushing Wake — 60; heal 10 from this creature.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **150**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Running Current:** The first time during your turn one or more attached Tide Essence is moved to or from this creature by one of your card effects, this creature's next attack during that turn deals 10 more damage.
- **Attack — Current Dash:** `1 Tide — 40 damage.`
- **Attack — Rushing Wake:** `2 Tide — 60 damage. After damage, if this creature has damage, heal 10 damage from it.`

**Reason:** Rillrunner teaches that Tide becomes stronger by moving existing attached resources intelligently rather than merely attaching more every turn.

### Tideroar

**Current prototype**

- Stage: Adult; evolves from Rillrunner
- HP: 280
- Withdrawal: 2
- **Ability — Current Keeper:** Once during your turn, move 1 attached Tide Essence between two friendly creatures.
- Attack 1: `2 Tide — Breakwater Roar — 80.`
- Attack 2: `3 Tide — Deep Current — 120; heal 30 from one friendly creature.`

**Audit:** **TUNE** high-ceiling payoff

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **280**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Current Keeper:** Once during your turn, you may move 1 attached Tide Essence from one friendly creature to another friendly creature. If you move an Essence this way, record that you moved attached Tide Essence this turn.
- **Attack — Breakwater Roar:** `2 Tide — 80 damage.`
- **Attack — Deep Current:** `3 Tide — 110 damage. If you moved at least 1 attached Tide Essence between friendly creatures during this turn, this attack deals 20 more damage. After damage, choose 1 damaged friendly creature and heal 30 damage from it.`

**Power ceiling:** Deep Current reaches **130 damage for 3 Tide** only after the player successfully creates a current that turn, then repairs the board. That is deliberately one of Set One's strongest three-Essence attack turns, but it is not unconditional.

**Engine drift note:** The current branch special-cases Tideroar's heal target after attack. STRUCTURE must make the conditional bonus and friendly heal generic.

### Family decision

**TIDE-01 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## TIDE-02 — Shellip → Reefback → Abyssalume

**Family purpose:** Represent deep-water pressure: heal into Shield, evolve into protected attacking, then preserve/redistribute Shield to unlock Tide's major Drenched finisher.

### Shellip

**Current prototype**

- Stage: Baby
- HP: 80
- Withdrawal: 2
- Ability: **missing**
- Attack: `1 Tide — Shell Tap — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **80**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Tidepool Shell:** The first time during your turn one or more damage is actually healed from this creature by one of your card effects, gain 10 Shield on this creature.
- **Attack — Shell Tap:** `1 Tide — 20 damage.`

**Reason:** Tide's defensive family converts recovery into future protection rather than copying Stone's static armour identity.

### Reefback

**Current prototype**

- Stage: Teen; evolves from Shellip
- HP: 170
- Withdrawal: 3
- **Ability — Reef Guard:** When this creature evolves, gain 20 Shield.
- Attack 1: `2 Tide — Coral Press — 50.`
- Attack 2: `3 Tide — Guarded Surge — 80; if this creature has Shield, heal 20 from it.`

**Audit:** **KEEP** with resolution timing

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **170**
- Withdrawal: **3**
- Starbound: **no**
- **Ability — Reef Guard:** When this creature evolves, gain 20 Shield on this creature.
- **Attack — Coral Press:** `2 Tide — 50 damage.`
- **Attack — Guarded Surge:** `3 Tide — 80 damage. After damage, if this creature still has at least 1 Shield, heal 20 damage from it.`

**Engine drift note:** Reef Guard is currently implemented by direct `tide-reefback` card-ID logic. STRUCTURE must replace that with generic on-evolution Shield metadata.

### Abyssalume

**Current prototype**

- Stage: Adult; evolves from Reefback
- HP: 300
- Withdrawal: 3
- **Ability — Lantern Shelter:** Once during your turn, move up to 20 Shield from this creature to another friendly Tide creature.
- Attack 1: `2 Tide — Lantern Pulse — 70.`
- Attack 2: `4 Tide — Abyssal Break — 140; if this creature has Shield, the opposing Vanguard becomes Drenched.`

**Audit:** **KEEP / TUNE exact Shield transfer and Drenched timing**

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **300**
- Withdrawal: **3**
- Starbound: **no**
- **Ability — Lantern Shelter:** Once during your turn, you may move up to 20 Shield from this creature to 1 other friendly Tide creature. You cannot move more Shield than Abyssalume currently has, and normal Shield caps still apply to the receiving creature.
- **Attack — Lantern Pulse:** `2 Tide — 70 damage.`
- **Attack — Abyssal Break:** `4 Tide — 140 damage. After damage, if Abyssalume still has at least 1 Shield and the opposing Vanguard remains in play, make that Vanguard Drenched.`

**Power/counterplay:** Abyssal Break is intentionally one of Tide's most threatening normal attacks because Drenched stops attacking. The player must preserve Shield through both previous combat and Lantern Shelter decisions; moving all Shield away turns off the condition payoff.

### Family decision

**TIDE-02 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Final STRUCTURE needs generic Shield transfer and an explicit post-damage condition gate based on the attacker's remaining Shield.

---

## TIDE-03 — Standalone package

**Package purpose:** Give Tide four different starting roles: Essence-fed Shield tank, hit-and-run healer, discard-to-Reserve Essence accelerator and pack-only Vanguard Essence collector.

### Reefshell

**Current prototype**

- Stage: Standalone
- HP: 160
- Withdrawal: 3
- Ability: **missing**
- Attack: `2 Tide — Tidal Push — 60.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **160**
- Withdrawal: **3**
- Starbound: **no**
- **Ability — Breakwater Current:** The first time during your turn one or more attached Tide Essence is moved onto this creature by one of your card effects, gain 20 Shield on this creature.
- **Attack — Tidal Push:** `2 Tide — 60 damage.`

**Reason:** Reefshell becomes a natural destination for the Tide player's moving Essence and gains strength from the element's signature resource manipulation.

### Mistmarten

**Current prototype**

- Stage: Standalone
- HP: 100
- Withdrawal: 0
- Ability: **missing**
- Attack 1: `1 Tide — Mist Dart — 30.`
- Attack 2: `2 Tide — Vanish Wake — 50; you may switch this creature with a Reserve creature.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **100**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Mist Recovery:** The first time during your turn this creature moves from Vanguard to Reserve because of one of its attacks, if it has damage, heal 20 damage from it.
- **Attack — Mist Dart:** `1 Tide — 30 damage.`
- **Attack — Vanish Wake:** `2 Tide — 50 damage. After damage, you may switch this creature with 1 of your Reserve creatures.`

### Surgefin

**Current prototype**

- Stage: Standalone
- HP: 130
- Withdrawal: 1
- **Ability — Undertow Supply:** Once during your turn, you may attach 1 Basic Tide Essence from your discard pile to 1 of your Reserve Tide creatures. If you do, heal 10 from that creature. This is additional to your normal manual Essence attachment.
- Attack 1: `1 Tide — Fin Slash — 30.`
- Attack 2: `2 Tide — Surge Cut — 60.`

**Audit:** **KEEP** with exact source/target wording

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **130**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Undertow Supply:** Once during your turn, choose up to 1 Basic Tide Essence in your discard pile and attach it to 1 friendly Tide creature in Reserve. If an Essence is attached this way, heal 10 damage from that Reserve creature if it is damaged. This attachment is generated by the Ability and is additional to your normal manual Essence attachment for the turn.
- **Attack — Fin Slash:** `1 Tide — 30 damage.`
- **Attack — Surge Cut:** `2 Tide — 60 damage.`

**Power note:** Surgefin is a major Tide accelerator, but it cannot directly feed the current Vanguard. The opponent can interact with the Reserve before Tide converts that stored power into a finishing turn.

### Lanternsquid

**Current prototype**

- Stage: Standalone
- HP: 150
- Withdrawal: **missing**
- Pack-only: yes
- Structured Ability/attacks: **missing**
- Legacy `effect_text`: `150 HP. Deep Signal: when it becomes Vanguard, you may move 1 Tide Essence from a Reserve creature to it. 2 Tide — Lantern Jet — 60; heal 10 from a Reserve creature.`

**Audit:** **TUNE** structure and trigger fence

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **150**
- Withdrawal: **1** provisional
- Pack-only: **yes**
- Starbound: **no**
- **Ability — Deep Signal:** The first time during your turn this creature becomes Vanguard, you may move 1 attached Tide Essence from one of your friendly Reserve creatures to Lanternsquid.
- **Attack — Lantern Jet:** `2 Tide — 60 damage. After damage, choose 1 damaged friendly Reserve creature and heal 10 damage from it.`

### Standalone package decision

**TIDE-03 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Weakness/resistance remains pending the cross-element review for all Tide creatures.

---

## TIDE-04 — Marevault — Heart of Tides

**Mythic purpose:** Serve as Tide's explicit Starbound apex and the highest-ceiling Set One payoff for mastering Tide's attached-Essence movement. Marevault does not simply have the largest unconditional damage number; it turns a fully developed board into a massive attack, resource redistribution and recovery swing.

### Marevault — Heart of Tides

**Current prototype**

- Stage: Mythic
- Trait: Mythic
- HP: 350
- Withdrawal: 3
- Reward value: implicit by Mythic fallback
- **Ability — Heart of Tides:** Once during your turn, move up to 2 attached Tide Essence among your friendly creatures in any combination. If you moved 2, heal 20 from one of those creatures.
- Attack 1: `2 Tide — Mooncurrent — 80.`
- Attack 2: `4 Tide — Tidal Vault — 150; you may move this creature to Reserve after damage without paying withdrawal.`

**Audit:** **TUNE** stage/prestige and major Starbound upgrade

**Current-rules design draft v1**

- Stage: **Standalone**
- Creature stage: **Standalone**
- Recipe/display type: **Creature — Standalone**
- Traits: **Mythic**
- Prestige mechanic: **Starbound**
- HP: **350**
- Withdrawal: **3**
- Reward value: **2**
- **Ability — Heart of Tides:** Once during your turn, you may move up to 2 attached Tide Essence among your friendly creatures in any combination. Each individual moved Essence must change creatures. If you move 2 Essence this way, choose 1 damaged friendly Tide creature that was a source or destination of at least 1 move and heal 20 damage from it.
- **Attack — Mooncurrent:** `2 Tide — 80 damage.`
- **Starbound Power — Tidal Vault:** `5 Tide — 180 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. After damage, if the match is still active, you may move up to 3 attached Tide Essence among your friendly Tide creatures in any combination. Then choose up to 2 different damaged friendly Tide creatures that were sources or destinations of at least 1 of those moves and heal 30 damage from each. Finally, if Marevault remains Vanguard and you have a friendly Reserve creature, you may switch Marevault with 1 of your Reserve creatures without paying withdrawal and without using your normal voluntary withdrawal.`

### Starbound decision

Marevault is explicitly **Mythic + Starbound**. Tidal Vault is its single Starbound effect.

- Heart of Tides remains an ordinary once-per-turn Ability.
- Mooncurrent remains an ordinary attack.
- Tidal Vault costs **5 Tide** and reaches **180 damage**, making it the largest raw Starbound attack currently locked in the eight elemental Set One Mythic cycle.
- The payoff is not only damage: the player may rebuild the entire current by moving up to 3 attached Tide Essence, repair up to two involved Tide creatures for 30 each, and then reposition Marevault.
- Tidal Vault consumes the player's one shared Starbound marker immediately on legal declaration.
- The extra effects do not occur if the match ends during damage/Reward/win resolution.
- Using Tidal Vault prevents that player from using any other Starbound Ability or Starbound attack later in the match; Marevault's ordinary Ability and attack remain usable.

### Why this is allowed to be exceptionally strong

Tidal Vault is deliberately the strongest raw-force Starbound package in Set One, reflecting the user's locked Tide direction. Its constraints are substantial:

1. five attached Tide Essence are required on the attacking Marevault;
2. Marevault must survive long enough to attack;
3. the resource/healing portion is strongest only if the player has multiple developed friendly Tide creatures;
4. the shared Starbound marker can be spent only once;
5. the opponent can disrupt Tide's setup before the payoff turn;
6. balance testing must still verify that this ceiling does not create an oppressive win rate.

### Mythic decision

**TIDE-04 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Final STRUCTURE needs generic multi-Essence movement, source/destination tracking, conditional multi-target healing and a Starbound post-attack effect switch.

---

## TIDE-05 — Essence package

**Package purpose:** Make attached Tide Essence itself fluid: ordinary attachment heals, Flow Essence redistributes existing resources, and pack-only Brine supplies targeted cleansing.

All four Tide Essence identities are explicitly **not Starbound**.

### Basic Tide Essence

**Audit:** **KEEP**

- Provides **1 Tide Essence** while attached and has no additional card effect.

### Calm Essence

**Current prototype:** Provides Tide. When attached from hand, heal 20 from the receiving Tide creature.

**Audit:** **KEEP**

**Current-rules design draft v1:** Provides **1 Tide Essence** while attached. When you attach this card from your hand to a friendly Tide creature, if that creature has damage, heal 20 damage from it.

**Engine note:** The current branch already special-cases Calm Essence. STRUCTURE must replace the card-ID branch with generic attach-and-heal metadata.

### Flow Essence

**Current prototype:** Provides Tide. When attached from hand, you may move 1 other Tide Essence from that creature to another friendly creature.

**Audit:** **KEEP / TUNE Tide destination**

**Current-rules design draft v1:** Provides **1 Tide Essence** while attached. When you attach this card from your hand to a friendly Tide creature, you may move **1 other** attached Tide Essence from that receiving creature to another friendly Tide creature.

**Rules note:** Flow Essence cannot move itself as part of its own attach trigger.

### Brine Essence

**Current prototype:** Pack-only; provides Tide; when attached from hand, clear Scorched or Venomed from the receiving Tide creature.

**Audit:** **KEEP** with choice wording

**Current-rules design draft v1:** Provides **1 Tide Essence** while attached. Pack-only: **yes**. When you attach this card from your hand to a friendly Tide creature, if that creature is Scorched or Venomed, choose up to 1 of those conditions and clear it.

### Essence package decision

**TIDE-05 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## TIDE-06 — Tactic package

**Package purpose:** Make Tide exceptionally consistent once established: find creatures/resources, redistribute attached Essence, heal multiple creatures, filter cards through the shared Realm, protect a key creature and punish Drenched opponents with pack-only movement tax.

Tide contains **9 Tactics**: 2 Allies, 4 Devices, 2 Relics and 1 Realm. All nine are explicitly **not Starbound**.

### Current Map

**Current prototype:** Search your deck for a Tide creature and a Basic Tide Essence, reveal both, hand, shuffle. Current structured metadata requires exactly one of each.

**Audit:** **TUNE** hidden-deck selection

**Current-rules design draft v1:** **Device — Current Map:** Search your deck for **up to 1 Tide Creature card and up to 1 Basic Tide Essence card**, reveal the chosen cards, put them into your hand, then shuffle your deck. Each category is optional independently.

**Power note:** This is intentionally a very strong Tide consistency card; it finds both a body and the ordinary resource needed to build the current, but does not generate additional attachments by itself.

### Deepwater Search

**Current prototype:** Search for a Tide Ally or Tide Relic, reveal it, hand, shuffle. Current structured metadata requires exactly 1.

**Audit:** **TUNE** hidden-deck selection

**Current-rules design draft v1:** **Device — Deepwater Search:** Search your deck for **up to 1** Tide Ally card or Tide Relic card, reveal it, put it into your hand, then shuffle your deck.

### Marina Wayfinder

**Current prototype:** Move up to 2 attached Tide Essence among your friendly creatures. Then draw 1 card.

**Audit:** **KEEP** with movement clarity

**Current-rules design draft v1:** **Ally — Marina Wayfinder:** Move up to 2 attached Tide Essence among your friendly Tide creatures in any combination. Each moved Essence must change creatures. Then draw 1 card.

### Moonlit Reef

**Current prototype:** Realm; first time each player heals one of their Tide creatures during their turn, that player may draw 1 then discard 1.

**Audit:** **KEEP / TUNE actual-healing trigger**

**Current-rules design draft v1:** **Realm — Moonlit Reef:** The first time during each player's own turn that player actually heals at least 1 damage from one of their Tide creatures with a card effect, that player may draw 1 card. If they draw this way, they then choose 1 card from their hand and discard it.

**Reason:** Zero-point “heals” on an undamaged creature do not activate the Realm.

### Recovery Spray

**Current prototype:** Heal 40 from one friendly creature; if it is Drenched, clear Drenched instead and heal 20.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Recovery Spray:** Choose 1 friendly creature. If it is Drenched, clear Drenched from it and heal 20 damage from it. Otherwise, heal 40 damage from it.

**Counterplay role:** Tide receives a strong recovery tool, but removing its own Drenched condition deliberately halves the healing amount.

### Reef Medic Olan

**Current prototype:** Heal 30 from up to 2 different friendly Tide creatures.

**Audit:** **KEEP** with damaged-target preference

**Current-rules design draft v1:** **Ally — Reef Medic Olan:** Choose up to 2 different damaged friendly Tide creatures. Heal 30 damage from each chosen creature.

### Shellguard Pendant

**Current prototype:** Attached creature receives 20 less damage from the next attack that damages it; then discard this Relic.

**Audit:** **KEEP** with exact consumption

**Current-rules design draft v1:** **Relic — Shellguard Pendant:** The next opposing attack that would deal damage to the attached creature has that attack damage reduced by up to 20. If this Relic prevents at least 1 damage, discard Shellguard Pendant after that attack finishes resolving.

### Tidal Lens

**Current prototype:** When you move an Essence from the attached Tide creature by an effect, heal 10 from it.

**Audit:** **TUNE** anti-loop fence

**Current-rules design draft v1:** **Relic — Tidal Lens:** The first time during each turn one or more attached Tide Essence is moved away from the attached Tide creature by one of your card effects, if that creature has damage, heal 10 damage from it.

**Reason:** The first-per-turn fence preserves the movement/healing identity without allowing repeated Essence shuttling to become an unlimited healing loop.

### Undertow Net

**Current prototype:** Pack-only Device; opposing Vanguard withdrawal +1 until its Aftermath, or +2 if Drenched.

**Audit:** **KEEP / TUNE movement-lock cap**

**Current-rules design draft v1:** **Device — Undertow Net:** Pack-only. Choose the opposing Vanguard. Until that creature's next Aftermath begins, its withdrawal cost is 1 higher. If it is Drenched when this Device resolves, its withdrawal cost is 2 higher instead. **This Device cannot by itself raise the creature's final withdrawal cost above 4.**

**Reason:** Drenched already stops attack declarations, so Undertow Net may punish retreat but must not create a routine unanswerable hard lock.

### Structure consequence

The Tide Tactic STRUCTURE pass must support or correct:

1. **Current Map:** two independent `0..1` hidden-deck groups;
2. **Deepwater Search:** `0..1` hidden-deck selection;
3. **Marina Wayfinder:** multi-Essence movement with required creature change;
4. **Moonlit Reef:** first actual heal per player's own turn listener;
5. **Shellguard Pendant:** single-use incoming attack reduction and self-discard;
6. **Tidal Lens:** first-per-turn attached-Essence-moved-away listener;
7. **Undertow Net:** temporary source-aware withdrawal modifier with a final-cost cap from this effect.

Recovery Spray and Reef Medic Olan already map closely to generic heal/condition operations but remain subject to the final deterministic grammar.

### Tactic package decision

**TIDE-06 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## TIDE-07 — Deep Current exact 60-card starter audit

**Starter identity:** `Deep Current` remains the Tide starter, but its current-rules identity is sharpened to **healing, Essence movement, patient control and overwhelming payoff once the current is established**, with **Drenched** as its signature condition and Marevault — Heart of Tides as its Starbound/Mythic apex.

### Exact current recipe check

Fresh Supabase inventory confirms:

- **60 cards exactly**
- **22 Creatures / 18 Essence / 20 Tactics**
- **21 distinct starter identities**
- **14 legal opening creature copies** after Marevault normalization: 6 Babies plus 8 Standalone copies across Reefshell, Mistmarten, Surgefin and Marevault
- Two complete evolution lines at `3 Baby → 2 Teen → 2 Adult`: Puddlepip → Rillrunner → Tideroar and Shellip → Reefback → Abyssalume
- No orphan evolution cards
- Essence remains `14 Basic Tide / 2 Flow / 2 Calm`
- Tactics remain `3 Current Map / 3 Recovery Spray / 2 Deepwater Search / 2 Marina Wayfinder / 2 Reef Medic Olan / 3 Tidal Lens / 2 Shellguard Pendant / 3 Moonlit Reef`
- Pack-only **Lanternsquid, Brine Essence and Undertow Net** are excluded
- Every starter card is Tide; there is no off-element inclusion
- Normal identities remain within the 4-copy gameplay limit; Marevault appears exactly once and satisfies the Mythic one-copy-per-identity rule
- Marevault is the current Tide **Starbound** card; no other Tide identity in this completed design pass is designated Starbound

### Marevault normalization inside the starter

The prototype recipe still labels Marevault as `Creature — Mythic`. During STRUCTURE, that becomes **Creature — Standalone** with **Mythic** retained as class/trait, **Starbound** retained as prestige metadata and explicit `reward_value = 2`.

### Starter decision

**TIDE-07 audit: KEEP THE EXACT 60-CARD RECIPE PROVISIONALLY.**

Deep Current already has the correct skeleton for Tide's intended high ceiling: two complete evolution families, 14 legal openers, 18 Essence, powerful resource search, Essence movement, discard-to-Reserve acceleration, healing and defensive tools. Changing the counts before deterministic testing would be guesswork.

### Balance-test questions

The following are deliberate test targets, not current defects:

1. whether **Current Map at 3 copies** plus Surgefin makes Tide's creature/Essence setup too consistent;
2. whether Surgefin's additional discard-pile attachment accelerates Marevault/Tideroar turns too quickly despite the Reserve-only restriction;
3. whether Puddlepip, Calm Essence, Rillrunner, Tideroar, Recovery Spray, Olan, Tidal Lens and Moonlit Reef create excessive aggregate sustain;
4. whether Reefback/Abyssalume can preserve Shield too reliably and therefore apply Drenched too often;
5. whether the current Drenched rule — attack lock plus Aftermath recovery — produces healthy counterplay when switching and cleanse options are available;
6. whether Tideroar's conditional **130 at 3 Tide + heal 30** is appropriately strong rather than too efficient;
7. whether 18 Essence plus Flow/Marina/Marevault movement effectively behaves like too much resource consistency;
8. whether Tidal Lens at 3 copies causes too much free healing from normal Essence repositioning;
9. whether Deepwater Search plus the Tide Relic/Ally suite creates overly deterministic defensive sequencing;
10. whether Marevault's Starbound **5 Tide / 180 + move up to 3 Essence + heal up to 60 total + optional effect switch** is an exciting late-game apex without generating an unacceptable win-rate spike;
11. whether Tide mirrors become too slow because both players can repeatedly repair damage;
12. whether early aggressive elements can pressure Tide before the current is assembled strongly enough to keep the overall matchup ecosystem fair.

### Tide power target

Tide is intentionally allowed to produce the **strongest fully-developed board and the largest raw Starbound attack package in Set One**. Balance testing should therefore not automatically nerf Tide merely because its successful late-game turns look more powerful than another element's late-game turn. The actual balance question is whether opponents have sufficient practical opportunities to disrupt that setup and whether Tide's overall match win rate remains healthy.

If testing proves Tide arrives at its apex too quickly, prefer tuning **setup speed, search density, movement frequency or healing throughput before reducing the identity-defining final payoff**. The goal is for the ocean to remain terrifying when it finally arrives.

### Tide element completion state

**TIDE CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES REVIEWED, STARTER RECIPE REVIEWED.**

Tide is **not registry-ready yet**. Weakness/resistance remains pending the cross-element review, numeric values remain provisional until deterministic AI/human testing, Drenched needs final rules-level structuring, and accepted designs still need deterministic structured metadata. The current `set-one-v0.6.1` Tide registry remains prototype evidence only.

---

## Next bounded audit

**VOLT — complete element audit**

Audit all 24 active Volt identities as one coherent element package, including both evolution families, Standalones, Stormcoil, all four Volt Essence cards, all nine Volt Tactics and the exact 60-card `Live Wire` starter. Apply the locked Starbound yes/no rule, normalize Mythic stage/class separation, keep weakness/resistance pending cross-element review and only STRUCTURE after the whole Volt design pass is accepted.