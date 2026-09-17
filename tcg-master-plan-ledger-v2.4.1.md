# Stream Bandit TCG — Master Plan V2.4.1 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.4.1.md`  
**Canonical checklist:** `tcg-master-plan-checklist-v2.4.1.md`  
**Previous canonical plan:** `tcg-master-plan-progress-v2.4.md`  
**Previous canonical ledger:** `tcg-master-plan-ledger-v2.4.md`  
**Exact source base:** `main` @ `27d8f2ec6ec50d5766b79f9c90b6597517302023`  
**Owner-family baseline:** 40 gameplay owner families retained  
**Ledger revision:** V2.4.1-1 — 2026-09-17  
**Release decision:** 🔒 HOLD public/live/production

## Ledger rules

- V2.4.1 inherits V2.4 in full except where it explicitly changes visual acceptance and immediate implementation priority.
- GitHub exact source/commit/CI evidence remains repository truth; Supabase deployed state remains live backend truth.
- V2.4.1 does not mark any gameplay gate complete merely because the visual plan is accepted.
- V2-ATTACK-01 remains open and release-critical.
- Current battle scaffolding is not automatically the approved release UX merely because it is functional.
- The 40 gameplay-owner architecture remains authoritative; presentation work does not create owner #41.
- Master Plan, Ledger and Checklist must agree before this checkpoint can be accepted.

---

## V2.4.1 transactions

### V2.4.1-001 — Current V2 battlefield reclassified as development scaffold

**State:** ✅ ACCEPTED planning correction  
**Checklist:** VIS-PLAN-01 through VIS-PLAN-03

Exact source review of `tcg-battle-v2.html` at base `27d8f2ec6ec50d5766b79f9c90b6597517302023` established that the current page contains:

- opponent and local field panels;
- Vanguard and Reserve placeholders;
- a basic hand strip;
- compact placeholder card controls;
- a technical battle/status HUD.

It does not yet provide the complete V2.2-approved release board composition or premium card presentation.

Missing release-presentation areas include:

- six Reward Cards per side;
- Deck and Discard zones;
- persistent Realm presentation;
- premium full-card artwork/printing renderer;
- attached Essence/Relic presentation;
- full visual damage/Shield/Condition/reward/promotion choreography;
- release-shaped hand/tabletop composition.

Decision:

> Treat the current page as useful functional scaffolding and source-path evidence, not as the release visual target.

No runtime, Supabase or gameplay-rule change is part of this transaction.

---

### V2.4.1-002 — V2.2 prototype-restoration authority reactivated as immediate product priority

**State:** ✅ LOCKED planning authority  
**Checklist:** VIS-PLAN-03 / VIS-PLAN-04

V2.2 already establishes:

- RESTORE, DO NOT REDESIGN;
- one-screen battlefield;
- physical-card interaction;
- full-card rendering;
- board-first choreography;
- approved playable prototype/workspace direction;
- Trev's latest explicit decision as highest UX authority;
- Pokémon TCG / Pokémon TCG Live as interaction-category references only.

Fresh player review confirms the project should return to that authority before spending the next main development slice on more isolated scaffold controls.

This transaction therefore supersedes only the V2.4 immediate-work wording that made another Attack attempt the sole next operation.

It does **not** supersede the V2.4 release gates.

---

### V2.4.1-003 — Battlefield spatial contract locked

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** BOARD-PLAN-01 through BOARD-PLAN-12

The release battlefield is one landscape table with two mirrored player halves.

Canonical composition:

- opponent upper half;
- local player lower half;
- one Vanguard per side nearest centre;
- four Reserve cards per side behind Vanguard;
- six Reward Cards per player;
- visible Deck and Discard for each side;
- one persistent shared Realm at/near centre line;
- local private hand along bottom edge;
- opponent private hand content hidden;
- attachments remain spatially associated with their Creature;
- active match remains board-only.

Mobile/touch may rescale/reflow controls but must preserve this mental model rather than become a vertical debug form.

Implementation remains open under BOARD-IMPL-01 through BOARD-IMPL-09.

---

### V2.4.1-004 — Pokémon-style interaction category / Stream Bandit originality boundary locked

**State:** ✅ LOCKED

The project may use the proven spatial/interaction categories documented in V2.2, such as:

- active battler nearest centre;
- reserve row;
- deck/discard rails;
- Reward/Prize-style face-down cards;
- persistent shared Realm/Stadium-like position;
- lower-edge private hand;
- visible attachments;
- landscape table presentation.

Stream Bandit retains original:

- terminology;
- rules;
- card names;
- artwork;
- frames;
- colours;
- iconography;
- sounds;
- animations;
- lore.

No Pokémon proprietary assets, branded UI, card text, frame art, sound or exact decorative trade dress enters the release client.

---

### V2.4.1-005 — Premium reusable full-card renderer made a first-class implementation gate

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** CARD-PLAN-01 through CARD-PLAN-06; CARD-IMPL-01 through CARD-IMPL-05

One renderer must serve current and future card identities from structured data.

Creature face requirements retain V2.2 authority:

- HP top-left;
- Type / Element top-right;
- name + stage/classification header;
- large artwork window;
- exactly two structured action slots;
- labelled numerical properties;
- Withdraw Cost bottom-right;
- rarity/printing/set treatment.

Battlefield cards remain recognisably full cards and support enlarged inspection.

Ability/Attack/Withdraw remain card-owned interactions.

No per-card HTML branch is accepted as the ordinary scaling model.

---

### V2.4.1-006 — Artwork/card-image pipeline locked

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** ART-PLAN-01 through ART-PLAN-06; ART-IMPL-01 through ART-IMPL-06

