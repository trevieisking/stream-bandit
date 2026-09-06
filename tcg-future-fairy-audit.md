# Stream Bandit TCG — Future Fairy Element — Current-Rules Design Audit

**Status:** Future expansion design ledger only. No Set One identity, production registry, migration, starter grant or deployed gameplay is changed by this file.

**Element:** Fairy  
**Package target:** 24 identities / 11 Creatures / 4 Essence / 9 Tactics / 3 pack-only / exact 60-card starter.

**Global matchup:** `Astral → Martial → Shade → Fairy → Underworld → Astral`.

Fairy uses no routine per-card Weakness field. Global matchup data owns Weakness.

## Locked Fairy identity

Fairy = **enchantment, protection, cleansing, graceful repositioning, healing amplification, friendly damage redistribution and selective reversal**.

Fairy must feel competitively serious. It is not a cosmetic/cute-only element and it does not simply become “the healing element”; Grove owns broad natural healing, Tide owns healing/current management, while Fairy owns **precision redirection and enchanted protection**.

**Pack-only Fairy identities:** Prismoth, Mirror Essence, Reversal Waltz.

All Fairy cards are not Starbound except **Luminara — Crown of Grace**.

---

# FAIRY-01 — Gleamouse → Charmhare → Prismalynx

**Family purpose:** teach protective damage redistribution.

### Gleamouse
- Stage: Baby
- HP: 60
- Withdrawal: 0
- Starbound: no
- **Ability — Gentle Burden:** The first time during your turn another friendly creature would be healed by one of your card effects, you may move up to 10 damage from that creature to Gleamouse instead of healing that moved amount. Do not move more damage than Gleamouse can survive unless a card explicitly permits it.
- **Attack — Sparkle Nip:** `1 Fairy — 20 damage.`

### Charmhare
- Stage: Teen; evolves from Gleamouse
- HP: 130
- Withdrawal: 1
- Starbound: no
- **Ability — Shared Grace:** When this creature evolves, you may move up to 20 damage from 1 other friendly creature to Charmhare.
- **Attack — Ribbon Kick:** `1 Fairy — 40 damage.`
- **Attack — Kindred Leap:** `2 Fairy — 60 damage. After damage, heal 20 damage from another damaged friendly creature.`

### Prismalynx
- Stage: Adult; evolves from Charmhare
- HP: 250
- Withdrawal: 1
- Starbound: no
- **Ability — Prismatic Burden:** Once during your turn, you may move up to 30 damage from one friendly creature to another friendly creature. At least 10 damage must move for the Ability to count as used.
- **Attack — Prism Claw:** `2 Fairy — 70 damage.`
- **Attack — Grace Reversal:** `3 Fairy — 100 damage. After damage, if Prismalynx has damage, you may move up to 20 damage from Prismalynx to the opposing Vanguard.`

**Family decision:** Fairy learns damage movement as support first, then gains a small hostile reversal only at Adult.

---

# FAIRY-02 — Dewimp → Halofox → Seraphowl

**Family purpose:** cleansing and enchanted protection.

### Dewimp
- Stage: Baby
- HP: 50
- Withdrawal: 0
- Starbound: no
- **Ability — Clear Dew:** When played from hand into an empty Reserve space during your Build phase, you may clear 1 modifier condition from your Vanguard.
- **Attack — Dew Tap:** `1 Fairy — 20 damage.`

### Halofox
- Stage: Teen; evolves from Dewimp
- HP: 140
- Withdrawal: 1
- Starbound: no
- **Ability — Halo Step:** When this creature evolves, choose 1 friendly creature. Until the start of your next turn, the first opposing card effect that would newly apply a modifier condition to that creature fails.
- **Attack — Halo Bite:** `1 Fairy — 40 damage.`
- **Attack — Clean Arc:** `2 Fairy — 60 damage. After damage, you may clear 1 condition from another friendly creature.`

### Seraphowl
- Stage: Adult; evolves from Halofox
- HP: 260
- Withdrawal: 1
- Starbound: no
- **Ability — Seraphic Veil:** Once during your turn, choose 1 friendly Fairy creature. Until your next turn begins, the next opposing effect damage packet dealt to that creature is reduced by 30.
- **Attack — Wing of Light:** `2 Fairy — 70 damage.`
- **Attack — Purity Spiral:** `3 Fairy — 110 damage. After damage, if you cleared a condition from one of your creatures during this turn, heal 30 damage from 1 damaged friendly creature.`

---

# FAIRY-03 — Standalone package

### Moondormouse
- Stage: Standalone
- HP: 100
- Withdrawal: 0
- Starbound: no
- **Ability — Moon Sip:** Once during your turn, if this creature has damage, you may drain 10 vitality from the opposing Vanguard and heal this creature by the actual HP damage drained.
- **Attack — Moonbeam:** `1 Fairy — 30 damage.`

### Crystaltoad
- Stage: Standalone
- HP: 180
- Withdrawal: 2
- Starbound: no
- **Ability — Crystal Reservoir:** The first time during each turn this creature is actually healed by a card effect, gain 10 Shield on it.
- **Attack — Crystal Bash:** `2 Fairy — 60 damage.`
- **Attack — Refraction:** `3 Fairy — 90 damage. If this creature has Shield, heal 20 damage from 1 other friendly creature.`

### Silkray
- Stage: Standalone
- HP: 130
- Withdrawal: 0
- Starbound: no
- **Ability — Ribbon Current:** The first time during your turn this creature becomes Vanguard from Reserve, you may move up to 20 damage from another friendly creature to Silkray. If damage moved, Silkray's next attack that turn deals 20 more damage.
- **Attack — Silk Slice:** `2 Fairy — 60 damage.`

