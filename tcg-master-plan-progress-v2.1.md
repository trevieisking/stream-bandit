# Stream Bandit TCG — Canonical Master Plan V2.1

**Plan date:** 2026-09-16  
**Status:** canonical desired-behaviour authority after accepted Fairy + Underworld V2 design packages and the accepted V2 Creature card-controller contract  
**Historical private-alpha baseline:** `bbde61a3dd50f93b64872a5bccfaec62e826be23` / PR #549  
**V2 visual/battle authority merge:** `29c689fe603d684d4b2cb53c29479f1a88633a79` / PR #556  
**Underworld design merge:** `a61a9795e545ccc50c44e9f5b95c5b0d9e5cc173` / PR #557  
**Fairy design merge:** `16a745a3cf96f6caf00c34ad88896fb0dcca2a73` / PR #558  
**V2 card-controller merge:** `019b029f344bac3c4efdc92480cdff5c9c2c5521` / PR #560  
**Execution ledger:** `tcg-master-plan-ledger-v2.1.md`  
**Battle interaction contract:** `tcg-battle-client-interaction-v1.json`  
**Card visual / printing contract:** `tcg-card-visual-printing-v1.json`  
**Card-controller contract:** `tcg-v2-card-action-controller-v1.json`  
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
9. Battle-client interaction must remain server-authoritative. Drag/drop, highlighting and animation are presentation/input choreography; they never become duplicate gameplay-rule ownership.
10. The accepted card-controller contract means the real rendered Creature card is the primary Ability / Attack / Withdraw control surface.

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

## 3. Battle-client experience — LOCKED VIDEO-STYLE CHOREOGRAPHY

The Battle Client must reproduce the approved match-video interaction choreography while using Stream Bandit's own terminology, card designs, art and rules. The canonical `tcg-battle-client-interaction-v1.json` remains the machine-readable interaction reference; this section carries the same behaviour directly in the master plan so future work cannot lose it.

### 3.1 Board-first layout

- opponent board occupies the upper half
- player board occupies the lower half
- 1 Vanguard + 4 Reserve positions per player
- 6 Reward Cards per player
- visible Deck + Discard piles
- physical card hand along the lower edge
- active Realm presence/slot remains visible
- compact turn / phase / status information
- the board remains visible while private choices, searches or target selections are open whenever practical

### 3.2 Primary input model — direct manipulation first

All cards that are **played from hand** should support drag/drop onto their legal destination, target or board slot on desktop. Tap/select → destination remains the touch/accessibility alternative.

Required direct-manipulation paths:

- Creature from hand → legal Vanguard/Reserve slot
- Evolution Creature → legal lower-stage Creature stack
- Essence → legal Creature attachment target
- Tactic → legal target, board target or effect-selection overlay
- Relic → legal Creature attachment target
- Realm → active Realm slot
- other future playable card types → their legal target/zone through the same generic legality/highlight model

While dragging or picking up a playable card:

- legal destinations/targets visibly highlight
- invalid destinations remain blocked and may show a text legality reason
- dropping on a legal destination submits the canonical server action
- the client never mutates authoritative state optimistically as if legality were browser-owned

### 3.3 Opening/setup choreography

The video-style opening flow remains:

1. opening choice/toss result
2. opening hand presentation
3. place Vanguard
4. place legal Reserve Creatures
5. confirm/ready setup
6. install/show six Reward Cards
7. transition into ordinary turn play without replacing the board with a debug/form screen

### 3.4 Creature play and evolution

Playing a Creature:

1. pick up/select Creature from hand
2. legal Vanguard/Reserve slots glow/highlight
3. drop/select destination
4. server validates placement
5. card animates from hand into the chosen slot

Evolution:

1. pick up/select the Evolution card
2. every Creature it can legally evolve **lights/glows green**
3. illegal Creature stacks remain unlit/blocked
4. drop/select the legal lower-stage Creature
5. server validates the exact evolution
6. animate the Evolution card onto the Creature stack
7. preserve stack/history for authoritative rules

Green evolution highlighting is a locked visual cue.

### 3.5 Essence attachment

Essence is played by dragging/selecting it onto the Creature you want to attach it to.

Flow:

1. pick up/select Essence from hand
2. legal friendly Creature targets highlight
3. drop/select the Creature
4. server validates attachment/payment/limits
5. animate Essence into that Creature's visible attachment stack
6. update costs/legality from authoritative server state

Essence is not a detached generic resource button; the physical card-to-Creature interaction is the primary UI.

### 3.6 Tactics, Relics and Realms

**Tactic**

- drag/select the Tactic from hand
- show its effect preview/requirements
- highlight legal targets or open the required choice overlay
- resolve private choices without hiding the battlefield unnecessarily
- server commits the effect
- animate the resolved result and send the resolving Tactic to its canonical destination

**Relic**

