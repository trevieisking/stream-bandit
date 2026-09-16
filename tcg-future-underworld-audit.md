# Stream Bandit TCG — Future Underworld Element — Current-Rules Design Audit

**Status:** Future expansion design ledger only. No Set One identity, production registry, migration, starter grant or deployed gameplay is changed by this file.

**Element:** Underworld  
**Package target:** 24 identities / 11 Creatures / 4 Essence / 9 Tactics / 3 pack-only / exact 60-card starter.

**Global matchup:** `Astral → Martial → Shade → Fairy → Underworld → Astral`.

Underworld uses no routine per-card Weakness field. Global matchup data owns Weakness.

## Locked Underworld identity

Underworld = **high-cost / high-reward power, vitality drain, wounds as resources, hostile damage transfer, discard/sacrifice costs and defeat-linked pressure**.

Underworld must remain distinct from Shade:

- Shade controls information and minds.
- Underworld converts pain, cards and resources into power.

**Pack-only Underworld identities:** Coffincrow, Grave Essence, Wound Exchange.

All Underworld cards are not Starbound except **Thanavor — Debt Sovereign**.

---

# UNDERWORLD-01 — Woundling → Scarjackal → Bloodbasilisk

**Family purpose:** teach vitality drain from light recurring siphon to high-cost conversion.

### Woundling
- Stage: Baby
- HP: 70
- Withdrawal: 1
- Starbound: no
- **Ability — Little Siphon:** Once during your turn, if Woundling has damage, drain 10 vitality from the opposing Vanguard and heal Woundling by the actual HP damage drained.
- **Attack — Scratch Debt:** `1 Underworld — 20 damage.`

### Scarjackal
- Stage: Teen; evolves from Woundling
- HP: 150
- Withdrawal: 1
- Starbound: no
- **Ability — Blood Interest:** The first time during your turn Scarjackal receives 10 or more damage from one of your own card effects, its next attack that turn deals 20 more damage.
- **Attack — Scar Bite:** `2 Underworld — 50 damage.`
- **Attack — Siphon Fang:** `2 Underworld + 1 any — 70 damage. After damage, if the target remains in play, drain 20 vitality from it and heal Scarjackal by the actual HP damage drained.`

### Bloodbasilisk
- Stage: Adult; evolves from Scarjackal
- HP: 290
- Withdrawal: 2
- Starbound: no
- **Ability — Paid in Blood:** Once during your turn, you may place 20 damage on Bloodbasilisk. If you do, choose 1 opposing creature and drain 40 vitality from it; heal Bloodbasilisk by the actual HP damage drained.
- **Attack — Debt Coil:** `3 Underworld — 100 damage.`
- **Attack — Red Ledger:** `4 Underworld — 140 damage. If Bloodbasilisk received damage from one of your own card effects during this turn, this attack deals 20 more damage.`

---

# UNDERWORLD-02 — Cryptmite → Debtwing → Revenantusk

**Family purpose:** convert existing wounds into hostile transfer and defeat-linked momentum.

### Cryptmite
- Stage: Baby
- HP: 60
- Withdrawal: 0
- Starbound: no
- **Ability — Grave Nibble:** When played from hand into an empty Reserve space during your Build phase, if another friendly creature has damage, you may move 10 damage from that creature to Cryptmite.
- **Attack — Crypt Tap:** `1 Underworld — 20 damage.`

### Debtwing
- Stage: Teen; evolves from Cryptmite
- HP: 140
- Withdrawal: 1
- Starbound: no
- **Ability — Owed Pain:** When this creature evolves, if it has damage, you may move up to 20 damage from Debtwing to the opposing Vanguard.
- **Attack — Debt Wing:** `1 Underworld — 40 damage.`
- **Attack — Collection Dive:** `2 Underworld — 60 damage. If one of your creatures was defeated since the end of your previous turn, this attack deals 20 more damage.`

