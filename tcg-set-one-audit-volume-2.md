# Stream Bandit TCG — Set One Current-Rules Audit — Volume 2

**Status:** Design ledger continuation only. No production card registry, starter deck, migration or deployed gameplay is changed by this file.

**Active implementation scope:** PR #549 on `feature/tcg-private-alpha-v0-5-source-recovery`.

**Authority boundary:** `tcg-set-one-audit.md` remains the completed current-rules audit authority for Astral, Ember, Gale and Grove plus the global Set One audit rules. This file continues that same audit without overlapping those completed element definitions and owns Shade, then Stone, Tide and Volt as they are completed.

All global rules, audit labels, Starbound rules, Mythic stage/class normalization, copy-limit rules, HP limits, deterministic-STRUCTURE policy and cross-element weakness/resistance deferral from Volume 1 remain binding here.

## Future expansion reservation — not SB1

The current eight-element Set One remains unchanged. Future expansions may introduce two additional full elements, bringing Stream Bandit TCG to a planned round **10 elemental types**:

- **Fairy** — magical, enchanted and graceful; future identity space includes enchantment, protection, cleansing, clever buffs and elegant transformation/repositioning. Fairy must be a strong competitive element rather than a cosmetic/cute-only theme.
- **Underworld** — deliberately high-cost and high-reward; future identity space includes expensive commitments, sacrifice/risk, defeat-linked value and major payoffs when the player successfully pays the required costs. Underworld must remain mechanically distinct from Shade: Shade owns mind/information disruption, while Underworld owns the heavier cost-for-power/death-payoff space.

These are future element reservations only. They do **not** add cards to SB1, change any of the eight existing starter recipes, change the current 193-card Set One total or alter the current engine during this audit.

---

# SHADE audit

## Shade registry snapshot

Fresh read-only inventory confirms Shade follows the Set One element template:

- **24 identities**
- **11 Creatures / 4 Essence / 9 Tactics**
- **3 pack-only identities**
- `Nightbind` = **60 cards / 21 identities**

**Locked Shade identity:** conditions, information warfare and controlled risk, with **Mindbound** as the signature condition.

**Pack-only Shade identities:** Graveglider, Eclipse Essence and False Memory.

All Shade identities in this completed pass are explicitly **not Starbound** except Umbravale — Thought Hunter.

---

## SHADE-01 — Gloamkin → Duskstalker → Noctivane

**Family purpose:** Develop Shade's information-war identity progressively: inspect the opponent's next draw, gain private hand information, then manipulate their future draw while paying a fair compensation cost when that future is changed.

### Gloamkin

**Current prototype**

- Stage: Baby
- HP: 60
- Withdrawal: 1
- Ability: **missing**
- Attack: `1 Shade — Gloom Tap — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **60**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Gloom Glimpse:** When you play this creature from your hand into an empty Reserve space during your Build phase, look at the top card of the opponent's deck, then return it to the top of that deck.
- **Attack — Gloom Tap:** `1 Shade — 20 damage.`

**Hidden-information rule:** Only Gloamkin's controller sees the inspected card identity.

### Duskstalker

**Current prototype**

- Stage: Teen; evolves from Gloamkin
- HP: 130
- Withdrawal: 1
- Ability: **missing**
- Attack 1: `1 Shade — Dusk Claw — 40.`
- Attack 2: `2 Shade — Hidden Step — 60; if the opponent has 5 or more cards in hand, +20 damage.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **130**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Hidden Tell:** When this creature evolves, if the opponent has at least 1 card in hand, the server chooses 1 of those cards at random. Look at that card, then return it to the opponent's hand without changing its state or order.
- **Attack — Dusk Claw:** `1 Shade — 40 damage.`
- **Attack — Hidden Step:** `2 Shade — 60 damage. If the opponent has at least 5 cards in hand when this attack is declared, this attack deals 20 more damage.`

**Reason:** The Teen broadens Shade's private information from the opponent's deck into their hand while keeping the hand-size attack payoff already present in the prototype.

### Noctivane

**Current prototype**

