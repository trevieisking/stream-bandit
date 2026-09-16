# Stream Bandit TCG — Underworld / Grave Pact V2 Review

**Status:** candidate for Trev approval. No runtime, database, migration, Supabase function or live registry change.

## Product identity

- Element: **Underworld**
- Starter: **Grave Pact**
- Pack: **Underworld Pack**
- Signature Mythic: **Thanavor — Debtbound Sovereign** (card-face display name: **Debtbound Sovereign**)
- Play identity: wounds as resources, vitality drain, sacrifice/discard costs, grave value, hostile wound transfer and defeat pressure.
- Visual identity: necrotic teal, charcoal, bone gold, spectral green, haunted stone.

## Creature rule — enforced

Every Creature uses exactly one of:

- **Ability + Attack 1**
- **Attack 1 + Attack 2**

No Creature in this candidate has Ability + Attack 1 + Attack 2.

Every visible number must be named: HP, Cost, Attack Cost, Damage, Withdraw Cost, Shield, Heal, etc.

## 11 Creatures

| # | Creature | Stage | Rarity | HP | Withdraw | Action shape |
|---|---|---|---|---:|---:|---|
| 1 | Grimling | Baby | Basic | 70 | 1 | Ability + Attack 1 |
| 2 | Cryptjaw | Teen | Rare | 150 | 1 | Ability + Attack 1 |
| 3 | Thanavor — Debtbound Sovereign | Adult | Mythic | 370 | 3 | Ability + Attack 1 |
| 4 | Mire Imp | Baby | Basic | 60 | 0 | Ability + Attack 1 |
| 5 | Graveshade | Teen | Rare | 140 | 1 | Attack 1 + Attack 2 |
| 6 | Requiem Lord | Adult | Extra Rare | 300 | 3 | Attack 1 + Attack 2 |
| 7 | Bone Lantern Hound | Standalone | Basic | 110 | 1 | Ability + Attack 1 |
| 8 | Hollow Revenant | Standalone | Rare | 210 | 3 | Ability + Attack 1 |
| 9 | Mourningray | Standalone | Rare | 160 | 1 | Ability + Attack 1 |
| 10 | Coffincrow | Standalone | Extra Rare | 130 | 0 | Attack 1 + Attack 2 — pack-only |
| 11 | Bloodbasilisk | Standalone | Extra Rare | 290 | 2 | Ability + Attack 1 |

### Headline evolution line A

**Grimling → Cryptjaw → Debtbound Sovereign**

- Grimling: Little Siphon + Bone Nip
- Cryptjaw: Blood Interest + Shadow Bite
- Debtbound Sovereign: Sovereign Debt + Final Collection

### Headline evolution line B

**Mire Imp → Graveshade → Requiem Lord**

- Mire Imp: Grave Nibble + Mire Bite
- Graveshade: Spectral Slash + Wraith Mark
- Requiem Lord: Final Rites + Grave Covenant

## 4 Essence

1. Underworld Essence — Basic
2. Siphon Essence — Rare
3. Debt Essence — Rare
4. Grave Essence — Extra Rare — pack-only

## 9 Tactics

- Collector Vey — Ally — Rare
- Ferryman Korr — Ally — Rare
- Mourner Isa — Ally — Rare
- Blood Contract — Device — Rare
- Debt Ledger — Device — Rare
- Wound Exchange — Device — Extra Rare — pack-only
- Black Chain — Relic — Rare
- Soul Ledger — Relic — Rare
- Hollow Crypt — Realm — Extra Rare

## Pack-only identities

Exactly 3:

- Coffincrow
- Grave Essence
- Wound Exchange

## Exact Grave Pact starter — 60 cards

### Creatures — 22

- Grimling ×3
- Cryptjaw ×2
- Debtbound Sovereign ×1
- Mire Imp ×3
- Graveshade ×2
- Requiem Lord ×2
- Bone Lantern Hound ×3
- Hollow Revenant ×2
- Mourningray ×2
- Bloodbasilisk ×2

### Essence — 18

- Underworld Essence ×14
- Siphon Essence ×2
- Debt Essence ×2

### Tactics — 20

- Collector Vey ×3
- Ferryman Korr ×3
- Mourner Isa ×2
- Blood Contract ×2
- Debt Ledger ×2
- Black Chain ×3
- Soul Ledger ×2
- Hollow Crypt ×3

Checks: **60 total / 21 starter identities / 22 Creature / 18 Essence / 20 Tactic / 1 Mythic / 0 pack-only in starter**.

## Rarity + shine / printing system

Gameplay rarity and cosmetic printing are separate.

- **Basic:** Standard, Shine
- **Rare:** Standard, Shine, Holo
- **Extra Rare:** Standard, Holo, Full-Art Shine, Alt-Art
- **Mythic:** Standard, Holo, Full-Art Shine, Alt-Art, Signature Mythic

A shiny/alternate printing never changes the underlying card rules.

## Artwork rule

Every one of the 24 Underworld gameplay identities has its own dedicated principal artwork target. Alternate-art printings receive an additional dedicated illustration. Shared frames, element icons and finish shaders may be reused.

## Approval question

**Approve Underworld / Grave Pact V2 package: YES / NO**

If YES: translate the candidate into the exact `sb-tcg-card-v0.2` effect/opcode schema and run capability/owner validation before any registry/runtime integration.
