# Stream Bandit TCG — Master Plan V2.2 Execution Ledger

**Canonical plan:** `tcg-master-plan-progress-v2.2.md`  
**Previous canonical plan:** `tcg-master-plan-progress-v2.1.md`  
**Previous ledger:** `tcg-master-plan-ledger-v2.1.md`  
**Historical runtime ledger:** `tcg-master-plan-ledger.md`  
**Owner-family baseline:** 40  
**Ledger revision:** V2.2-1 — 2026-09-17

## Rules

- This ledger is append-only continuity over V2.1; it does not erase V2.1 evidence.
- V2.2 inherits all V2.1 gameplay/content decisions except where a later explicit correction supersedes them.
- GitHub exact source/PR/commit evidence is repository truth.
- Supabase remains deployed/live truth.
- Historical workspace/prototype evidence is design evidence, not deployed-runtime evidence.
- Pokémon research is interaction-category research only; Stream Bandit remains original in names, art, wording, card frames, sounds and branded UI.
- UI simplicity must not create a duplicate rules engine.

---

## V2.2 transactions

### V2.2-001 — Original playable prototype intent recovered

**State:** ✅ accepted continuity correction

Evidence reviewed from archived project/workspace records:

- 4 Sep 2026 master-build continuity explicitly recorded a **current one-screen battlefield layout**;
- the same continuity locked a **premium live card renderer** whose stats/effects come from the authoritative registry rather than decorative artwork;
- Collection and Deck Builder were already first-class product areas;
- fullscreen + Esc behaviour was part of the intended play surface;
- the implementation restart note explicitly said **“we do not redesign anything”**;
- later continuity explicitly said **“the board stays”** while backend mechanics were extended.

Finding:

The later lab/debug page was useful for engine proof but drifted away from the original player-facing prototype direction. Restoring the physical-card, one-screen, direct-manipulation battle experience is therefore a continuity correction, not a new product redesign.

Accepted anti-drift rule:

> If the release Battle Client becomes harder to understand or less immediately playable than the earlier approved prototype without a rules/safety reason, treat that as a UX regression.

### V2.2-002 — Prior rules reconciled rather than blindly restored

**State:** ✅ conflict-resolution rule accepted

Not every old prototype/design rule is revived automatically.

Example:

- old controlled-design material required every Creature to have an Ability;
- current accepted V2 rule is **Ability + Attack 1 OR Attack 1 + Attack 2**;
- therefore the current two-slot rule wins.

By contrast, the early one-screen battlefield, physical-card interaction, premium renderer and Collection/Deck Builder intent were never superseded and remain active authority.

### V2.2-003 — Pokémon TCG / Live / Online interaction review completed

**State:** ✅ research synthesis accepted

Research scope:

- official Pokémon TCG rules/play-area model;
- current Pokémon TCG Live product page;
- 21 Apr 2026 Live landscape/deck-editor update;
- current Live card-variant support;
- historical Live/Online comparison for interaction/product lessons.

Useful category patterns recorded:

- clear spatial battle zones;
- one main battler + reserve/bench line;
- visible Prize/Reward, Deck and Discard areas;
- attached resource cards remain associated with creatures;
- persistent Stadium/Realm-like shared card;
- attack as a turn-ending action;
- resource-paid retreat/withdrawal;
- full-card inspection and readable battlefield cards;
- active-turn lighting/feedback;
- attack/defeat animation;
- collection/card gallery;
- card variants/rarities grouped under one gameplay identity;
- deck validation visible while editing;
- practice/test-deck mode;
- older-client strength in obvious Collection/Deck Manager/Trainer Challenge/event-style destinations.

Originality boundary recorded:

- no Pokémon names, art, card text, branded interface, audio or proprietary assets are copied;
- only general interaction patterns are used;
- Stream Bandit terminology remains Vanguard / Reserve / Rewards / Essence / Realm / Withdraw.

### V2.2-004 — Prototype-restoration authority order accepted

**State:** ✅ LOCKED

UX authority order:

1. Trev's latest explicit decision.
2. Current structured rules/data.
3. Approved playable Stream Bandit prototype/workspace visual intent.
4. Approved uploaded gameplay video choreography.
5. Ten approved Stream Bandit showcase image families.
6. Pokémon Live/Online interaction research only.
7. Older planning where not superseded.

This prevents a future implementation from treating the debug harness as the UX source of truth merely because it is newer code.

### V2.2-005 — Fun-first interaction contract accepted

**State:** ✅ LOCKED

Player-facing principle:

> Pick up a card, see where it can go, play it, see what happened, and keep playing.

Accepted behaviours:

- ordinary battle remains one-screen/board-first;
- all playable hand cards use drag/drop on desktop where a physical target/zone exists;
- touch/accessibility path is tap/select → destination;
- legal destinations glow;
- green glow is mandatory for legal Evolution targets;
- choices can be changed/cancelled before authoritative server commit where practical;
- searches/private choices use overlays while preserving board context;
- no browser prompts for ordinary gameplay;
- no generic global Attack control as the primary attack UI;
- raw owner/engine terminology is not exposed to ordinary players.

### V2.2-006 — Card-owned actions retained

**State:** ✅ LOCKED / continuity with PR #560

Creature card action surface:

- Ability when active/legal;
- Attack 1;
- Attack 2 only for two-attack cards;
- Withdraw;
- Inspect.

Rules:

- exactly Ability + Attack 1 OR Attack 1 + Attack 2;
- active Abilities normally once during the player's turn unless card data says otherwise;
- triggered/passive/continuous Abilities do not create fake manual controls;
- attacks resolve and then automatically end the turn after Aftermath;
- Withdraw is paid/selected from the Vanguard card and animated as a Vanguard/Reserve exchange.

### V2.2-007 — Persistent physical board objects reaffirmed

**State:** ✅ LOCKED

- Essence is dragged/selected onto its Creature and remains visibly associated with it.
- Relics attach to legal Creatures and remain until rules remove them.
- Realms occupy the Realm slot, persist across turns, and leave only when replaced by another legal Realm or explicitly removed/discarded by a card/effect.
- Tactics resolve from the physical card in hand through board/overlay targeting and then move to their canonical destination.

### V2.2-008 — Complete-client product direction reaffirmed

**State:** ✅ planning continuity

The game should feel like a complete digital TCG home, not only a match debugger.

Required/retained product areas:

- TCG Home;
- Learn / tutorial;
- Collection / card gallery;
- Deck Builder with validation and owned/in-deck/available counts;
- card variants/rarity/finish browsing;
- Packs;
- Practice/Test Deck;
- private rooms and Casual play;
- Ranked/events only when their own gates are ready;
- Season/Battle Pass;
- Card Viewer;
- future event/tournament richness under Stream Bandit's own rules/economy.

### V2.2-009 — Complexity brake accepted

**State:** ✅ LOCKED

The backend has already proven substantial rules coverage. From this point:

- do not expose backend complexity as player complexity;
- do not add UI actions when direct physical-card interaction can express the action;
- do not add owner family #41 merely for UI convenience;
- do not create per-card browser helpers for ordinary mechanics;
- do not expand unrelated economy/event scope before the playable Battle Client is restored after V2-G1;
- keep one canonical server rule path and one clear player interaction path.

### V2.2-010 — Gate interpretation updated

**State:** ✅ active plan control

V2-G1 remains the current engineering lane:

- finish Fairy + Underworld canonical schema;
- validate 241 identities and ten starters;
- repair only proven generic dispatcher gaps.

After V2-G1:

- **V2-G2:** premium full-card renderer;
- **V2-G3:** playable prototype restoration / one-screen Battle Client;
- **V2-G4:** prove clean delegation to canonical server owners;
- **V2-G5:** Collection / Deck / printing UX;
- **V2-G6:** real two-user match on restored client;
- **V2-G7:** public promotion HOLD until all preceding gates pass.

Battle Client acceptance is now explicitly **usability + correctness**, not backend correctness alone.

---

## Current tracker

| Area | State |
|---|---|
| Historical private-alpha 8 / 193 / 8 | ✅ |
| V2 target 10 / 241 / 10 | ✅ |
| Fairy design | ✅ |
| Underworld design | ✅ |
| Card-controller contract | ✅ |
| Original prototype one-screen intent recovered | ✅ |
| Uploaded-video choreography | ✅ |
| Ten showcase visual families | ✅ |
| Pokémon Live/Online interaction research | ✅ |
| Direct drag/drop / tap-target play | ✅ LOCKED |
| Green Evolution target glow | ✅ LOCKED |
| Essence-to-Creature play | ✅ LOCKED |
| Persistent Realm | ✅ LOCKED |
| Ability normally once/turn | ✅ LOCKED |
| Attack auto-ends turn | ✅ LOCKED |
| Debug-form regression forbidden | ✅ LOCKED |
| V2-G1 241-card canonical data | 🔎 IN PROGRESS |
| Full-card renderer | ☐ |
| Playable prototype restoration | ☐ |
| Two-user restored-client E2E | ☐ |
| Public V2 | 🔒 HOLD |

---

## Locked restart point

1. Continue Fairy + Underworld exact `sb-tcg-card-v0.2` translation.
2. Validate the full deterministic 241-card / ten-starter authority.
3. Extend only proven generic dispatcher gaps.
4. Build the premium full-card renderer.
5. Restore the one-screen playable prototype interaction before unrelated complexity.
6. Run the complete prototype/video choreography checklist.
7. Prove a real two-user match.
