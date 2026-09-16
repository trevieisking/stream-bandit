# Stream Bandit TCG — Master Plan V2.1 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.1.md`  
**Historical V2 ledger:** `tcg-master-plan-ledger-v2.md`  
**Historical runtime ledger:** `tcg-master-plan-ledger.md`  
**Owner-family baseline:** 40  
**Ledger revision:** V2.1-2 — 2026-09-16

## Rules

- This file continues the V2 audit trail; it does not rewrite older ledgers.
- GitHub exact commit/PR/comment evidence is repository truth.
- Supabase is live/deployed truth.
- The 8 / 193 / 8 private-alpha baseline remains historical truth until runtime integration changes it.
- Concept images define visual direction, not exact rules authority.
- Structured data defines card rules/numbers.
- UI code never becomes a duplicate gameplay mutation owner.
- The approved uploaded match video defines interaction choreography; Stream Bandit retains original names, rules, art, cards and brand.
- Drag/drop, glow/highlighting and animation are client presentation/input contracts only; legal actions and state changes remain server-authoritative.

## Continuity checkpoint

V2 visual/battle authority was accepted through PR #556 at merge:

`29c689fe603d684d4b2cb53c29479f1a88633a79`

That checkpoint locked:

- ten deck/pack visual families
- uploaded match video as interaction choreography reference
- Creature action shapes = Ability + Attack 1 OR Attack 1 + Attack 2
- named numeric properties
- Basic / Rare / Extra Rare / Mythic
- Standard / Shine / Holo / Full-Art Shine / Alt-Art / Signature Mythic
- dedicated artwork target on every printable identity
- 40-owner architecture retained

## V2.1 transactions

### V2.1-001 — Underworld / Grave Pact design package accepted

**State:** ✅ accepted design/content authority

PR: #557  
Candidate head: `0e59b4affebb648829cdfc9f0e1e325917e0de40`  
Merge SHA: `a61a9795e545ccc50c44e9f5b95c5b0d9e5cc173`

Accepted files:

- `tcg-underworld-grave-pact-v2-candidate.json`
- `tcg-underworld-grave-pact-v2-review.md`

Accepted shape:

- 24 identities
- 11 Creature / 4 Essence / 9 Tactic
- 3 pack-only identities
- exact 60-card Grave Pact starter
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic copies
- signature Mythic: Thanavor — Debtbound Sovereign
- every Creature obeys the two-action-slot V2 rule

Safety boundary:

- no runtime
- no registry integration
- no migration
- no Edge function
- no Supabase deployment
- no live page change

### V2.1-002 — Fairy / Glimmerwish design package accepted

**State:** ✅ accepted design/content authority

PR: #558  
Candidate head: `e01ebd35a82750d7429d452c91c1a72a4c17681b`  
Merge SHA: `16a745a3cf96f6caf00c34ad88896fb0dcca2a73`

Accepted files:

- `tcg-fairy-glimmerwish-v2-candidate.json`
- `tcg-fairy-glimmerwish-v2-review.md`

Accepted shape:

- 24 identities
- 11 Creature / 4 Essence / 9 Tactic
- 3 pack-only identities
- exact 60-card Glimmerwish starter
- 21 starter identities
- 22 Creature / 18 Essence / 20 Tactic copies
- signature Mythic: Moonpetal Empress
- every Creature obeys the two-action-slot V2 rule

Safety boundary:

- no runtime
- no registry integration
- no migration
- no Edge function
- no Supabase deployment
- no live page change

### V2.1-003 — Exact ten-family identity target resolved

**State:** ✅ accepted planning arithmetic

Evidence:

- historical 8 elemental packages = 8 × 24 = 192 elemental identities
- Fairy accepted = 24 identities
- Underworld accepted = 24 identities
- V2 elemental total = 10 × 24 = 240
- Prismatic Founder remains 1 separate special identity

Therefore:

- **240 elemental identities**
- **+ 1 Prismatic Founder**
- **= 241 total V2 gameplay identities**
- **10 exact 60-card starter targets**