- drag/select the Relic onto a legal Creature
- render a persistent Relic attachment badge/visual
- Relic lifecycle remains owned by Relic/Card-Zone rules, not the browser

**Realm**

- drag/select the Realm into the Realm slot
- a played Realm **remains in play** until either:
  - another legal Realm is played over/replaces it, or
  - another card/effect explicitly discards/removes it
- the Realm must not disappear merely because a turn ends
- Realm persistence/removal remains owned by Realm #18 plus the canonical movement/Card-Zone owners

### 3.7 Card inspection and Creature card-controller actions

Hover/tap/selecting a Creature should lift/enlarge/focus the real rendered card while keeping battlefield context understandable.

The Creature card itself exposes its legal contextual controls:

- Ability when the structured Ability is active and currently legal
- Attack 1
- Attack 2 only for identities whose two-slot shape is `Attack 1 + Attack 2`
- Withdraw
- Inspect

The accepted two-slot rule remains exact:

- **Ability + Attack 1**, or
- **Attack 1 + Attack 2**

Never `Ability + Attack 1 + Attack 2`.

Triggered/continuous Abilities remain printed/visible on the card but do not manufacture a manual Ability button.

### 3.8 Active Ability timing

Default rule for manually activated Creature Abilities:

- normally **once during your turn**
- the card's structured rule may explicitly state a different limit/timing
- triggered, passive and continuous Abilities follow their own event/timing rules rather than the once-per-turn manual activation rule
- after use, the card/UI must visibly show that the Ability is spent/locked for the relevant duration when appropriate
- legality, use receipts and limits are server-authoritative through Active Ability #15 and existing timing/limit owners

### 3.9 Attack choreography — attack ends the turn

The Vanguard Creature card is the normal attack source.

Attack flow:

1. select/enlarge Vanguard Creature
2. choose Attack 1 or Attack 2 from that card
3. show exact Attack Cost
4. resolve any required target/choice
5. server validates attack legality and payment
6. animate payment
7. animate the attack
8. resolve the attack's canonical printed effects and damage
9. show damage numbers, HP delta, Shield/Condition/listener results
10. scan defeat, Reward/promotion consequences and Aftermath
11. **automatically end the attacker's turn** once the attack resolution/Aftermath is complete

There is no required extra generic **End Turn** click after a completed attack. An attack is the turn-ending action unless a specific authoritative rule explicitly says otherwise.

### 3.10 Withdraw / switch choreography

Voluntary Withdraw:

1. select Vanguard
2. choose Withdraw from that card
3. show `Withdraw Cost`
4. highlight legal Reserve replacements
5. select incoming Reserve
6. show exact payment
7. animate outgoing/incoming Creature movement
8. commit through Cost #25 / Payment #26 / Switch #27
9. emit movement/listener context through #29

Card-effect Switch and forced promotion reuse the movement renderer while remaining distinct rule events.

### 3.11 Search, hidden choices and target overlays

For deck/hand/discard/Reward searches or multi-card choices:

- keep the battlefield visible where practical
- open a card carousel or grid rather than browser prompts
- show the requirement, legal set and selected count
- hide information the viewer is not entitled to see
- confirm the choice through the authoritative server route
- return cleanly to the same board state without replaying the originating action

### 3.12 Reward, defeat and promotion presentation

- defeated Creature receives a clear defeat animation/state transition
- if a Vanguard is defeated, legal Reserve promotion candidates highlight
- forced promotion animates the selected Reserve into Vanguard
- Reward selection uses a dedicated overlay with face-down Reward positions
- selected Rewards animate to the authoritative destination
- match terminal state shows final board/result, victory/defeat and one-time match rewards
- terminal UI may offer rematch/exit without mutating the completed match

### 3.13 Required visual feedback from the approved video choreography

The Battle Client must include or preserve equivalent feedback for:

- legal destination/target glow
- **green legal-evolution glow**
- invalid-destination explanation
- selected-card lift/focus/enlargement
- damage number + HP delta
- Shield delta
- Condition badge/timer/state
- attached Essence visual stack
- Relic attachment badge
- persistent Realm presence
- listener/trigger notice where player-visible
- turn banner/active-player feedback
- opponent thinking / pending-choice state
- smooth movement between hand, Vanguard, Reserve, Discard, Deck/Reward-related destinations
- touch-friendly tap/select alternative
- reduced-motion/keyboard/text-legality accessibility path

### 3.14 Forbidden release-client patterns

Do not ship:

- browser prompts for normal gameplay targeting
- a duplicate browser rules engine
- generic global Attack buttons as the primary attack UI
- hidden opponent-card leakage
- debug-form layout as the release battlefield
- card plays that bypass the drag/select → legal-target → server-validate choreography

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

Interaction-specific ownership locks:

- drag/drop is input choreography, not rule authority
- green evolution highlighting comes from server-proven legal evolution targets
- attack auto-end-turn is coordinated through the canonical Attack/turn-lifecycle path, not a browser-only timer
- Ability once-per-turn limits come from structured Ability data and server receipts
- Realm persistence/replacement/removal is owned by Realm + Card-Zone/movement rules

## 7. V2 gates

### V2-G0 — Scope/design authority — COMPLETE ✅

Proven:

- ten deck/pack families accepted
- Fairy/Underworld package scope explicit
- exact target fixed at 241 identities / 10 starters
- visual card contract accepted
- battle interaction contract accepted
- rarity/printing contract accepted
- Creature card-controller contract accepted

### V2-G1 — Ten structured packages / ten starters — IN PROGRESS 🔎

Current state:

- eight original packages: structured/runtime-proven
- Fairy: 24/24 V2 design candidate accepted; exact canonical schema translation pending
- Underworld: 24/24 V2 design candidate accepted; exact canonical schema translation pending
- Fairy/Underworld 22-Creature card-controller contract: accepted on `main` through PR #560

Pass when all 241 identities are represented by canonical structured data and all ten exact 60-card recipes validate.

### V2-G2 — Reusable card renderer — NOT STARTED

Pass when all card families render from structured data using the locked showcase visual language, named numbers and printing finishes.

### V2-G3 — Battle Client Shell — NOT STARTED

Pass when the board reproduces the approved video choreography using Stream Bandit terminology and visual assets, including universal playable-card drag/drop, green evolution highlighting, card-context controls, persistent Realm presentation and attack-as-turn-ending choreography.

### V2-G4 — Engine integration — NOT STARTED

Pass when the new client delegates gameplay actions to existing canonical owners with no duplicate browser rule engine, including server-derived legal drag/drop targets, Ability use limits and attack turn completion.

### V2-G5 — Printing / collection / deck UX — NOT STARTED

Pass when multiple printings can represent one gameplay identity and Collection/Deck UI can inspect/filter/select them.

### V2-G6 — Real two-user end-to-end — HOLD

Requires two authenticated users to complete a real match on the new Battle Client and prove setup, hidden information, drag/drop card play, Evolution highlighting, Essence attachment, Tactic/Realm/Relic play, Abilities, Attack auto-turn-end, Withdraw/switch, Rewards, defeat/promotion and terminal rewards.

### V2-G7 — live/public promotion — HOLD 🔒

No public V2 promotion until the preceding gates are satisfied.

## 8. Locked implementation order from this checkpoint

1. Translate Fairy and Underworld accepted V2 design packages into exact `sb-tcg-card-v0.2` / effect-opcode data.
2. Validate both packages against the existing 40-owner capability model.
3. Produce exact ten-package / ten-starter canonical registries and deterministic total = 241.
4. Update registry builders/validators without element-name branching.
5. Build reusable card renderer from structured data.
6. Build printing/finish renderer.
7. Build the board-first Battle Client shell from the complete interaction choreography in section 3.
8. Connect opening setup + universal drag/drop card play + server-derived legal-target highlighting.
9. Connect Evolution stacking + green legal-evolution glow.
10. Connect Essence/Tactic/Relic/Realm direct manipulation and persistent Realm lifecycle presentation.
11. Connect card-context Ability/Attack/Withdraw actions.
12. Enforce/display default once-per-turn active Ability usage unless structured rules say otherwise.
13. Connect attack resolution through automatic turn completion after Aftermath.
14. Connect search/private-choice overlays while keeping board context.
15. Connect Rewards/defeat/promotion/victory presentation.
16. Run real two-user V2 end-to-end.
17. Repair only proven owner-scoped defects.

## 9. Current progress

- Historical private-alpha backend: ✅ 8 / 193 / 8
- V2 ten-family visual/product direction: ✅
- Video interaction authority: ✅
- Full video choreography copied into canonical master plan: ✅
- Rarity + finish contract: ✅
- Fairy V2 design package: ✅ 24/24 + 60/60
- Underworld V2 design package: ✅ 24/24 + 60/60
- V2 exact target: ✅ 241 identities / 10 starters
- V2 Creature card-controller contract: ✅ merged PR #560 / `019b029f344bac3c4efdc92480cdff5c9c2c5521`
- Universal playable-card drag/drop rule: ✅ LOCKED
- Green legal-Evolution highlighting: ✅ LOCKED
- Realm persistence until replacement/effect removal: ✅ LOCKED
- Active Ability default once/turn unless stated otherwise: ✅ LOCKED
- Attack resolves then automatically ends turn: ✅ LOCKED
- V2-G0: ✅ COMPLETE
- Fairy shared-schema translation: 🔎 NEXT
- Underworld shared-schema translation: 🔎 NEXT
- V2-G1: 🔎 IN PROGRESS
- New card renderer: ☐
- New Battle Client: ☐
- New two-user E2E: ☐
- Public V2 promotion: 🔒 HOLD
