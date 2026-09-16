# Stream Bandit TCG — Canonical Master Plan V2.1

**Plan date:** 2026-09-16  
**Status:** canonical desired-behaviour authority after accepted Fairy + Underworld V2 design packages  
**Historical private-alpha baseline:** `bbde61a3dd50f93b64872a5bccfaec62e826be23` / PR #549  
**V2 visual/battle authority merge:** `29c689fe603d684d4b2cb53c29479f1a88633a79` / PR #556  
**Underworld design merge:** `a61a9795e545ccc50c44e9f5b95c5b0d9e5cc173` / PR #557  
**Fairy design merge:** `16a745a3cf96f6caf00c34ad88896fb0dcca2a73` / PR #558  
**Execution ledger:** `tcg-master-plan-ledger-v2.1.md`  
**Battle interaction contract:** `tcg-battle-client-interaction-v1.json`  
**Card visual / printing contract:** `tcg-card-visual-printing-v1.json`  
**Ten-deck blueprint:** `tcg-ten-deck-product-blueprint-v2.json`  
**Element package target:** `tcg-element-packages-v0.3-v2.json`

## 0. Authority and anti-drift

1. This file defines desired V2 behaviour and scope.
2. The approved uploaded match video defines interaction choreography only; Stream Bandit keeps its own names, rules, art, cards and brand.
3. The ten approved Stream Bandit showcase image families define visual language.
4. Structured card data, not concept-art text, defines exact gameplay numbers/rules.
5. GitHub exact source/PR/commit evidence is repository truth.
6. Supabase project `xzxqfrvqdgkzwujbkdbk` is live/deployed truth.
7. `tcg-master-plan-ledger-v2.1.md` is append-only audit history from this synchronization point.
8. The historical 8-element private-alpha baseline remains true until runtime integration explicitly changes it.

## 1. V2 product target — exact ten-family scope

V2 contains ten elemental deck/pack families:

- Astral — **Second Sky** — Astral Pack
- Ember — **Ashrush** — Ember Pack
- Fairy — **Glimmerwish** — Fairy Pack
- Gale — **Skyshift** — Gale Pack
- Grove — **Wildgrowth** — Grove Pack
- Shade — **Nightbind** — Shade Pack
- Stone — **Unbroken** — Stone Pack
- Tide — **Deep Current** — Tide Pack
- Underworld — **Grave Pact** — Underworld Pack
- Volt — **Live Wire** — Volt Pack

### Exact V2 identity target

Each full element package contains exactly:

- 24 gameplay identities
- 11 Creatures
- 4 Essence
- 9 Tactics
- 3 pack-only identities
- one exact 60-card starter target

Therefore:

- 10 elements × 24 = **240 elemental gameplay identities**
- + **1 Prismatic Founder**
- = **241 total V2 gameplay identities**
- **10 starter decks**, each exactly 60 cards

This resolves the former `TBD` target.

### Runtime honesty

The accepted live/private-alpha runtime still proves only:

- 8 elements
- 193 structured identities
- 8 starters

Fairy and Underworld are now accepted V2 **design/content packages**, but are not yet production registry/runtime packages. Their next step is exact translation into the canonical shared card/effect schema plus owner/capability validation.

## 2. Fairy and Underworld — accepted V2 content authority

### Fairy — Glimmerwish

Accepted source:

- `tcg-fairy-glimmerwish-v2-candidate.json`
- `tcg-fairy-glimmerwish-v2-review.md`

Shape:

- 24 identities
- 11 Creature / 4 Essence / 9 Tactic
- pack-only: Prismoth / Mirror Essence / Reversal Waltz
- exact 60-card `Glimmerwish` starter
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic copies
- signature Mythic: **Moonpetal Empress**

Fairy gameplay identity remains precision protection, cleansing, repositioning, healing amplification, friendly damage redistribution and selective reversal.

### Underworld — Grave Pact

Accepted source:

- `tcg-underworld-grave-pact-v2-candidate.json`
- `tcg-underworld-grave-pact-v2-review.md`

Shape:

- 24 identities
- 11 Creature / 4 Essence / 9 Tactic
- pack-only: Coffincrow / Grave Essence / Wound Exchange
- exact 60-card `Grave Pact` starter
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic copies
- signature Mythic: **Thanavor — Debtbound Sovereign** / display name **Debtbound Sovereign**

Underworld gameplay identity remains wounds-as-resources, vitality drain, sacrifice/discard costs, grave value, hostile damage transfer and defeat-linked pressure.

## 3. Battle-client experience — locked

The battle client must play with the interaction choreography proven by the approved match video while using Stream Bandit's own terminology and assets.

### Board-first layout

- opponent board upper half
- player board lower half
- 1 Vanguard + 4 Reserve positions per player
- 6 Reward Cards per player
- visible Deck + Discard piles
- physical card hand along the lower edge
- compact turn/phase/status information

### Direct manipulation

Support:

- hand Creature → Vanguard/Reserve
- Evolution → valid lower stage
- Essence → valid Creature
- Tactic → board target/selection overlay
- Relic → attached Creature
- Realm → Realm slot
- hover/tap inspect
- legal target/destination highlighting
- touch-friendly tap/select alternative

The client never becomes a duplicate legality/mutation engine.

### Card-context actions

Selecting a legal Creature exposes that card's actions, not generic debug controls:

- Ability when present/legal
- Attack 1
- Attack 2 only for two-attack identities
- Withdraw
- Inspect

### Withdraw / switch choreography

Voluntary Withdraw:

1. select Vanguard
2. choose Withdraw
3. show `Withdraw Cost`
4. highlight legal Reserve replacements
5. select incoming Reserve
6. show exact payment
7. animate outgoing/incoming Creature movement
8. commit through Cost #25 / Payment #26 / Switch #27
9. emit movement/listener context through #29

Card-effect Switch and forced promotion reuse the movement renderer while remaining distinct rule events.

## 4. Locked card presentation

### Creature face

- HP top-left
- type / element top-right
- name + stage/classification identity band
- large dedicated artwork below header
- exactly two action slots below art
- Withdraw Cost bottom-right
- rarity / finish / set markers in frame/footer

### Exactly two action slots

Every Creature uses one of exactly:

1. **Ability + Attack 1**
2. **Attack 1 + Attack 2**

Forbidden:

- Ability + Attack 1 + Attack 2

Every attack renders:

- Attack label
- Attack name
- Attack Cost + Essence icons/types/count
- Damage + value
- effect/rules text

### Named numbers

No ambiguous floating gameplay numbers.

Examples:

- HP 150
- Cost 3
- Attack Cost 2 Fairy
- Damage 60
- Withdraw Cost 2
- Shield 40
- Heal 20

## 5. Rarity, printing and artwork

Gameplay/acquisition rarity:

- Basic
- Rare
- Extra Rare
- Mythic

Approved cosmetic finishes:

- Standard
- Shine
- Holo
- Full-Art Shine
- Alt-Art
- Signature Mythic

Rules:

- finish never changes gameplay power
- one gameplay identity may have multiple printings
- dedicated artwork target exists for every printable gameplay identity
- alternate art may change illustration only
- rarity/finish render through Card Printing / Art Metadata owner #3
- pack acquisition later delegates through Pack owner #37 + Collection #4 + Economy #35

## 6. Architecture invariants

The 40-owner gameplay architecture remains authoritative. No owner #41 is created merely because the UI or content expands.

Critical owners remain:

- Attack #14
- Active Ability #15
- Tactic #16
- Relic #17
- Realm #18
- Essence Attachment #22
- Cost #25
- Payment #26
- Atomic Switch / Battlefield Position #27
- Movement Listener #29
- Card-Zone / Draw / Shuffle / Discard #30
- Reward Cards #32
- Hidden Information #33
- Card Printing / Art Metadata #3
- Pack #37

Fairy and Underworld must consume shared owners/opcodes. Do not add element-name branches or per-card helper engines for ordinary mechanics.

## 7. V2 gates

### V2-G0 — Scope/design authority — COMPLETE ✅

Proven:

- ten deck/pack families accepted
- Fairy/Underworld package scope explicit
- exact target fixed at 241 identities / 10 starters
- visual card contract accepted
- battle interaction contract accepted
- rarity/printing contract accepted

### V2-G1 — Ten structured packages / ten starters — IN PROGRESS 🔎

Current state:

- eight original packages: structured/runtime-proven
- Fairy: 24/24 V2 design candidate accepted; exact canonical schema translation pending
- Underworld: 24/24 V2 design candidate accepted; exact canonical schema translation pending

Pass when all 241 identities are represented by canonical structured data and all ten exact 60-card recipes validate.

### V2-G2 — Reusable card renderer — NOT STARTED

Pass when all card families render from structured data using the locked showcase visual language, named numbers and printing finishes.

### V2-G3 — Battle Client Shell — NOT STARTED

Pass when the board reproduces the approved video choreography using Stream Bandit terminology and visual assets.

### V2-G4 — Engine integration — NOT STARTED

Pass when the new client delegates gameplay actions to existing canonical owners with no duplicate browser rule engine.

### V2-G5 — Printing / collection / deck UX — NOT STARTED

Pass when multiple printings can represent one gameplay identity and Collection/Deck UI can inspect/filter/select them.

### V2-G6 — Real two-user end-to-end — HOLD

Requires two authenticated users to complete a real match on the new Battle Client and prove setup, hidden information, actions, Withdraw/switch, Rewards, defeat/promotion and terminal rewards.

### V2-G7 — live/public promotion — HOLD 🔒

No public V2 promotion until the preceding gates are satisfied.

## 8. Locked implementation order from this checkpoint

1. Translate Fairy and Underworld accepted V2 design packages into exact `sb-tcg-card-v0.2` / effect-opcode data.
2. Validate both packages against the existing 40-owner capability model.
3. Produce exact ten-package / ten-starter canonical registries and deterministic total = 241.
4. Update registry builders/validators without element-name branching.
5. Build reusable card renderer from structured data.
6. Build printing/finish renderer.
7. Replace the lab layout with the board-first Battle Client shell.
8. Connect setup/direct manipulation/search/choice overlays.
9. Connect Ability/Attack/Withdraw card-context actions.
10. Connect Rewards/defeat/promotion/victory presentation.
11. Run real two-user V2 end-to-end.
12. Repair only proven owner-scoped defects.

## 9. Current progress

- Historical private-alpha backend: ✅ 8 / 193 / 8
- V2 ten-family visual/product direction: ✅
- Video interaction authority: ✅
- Rarity + finish contract: ✅
- Fairy V2 design package: ✅ 24/24 + 60/60
- Underworld V2 design package: ✅ 24/24 + 60/60
- V2 exact target: ✅ 241 identities / 10 starters
- V2-G0: ✅ COMPLETE
- Fairy shared-schema translation: 🔎 NEXT
- Underworld shared-schema translation: 🔎 NEXT
- V2-G1: 🔎 IN PROGRESS
- New card renderer: ☐
- New Battle Client: ☐
- New two-user E2E: ☐
- Public V2 promotion: 🔒 HOLD