- Stage: Adult; evolves from Duskstalker
- HP: 250
- Withdrawal: 2
- **Ability — Night Reading:** Once during your turn, look at the top card of the opponent's deck. You may leave it or put it on the bottom; if you move it, the opponent draws 1 card after your Aftermath.
- Attack 1: `2 Shade — Nocturne Slash — 70.`
- Attack 2: `3 Shade — Dark Forecast — 110; the opposing Vanguard becomes Silenced.`

**Audit:** **KEEP / TUNE deterministic delayed draw**

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **250**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Night Reading:** Once during your turn, look at the top card of the opponent's deck. You may leave it on top or put it on the bottom. If you put it on the bottom, schedule the opponent to draw 1 card after your Aftermath finishes, provided the match is still active.
- **Attack — Nocturne Slash:** `2 Shade — 70 damage.`
- **Attack — Dark Forecast:** `3 Shade — 110 damage. After damage, make the opposing Vanguard Silenced.`

**Reason:** Noctivane gets meaningful control over the opponent's next draw, but changing that future compensates the opponent with a later card. That preserves controlled risk rather than creating free repeated draw denial.

### Family decision

**SHADE-01 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

STRUCTURE later needs generic private opponent-deck looks, server-random opponent-hand sampling, hand-size predicates, top-to-bottom movement and a delayed fixed-draw lifecycle event. None should be card-name branches.

---

## SHADE-02 — Murkmite → Veiljaw → Hollowcrown

**Family purpose:** Escalate Shade control conditions deliberately: the Baby rewards an already-controlled target, the Teen applies Dazed on evolution, and the Adult upgrades an existing control condition into Mindbound.

### Murkmite

**Current prototype**

- Stage: Baby
- HP: 50
- Withdrawal: 0
- Ability: **missing**
- Attack: `1 Shade — Murk Nip — 20.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Baby**
- HP: **50**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Murk Sense:** While the opposing Vanguard has a control condition, Murk Nip deals 10 more damage.
- **Attack — Murk Nip:** `1 Shade — 20 damage.`

### Veiljaw

**Current prototype**

- Stage: Teen; evolves from Murkmite
- HP: 140
- Withdrawal: 1
- **Ability — Frayed Thought:** When this creature evolves, the opposing Vanguard becomes Dazed if its control-condition slot is empty.
- Attack 1: `2 Shade — Veil Bite — 50.`
- Attack 2: `3 Shade — Thought Rend — 80; if the target has a condition, +20 damage.`

**Audit:** **KEEP** with deterministic wording

**Current-rules design draft v1**

- Stage: **Teen**
- HP: **140**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Frayed Thought:** When this creature evolves, if the opposing Vanguard's control-condition slot is empty, make that Vanguard Dazed.
- **Attack — Veil Bite:** `2 Shade — 50 damage.`
- **Attack — Thought Rend:** `3 Shade — 80 damage. If the target has at least 1 condition when this attack is declared, this attack deals 20 more damage.`

**Engine drift note:** The current branch implements Frayed Thought through a direct `shade-veiljaw` evolution branch. STRUCTURE must replace that with generic on-evolution condition metadata.

### Hollowcrown

**Current prototype**

- Stage: Adult; evolves from Veiljaw
- HP: 270
- Withdrawal: 2
- **Ability — Hollow Command:** Once during your turn, if the opposing Vanguard already has a condition, you may replace its control condition with Mindbound.
- Attack 1: `2 Shade — Hollow Lash — 70.`
- Attack 2: `4 Shade — Crowned Nightmare — 130; if the target is Mindbound, +30 damage.`

**Audit:** **TUNE** target qualification

**Current-rules design draft v1**

- Stage: **Adult**
- HP: **270**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Hollow Command:** Once during your turn, if the opposing Vanguard has a control condition other than Mindbound, you may replace that control condition with Mindbound.
- **Attack — Hollow Lash:** `2 Shade — 70 damage.`
- **Attack — Crowned Nightmare:** `4 Shade — 130 damage. If the target is Mindbound when this attack is declared, this attack deals 30 more damage.`

**Reason:** Hollowcrown now clearly upgrades the line's existing control pressure instead of creating Mindbound from an unrelated modifier such as Venomed alone.

### Family decision

**SHADE-02 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

The final engine needs generic condition-slot predicates and a controlled `replace control condition` operation so Mindbound upgrades are not hard-coded to Hollowcrown.

---

## SHADE-03 — Standalone package

**Package purpose:** Give Shade four different starting roles: hit-and-hide information, Vanguard-entry Dazed pressure, conditioned-target deck disruption and pack-only top-deck manipulation.

### Wispbat

**Current prototype**

- Stage: Standalone
- HP: 90
- Withdrawal: 0
- Ability: **missing**
- Attack 1: `1 Shade — Wisp Bite — 30.`
- Attack 2: `2 Shade — Fade Strike — 50; you may switch this creature with a Reserve creature.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **90**
- Withdrawal: **0**
- Starbound: **no**
- **Ability — Fade Echo:** The first time during your turn this creature moves from Vanguard to Reserve because of one of its attacks, look at the top card of the opponent's deck, then return it to the top.
- **Attack — Wisp Bite:** `1 Shade — 30 damage.`
- **Attack — Fade Strike:** `2 Shade — 50 damage. After damage, you may switch this creature with 1 of your Reserve creatures.`