Development placeholder gradients/emoji blocks do not satisfy release visual acceptance.

Artwork must resolve through structured card/printing metadata and support:

- primary art;
- alternate art;
- cosmetic printing/finish variants;
- future series/printings;
- explicit development fallback.

Every release-visible card needs a tracked art state:

- `approved`;
- `placeholder`;
- `missing`.

`placeholder` and `missing` remain release visual gate failures for cards expected to ship.

Launch visual treatment must cover Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt while staying data-driven for future content.

---

### V2.4.1-007 — Board-visible state and direct manipulation retained as acceptance requirements

**State:** ✅ REQUIREMENT LOCK / 📋 implementation open  
**Checklist:** Sections E and F

The board must visibly communicate:

- damage/current HP;
- Shield;
- Conditions;
- Ability-use state;
- legal/illegal destinations;
- green Evolution targets;
- Reward state;
- Deck/Discard counts;
- active turn/phase;
- choice/search/listener state;
- defeat/KO;
- mandatory promotion;
- result state.

Direct tabletop interaction remains:

- Creature → Vanguard/Reserve;
- Evolution → legal stack;
- Essence → legal Creature;
- Relic → legal host;
- Realm → Realm slot;
- Tactic → structured board target/choice flow.

Desktop prioritizes drag/drop with inspect. Touch/accessibility uses tap/select equivalents. Server authority remains final legality authority.

---

### V2.4.1-008 — Game-feel choreography restored to active plan

**State:** ✅ PLANNING CONTRACT / 📋 implementation open  
**Checklist:** ANIM-01 through ANIM-12 / V2-AUDIO-01

Required presentation sequence includes:

- draw;
- card play;
- Evolution;
- Essence/Relic attachment;
- Realm placement/replacement;
- Attack wind-up/hit;
- damage/HP/Shield feedback;
- Condition feedback;
- defeat/KO;
- Reward claim;
- promotion;
- turn handoff;
- victory/defeat/result.

Animations remain projections of authoritative state and may never become rule authority.

Audio remains a release requirement.

---

### V2.4.1-009 — Release shell look/feel remains outside active battle

**State:** ✅ ARCHITECTURE / 📋 implementation open  
**Checklist:** Section H

Inherited route model remains:

`Landing / Sign In → Game Home → Play / Ranked → Matchmaking → Opponent Found → Board-only Match → Result`

Outside-match destinations remain:

`Account · TCG Players/Friends · Collection · Deck Builder · Packs · Learn · Progress · Settings`

The shell should share one original Stream Bandit TCG design system for typography, controls, panels, navigation, loading/error/empty states and card-gallery treatment.

No account/friends/navigation chrome enters the active battle route.

---

### V2.4.1-010 — Immediate development order corrected

**State:** ✅ LOCKED ORDER  
**Checklist:** ORDER-01 through ORDER-08

The active order is now:

1. inventory current renderer/art/board assets;
2. establish the reusable premium card renderer foundation;
3. establish the correct tabletop zone skeleton;
4. wire authoritative current card data + artwork into the renderer;
5. wire full-card Vanguard/Reserve/hand/Reward/Deck/Discard/Realm presentation;
6. wire direct drag/drop + tap/select and board-visible state;
7. add core animation/audio hooks and coherent shell styling;
8. resume fresh two-user V2-ATTACK-01 on the restored release-shaped client;
9. repair only proven canonical owner defects;
10. execute inherited MATCH-01 through MATCH-25;
11. complete accessibility/device/polish;
12. build release candidate and make a separate live-promotion decision.

This changes the immediate build sequence only.

V2-ATTACK-01 remains mandatory for release.

---

### V2.4.1-011 — Kay/Trev scaffold test classification locked

**State:** ✅ TEST-INTERPRETATION RULE  
**Checklist:** TEST-CLASS-01 through TEST-CLASS-04

If the current scaffold is tested before visual restoration, the result may provide useful evidence about:

- Attack request transport;
- server authoritative response;
- revisions;
- synchronized state;
- other mechanic behavior reached during the session.

It does not approve:

- current board layout;
- placeholder card visuals;
- current scaffold styling;
- release UX.

Exact request/response/revision evidence should still be captured from any successful or failed gameplay action.

---

## Current V2.4.1 progress board

| Area | State | Meaning |
|---|---|---|
| V2.4 release model | ✅ retained | source/E2E/release states remain separate |
| V2.2 prototype-restoration authority | ✅ active priority | restore approved game presentation |
| Current V2 board | 🧪 scaffold | functional evidence, not release visual target |
| Battlefield zone map | ✅ planned/locked | implementation open |
| Premium full-card renderer | ✅ requirement locked | implementation open |
| Artwork/image pipeline | ✅ requirement locked | inventory + wiring open |
| Direct tabletop interaction | ✅ requirement locked | implementation open |
| Board-visible state | ✅ requirement locked | implementation open |
| Animations/audio | ✅ requirement locked | implementation open |
| Release shell look/feel | ✅ planned | implementation open |
| V2 Attack source transport | ✅ source-proven | inherited from PR #573 |
| V2-ATTACK-01 | ⛔ open | still blocks public/live |
| MATCH-01…MATCH-25 | 📋 open | release-shaped two-user proof required |
| Public/live/production | 🔒 HOLD | no promotion |

---

## Next ledger transaction

The next implementation transaction should be a **read/inventory-first renderer + artwork + board asset audit** bound to V2-CARD-01 and V2-VISUAL-01.

Do not change gameplay rules merely to make the visual shell easier to build.

Do not add another isolated debug control as the main product-development slice.

Do not deploy Supabase unless a later exact visual/data integration gap proves a backend change is actually required.