### Prismoth — pack-only
- Stage: Standalone
- HP: 120
- Withdrawal: 0
- Pack-only: yes
- Starbound: no
- **Ability — Mirror Dust:** The first time during your turn an opposing card effect places or moves damage onto one of your creatures, you may move up to 20 of that newly placed/moved damage from that creature to Prismoth.
- **Attack — Mirror Wing:** `1 Fairy — 30 damage.`
- **Attack — Gleam Scatter:** `2 Fairy — 60 damage.`

---

# FAIRY-04 — Luminara — Crown of Grace

- Stage: Standalone
- Traits: Mythic
- Prestige: Starbound
- HP: 350
- Withdrawal: 2
- Reward value: 2
- Deck limit: max 1 identity

**Ability — Crown of Grace:** Once during your turn, choose up to 2 damaged friendly Fairy creatures. Move up to 20 damage from each chosen creature to Luminara, then heal 20 damage from Luminara.

**Attack — Radiant Crown:** `3 Fairy — 100 damage.`

**Starbound Power — Grand Reversal:** `5 Fairy — 160 damage.` Consume the shared Starbound marker on legal declaration. After damage, if the match remains active, choose up to 2 damaged friendly creatures. From each chosen creature, you may move up to 30 damage to the opposing Vanguard. Then heal 30 damage from Luminara.

**Starbound identity:** Fairy's apex protects its board and converts carefully accumulated wounds into one major reversal without matching Underworld's larger routine hostile-transfer access.

---

# FAIRY-05 — Essence package

### Basic Fairy Essence
Provides 1 Fairy Essence while attached. No additional effect.

### Grace Essence
Provides 1 Fairy Essence. When attached from hand to a damaged friendly Fairy creature, heal 20 damage from it.

### Halo Essence
Provides 1 Fairy Essence. The first time during each turn the attached Fairy creature has a condition cleared by one of your card effects, gain 10 Shield on it.

### Mirror Essence — pack-only
Provides 1 Fairy Essence. Pack-only. The first time during each of your turns damage is moved away from the attached Fairy creature by one of your card effects, its next attack that turn deals 20 more damage.

---

# FAIRY-06 — Tactic package

Fairy has 9 Tactics: 3 Allies, 3 Devices, 2 Relics, 1 Realm.

### Keeper Elia — Ally
Choose up to 2 damaged friendly Fairy creatures. Heal 20 damage from each.

### Dancer Suri — Ally
Choose 1 friendly Fairy creature in Reserve and switch it with your Vanguard. This is an effect switch. Then you may move up to 20 damage from the creature moved to Reserve to the new Vanguard.

### Archivist Faye — Ally
Look at the top 5 cards of your deck. Put up to 2 Fairy Creature or Fairy Essence cards among them into your hand. Put the rest on the bottom in any order.

### Graceful Exchange — Device
Choose 2 friendly creatures. Move up to 30 damage from the first to the second.

### Purity Bell — Device
Choose 1 friendly creature with a condition. Clear 1 condition from it, then heal 20 damage from it.

### Reversal Waltz — pack-only Device
Pack-only. Choose 1 damaged friendly Fairy creature and the opposing Vanguard. Move up to 40 damage from the friendly creature to the opposing Vanguard. You may play this only once per turn and only if at least 20 damage can move.

### Moonlace — Relic
The first time during each turn the attached Fairy creature is healed by a card effect, increase that actual healing by 10.

### Prism Ribbon — Relic
The first time during each turn the attached Fairy creature would receive effect damage, reduce that effect damage by 20.

### Court of Glass — Realm
The first time during each player's own turn that player moves damage between two friendly creatures by a card effect, the destination creature gains 10 Shield after the move.

---

# FAIRY-07 — Exact 60-card starter

**Starter name:** `Gracebound`

## Creatures — 22
- Gleamouse ×3
- Charmhare ×2
- Prismalynx ×2
- Dewimp ×3
- Halofox ×2
- Seraphowl ×2
- Moondormouse ×3
- Crystaltoad ×2
- Silkray ×2
- Luminara — Crown of Grace ×1

## Essence — 18
- Basic Fairy Essence ×14
- Grace Essence ×2
- Halo Essence ×2

## Tactics — 20
- Keeper Elia ×3
- Dancer Suri ×3
- Archivist Faye ×2
- Graceful Exchange ×2
- Purity Bell ×2
- Moonlace ×3
- Prism Ribbon ×2
- Court of Glass ×3

**Excluded pack-only:** Prismoth, Mirror Essence, Reversal Waltz.

Checks:
- 60 cards exactly
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic
- two complete 3→2→2 evolution lines
- no pack-only identity in starter
- Luminara exactly one copy
- no routine per-card Weakness data

---

# FAIRY-08 — Balance questions

1. Does friendly damage movement make defeat too easy to avoid indefinitely?
2. Is Grace Reversal's 20 hostile transfer fair at three Essence?
3. Does Luminara's Starbound create too much effective swing when two 30-point transfers combine with 160 attack damage?
4. Is Fairy's cleansing sufficient to remain playable into Shade despite Shade's global Weakness advantage, without erasing Shade's identity?
5. Do Court of Glass + Crystaltoad produce excessive Shield through repeated damage movement?
6. Is Reversal Waltz's 40 hostile transfer acceptable as pack-only once-per-turn pressure?
7. Does Moondormouse's 10 drain create healthy attrition rather than repetitive stalling?

These are simulation/human-test questions, not reasons to change numbers before testing.

---

## Fairy completion state

**FAIRY CURRENT-RULES DESIGN AUDIT: COMPLETE — 24 / 24 IDENTITIES + EXACT 60-CARD STARTER DESIGNED.**

Fairy is future expansion design only and is not production-registry ready until structured through the consolidated shared schema and balance tested.