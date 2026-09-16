# Stream Bandit TCG — Master Plan V2 Execution Ledger

**Plan authority:** `tcg-master-plan-progress-v2.md`  
**Historical runtime ledger:** `tcg-master-plan-ledger.md`  
**Historical private-alpha baseline:** `bbde61a3dd50f93b64872a5bccfaec62e826be23`  
**Owner-family baseline:** 40  
**Ledger revision:** V2-1 — 2026-09-16  

## Rules

- This V2 ledger is append-only from the V2 decision point.
- It does not rewrite the historical 8-element private-alpha ledger.
- The historical 40 mechanic owners remain valid until exact evidence proves an owner change is necessary.
- UI/visual systems do not become gameplay mutation owners merely because they are new components.
- Every V2 implementation slice must identify the existing mechanic owner(s) it projects/calls.
- GitHub exact source/PR/comments remain source truth; Supabase remains live truth.
- Concept images define visual direction, not exact rules text or numeric gameplay authority.

## V2 design transactions

### V2-001 — First real two-user match exposed a Battle Client surface defect

**State:** ✅ accepted design finding

Evidence/context:

- PR #549 private-alpha baseline reached `main` at `bbde61a3dd50f93b64872a5bccfaec62e826be23`.
- The first real player-facing test proved substantial backend/game-state capability but the `t.html` surface behaves as a developer/lab harness rather than the intended physical-card tabletop client.
- This does not by itself reopen every backend owner.

Decision:

- Preserve accepted server-authoritative owners.
- Replace the player-facing battle shell with a board-first card interaction client.
- Any actual attack/ability/runtime defect must still be proven separately before changing its mechanic owner.

### V2-002 — Uploaded match video becomes interaction choreography authority

**State:** ✅ locked

Reference: `Dar match up test deck(1).mp4` supplied by Trev on 2026-09-16.

Observed interaction patterns adopted for Stream Bandit:

- coin/opening setup presentation;
- board-first active/bench-style placement, mapped to Vanguard/Reserve;
- cards visually move from hand to board;
- resource/Essence attachment is card-to-card interaction;
- board remains visible during searches/selections;
- searched cards use a visual carousel/grid with explicit confirm;
- enlarged card inspection exposes card actions;
- attack/ability resolution visibly affects board state;
- Reward/Prize-style choice is visual and positional;
- turn handoff and terminal victory state are explicit.

Stream Bandit keeps original names, art, rules, branding and board geometry. No external franchise assets are adopted.

### V2-003 — Ten approved Stream Bandit visual families

**State:** ✅ locked visual direction

Approved families:

1. Ember / Ashrush
2. Tide / Deep Current
3. Grove / Wildgrowth
4. Volt / Live Wire
5. Stone / Unbroken
6. Gale / Skyshift
7. Shade / Nightbind
8. Astral / Second Sky
9. Fairy / Glimmerwish
10. Underworld / Grave Pact

Decision:

- The supplied/approved showcase images define visual hierarchy, palette, frame language, premium art direction, starter-box and pack presentation.
- Every printable gameplay card targets dedicated artwork.
- Runtime text must be rendered from structured data; concept-art lettering is never rules authority.

### V2-004 — Creature card action-slot contract

**State:** ✅ locked

Every Creature displays exactly two action slots:

- `Ability + Attack 1`, **or**
- `Attack 1 + Attack 2`.

Forbidden: `Ability + Attack 1 + Attack 2` on the same Creature.

Every attack must expose named fields for attack name, Attack Cost, Damage and effect text. Withdraw Cost remains bottom-right in the card face/inspector.

Owner impact:

- No new mechanic owner.
- Attack behaviour remains #14.
- Active Ability remains #15.
- Cost/Payment remain #25/#26.
- Card content/registry remains #1.

### V2-005 — Named numeric-property rule

**State:** ✅ locked

The release renderer must not show unexplained gameplay numbers.

Expected rendering examples:

- `HP 150`
- `Cost 3`
- `Attack Cost 2 Ember`
- `Damage 60`
- `Withdraw Cost 2`
- `Shield 40`
- `Heal 20`

A globally standardized icon may visually abbreviate a property only when the accessible/inspection form still provides the property name.

### V2-006 — Rarity and printing/shine are independent axes

**State:** ✅ locked

Gameplay/acquisition rarity:

- Basic
- Rare
- Extra Rare
- Mythic

Cosmetic printing/finish:

- Standard
- Shine
- Holo
- Full-Art Shine
- Alt-Art
- Signature Mythic

A Shine/Holo/Alt-Art copy does **not** become stronger than the same gameplay identity in Standard finish.

Owner impact:

- Card Printing / Art Metadata #3 owns printing/art identity.
- Collection #4 owns player copies.
- Deck legality #6 reasons over gameplay identities/allowed copies, not cosmetic strength.
- Pack #37 will own pack definition/odds/opening when implemented.

### V2-007 — Fairy and Underworld return to desired product scope

**State:** ✅ scope decision / 🔎 content implementation pending

Decision:

- Fairy / Glimmerwish and Underworld / Grave Pact are no longer merely archived concept notes in V2 desired behaviour.
- They are target deck/pack families alongside the existing eight.
- The historical private-alpha baseline remains 8 elements / 193 identities / 8 starters until new registries actually land.
- Exact new total identity count remains `TBD` until complete Fairy/Underworld structured registries are approved.

Consequence:

- Old G0/G1 completion applies only to the historical private-alpha baseline.
- V2-G0/V2-G1 are reopened for ten-family scope and content proof.

### V2-008 — Battle Client is projection/interaction, not owner #41

**State:** ✅ architecture decision

The new client may provide:

- card hover/inspect;
- drag/drop and tap/select;
- legal target highlighting;
- action menus on Creature cards;
- selection/search overlays;
- battle animation;
- finish/foil rendering;
- accessibility/reduced-motion presentation.

It may **not** own authoritative gameplay mutation.

Relevant canonical owners remain:

- #14 Attack
- #15 Active Ability
- #16 Tactic
- #17 Relic
- #18 Realm
- #22 Essence Attachment
- #25 Cost
- #26 Payment
- #27 Atomic Switch/Battlefield Position
- #29 Movement Listener
- #30 Card-Zone
- #32 Reward Card
- #33 Hidden Information
- #34 Defeat/Match End

### V2-009 — Withdraw / switch visual choreography

**State:** ✅ UX contract / ☐ implementation pending

Voluntary Withdraw flow:

1. select Vanguard;
2. choose Withdraw from that Creature;
3. display exact `Withdraw Cost`;
4. highlight legal Reserve replacements;
5. select replacement;
6. preflight through Cost #25;
7. consume through Payment #26;
8. move positions atomically through Switch #27;
9. emit exact movement context/listeners #29;
10. animate the same committed transition on the board.

Effect-based switches and forced post-defeat promotion reuse the movement animation but preserve their distinct action context.

### V2-010 — Implementation order locked

**State:** 🔎 next implementation programme

1. synchronize V2 plan/ledger/contracts;
2. complete ten-family structured content inventory;
3. build reusable structured-data card renderer;
4. build rarity/printing finish renderer;
5. replace `t.html` lab battlefield with board-first battle shell;
6. connect direct manipulation/setup;
7. connect inspect/search/choice overlays;
8. connect Ability/Attack card-context actions;
9. connect Withdraw/Switch choreography;
10. connect Rewards/defeat/victory;
11. run real two-user V2 E2E;
12. repair only proven owner defects.

## V2 progress meter

| Area | State |
|---|---|
| Historical private-alpha backend baseline | ✅ |
| Ten visual families | ✅ |
| Video interaction contract | ✅ |
| Creature action-slot contract | ✅ |
| Named numeric-property contract | ✅ |
| Rarity/printing finish split | ✅ |
| Ten exact 60-card starter recipes under V2 | 🔎 |
| Fairy structured runtime package | ☐ |
| Underworld structured runtime package | ☐ |
| Dedicated art metadata for every printable card | ☐ |
| Reusable card renderer | ☐ |
| Printing/shine renderer | ☐ |
| Board-first battle client | ☐ |
| Withdraw/switch V2 UX | ☐ |
| Real two-user V2 E2E | ☐ |
| Public V2 promotion | 🔒 HOLD |

## Next operation

**NEXT:** finish the ten-family structured card/deck inventory against the existing registry before writing battle-client runtime code. This establishes exactly which existing cards need V2 action-slot normalization and which Fairy/Underworld identities are genuinely new, without guessing or replacing working owner logic.
