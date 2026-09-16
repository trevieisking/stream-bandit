# Stream Bandit TCG — Canonical Master Plan V2

**Plan date:** 2026-09-16  
**Status:** candidate desired-behaviour authority; no runtime/deployment change in this branch  
**Historical live/private-alpha baseline:** `bbde61a3dd50f93b64872a5bccfaec62e826be23` / PR #549  
**Historical Release Control:** `tcg-release-control-v1.json`  
**V2 execution ledger:** `tcg-master-plan-ledger-v2.md`  
**Battle interaction contract:** `tcg-battle-client-interaction-v1.json`  
**Card visual / printing contract:** `tcg-card-visual-printing-v1.json`  
**Ten-deck product blueprint:** `tcg-ten-deck-product-blueprint-v1.json`

## 0. Authority and anti-drift

V2 records Trev's explicit post-private-alpha direction after the first real two-user test exposed the difference between the working engine harness and the intended game experience.

Authority order:

1. **Desired behaviour:** this V2 plan plus the locked battle/card contracts.
2. **Interaction reference:** the approved uploaded match video `Dar match up test deck(1).mp4` defines interaction choreography, not Pokémon names/assets/branding.
3. **Visual reference:** the ten approved Stream Bandit starter-deck showcase images define the visual language.
4. **Source truth:** GitHub exact source/branch/PR evidence.
5. **Live truth:** Supabase project `xzxqfrvqdgkzwujbkdbk`.
6. **Audit history:** `tcg-master-plan-ledger-v2.md` plus GitHub checkpoint comments.

The old 8-element / 193-identity / 8-starter state remains a historical accepted private-alpha baseline. V2 must never rewrite history to pretend Fairy, Underworld, the new battle client, shine printings, or ten starters are already live.

## 1. Product target — ten elemental deck families

The desired Stream Bandit product target now contains ten elemental deck/pack families:

- Ember — **Ashrush**
- Tide — **Deep Current**
- Grove — **Wildgrowth**
- Volt — **Live Wire**
- Stone — **Unbroken**
- Gale — **Skyshift**
- Shade — **Nightbind**
- Astral — **Second Sky**
- Fairy — **Glimmerwish**
- Underworld — **Grave Pact**

Each family has:

- one exact 60-card starter-deck recipe when implemented;
- one matching elemental pack product definition;
- its own visual palette, pack/box treatment and showcase identity;
- one signature Mythic;
- structured gameplay identities only, using existing generic owner engines wherever possible.

**Scope honesty:** the accepted private-alpha runtime currently proves only the existing 8-element / 193-identity / 8-starter registry. Fairy and Underworld are now V2 target scope, but their final structured identity totals are **TBD until their complete card registries are approved**. Do not invent a new total card count before that approval.

## 2. Battle-client experience — locked

The uploaded match video is the interaction reference. Stream Bandit must reproduce the useful interaction choreography in its own original UI and terminology.

### 2.1 Board-first play

The battlefield itself is the primary interface:

- opponent board on the upper half;
- player board on the lower half;
- one **Vanguard** and four **Reserve** positions per player;
- six **Reward Cards** visibly represented per player;
- Deck and Discard piles visibly represented;
- hand rendered as physical cards along the lower edge;
- turn/phase/status information remains compact and secondary to the board.

The final client must not look or behave like the current debug/lab form layout.

### 2.2 Direct manipulation

Supported interaction patterns:

- drag/tap a legal Creature from hand to Vanguard/Reserve;
- drag/tap an Evolution onto its legal lower stage;
- drag/tap Essence onto a legal Creature;
- play Tactics from hand and choose legal targets on the board;
- play/replace Relics through the attached Creature;
- play/replace Realms through the Realm position;
- click/tap/hover a card to inspect it at readable size;
- highlight legal destinations and targets before committing;
- keep the battlefield visible during searches, choices and target overlays;
- use equivalent tap/select flows on touch devices where drag is awkward.

The browser/client displays legality but does not own legality. Existing server owners remain authoritative.

### 2.3 Card-context actions

Creature actions come from the Creature itself, not from generic global debug buttons.

Selecting the current Vanguard exposes only currently legal actions:

- Ability, if the card has one and it is currently legal;
- Attack 1;
- Attack 2 only when the card's structured identity uses the two-attack form;
- Withdraw;
- Inspect.

Unavailable actions remain visible only when useful, with an explicit reason such as `Need 1 Shade Essence`, `Not your turn`, `Used this turn`, or `No legal Reserve target`.

### 2.4 Withdraw / switch choreography

Voluntary Withdraw should feel like the approved video interaction:

1. select Vanguard;
2. choose **Withdraw**;
3. display `Withdraw Cost` and the exact required payment;
4. highlight legal Reserve replacements;
5. select the incoming Reserve Creature;
6. show payment leaving the correct source;
7. animate outgoing Vanguard → Reserve and incoming Reserve → Vanguard;
8. commit through canonical Cost/Payment/Switch owners;
9. fire the existing movement/switch listeners with exact context.

Card-effect Switch and forced post-defeat promotion reuse the same visual movement system while remaining different rule events underneath.

### 2.5 Searches, choices and hidden information

The video's modal/card-carousel choice behaviour is retained in Stream Bandit form:

- searched cards appear in a board overlay or carousel;
- selectable cards are visibly highlighted;
- selected count and requirement are explicit;
- confirm/cancel is explicit where rules allow;
- opponent-hidden information is never leaked;
- Reward-card choice uses a visual Reward overlay rather than text/prompt input.

### 2.6 Combat feedback

The client must visually communicate:

- chosen attack/ability;
- Essence/payment consumption;
- attack path/target;
- damage amount and HP delta;
- Shield prevention/consumption;
- conditions and timers;
- triggered listeners/secondary effects;
- defeat;
- Reward-card take;
- forced promotion;
- match victory/defeat.

Animations may be skipped/reduced for accessibility, but state changes may never become ambiguous.

## 3. Locked Creature card face

Every Creature card uses a readable physical-card presentation.

### 3.1 Header / art / action layout

- **Top-left:** `HP` and value.
- **Top-right:** Creature type / elemental identity badge.
- **Upper identity band:** card name plus Baby / Teen / Adult / Standalone / Mythic identity as appropriate.
- **Below header:** large dedicated artwork window.
- **Below artwork:** exactly two action slots.
- **Bottom-right:** `Withdraw Cost` and value.
- Rarity and printing/finish markers live on the frame/footer without replacing gameplay labels.

### 3.2 Exactly two action slots

A Creature has one of exactly two presentation/program shapes:

1. **Ability + Attack 1**
2. **Attack 1 + Attack 2**

A Creature must **never** display Ability + Attack 1 + Attack 2 together.

Every attack displays:

- `Attack 1` or `Attack 2`;
- attack name;
- `Attack Cost` with Essence icons/types/count;
- `Damage` and value (including `0` when intentionally non-damaging);
- rules/effect text.

Every active/passive Ability displays `Ability` plus its name and rules text.

### 3.3 Every visible number has a named property

Final rendered cards and enlarged inspectors must not show ambiguous floating numbers. Numeric gameplay values are rendered with their property label or a globally standardized labeled icon with an accessible tooltip/text equivalent.

Examples:

- `HP 150`
- `Cost 3`
- `Attack Cost 2 Ember`
- `Damage 60`
- `Withdraw Cost 2`
- `Shield 40`
- `Heal 20`

Concept-art text is never runtime rules authority. Exact values come from structured card data.

## 4. Other card families — same premium visual system

All printables use the approved Stream Bandit frame/art language.

### Tactic

`Cost` → type/name → large art → effect text → rarity/finish/set markers.

### Essence

Essence family/type and amount are explicit. Basic/Special Essence artwork is dedicated per printing.

### Relic

`Cost` → Relic name → large art → attachment/effect text → rarity/finish.

### Realm

`Cost` → Realm name → environment art → persistent/replace rules → rarity/finish.

No card family falls back to plain debug boxes in the final client.

## 5. Artwork and printing system — locked direction

### 5.1 Artwork on every printable card

Target: **every printable gameplay card has dedicated artwork**.

This includes Creatures, Tactics, Essence, Relics, Realms and special cards. Shared frames/icons are reusable; the principal illustration should be card-specific unless an explicit reprint intentionally reuses art.

### 5.2 Rarity is separate from printing finish

Gameplay/acquisition rarity:

- **Basic**
- **Rare**
- **Extra Rare**
- **Mythic**

Printing/finish is cosmetic and never changes gameplay rules. One gameplay identity may have multiple printings.

Approved V2 printing ladder:

- **Standard** — normal frame/art finish;
- **Shine** — foil/light-reactive treatment;
- **Holo** — stronger animated/foil field treatment;
- **Full-Art Shine** — expanded art with reduced frame footprint;
- **Alt-Art** — alternate illustration using identical gameplay identity;
- **Signature Mythic** — prestige Mythic printing treatment for eligible Mythics.

Future names/finish counts may expand without creating new gameplay identities.

### 5.3 Rarity/finish presentation

- Basic: clean restrained frame;
- Rare: enhanced trim and rarity marker;
- Extra Rare: ornate luminous frame;
- Mythic: signature premium frame;
- Shine/Holo variants add shader/foil/particle treatment on top of the rarity frame;
- printings share the same rules text and identity ID.

This belongs under existing **Card Printing / Art Metadata owner #3** and **Pack owner #37** when packs are implemented. Do not create a duplicate card-rules owner for foil versions.