### Umbraspider

**Current prototype**

- Stage: Standalone
- HP: 130
- Withdrawal: 1
- **Ability — Web of Doubt:** When this creature becomes Vanguard, the opposing Vanguard becomes Dazed if its control-condition slot is empty.
- Attack: `2 Shade — Shadow Fang — 50.`

**Audit:** **TUNE** first-trigger fence

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **130**
- Withdrawal: **1**
- Starbound: **no**
- **Ability — Web of Doubt:** The first time during your turn this creature becomes Vanguard, if the opposing Vanguard's control-condition slot is empty, make that Vanguard Dazed.
- **Attack — Shadow Fang:** `2 Shade — 50 damage.`

### Nightmaw

**Current prototype**

- Stage: Standalone
- HP: 180
- Withdrawal: 2
- Ability: **missing**
- Attack 1: `2 Shade — Night Bite — 60.`
- Attack 2: `3 Shade — Dread Crush — 90; if the opposing Vanguard has a condition, discard the top 2 cards of the opponent's deck.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **180**
- Withdrawal: **2**
- Starbound: **no**
- **Ability — Dread Hunger:** The first time during your turn one or more cards are discarded from the opponent's deck by one of your effects, if this creature has damage, heal 10 damage from it.
- **Attack — Night Bite:** `2 Shade — 60 damage.`
- **Attack — Dread Crush:** `3 Shade — 90 damage. If the opposing Vanguard has at least 1 condition when this attack is declared, after damage discard the top 2 cards of the opponent's deck.`

**Reason:** Nightmaw remains opponent-deck disruption rather than drifting into Underworld's future self-sacrifice/death-recovery space.

### Graveglider

**Current prototype**

- Stage: Standalone
- HP: 140
- Withdrawal: **missing**
- Pack-only: yes
- Structured Ability/attacks: **missing**
- Legacy `effect_text`: `140 HP. Cold Read: once when it becomes Vanguard, look at the top 2 cards of the opponent's deck and return them in the same order or swap them. 2 Shade — Gloom Glide — 60.`

**Audit:** **TUNE**

**Current-rules design draft v1**

- Stage: **Standalone**
- HP: **140**
- Withdrawal: **1** provisional
- Pack-only: **yes**
- Starbound: **no**
- **Ability — Cold Read:** The first time during your turn this creature becomes Vanguard, look at the top 2 cards of the opponent's deck and return them in either order.
- **Attack — Gloom Glide:** `2 Shade — 60 damage.`

### Standalone package decision

**SHADE-03 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Weakness/resistance remains pending the cross-element matchup review for every Shade creature.

---

## SHADE-04 — Umbravale — Thought Hunter

**Mythic purpose:** Serve as Shade's explicit Starbound Mythic information/control apex: ordinary turns can privately read part of a conditioned opponent's hand, while the once-per-match Starbound attack imposes Mindbound.

### Umbravale — Thought Hunter

**Current prototype**

- Stage: Mythic
- Trait: Mythic
- HP: 330
- Withdrawal: 2
- Reward value: implicit by Mythic fallback
- **Ability — Thought Hunter:** Once during your turn, if the opposing Vanguard has a control condition, look at 2 random cards from the opponent's hand and return them without changing order/state.
- Attack 1: `2 Shade — Veil Pierce — 80.`
- Attack 2: `4 Shade — Mind Eclipse — 140; the opposing Vanguard becomes Mindbound.`

