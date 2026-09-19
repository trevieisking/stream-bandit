# Stream Bandit TCG — Canonical Master Plan V2.4.1

**Plan date:** 2026-09-17  
**Status:** visual/prototype-restoration priority correction layered on V2.4  
**Inherits:** `tcg-master-plan-progress-v2.4.md` in full except where this file explicitly supersedes immediate work order, battle-presentation priority, and visual acceptance wording  
**Execution ledger:** `tcg-master-plan-ledger-v2.4.1.md`  
**Checklist:** `tcg-master-plan-checklist-v2.4.1.md`  
**Exact source base:** `main` @ `27d8f2ec6ec50d5766b79f9c90b6597517302023`  
**Inherited UX authority:** `tcg-master-plan-progress-v2.2.md` — RESTORE, DO NOT REDESIGN  
**Release decision:** 🔒 HOLD public/live/production until the inherited V2.4 release gates pass.

---

## 0. Why V2.4.1 exists

A fresh player-facing review of the current V2 battle page exposed a control-plan ordering error.

The current `tcg-battle-v2.html` source is a thin functional scaffold. It proves that an authenticated board-only route and card-owned Attack transport can exist, but it does not yet resemble the approved release battlefield strongly enough to be treated as the presentation target.

The scaffold currently provides only:

- opponent and own field panels;
- one Vanguard area per side;
- four Reserve slots per side;
- a simple hand strip;
- compact placeholder card controls;
- a technical battle/status HUD.

It does not yet provide the full battle composition locked by V2.2, including:

- six Reward Cards per player;
- Deck and Discard zones;
- persistent Realm presentation;
- attached Essence and Relic presentation;
- premium full-card rendering with real artwork/printing treatment;
- true tabletop spatial balance;
- the approved board-first visual choreography;
- release-grade card inspection, animations, damage/Shield/Condition feedback, Reward/promotion presentation and hand treatment.

V2.4 previously made the fresh two-user Attack attempt the immediate next operation. Attack remains a release-critical gate, but that wording over-prioritized repeated mechanic testing on a visibly incomplete scaffold.

V2.4.1 corrects the work order without weakening any gameplay gate:

> **Restore the approved battle presentation and premium card experience first enough that the player is testing the intended game, then resume the full two-user gameplay proof on that release-shaped client.**

---

## 1. Authority correction — latest Trev visual decision wins

V2.2 already established the UX authority order:

1. Trev's latest explicit correction/decision;
2. current structured rules/card data for exact legality/numbers;
3. approved playable Stream Bandit prototype/workspace visual direction;
4. approved match-video choreography;
5. approved Stream Bandit showcase card families;
6. Pokémon TCG / Pokémon TCG Live research as interaction-category reference only;
7. older planning where not superseded.

V2.4.1 therefore treats the current visual review as a valid correction to execution priority.

### What does not change

- V2-ATTACK-01 remains open and required before public/live promotion.
- The 40 gameplay-owner architecture remains authoritative.
- The browser remains presentation + player intent only.
- Server owners retain legality, payment, damage, targeting, choices, listeners, defeat, Rewards and lifecycle authority.
- The existing V2 Attack source-path proof remains accepted.
- Supabase/runtime is not changed by this planning checkpoint.

### What changes

- the current thin scaffold is explicitly classified as **development scaffolding**, not the release visual target;
- visual/prototype restoration becomes the immediate product-development lane;
- the next genuine two-user acceptance run should use the restored release-shaped board as soon as the minimum visual/interaction shell is ready;
- shell, card renderer, art and board work may proceed before another broad gameplay repair cycle because they do not change game rules.

---

## 2. Originality boundary — Pokémon-style tabletop, Stream Bandit identity

The intended battle layout may use the proven spatial language of a modern creature-card tabletop game, including the Pokémon TCG / Pokémon TCG Live category pattern already documented in V2.2:

- opponent on the upper half;
- own side on the lower half;
- one primary battler nearest the centre line;
- a reserve/bench row behind that battler;
- visible Deck and Discard;
- face-down Reward/Prize-style cards;
- persistent shared Realm/Stadium-like board object;
- player's private hand along the lower edge;
- attached resource cards visibly associated with the Creature;
- landscape/full-board presentation.

Stream Bandit maps those interaction categories to its own game:

- **Vanguard**;
- **4 Reserve**;
- **6 Reward Cards**;
- **Essence**;
- **Realm**;
- Stream Bandit card names, rules, artwork, frame geometry, iconography, sounds, animations, colours and lore.

Do not copy Pokémon proprietary art, cards, frames, logos, text, branded UI, audio or exact decorative trade dress.

The target is **familiar tabletop readability with an original Stream Bandit visual system**.

---

## 3. V2-VISUAL-01 — locked battlefield composition

The release battlefield is one landscape board with two mirrored player halves.

### 3.1 Opponent half

From the opponent edge toward the centre line:

- opponent identity/status strip;
- opponent hand count/private-card backs, never private card faces;
- opponent four-card Reserve row;
- opponent Vanguard nearest the centre line;
- opponent Deck and Discard on a lateral rail;
- opponent six Reward Cards on the opposite lateral rail;
- opponent attached Essence/Relic state remains spatially attached to the owning Creature.

### 3.2 Centre line

The centre of the table contains only match-relevant shared presentation:

- shared/persistent Realm slot;
- turn/phase/choice indicator kept compact and non-obstructive;
- temporary attack/effect/choice animation space;
- no normal website navigation.

The Realm remains on the board until canonical rules replace/remove it.

### 3.3 Player half

From the centre line toward the local player edge:

- player Vanguard nearest the centre line;
- four-card Reserve row behind the Vanguard;
- player Deck and Discard on a lateral rail;
- player six Reward Cards on the opposite lateral rail;
- player identity/status information;
- player's hand as a fan/scrollable card rail along the bottom edge.

### 3.4 Responsive behavior

Desktop/tablet landscape is the primary composition.

Mobile/touch must preserve the same mental model rather than becoming a vertical debug form. Permitted adaptations include:

- scaled board;
- horizontally scrollable/fanned hand;
- zoom/inspect layer;
- compact side rails;
- tap/select alternatives to drag/drop.

Do not collapse the normal battle into stacked developer panels.

---

## 4. V2-CARD-01 — reusable premium full-card renderer

The release board must use one canonical reusable card renderer driven by authoritative card/printing data.

The renderer must support all current and future gameplay identities without per-card HTML branches.

### 4.1 Creature face contract

Inherited V2.2 visual authority remains active:

- **HP** top-left;
- **Type / Element** top-right;
- card name + stage/classification header;
- large dedicated artwork window;
- exactly two structured action slots below artwork according to card data;
- every displayed number labelled by its property;
- **Withdraw Cost** bottom-right;
- rarity / printing / set treatment in frame/footer.

The renderer must support readable examples such as:

- HP;
- Attack Cost;
- Damage;
- Withdraw Cost;
- Shield;
- Heal;
- conditional/structured effect text.

### 4.2 Full-card battlefield rule

Battlefield cards remain recognisably complete cards.

They may scale down in board view, but must not become anonymous dark rectangles or compact debug widgets.

Hover/tap/hold opens an enlarged readable card inspection state without losing the board context.

### 4.3 Card-owned actions

The Creature card remains the gameplay controller:

- Vanguard card exposes its legal Attack slot(s);
- applicable active Ability is exposed through the card;
- Withdraw is exposed through the Vanguard card;
- passive/triggered abilities are visible but not presented as fake manual buttons.

No detached global Attack strip becomes the primary interaction.

---

## 5. V2-ART-01 — artwork and image pipeline

Placeholder gradients/emoji blocks are development-only and do not satisfy the visual gate.

The game needs one scalable art/image pipeline for current and future cards.

### 5.1 Art metadata

Each printing/card presentation must be able to resolve an approved artwork asset through structured metadata rather than a hard-coded page list.

The pipeline must support:

- primary artwork;
- alternate artwork;
- Full-Art / Shine / Holo / Signature-style finishes where defined;
- future set/printing variants;
- safe fallback only for incomplete development data.

### 5.2 Release art status

Every release-visible card must have an explicit art state:

- `approved` — release artwork exists;
- `placeholder` — development only;
- `missing` — gate failure for any card expected in release presentation.

Do not silently ship placeholder artwork as though it were finished.

### 5.3 Original Stream Bandit visual families

Artwork and frames should reinforce Stream Bandit's own element/family language across Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt launch content, while leaving the system extensible for future elements/series.

Visual differentiation may use original:

- frame accents;
- sigils/icons;
- textures;
- foil/shine treatments;
- animation layers;
- background motifs;
- rarity effects.