### Revenantusk
- Stage: Adult; evolves from Debtwing
- HP: 300
- Withdrawal: 3
- Starbound: no
- **Ability — Final Account:** The first time during each opponent turn one of your other creatures is defeated, gain 20 Shield on Revenantusk and heal 20 damage from it.
- **Attack — Grave Charge:** `3 Underworld — 100 damage.`
- **Attack — Debt Collector:** `4 Underworld — 130 damage. After damage, if Revenantusk has at least 40 damage, you may move up to 40 damage from Revenantusk to the opposing Vanguard.`

---

# UNDERWORLD-03 — Standalone package

### Leechmole
- Stage: Standalone
- HP: 110
- Withdrawal: 1
- Starbound: no
- **Ability — Buried Sip:** Once during your turn, if the opposing Vanguard has damage, drain 20 vitality from it and heal Leechmole by the actual HP damage drained.
- **Attack — Tunnel Bite:** `1 Underworld — 30 damage.`

### Hollowram
- Stage: Standalone
- HP: 210
- Withdrawal: 3
- Starbound: no
- **Ability — Hollow Price:** The first time during your turn you discard a card from your hand as a cost, gain 20 Shield on Hollowram.
- **Attack — Hollow Bash:** `2 Underworld — 60 damage.`
- **Attack — Toll Charge:** `3 Underworld — 100 damage. You may discard 1 card from your hand when this attack is declared; if you do, this attack deals 30 more damage.`

### Mourningray
- Stage: Standalone
- HP: 160
- Withdrawal: 1
- Starbound: no
- **Ability — Grief Current:** The first time during your turn one of your friendly creatures is actually healed, you may place 10 damage on Mourningray. If you do, draw 1 card.
- **Attack — Dirge Ray:** `2 Underworld — 60 damage.`
- **Attack — Black Wake:** `3 Underworld — 90 damage. If Mourningray has at least 30 damage, drain 20 vitality from the target after damage.`

### Coffincrow — pack-only
- Stage: Standalone
- HP: 130
- Withdrawal: 0
- Pack-only: yes
- Starbound: no
- **Ability — Carrion Claim:** The first time during each turn an opposing creature is defeated, if Coffincrow has damage, heal 30 damage from it.
- **Attack — Coffin Peck:** `1 Underworld — 30 damage.`
- **Attack — Last Feather:** `2 Underworld — 60 damage. If a creature was defeated during this turn, this attack deals 20 more damage.`

---

# UNDERWORLD-04 — Thanavor — Debt Sovereign

- Stage: Standalone
- Traits: Mythic
- Prestige: Starbound
- HP: 370
- Withdrawal: 3
- Reward value: 2
- Deck limit: max 1 identity

**Ability — Sovereign Debt:** Once during your turn, choose 1 damaged friendly Underworld creature. Move up to 30 damage from it to Thanavor. If at least 20 damage moved, draw 1 card.

**Attack — Black Tribute:** `3 Underworld — 110 damage.`

**Starbound Power — Final Collection:** `5 Underworld — 170 damage.` Consume the shared Starbound marker on legal declaration. As an additional declaration cost, choose one: discard 2 cards from your hand; or place 40 damage on Thanavor. After damage, if the target remains in play, drain 60 vitality from the opposing Vanguard and heal Thanavor by the actual HP damage drained. Then, if Thanavor has at least 40 damage, you may move up to 40 damage from Thanavor to another opposing creature.

**Apex rule:** Underworld gets the strongest natural hostile wound conversion, but it pays explicit costs and still does not exceed Tide's special `120 × 2` ranged placement reservation.

---

# UNDERWORLD-05 — Essence package

### Basic Underworld Essence
Provides 1 Underworld Essence while attached. No additional effect.

### Siphon Essence
Provides 1 Underworld Essence. The first time during each of your turns the attached Underworld creature drains vitality, increase the heal from that drain by up to 10, never above the actual HP damage drained plus this bonus's explicit allowance. This bonus healing cannot recursively trigger another drain.

### Debt Essence
Provides 1 Underworld Essence. When attached from hand to a damaged friendly Underworld creature, you may place 10 additional damage on that creature; if you do, draw 1 card.

