# Stream Bandit TCG — Fairy / Glimmerwish V2 Review

**Purpose:** reconcile the already-complete Fairy current-rules audit with the approved V2 visual/product direction without changing runtime or production.

## Package result

- 24 identities exactly
- 11 Creatures
- 4 Essence
- 9 Tactics
- 3 pack-only identities
- exact 60-card `Glimmerwish` starter
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic cards
- 1 signature Mythic copy

## Approved V2 showcase reconciliation

The approved visual names are now the front of the package:

- `Pixlet -> Glimmerspry -> Moonpetal Empress`
- `Wishbud -> Radiant Nymph -> Petalqueen`
- `Charm of Grace`
- `Fairy Essence`
- `Heartbloom Charm`
- `Silverpetal Grove`

Historical mechanics from `tcg-future-fairy-audit.md` are retained and redistributed across the V2 names rather than discarded.

## Fairy gameplay identity retained

Fairy remains about:

- precise friendly damage redistribution;
- cleansing and condition protection;
- graceful switch/repositioning;
- healing amplification;
- selective reversal of accumulated damage;
- enchanted prevention rather than generic raw healing.

This keeps Fairy distinct from Grove and Tide.

## Creature action-shape validation

All 11 Creature identities use exactly one V2 shape:

- `Ability + Attack 1`, or
- `Attack 1 + Attack 2`.

No Creature uses `Ability + Attack 1 + Attack 2`.

## Pack-only identities

- Prismoth
- Mirror Essence
- Reversal Waltz

They are excluded from the starter.

## Exact starter recipe

### Creatures — 22
- Pixlet x3
- Glimmerspry x2
- Moonpetal Empress x1
- Wishbud x3
- Radiant Nymph x2
- Petalqueen x2
- Moondormouse x3
- Crystaltoad x2
- Silkray x2
- Luminara x2

### Essence — 18
- Fairy Essence x14
- Grace Essence x2
- Halo Essence x2

### Tactics — 20
- Charm of Grace x3
- Dancer Suri x3
- Archivist Faye x2
- Graceful Exchange x2
- Purity Bell x2
- Heartbloom Charm x3
- Prism Ribbon x2
- Silverpetal Grove x3

## Visual / printing contract

- dedicated artwork target for every identity;
- rarity = Basic / Rare / Extra Rare / Mythic;
- finish = Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic;
- finish never changes gameplay rules;
- every visible gameplay number must render with a named property;
- final card face uses HP top-left, type/element top-right, large art, two action slots, Withdraw Cost bottom-right.

## Scope boundary

This candidate does **not** change the production registry, database, starter grant, runtime, Edge functions, Supabase, or live page. The next implementation step after V2 content synchronization is translation into exact shared `sb-tcg-card-v0.2` / effect-opcode data and owner-capability validation.