Gameplay power is never altered by cosmetic printing/finish.

---

## 6. V2-VISUAL-02 — board state must be visible, not hidden in text

Release presentation must visibly express match state.

Required visual states include:

- attached Essence grouped with the Creature;
- Relic visibly attached to its host;
- damage and current HP change;
- Shield state;
- Conditions;
- Ability-use/spent state where relevant;
- legal target highlighting;
- green Evolution target highlighting;
- selected card/target state;
- Reward Cards remaining/claimed;
- Deck and Discard counts;
- persistent Realm;
- active player/turn state;
- pending choice/search/listener state;
- defeat/KO;
- mandatory promotion;
- victory/defeat.

Raw JSON/revision/debug information may exist in diagnostics, but it is not the normal player presentation.

---

## 7. V2-INTERACT-01 — direct tabletop interaction

The V2.2 physical-card metaphor remains locked.

### From hand

- Creature → legal Vanguard/Reserve position;
- Evolution → legal Creature stack, highlighted green;
- Essence → legal Creature;
- Relic → legal host;
- Realm → Realm slot;
- Tactic → legal board target or structured choice overlay.

### Input modes

Desktop priority:

- drag/drop;
- hover/inspect;
- click/select as secondary.

Touch/accessibility:

- tap/select;
- legal target highlighting;
- confirm/cancel before server commit where appropriate.

The same server authority validates the result regardless of input mode.

---

## 8. V2-UX-ANIM-01 — game-feel choreography

The board must communicate cause and effect.

Planned visual choreography includes:

- draw movement;
- card play movement;
- Evolution stack transition;
- Essence/Relic attachment movement;
- Realm placement/replacement;
- Attack wind-up / hit feedback;
- damage/HP delta;
- Shield feedback;
- Condition feedback;
- defeat/KO animation;
- Reward claim;
- promotion movement;
- turn handoff;
- result/victory/defeat presentation.

Animation must never replace authoritative state. If animation is interrupted, reconnect/refresh still renders the current server truth.

---

## 9. V2-SHELL-VISUAL-01 — complete game look and feel outside battle

V2.4's route model remains:

`Landing / Sign In → Game Home → Play / Ranked → Matchmaking → Opponent Found → Board-only Match → Result`

Signed-in destinations remain:

`Account · TCG Players/Friends · Collection · Deck Builder · Packs · Learn · Progress · Settings`

The active match stays board-only.

Outside the match, the TCG should feel like one coherent card-game application rather than unrelated utility pages.

The shell visual system should establish reusable:

- typography;
- buttons/controls;
- panels/modals;
- navigation;
- element accents;
- card gallery treatment;
- loading/error/empty states;
- audio controls;
- accessibility states.

Do not duplicate gameplay rules in these surfaces.

---

## 10. Corrected implementation order — supersedes V2.4 immediate-next wording

### Stage 1 — Visual authority and renderer

1. Lock the board zone map and responsive composition.
2. Build/reuse the canonical premium full-card renderer.
3. Wire artwork/printing metadata with explicit placeholder/missing states.
4. Render real current card data through the renderer.

### Stage 2 — Real board composition

5. Replace scaffold panels with the landscape tabletop composition.
6. Add both Deck/Discard rails.
7. Add both six-Reward areas.
8. Add persistent Realm slot.
9. Add full-card Vanguard/Reserve presentation.
10. Add hand fan/rail with inspect behavior.
11. Add attached Essence/Relic visual treatment.

### Stage 3 — Direct interaction and state feedback

12. Wire drag/drop + tap/select legal-target projections.
13. Restore green Evolution target highlighting.
14. Restore direct Essence/Relic/Realm/Tactic play.
15. Keep Ability/Attack/Withdraw card-owned.
16. Add visible damage/Shield/Condition/Reward/promotion/choice feedback.
17. Add board-preserving search/choice overlays.

### Stage 4 — Game feel and shell

18. Add core animation transitions and audio hooks.
19. Implement the remaining release shell screens with the same visual system.
20. Continue Collection/Deck/Packs/Learn/Progress/Settings against their canonical owners.

### Stage 5 — release-shaped gameplay proof

21. Resume fresh two-user V2-ATTACK-01 on the restored board.
22. Capture exact authoritative evidence.
23. Repair only proven owner defects.
24. Run MATCH-01 through MATCH-25 on the release-shaped client.
25. Complete accessibility/device/polish pass.
26. Build release candidate and decide live promotion separately.