**Audit:** **TUNE** stage/prestige/timing

**Current-rules design draft v1**

- Stage: **Standalone**
- Creature stage: **Standalone**
- Recipe/display type: **Creature — Standalone**
- Traits: **Mythic**
- Prestige mechanic: **Starbound**
- HP: **330**
- Withdrawal: **2**
- Reward value: **2**
- **Ability — Thought Hunter:** Once during your turn, if the opposing Vanguard has a control condition and the opponent has at least 1 card in hand, the server chooses up to 2 cards from that hand at random. Look at those cards, then return them without changing their state.
- **Attack — Veil Pierce:** `2 Shade — 80 damage.`
- **Starbound Power — Mind Eclipse:** `4 Shade — 140 damage. You may declare this attack only if you still have your Starbound marker. Consume that marker when the legal attack is declared. After damage, if the target remains in play, replace its current control condition with Mindbound; if its control-condition slot is empty, make it Mindbound.`

### Starbound decision

Umbravale is explicitly **Mythic + Starbound**. Mind Eclipse is its single Starbound effect.

- Thought Hunter remains an ordinary once-per-turn Ability.
- Veil Pierce remains an ordinary attack.
- Mind Eclipse consumes the player's one shared Starbound marker immediately on legal declaration.
- Mind Eclipse may replace an existing control condition because Mindbound is the intended once-per-match apex of Shade control.
- Using Mind Eclipse prevents that player from using any other Starbound Ability or Starbound attack later in the match; Umbravale's ordinary Ability and attack remain available.

### Mythic decision

**SHADE-04 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

Final STRUCTURE needs the generic Starbound gate shared by attack and Ability forms plus server-random private hand sampling and generic control-condition replacement metadata.

---

## SHADE-05 — Essence package

**Package purpose:** Turn Shade Essence attachments into information and conditioned-target payoffs while keeping actual attached Essence cards as the only resource source.

All four Shade Essence identities are explicitly **not Starbound**.

### Basic Shade Essence

**Audit:** **KEEP**

- Provides **1 Shade Essence** while attached and has no additional card effect.

### Veil Essence

**Current prototype:** Provides Shade; when attached from hand to a Shade creature, look at the top card of the opponent's deck.

**Audit:** **KEEP** with target/privacy normalization

**Current-rules design draft v1:** Provides **1 Shade Essence** while attached. **When you attach this card from your hand to a friendly Shade creature, if the opponent's deck is not empty, look at its top card, then return that card to the top.**

**Engine drift note:** The current manual Essence path does not execute Veil Essence's look effect. STRUCTURE must encode it generically rather than add a card-ID shortcut.

### Whisper Essence

**Current prototype:** Provides Shade; attached creature deals +10 damage to a conditioned Vanguard.

**Audit:** **KEEP** with element/target wording

**Current-rules design draft v1:** Provides **1 Shade Essence** while attached. **While attached to a Shade creature, that creature's attacks deal 10 more damage to an opposing Vanguard that has at least 1 condition when the attack is declared.**

**Engine drift note:** The current branch implements Whisper through a direct `shade-whisper-essence` check inside attack damage. Final STRUCTURE must replace that with a generic persistent attached attack modifier.

### Eclipse Essence

**Current prototype:** Pack-only; provides Shade; first time attached Shade creature applies a condition each turn, heal 10 from it.

**Audit:** **KEEP / TUNE successful-application wording**

**Current-rules design draft v1:** Provides **1 Shade Essence** while attached. Pack-only: **yes**. **The first time during each turn an Ability or attack of the attached Shade creature successfully applies or replaces a condition on an opposing creature, if the attached creature has damage, heal 10 damage from it.**

### Essence package decision

**SHADE-05 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## SHADE-06 — Tactic package

**Package purpose:** Preserve Shade as Set One's strongest mind/information-disruption Tactic suite while keeping all random decisions server-authoritative and all hidden-information views private to the player entitled to see them.

Shade contains **9 Tactics**: 3 Allies, 3 Devices, 2 Relics and 1 Realm. All nine are explicitly **not Starbound**.

### Broker Vale