### Grave Essence — pack-only
Provides 1 Underworld Essence. Pack-only. When the attached creature is defeated, if this Essence is discarded from that creature by the defeat flow, choose 1 damaged friendly Underworld creature and heal 20 damage from it.

---

# UNDERWORLD-06 — Tactic package

Underworld has 9 Tactics: 3 Allies, 3 Devices, 2 Relics, 1 Realm.

### Collector Vey — Ally
Choose 1 damaged friendly Underworld creature. Move up to 30 damage from it to another friendly creature. If at least 20 damage moved, draw 1 card.

### Ferryman Korr — Ally
Choose up to 1 Underworld Creature card in your discard that was defeated earlier in the match and put it on the bottom of your deck. Then draw 2 cards.

### Mourner Isa — Ally
If one of your creatures was defeated during the opponent's previous turn, draw 3 cards, then discard 1 card.

### Blood Contract — Device
Choose 1 friendly Underworld creature. Place 20 damage on it; then attach up to 1 Basic Underworld Essence from your discard to that creature. This is additional to the normal manual Essence attachment.

### Debt Ledger — Device
Discard 1 card from your hand. If you do, choose 1 opposing creature with damage and deal 40 effect damage to it.

### Wound Exchange — pack-only Device
Pack-only. Choose 1 damaged friendly Underworld creature and 1 opposing creature. Move up to 60 damage from the friendly creature to the opposing creature. You may play this only if at least 30 damage can move.

### Black Chain — Relic
The first time during each of your turns the attached Underworld creature drains vitality, its next attack that turn deals 20 more damage.

### Grave Crown — Relic
The first time during each opponent turn another friendly creature is defeated, gain 20 Shield on the attached Underworld creature.

### Last Gate — Realm
The first time during each player's own turn that player places damage on one of their own creatures as a card cost, that player may draw 1 card, then discard 1 card.

---

# UNDERWORLD-07 — Exact 60-card starter

**Starter name:** `Debtbound`

## Creatures — 22
- Woundling ×3
- Scarjackal ×2
- Bloodbasilisk ×2
- Cryptmite ×3
- Debtwing ×2
- Revenantusk ×2
- Leechmole ×3
- Hollowram ×2
- Mourningray ×2
- Thanavor — Debt Sovereign ×1

## Essence — 18
- Basic Underworld Essence ×14
- Siphon Essence ×2
- Debt Essence ×2

## Tactics — 20
- Collector Vey ×3
- Ferryman Korr ×3
- Mourner Isa ×2
- Blood Contract ×2
- Debt Ledger ×2
- Black Chain ×3
- Grave Crown ×2
- Last Gate ×3

**Excluded pack-only:** Coffincrow, Grave Essence, Wound Exchange.

Checks:
- 60 cards exactly
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic
- two complete 3→2→2 evolution lines
- no pack-only identity in starter
- Thanavor exactly one copy
- no routine per-card Weakness data

---

# UNDERWORLD-08 — Balance questions

1. Is recurring 10/20 drain too efficient when combined with ordinary attack damage?
2. Does Bloodbasilisk's self-damage → 40 drain create too much net swing?
3. Is Revenantusk's 40 hostile damage transfer sufficiently gated by carrying its own wounds?
4. Does Wound Exchange's pack-only 60 transfer need an additional once-per-turn or hand/discard cost after simulation?
5. Does Thanavor's `170 + 60 drain + optional 40 wound transfer` create a fair once-per-match apex after its explicit cost?
6. Do defeat-linked cards encourage tactical sacrifice without rewarding intentional throwaway boards too heavily?
7. Does Debtbound have enough counterplay when opponents deny damaged targets or remove wounded Underworld creatures before they can convert damage?
8. Does Underworld remain distinct from Shade in actual play rather than drifting into generic disruption?

These are simulation/human-test questions, not reasons to change numbers before testing.

---

## Underworld completion state

**UNDERWORLD CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES + EXACT 60-CARD STARTER DESIGNED.**

Underworld is future expansion design only and is not production-registry ready until structured through the consolidated shared schema and balance tested.