### Important gate rule

This order changes **what we build next**, not what is required for release.

V2-ATTACK-01 remains mandatory before public/live promotion.

---

## 11. How to classify the next test with Kay

If Trev and Kay test the current scaffold before the visual-restoration lane is implemented, classify that session as:

- useful **diagnostic gameplay evidence**;
- useful for Attack/server transport/state synchronization;
- **not** visual acceptance;
- **not** proof that the current layout is approved;
- **not** release UX acceptance.

Any layout criticism from that test should be measured against this V2.4.1 board contract and V2.2 prototype authority, not against the scaffold itself.

---

## 12. Safety / architecture boundaries

This visual-restoration lane must not:

- change gameplay numbers to fit UI;
- duplicate server legality in browser code;
- add card-name branches;
- add a new gameplay owner for presentation convenience;
- create a second backend;
- weaken RLS/security;
- move Account/Friends into the battle controller;
- copy Pokémon branded assets or trade dress;
- mark placeholder art as release complete.

No Supabase deployment is required merely to build the visual layer unless a later proven data gap specifically requires it.

---

## 13. V2.4.1 progress state

### Accepted/locked planning authority

- ✅ V2.4 release-readiness model retained;
- ✅ V2.2 RESTORE, DO NOT REDESIGN authority reactivated as immediate product priority;
- ✅ current V2 battle page classified as scaffold, not release visual target;
- ✅ Pokémon-style tabletop interaction categories mapped to original Stream Bandit board terminology;
- ✅ exact board zones locked;
- ✅ premium full-card renderer requirement locked;
- ✅ artwork/printing pipeline requirement locked;
- ✅ direct manipulation and board-visible state requirements locked;
- ✅ Attack remains a release gate without monopolizing immediate development order;
- ✅ current Kay/Trev scaffold test classified as diagnostic if performed before restoration.

### Implementation still open

- ☐ premium reusable card renderer;
- ☐ approved artwork wired to release-visible cards;
- ☐ final landscape board composition;
- ☐ Rewards / Deck / Discard / Realm presentation;
- ☐ full hand/card inspection treatment;
- ☐ Essence/Relic attachment visuals;
- ☐ direct drag/drop/tap interactions;
- ☐ damage/Shield/Condition/choice/reward/promotion visual states;
- ☐ animations/audio hooks;
- ☐ complete release shell look/feel;
- ☐ V2-ATTACK-01 real two-user proof;
- ☐ full MATCH-01…MATCH-25 release-shaped proof.

---

## 14. Immediate next operation

**One bounded implementation lane:** inventory the current renderer/art/board assets and identify the smallest reusable foundation for **V2-CARD-01 + V2-VISUAL-01**.

The first implementation should produce a genuine Stream Bandit full-card + correct tabletop zone skeleton without changing gameplay rules.

Do not spend the next main development slice adding another isolated debug control to the scaffold.

**Current release decision:** 🔒 **HOLD public/live/production.**


---

## V2.4.40 — official deck accessories and Shop collection depth

Every official starter/deck product now has a locked cosmetic product rule: the deck includes one matching Card Sleeve Set, one cosmetic Battle Coin and one Deck Box.

The eight active launch starters therefore reserve 24 accessory identities. Exact collectible and artwork identities live in `assets/tcg/accessories/tcg-deck-accessory-ledger-v1.json`.

This increases collection/shop depth without creating gameplay variants:
- sleeves affect card-back presentation only;
- battle coins are cosmetic and never affect authoritative randomness;
- deck boxes affect presentation only;
- custom user-built decks do not auto-create bespoke accessory records.

When accessory ownership is implemented, starter acquisition must idempotently ensure all three matching cosmetics. Existing starter owners require a safe backfill. If a player does not own an accessory, the in-game Shop must make it obtainable through the canonical economy/catalog owner. Owned accessories must not be sold/granted as accidental duplicates.

Shop-visible categories are reserved now: Card Sleeves, Battle Coins, Deck Boxes and Accessory Bundles. Prices/currency remain open until the real economy owner exists.

Future promoted official deck products inherit this rule automatically. Fairy / Glimmerwish and Underworld / Grave Pact remain future concepts; this accessory rule does not promote them to launch/runtime.

**Artwork state:** 0/24 launch accessory artworks approved. Identity/path planning is complete; art creation remains open.