**Current prototype:** Both players discard their remaining hands. Then you draw 5 cards and the opponent draws 4. Fixed-draw deck depletion applies.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Ally — Broker Vale:** Each player discards all cards remaining in their hand. Then you draw exactly 5 cards and the opponent draws exactly 4 cards. If either player cannot complete their fixed draw, apply the normal deck-depletion rule after the effect finishes resolving.

**Reason:** This deliberate asymmetric hand reset is Shade territory; Astral's Archivist Sol was separately corrected away from mass discard so the elements remain distinct.

### False Memory

**Current prototype:** Pack-only Ally; opponent discards 1 random card, then you discard 1 card and draw 2.

**Audit:** **TUNE** edge-case legality

**Current-rules design draft v1:** **Ally — False Memory:** If the opponent has at least 1 card in hand, the server chooses 1 of those cards at random and discards it. Then you may discard 1 card from your hand. If you discard a card this way, draw 2 cards; otherwise draw 1 card.

**Reason:** The pack-only Ally retains controlled risk without becoming illegal when either hand is unusually small.

### Gloom Locket

**Current prototype:** Attached Shade creature receives 10 less damage from conditioned opposing creatures.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Relic — Gloom Locket:** Damage dealt to the attached Shade creature by attacks from opposing creatures that currently have at least 1 condition is reduced by 10 before Shield and damage are applied.

### Hollow Midnight

**Current prototype:** Realm; conditioned Vanguards deal 10 less attack damage. Shade creatures ignore the reduction.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Realm — Hollow Midnight:** A Vanguard that has at least 1 condition deals 10 less damage with its attacks. Shade creatures ignore this Realm's damage reduction.

### Mind Cleanse

**Current prototype:** Clear Mindbound, Dazed or Silenced from one friendly creature, then draw 1.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Device — Mind Cleanse:** Choose 1 friendly creature that is Mindbound, Dazed or Silenced. Choose and clear 1 of those conditions from it, then draw 1 card.

### Mirror Fang

**Current prototype:** When the attached Shade creature becomes affected by a control condition, the opposing Vanguard becomes Dazed if its slot is empty.

**Audit:** **TUNE** first-trigger fence

**Current-rules design draft v1:** **Relic — Mirror Fang:** The first time during each turn the attached Shade creature gains or has its control condition replaced by another control condition, if the opposing Vanguard's control-condition slot is empty, make that Vanguard Dazed.

### Quiet Step

**Current prototype:** Switch your Vanguard with a Reserve Shade creature; clear one control condition from the creature moved to Reserve.

**Audit:** **KEEP** with explicit effect-switch wording

**Current-rules design draft v1:** **Device — Quiet Step:** Choose 1 friendly Shade creature in your Reserve and switch it with your Vanguard. This is an effect switch and does not use your normal voluntary withdrawal. Then you may clear up to 1 control condition from the creature that moved from Vanguard to Reserve.

### Seer Nyx

**Current prototype:** Look at top 3 opponent deck; discard 1 chosen card; return the other cards to top in any order.

**Audit:** **KEEP**

**Current-rules design draft v1:** **Ally — Seer Nyx:** Look at the top 3 cards of the opponent's deck. Choose 1 of those cards and discard it face-up. Return the remaining cards to the top of that deck in any order.

### Veil Search

**Current prototype:** Search deck for a Shade creature or Special Shade Essence, reveal it, hand, shuffle. Current structured selection requires exactly 1.

**Audit:** **TUNE** hidden-deck selection

**Current-rules design draft v1:** **Device — Veil Search:** Search your deck for **up to 1** Shade Creature card or Special Shade Essence card, reveal it, put it into your hand, then shuffle your deck.

### Structure consequence

The Shade Tactic STRUCTURE pass must support or correct:

1. **False Memory:** server-random opponent-hand discard plus optional self-discard/draw branch;
2. **Gloom Locket:** persistent incoming attack-damage modifier keyed to attacker condition state;
3. **Hollow Midnight:** shared persistent Realm attack modifier with Shade exemption;
4. **Mirror Fang:** first-per-turn control-condition listener;
5. **Veil Search:** change hidden-deck search from exactly 1 to `0..1`.