This replaces the earlier `TBD_AFTER_COMPLETE_FAIRY_AND_UNDERWORLD_REGISTRIES` planning value.

### V2.1-004 — V2-G0 closed

**State:** ✅ COMPLETE

V2-G0 now has:

- ten approved deck/pack families
- explicit Fairy + Underworld scope
- exact total target 241
- accepted visual card contract
- accepted battle interaction contract
- accepted rarity/printing contract

No further design-scope work is required before structured-schema translation.

### V2.1-005 — V2-G1 becomes the active work lane

**State:** 🔎 IN PROGRESS

Current truth:

- Astral / Ember / Gale / Grove / Shade / Stone / Tide / Volt: canonical structured/runtime-proven package sources already exist
- Fairy: accepted V2 design package; canonical `sb-tcg-card-v0.2` translation pending
- Underworld: accepted V2 design package; canonical `sb-tcg-card-v0.2` translation pending

Locked operation from that checkpoint:

1. translate Fairy to exact shared schema/effect opcodes;
2. translate Underworld to exact shared schema/effect opcodes;
3. validate both against existing owners/capabilities;
4. produce one ten-package deterministic registry + ten exact starter authority;
5. do not change live/runtime until that evidence is complete.

### V2.1-006 — Creature cards accepted as the Battle Client action surface

**State:** ✅ accepted / merged

PR: #560  
Reviewed candidate head: `a3b6c044368184e6b5e10bbc40f44cf9e642c876`  
Merge SHA: `019b029f344bac3c4efdc92480cdff5c9c2c5521`  
Exact-head gate: **TCG Card Pass 2 Validation #570 SUCCESS**

Accepted files:

- `tcg-v2-card-action-controller-v1.json`
- `tcg-v2-g1-card-controller-capability-audit.md`
- `tcg/tests/card-pass-2-v2-card-controller-contract.test.mjs`

Accepted contract:

- the real rendered Creature card is the primary battle action surface
- attacks submit through existing `action=attack` + `attack_slot=1|2`
- active Abilities submit through existing `action=use_ability`
- Withdraw submits through existing `action=withdraw`
- triggered/automatic Abilities do not create fake manual buttons
- 17 of the 22 new Fairy/Underworld Creatures use `Ability + Attack 1`
- 5 use `Attack 1 + Attack 2`
- 0 use three action slots
- the browser remains presentation/input only; server owners determine legality and mutation

Capability audit truth recorded at acceptance:

- 8 new active Ability designs total
- 3 match directly proven existing live Ability families
- 5 require generic dispatcher/recognizer extensions
- underlying semantic owners already exist
- no owner family #41 is justified

Safety boundary:

- no runtime source changed
- no registry integration
- no migration
- no Edge Function/Supabase deployment
- no live/public Battle Client change

### V2.1-007 — Video-style direct manipulation and turn choreography locked into the canonical plan

**State:** ✅ desired behaviour LOCKED

Authority:

- approved uploaded match-video choreography
- existing machine-readable `tcg-battle-client-interaction-v1.json`
- explicit user clarification on 2026-09-16

Locked direct-manipulation rules:

- every card played from hand should support drag/drop to its legal board slot, target or attachment destination on desktop
- touch/accessibility alternative remains tap/select → destination
- Creature → legal Vanguard/Reserve slot
- Evolution → legal lower-stage Creature stack
- Essence → Creature the player wishes to attach it to
- Tactic → legal target/selection overlay
- Relic → legal Creature attachment
- Realm → Realm slot
- future card types reuse the same generic legal-target choreography rather than bespoke browser rule engines

Locked Evolution visual cue:

- when an Evolution card is picked up/dragged, all Creatures it can legally evolve **light/glow green**
- illegal Creature stacks remain unlit/blocked
- the green state must be derived from authoritative legal evolution targets

Locked Realm lifecycle:

- Realm remains present after it is played
- Realm persists across turn changes
- Realm leaves only when another legal Realm is played over/replaces it or a card/effect explicitly discards/removes it
- Realm lifecycle remains owned by Realm #18 and canonical movement/Card-Zone rules