## 6. Collection / deck / pack presentation

The final product should support the useful client concepts demonstrated by modern and historical digital TCG clients while remaining Stream Bandit-specific:

- visual Collection browser;
- deck builder with large card inspection;
- filters by element, type, rarity, finish, set and ownership;
- owned-copy/printing counts;
- selectable printings for the same gameplay identity;
- starter deck products;
- elemental packs;
- deck testing;
- private battle and matchmaking;
- progression/reward surfaces once their owners are ready.

Pack definitions for all ten element families may be designed before Pack #37 goes live. Pack opening/award mutation must later delegate to Pack #37 + Collection #4 + Economy #35 and must never become one-off per-pack helpers.

## 7. Architecture invariants retained

The existing 40-owner model remains the rules architecture. V2 does not authorize owner #41 merely because the client changes.

Critical boundaries:

- Attack remains owner #14.
- Active Ability remains #15.
- Tactic remains #16.
- Relic remains #17.
- Realm remains #18.
- Essence attachment remains #22.
- Cost remains #25.
- Payment remains #26.
- Atomic Switch/Battlefield Position remains #27.
- Movement listeners remain #29.
- Card-Zone/Draw/Shuffle/Discard remains #30.
- Reward Cards remain #32.
- Hidden Information remains #33.
- Card Printing/Art Metadata remains #3.
- Pack opening remains #37.

The new battle client is a **projection/interaction layer over those owners**, not a new mutation engine.

## 8. V2 release gates

### V2-G0 — Scope/design authority — REOPENED

Pass when:

- ten deck/pack families are approved;
- Fairy/Underworld content scope is explicit;
- total structured identity target is no longer `TBD`;
- rarity/printing contracts are accepted.

### V2-G1 — Content registries / 10 starters

Pass when:

- all ten element packages are structured;
- all ten exact 60-card starter recipes validate;
- every Creature obeys `Ability + Attack 1` OR `Attack 1 + Attack 2`;
- every numeric property renders from named structured fields;
- all card identities have art metadata/asset status.

### V2-G2 — Battle Client Shell

Pass when the client reproduces the approved video choreography with Stream Bandit terminology/visuals:

- setup placement;
- hand interaction;
- Essence attach;
- evolution;
- Tactic/Relic/Realm play;
- search/choice overlays;
- card inspect;
- Ability/Attack selection on-card;
- Withdraw/switch flow;
- Reward choice;
- defeat/promotion;
- victory presentation.

### V2-G3 — Engine integration

Pass when the new client sends actions only through canonical server owners and no duplicate browser legality/mutation engine exists.

### V2-G4 — Printing / collection UX

Pass when Standard/Shine/Holo/Full-Art Shine/Alt-Art/Signature Mythic printings can represent one identity without changing gameplay rules, and the Collection/Deck UI can choose/render them.

### V2-G5 — Real two-user end-to-end

Two authenticated users must complete a real match on the new battle client and prove:

- hidden information safety;
- opening/setup;
- legal turn restrictions;
- card play/evolution/Essence;
- at least one Ability;
- Attack 1 and a legal Attack 2 on a two-attack Creature;
- Withdraw and card-effect/forced switch;
- Tactic, Relic and Realm interactions where available;
- Reward selection;
- defeat/promotion;
- terminal reward receipt exactly once;
- victory/defeat presentation.

### V2-G6 — production/live promotion

Only after the V2 target is synchronized, tested and deployable. The existing private-alpha rollback point remains preserved.

## 9. Locked implementation order

1. Land/synchronize V2 plan, ledger and contracts.
2. Build exact ten-deck/card data inventory; do not invent missing totals.
3. Implement reusable card renderer driven only by structured data.
4. Implement reusable printing/finish renderer.
5. Replace the lab battlefield with board-first Battle Client Shell.
6. Connect setup and direct-manipulation placement.
7. Connect inspect/search/selection overlays.
8. Connect Ability/Attack card-context actions.
9. Connect Withdraw/Switch visual choreography to #25/#26/#27/#29.
10. Connect Rewards/defeat/victory presentation.
11. Run real two-user V2-G5.
12. Repair only proven defects through the rightful owner.

## 10. Current progress checkpoint

- Historical 8-element private-alpha backend baseline: ✅
- Ten showcase visual direction: ✅ approved
- Video interaction study: ✅ locked as interaction reference
- Creature card two-slot rule: ✅ locked
- Named numeric-property rule: ✅ locked
- Rarity vs printing/shine separation: ✅ locked
- Ten-deck gameplay registries: 🔎 not yet fully structured
- Fairy + Underworld runtime packages: ☐
- New reusable card renderer: ☐
- New battle client shell: ☐
- New two-user V2 E2E: ☐
- Public V2 promotion: 🔒 HOLD