Broker Vale, Mind Cleanse, Quiet Step and Seer Nyx already have useful structured prototypes but remain subject to the final generic metadata grammar.

### Tactic package decision

**SHADE-06 status: DESIGN PASS — READY FOR LATER STRUCTURE, NOT YET REGISTRY-READY.**

---

## SHADE-07 — Nightbind exact 60-card starter audit

**Starter identity:** `Nightbind` remains the Shade starter for **conditions, information and controlled risk**, with **Mindbound** as its signature condition and Umbravale — Thought Hunter as its Starbound/Mythic control apex.

### Exact current recipe check

Fresh Supabase inventory confirms:

- **60 cards exactly**
- **22 Creatures / 18 Essence / 20 Tactics**
- **21 distinct starter identities**
- **14 legal opening creature copies** after Umbravale normalization: 6 Babies plus 8 Standalone copies across Wispbat, Umbraspider, Nightmaw and Umbravale
- Two complete evolution lines at `3 Baby → 2 Teen → 2 Adult`: Gloamkin → Duskstalker → Noctivane and Murkmite → Veiljaw → Hollowcrown
- No orphan evolution cards
- Essence remains `14 Basic Shade / 2 Veil / 2 Whisper`
- Tactics remain `3 Veil Search / 3 Quiet Step / 2 Mind Cleanse / 2 Seer Nyx / 2 Broker Vale / 3 Gloom Locket / 2 Mirror Fang / 3 Hollow Midnight`
- Pack-only **Graveglider, Eclipse Essence and False Memory** are excluded
- Every starter card is Shade; there is no off-element inclusion
- Normal identities remain within the 4-copy gameplay limit; Umbravale appears exactly once and satisfies the Mythic one-copy-per-identity rule
- Umbravale is the current Shade **Starbound** card; no other Shade identity in this completed design pass is designated Starbound

### Umbravale normalization inside the starter

The prototype recipe still labels Umbravale as `Creature — Mythic`. During STRUCTURE, that becomes **Creature — Standalone** with **Mythic** retained as class/trait, **Starbound** retained as prestige metadata and explicit `reward_value = 2`.

### Starter decision

**SHADE-07 audit: KEEP THE EXACT 60-CARD RECIPE PROVISIONALLY.**

The recipe already gives Shade enough legal opening creatures, two complete evolution families, strong information tools, meaningful condition access and clear counterplay/recovery without requiring its pack-only identities.

The following are balance-test questions, not current defects:

1. whether Veiljaw, Umbraspider, Mirror Fang, Hollowcrown and Umbravale create excessive control-condition uptime;
2. whether Mindbound's attack-interruption swing becomes too oppressive when both Hollowcrown and Umbravale can access it;
3. whether Umbravale's four-Shade Starbound Power becomes available too early with 18 Essence;
4. whether Broker Vale's asymmetric 5/4 hand reset combines too strongly with Duskstalker's 5-card threshold and Noctivane's delayed compensation draw;
5. whether Seer Nyx plus Nightmaw creates unhealthy opponent-deck depletion pressure;
6. whether 3 Gloom Locket plus 3 Hollow Midnight stacks too much damage reduction in condition-heavy matchups;
7. whether Quiet Step, Wispbat and Umbraspider allow too many repeated Vanguard-entry/control sequences;
8. whether Whisper Essence's conditioned-target bonus is too easy to maintain in the starter's normal game plan.

These questions belong in deterministic AI Test Match followed by human playtesting rather than speculative starter-count changes now.

### Shade element completion state

**SHADE CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES REVIEWED, STARTER RECIPE REVIEWED.**

Shade is **not registry-ready yet**. Weakness/resistance remains pending cross-element review, all numeric values remain provisional until deterministic AI/human testing, and accepted designs still need deterministic structured metadata. The current `set-one-v0.6.1` Shade registry remains prototype evidence only.

---

## Next bounded audit

**STONE — complete element audit**

Audit all 24 active Stone identities as one coherent element package, including both evolution families, Standalones, Crowncrag, all four Stone Essence cards, all nine Stone Tactics and the exact 60-card `Unbroken` starter. Apply the locked Starbound yes/no rule, normalize Mythic stage/class separation, keep weakness/resistance pending cross-element review and only STRUCTURE after the whole Stone design pass is accepted.