Locked Essence choreography:

- Essence is physically dragged/selected onto the intended Creature
- legal friendly Creature targets highlight
- successful attachment animates into the Creature's visible Essence stack
- browser does not invent resource legality

Locked Ability timing:

- manually activated Creature Abilities are normally **once during your turn**
- structured card text/data may explicitly define a different limit/timing
- triggered/passive/continuous Abilities follow their own events rather than the manual once-per-turn rule
- UI displays used/locked state where appropriate; server Active Ability/timing owners enforce it

Locked Attack turn rule:

- the Vanguard card supplies Attack 1 / Attack 2 selection
- server validates cost/legality
- attack resolves its canonical printed effects, damage, listeners, defeat, Rewards/promotion consequences and Aftermath
- once resolution/Aftermath completes, the attacker's turn **ends automatically**
- no extra generic End Turn click is required after a completed attack unless a future explicit authoritative rule creates an exception

Video choreography copied into the plan also includes:

- board-first opponent-top/player-bottom layout
- physical hand along lower edge
- 1 Vanguard + 4 Reserve slots per player
- 6 Reward Cards per player
- visible Deck + Discard
- hover/tap inspect and selected-card enlargement/focus
- legal destination glow and invalid-reason feedback
- setup placement/ready flow
- Tactic effect previews and private-choice overlays
- search/select carousel/grid while preserving board context
- voluntary Withdraw and animated Vanguard/Reserve switching
- effect-driven switches reusing the same movement renderer without changing action semantics
- defeat animation + forced promotion highlighting
- Reward overlay/animation
- damage number + HP delta
- Shield delta
- Condition badge/state/timer
- visible attached Essence stack
- Relic attachment badge
- persistent Realm presence
- listener/trigger notices where player-visible
- turn banner and opponent pending-choice/thinking state
- terminal victory/defeat + one-time match reward presentation
- reduced-motion, keyboard-focus and text-legality accessibility path

Forbidden client patterns remain:

- browser prompts for normal gameplay targeting
- duplicate browser rules engine
- generic global Attack buttons as primary attack UI
- hidden-opponent-card leakage
- debug-form layout as the release battlefield

### V2.1-008 — Night-stop checkpoint / next restart point

**State:** 🌙 STOP AFTER DOCUMENTATION SYNC

No runtime/Supabase/live work is required after this ledger/master-plan synchronization tonight.

Locked restart order:

1. continue Fairy + Underworld `sb-tcg-card-v0.2` translation under V2-G1;
2. validate new Creature effects/active Ability shapes against existing 40 owners;
3. extend only proven generic dispatcher gaps;
4. finish 241-card / ten-starter deterministic canonical registry;
5. then build reusable card renderer;
6. then build the video-style Battle Client from the complete interaction section now preserved in the master plan.

## Current tracker

| Area | State |
|---|---|
| Private-alpha backend 8/193/8 | ✅ historical/live baseline |
| V2 visual/product families | ✅ 10/10 |
| Fairy design identities | ✅ 24/24 |
| Fairy starter | ✅ 60/60 design |
| Underworld design identities | ✅ 24/24 |
| Underworld starter | ✅ 60/60 design |
| V2 total target | ✅ 241 |
| V2-G0 | ✅ COMPLETE |
| Creature card-controller contract | ✅ PR #560 merged |
| Playable-card drag/drop | ✅ LOCKED |
| Green Evolution target glow | ✅ LOCKED |
| Persistent Realm lifecycle | ✅ LOCKED |
| Active Ability normally once/turn | ✅ LOCKED |
| Attack automatically ends turn | ✅ LOCKED |
| Full video choreography in canonical plan | ✅ LOCKED |
| Fairy canonical schema | 🔎 NEXT |
| Underworld canonical schema | 🔎 NEXT |
| V2-G1 | 🔎 IN PROGRESS |
| Card renderer | ☐ |
| Battle Client | ☐ |
| Two-user V2 E2E | ☐ |
| Public V2 promotion | 🔒 HOLD |
