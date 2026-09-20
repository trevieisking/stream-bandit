# Stream Bandit TCG Progress V2.4.45 — Pre-Generation Source-of-Truth Lock

V2.4.45 removes the stale-memory failure mode from the Set One material artwork loop.

## Mandatory workflow

Before every image generation, the assistant must:

1. refresh PR #576 and record the current branch head;
2. read `assets/tcg/art-direction/tcg-art-production-ledger-v1.json` from that active branch;
3. resolve the next card from the locked batch order / remaining `artwork_status: missing` record;
4. bind the exact `card_id`, `printing_id`, `artwork_id`, `target_path` and visual brief;
5. verify the canonical PNG does not already exist;
6. only then generate the image.

After generation the existing locked loop continues:

`create GitHub path -> verify path -> give clickable link + filename + commit message + description -> Trevor uploads -> verify commit/canonical PNG -> synchronize truth -> repeat from source preflight`.

Conversation memory, model memory and prior response text are not sufficient authority for choosing the next card.

## Current verified material truth

Set One Standard/base PNG masters verified at canonical paths: **24/193**.
Astral verified: **24/24**.

Verified cards:
- Stardot
- Orbitail
- Cosmarch
- Moonbit
- Comettail
- Nebulynx
- Cometmanta
- Orbitortoise
- Prismowl
- Starwhale
- Celestyr — Dream Cartographer
- Basic Astral Essence
- Star Essence
- Orbit Essence
- Nova Essence
- Archivist Sol
- Cartographer Lyra
- Future Draw
- Gravity Shift
- Star Chart
- Celestial Observatory
- Dreamglass
- Orbit Ring
- Parallax Window

Astral Standard/base artwork is complete at **24/24**., but the workflow requires a fresh GitHub preflight again immediately before its image is generated.

## Rejected-candidate rule

A generated candidate that materially conflicts with the locked brief is rejected before upload and never counted. This is how the incorrect fox-like Cometmanta candidate was handled before the valid celestial manta was accepted.

## Safety / release boundary

No gameplay, runtime, database, Supabase, `main`, public Pages, live or production authority is changed by V2.4.45.

## First completed deck product-preview gate

When the first full starter-deck art package is complete, use the real approved assets to build a branch-only product preview before moving to the next deck presentation milestone.

- First preview deck: **Astral — Second Sky**.
- Trigger: Astral Standard/base art reaches **24/24** and the existing starter recipe remains valid.
- Preview surfaces: Shop Featured / Starter Decks plus a coordinated Battle Pass Season 1 preview.
- The shop preview must show the actual starter product identity, representative approved card art, and its matching **Second Sky Card Sleeve Set**, **Second Sky Battle Coin**, and **Second Sky Deck Box**.
- Official starter ownership continues to include the matching sleeves, battle coin and deck box once; unowned accessories remain individually obtainable from the in-game Shop per the accessory ledger.
- The preview is visual/product proof only until the canonical economy owner provides prices, purchase receipts, grants and ownership state. Do not fabricate prices, currencies, odds or grants.
- No preview may change gameplay, deck legality, randomness, card ownership or economy balances.

## Battle Pass Season 1 authority

**Set One (SB1) is the first Stream Bandit TCG Battle Pass season identity.**

- Season display identity: **Set One — Season 1**.
- Existing locked structure remains **100 tiers with a reward every tier** and three daily achievements.
- Set One cards, packs, cosmetics and deck accessories may be used as the Season 1 visual/reward pool only through the future progression/economy owner.
- This decision does **not** mean all 193 Set One cards are automatically granted by the pass.
- Exact free/premium track assignments, tier rewards, token costs, receipts, progression values and entitlement rules remain unassigned until the canonical Battle Pass/economy systems own them.
- After the Astral 24/24 deck-art gate, create a branch-only Battle Pass Season 1 visual preview beside the Second Sky Shop preview so the player-facing presentation can be reviewed with real assets.

Second Sky product-preview gate is now open because Astral artwork reached **24/24**; starter recipe revalidation and accessory/product-preview work remain separate next steps.

## Second Sky integrated presentation checkpoint

The first completed deck presentation is now wired on the PR branch using canonical owners and real Astral artwork.

- Canonical deck: **Astral — Second Sky** (`deck-astral-second-sky`).
- Repository recipe revalidated: **60 cards / 21 identities**.
- Live Supabase corroboration: active Second Sky starter remains **60 cards**, rules version `set-one-v0.6.1`, signature effect **Timefold**.
- All 21 identities used by Second Sky have approved repository artwork.
- Full Astral Set One pool is **24/24**; Cometmanta, Nova Essence and Parallax Window remain Astral pool cards outside the 60-card starter recipe.
- The shared art resolver now consumes canonical production-ledger `target_path` records, so approved Astral artwork can appear on existing rendered cards, including the battle renderer, without adding gameplay authority.
- Printing/art intake metadata is synchronized to the canonical `card_id -> printing_id -> artwork_id -> /standard/<artwork_id>.png` chain.
- A reusable product-presentation registry now selects featured starters by `starter_id`; future completed deck products can be added without new page-specific deck branches.
- Branch-only presentation now covers Game Home, Play, Decks, Collection, Shop and Battle Pass; Battle receives the same card art through the shared resolver.
- Shop remains preview-only: no fake prices, purchases, receipts, grants or ownership.
- **Set One — Season 1** remains presentation-only until canonical progression/economy owners assign actual tiers/rewards/entitlements.
- Second Sky sleeve, battle coin and deck-box artwork are still pending and must not be claimed complete.
- No gameplay engine, card rules, database row, Edge Function, Supabase deployment, `main`, Pages/public or live release was changed by this presentation slice.

## Second Sky human visual acceptance — desktop PASS / mobile re-test pending

Trevor completed and passed the desktop branch-preview visual review on exact head `7d15aec02ee76613a706e4ca491f6c091e57351b`.

Kay's phone review then exposed a separate responsive-layout defect: the full top navigation rail was not visible and the Collection page could not expose all Astral cards reliably on a phone-sized viewport.

V2.4.50 therefore adds a mobile-only responsive path:
- the six-item navigation becomes a fully visible 3 x 2 rail;
- phone pages switch from fixed-screen clipping to vertical document scrolling;
- Play/Core layouts stack to one column;
- Collection/Deck card feeds become complete two-column mobile grids;
- nested fixed feeds stop hiding lower content on phone;
- desktop-approved layouts remain unchanged above the mobile breakpoint.

Desktop acceptance remains valid. Kay then re-tested V2.4.50 on phone and **passed the repaired mobile layout**. Overall cross-device Second Sky visual acceptance is now **PASS**.

Second Sky accessory artwork is still pending, economy/Battle Pass ownership remains gated, and no merge/main/Pages/live promotion is implied by either visual review.


## Canonical deck presentation template

The accepted **Astral — Second Sky** presentation is now the visual/layout baseline for the remaining launch decks.

Reuse these presentation rules for every later completed deck unless a specific element needs a content-driven variation:
- desktop top rail: complete six-control rail, compact and unclipped;
- desktop pages: Game Home, Play, Decks, Collection, Shop and Battle Pass use the accepted panel proportions and artwork-fit rules;
- Play: Active Battle gets priority over low-information sidebar space and shows a full card-shaped deck preview;
- Decks: exact starter recipe is shown as the canonical deck preview;
- Collection: complete element card pool must be reachable and visually consistent;
- Shop: featured starter uses the neat framed showcase/product treatment;
- Battle Pass: launch showcase fits its panel and reward-card content remains contained;
- mobile top rail: fully visible 3 x 2 grid;
- mobile pages: vertical document scrolling, stacked core layouts and complete two-column card grids;
- raw artwork must be composed so the important subject survives these accepted desktop/mobile crops and card-shaped containers.

## One-deck-per-day production cadence

Working cadence target: **one completed launch deck per working day**, using the same source-of-truth loop and human acceptance gates as Second Sky. The cadence never overrides correctness, CI or visual acceptance.

Canonical next starter from the current Set One starter registry:
- **Ember — Ashrush** (`deck-ember-ashrush`).

Each deck follows:
`fresh GitHub card-art preflight -> generate/upload/verify all required art -> canonical starter/pool wiring -> desktop preview -> mobile preview -> human PASS -> exact-head CI -> promotion decision -> checkpoint -> next deck`.


## V2.4.51 priority override — canonical global card face before more artwork

Card readability/playability is now the immediate TCG priority ahead of Ember/Ashrush image production.

The accepted visual direction is the Orbitortoise canonical card-face reference:
- https://chatgpt.com/s/m_6aafc9a916c88191b0f63b164d1923cc

Locked player-facing card contract:
- one shared card renderer across Battle, hand, Collection, Decks, Shop, packs/rewards and Battle Pass previews;
- Creature HP sits at the top-left beside the name;
- element / energy type sits at the top-right;
- large artwork occupies the upper card area;
- Ability and every canonical Attack remain readable on the card face;
- Reward Cards sit at the bottom-left;
- rarity sits at the bottom-right with Withdraw directly beneath it;
- cards without approved artwork use the same complete frame with an Artwork Pending window and remain fully readable/playable;
- active Ability glow is server-authoritative from existing field-actions capability data; triggered Abilities are displayed but never exposed as manual-use buttons;
- legal/illegal Attack state is explicit on the Attack row and Attack transport remains server-owned;
- raw artwork remains separate from the frame/rules UI so future printings, finishes and alternate art do not duplicate gameplay authority.

Astral remains the first complete proof set because all **24/24** Astral Standard/base artworks already exist at canonical GitHub paths. Those existing images must be fitted/cropped through the shared renderer rather than regenerated merely to match the frame.

The remaining **169** Set One identities do not wait for artwork before becoming readable card faces: their structured rules/stats must render now with the same placeholder-art card system.

**Artwork production pause:** do not begin Ember/Ashrush image generation until the global card-face renderer has passed Astral desktop/mobile Battle + Collection/Deck readability and missing-art placeholder tests. This priority change does not alter card rules, deck legality, economy, ownership or Supabase authority.


## V2.4.52 — attack, defeat/reward, explicit quit and post-match lifecycle lock

The first real two-player Battle test proved that setup/coin-toss/board presentation can pass while the actual play loop is still not accepted. From this checkpoint onward, **an attack is not considered implemented until damage visibly lands and the complete server lifecycle finishes**.

Locked Battle lifecycle:
- a legal Attack is chosen from the real Vanguard card face;
- the canonical server Attack owner validates Essence/requirements/conditions/targets;
- the server places the resulting damage automatically — the browser never asks the player to type or place damage;
- after any required Attack effect/listener/choice resolution, the Attack ends the attacking player's turn automatically;
- if damage or an Attack effect defeats a Creature, canonical Defeat removes it and immediately queues the proper Reward Card resolution for the opposing player;
- Reward taking, forced Vanguard promotion, terminal winner evaluation and turn progression remain server-owned and occur in that order;
- the first real cross-device acceptance test must prove **Attack -> visible damage -> defeat when applicable -> Reward resolution -> turn/result state**, not merely that an Attack button can be clicked.

Explicit match exit:
- Battle has one small settings/cog control;
- **Quit Match** is an explicit concession, not a pause: the quitting player receives the loss and the opponent receives the win;
- concession must use the existing authoritative `concede` match command and may not be simulated in browser state;
- ordinary browser reload/navigation is not treated as a concession; an unfinished match can still resume from authoritative state unless the player explicitly chooses Quit Match;
- after a terminal win/loss screen, the only continuation destination is `tcg-play.html` with no carried `match_id`; the player must press **Find Opponent** again for a new match.

Card interaction clarity:
- the Orbitortoise reference supplied by Trevor on 20 September 2026 remains the visual baseline for **every card face**;
- all current and future cards use the same full trading-card structure and remain ready for approved art without changing gameplay data;
- active Abilities visibly glow/pulse only while the authoritative server says they can be activated, and the glow stops after use/limit consumption;
- triggered Abilities remain readable but never masquerade as manual buttons;
- Attack rows visibly distinguish Ready from blocked states and explain common blockers such as insufficient Essence;
- Essence attachment always retains tap-select -> highlighted-destination as a reliable touch/accessibility fallback; V2.4.53 additionally requires real touch drag/drop parity on phones rather than desktop-only drag;
- successful attachment is reflected by the refreshed authoritative creature state, including attached Essence count/effects.

**Acceptance boundary:** anything after Attack remains unaccepted until a real two-user test has actually placed damage on a Creature. Automated tests may prove the server lifecycle and browser transport, but they do not replace the final Trevor/Kay visible Battle pass.


## V2.4.53 — visible Essence resource orbs + phone drag/drop parity

Trevor/Kay's first real cross-device Battle pass adds two player-readability requirements without changing any gameplay authority or the accepted board geometry.

### Attached Essence must be visible on the Creature

Every Creature on the battlefield must show a compact **attached Essence orb rail** directly with that Creature so the player never has to remember how much Essence is attached.

Locked presentation contract:
- attached Essence is represented by tiny **sphere/orb/pip** markers, visually similar to small energy balls;
- each visible resource unit uses the canonical element identity/color already owned by Stream Bandit's element palette: Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt;
- color is not the only signal: every orb also carries the canonical element glyph/mark and an accessible element label;
- the rail is derived only from the authoritative Creature's attached `essence` instances plus their structured `provides` data; the browser does not maintain a second Essence count;
- the visual represents the **effective payable Essence units**. A source that provides more than one unit contributes the corresponding units. While the Essence rail remains inside its allocated card bounds, units appear as individual tiny orbs. **Only when the rail would breach/overflow those card parameters** does it compress: each Essence element present becomes one element-colored orb with that element's current numeric total printed inside it. The number is whatever the authoritative state currently contains — there is no fixed threshold or special value. Different Essence types always remain separate counted orbs so element information is never lost;
- the Attack row continues to show its required Essence orbs/cost beside the Attack. A player can therefore compare **attached colored orbs** with **required colored orbs** on the same card without mental bookkeeping;
- when an Essence is discarded, removed, moved, expired or otherwise no longer attached in authoritative state, every orb contributed by that source disappears on the next authoritative render;
- when Essence changes element/value through a canonical rule, the displayed resource rail follows the server-authoritative effective value;
- both players may see only the attached-Essence information exposed by the public match view; this visual must never reveal hidden card identity or private information;
- the orb rail must not cover HP, artwork, Ability text, Attack text, Reward Cards, rarity or Withdrawal. It belongs to live Battle status around/on the card, not baked into artwork.

The existing numeric `Essence N` status may remain as an accessibility/count companion during implementation, but the final Battle readability gate requires the colored orb rail. The orb rail is presentation only: payment, attachment, discard and Attack-cost validation remain owned by the existing Essence / Payment / Attack engines.

### Phone drag/drop is required, not optional

Kay's phone test proved the current coarse-touch client cannot drag a hand card even though desktop drag/drop works. Source inspection confirms the current Battle controller deliberately renders playable hand cards with `draggable="false"` on coarse-touch input, so this is a real client-interaction gap rather than a server rules failure.

V2.4.53 supersedes the desktop-only drag portion of V2.4.52:
- desktop keeps click/select and drag/drop;
- phone/tablet must support **finger drag/drop** from a playable hand card to a legal board destination;
- tap-select -> tap highlighted destination remains fully supported as an equal fallback and accessibility path;
- touch drag/drop must use a pointer/touch-safe gesture path rather than relying only on native HTML5 drag events, because native drag transport is not dependable on coarse-touch mobile browsers;
- drag start selects the same authoritative hand-card intent used by tap selection;
- legal destinations highlight while dragging; illegal destinations do not accept the drop and show the same legality explanation used by tap mode;
- dropping calls the exact same existing server command as tap mode (`play_creature`, `evolve`, `attach_essence`, `attach_relic`, etc.); no mobile rules engine is permitted;
- scrolling must remain possible when the gesture is not an active card drag;
- the accepted Trevor desktop and Kay phone board layout/slot geometry must not move merely to add drag support.

### Final Battle decoration remains last

The accepted tabletop geometry is frozen while gameplay interaction is made genuinely playable. Final board decoration/background/realm polish is a **later presentation-only pass** after Attack, Essence visibility, phone drag/drop, card readability and result/quit flows have passed cross-device play. Decoration may improve atmosphere but may not relocate zones, obscure cards, reduce touch targets or create gameplay authority.

### Priority remains card visuals + real Attack playability

This overflow refinement is a readability detail inside the existing priority, not a new detour. Current order stays:
1. canonical card visuals/readability;
2. real Attack -> damage -> turn/reward lifecycle;
3. visible Essence counts/orbs and phone drag parity as part of making those cards genuinely playable;
4. final board decoration only after the above passes.

**V2.4.53 acceptance boundary:** source planning is complete only when progress/ledger/checklist/interaction-contract agree. Implementation is accepted only after Trevor/Kay prove on real devices that attached Essence orbs update correctly and Kay can physically drag/drop playable cards with a finger as well as use the tap fallback.


## V2.4.53 implementation A — authoritative Essence rail source complete

The first V2.4.53 implementation target is now present on the branch.

- The shared card renderer owns one reusable Essence-orb primitive for both attached resources and Attack costs.
- Battle derives attached resource units only from each Creature's authoritative `essence` instances plus the structured Essence `provides` definition already available to the viewer.
- The renderer receives only derived `{ element, count }` presentation data; it does not decide attachment legality, payment or Attack legality.
- Individual element orbs are rendered while the rail fits. The Battle controller measures the actual rendered rail against its allocated card width and switches to counted-per-element mode only when the rail would overflow.
- Different elements remain separate in counted mode.
- Removing an attachment naturally removes its contribution because every Battle refresh rebuilds the rail from the latest authoritative Creature state.
- Attack costs now use the same element-orb identity system, so required Essence and attached Essence are visually comparable.
- Existing HP / Shield / numeric Essence companion status remains during this pass.
- A browser-transport regression fixture now proves a successful authoritative `attach_essence` refresh changes the Creature from no rail to an Astral Essence rail.
- Human desktop/mobile readability remains pending and no promotion is implied.

Next implementation target after this source slice validates is **phone/tablet pointer/touch-safe hand-card drag/drop**, while preserving the existing tap-select fallback and exact server action payloads.


## V2.4.53 implementation B — phone/tablet touch drag source complete

The second V2.4.53 implementation target is now present on the branch without creating a mobile gameplay owner.

- Coarse-touch playable hand cards now bind a touch-safe hold-and-drag gesture while native HTML5 drag remains available on fine-pointer desktop.
- A short hold deliberately activates card dragging; ordinary movement before activation cancels the drag path so normal phone scrolling remains available.
- Drag activation selects the same existing hand-card UID used by tap mode.
- The gesture discovers the existing setup/play destination elements and calls the existing legality hints only for visual highlighting.
- A legal drop delegates to the **same existing action functions** as tap mode: `runSetupPlace` for setup or `runPlayHandTarget` for play/evolve/Essence/Relic.
- No mobile rules engine, mobile Essence route, alternate Creature placement path or duplicate server payload was introduced.
- Setup destinations are now discoverable before selection so a held phone card can be dragged directly to an open legal setup slot; legality highlighting still appears only when a card is actually selected/held.
- Tap-select -> highlighted destination remains bound and available as the equal fallback/accessibility path.
- The accepted Trevor/Kay Battle board geometry is unchanged.
- A coarse-touch browser regression fixture proves long-press drag of Basic Astral Essence to the Vanguard emits exactly one authoritative `attach_essence` command, while a separate coarse-touch tap test proves the fallback still emits the same command.

Human Kay-phone finger-drag acceptance remains pending. The next source target after exact-head validation is the remaining **V2.4.53 automated rail compression/removal proof**, followed by any still-open non-human Battle acceptance evidence before returning the build to Trevor/Kay.


## V2.4.53 implementation C — automated Essence/touch evidence assembled

The branch now contains deterministic browser-side evidence for the remaining non-human V2.4.53 claims:

- authoritative Essence attachment refresh adds the correct element rail;
- a later authoritative state with the attachment removed removes the rail and returns the companion count to zero;
- the real compression routine is exercised with measured expanded width greater than available rail width and then with a fitting width, proving compression and re-expansion are layout-driven;
- mixed-element counted fallbacks remain per-element rather than becoming one total;
- Attack-cost and attached-resource orbs reuse the same element renderer;
- coarse-touch long-hold/drop emits the same existing `attach_essence` action shape as tap mode, while a separate coarse-touch tap test remains functional.

These are automated source claims only. Trevor/Kay device acceptance is still required. After exact-head CI validates this packet, the next non-human checklist target is **V2.4.52 active Ability capability projection: usable -> glow -> authoritative use -> projection disappears**.


## V2.4.52 implementation D — active Ability projection proof assembled

The previously open automated Ability-capability gate now has both server and browser behavior evidence on the branch:

- the real Match action owner projects a currently usable active Ability through `field_actions.ability_sources`;
- a real generic immediate active Ability is exercised through `use_ability`, consumes its once-per-turn limit and returns to play;
- a subsequent authoritative `field_actions` projection no longer includes that Ability source;
- the Battle controller/browser regression fixture proves the first projection renders **ABILITY READY** as a clickable card-owned control;
- clicking that card-owned Ability sends exactly one existing `use_ability` command;
- after the refreshed empty capability projection, **ABILITY READY** and the clickable Ability control disappear.

No renderer-owned Ability legality was added. Server capability remains the only source of the glow/ready state.

Once exact-head CI passes, all currently listed non-human V2.4.52/V2.4.53 interaction gates are complete. The loop must then stop at the explicit Trevor/Kay real-device Battle gate before any promotion or decorative-board pass.


## V2.4.53 automated interaction gate — source PASS at run #1040

TCG Card Pass 2 Validation **#1040** passed at source head `e3e5b00053ef5665b13ca6aeba5cc8c0b185ee28`, including:
- attached Essence add/remove + measured compression/re-expansion;
- per-element counted overflow and shared Attack-cost identity;
- coarse-touch drag command parity + tap fallback;
- server active-Ability capability consumption and browser glow disappearance.

The subsequent checklist/progress synchronization changes documentation only, so a fresh exact-head validation is still required before the branch checkpoint is called fully current.

**Next target boundary:** the remaining Battle acceptance items are now real Trevor/Kay device checks. Do not replace them with more automation, do not decorate the board yet, and do not promote. The next actionable step after final exact-head CI is to present this branch for the explicit two-device test: real Attack/damage/reward, Ability glow/use, Essence rail, phone drag/tap and Quit Match.


## V2.4.53 synchronized automated checkpoint — #1041 PASS

TCG Card Pass 2 Validation **#1041** passed on synchronized implementation/docs head `7e51f9be1f7a4a101bd2e2f4a805088dbd4bb5b1`.

This closes every currently listed **automated** V2.4.52/V2.4.53 interaction gate:
- Attack readiness/damage/turn advance and lethal Reward queue;
- explicit concession/result routing;
- active Ability server projection -> card glow -> use -> projection disappears;
- attached Essence element rail, measured overflow compression/re-expansion and removal refresh;
- phone touch-drag transport + tap fallback through the same authoritative actions.

The checklist update that records this PASS is documentation-only and creates one final exact head requiring routine validation. After that, the branch is at the mandatory **real two-device acceptance boundary**. No additional code claim may substitute for Trevor/Kay seeing these behaviors in an actual match.


## Trevor/Kay human Battle checkpoint — first strike, KO proof and blocked-Attack clarity

The real two-player test now proves several items that automation could not:
- Trevor completed a legal Attack that visibly placed damage and defeated Kay's Creature — the first real KO is accepted evidence.
- Explicit Quit Match/concession returned both players to the expected result/matchmaking flow.
- A later Attack attempt was correctly blocked because the current Vanguard did not have enough matching Essence; the video shows this is a legitimate server-owned legality result rather than an Attack-engine failure.
- The card copy **Ends Turn** was too terse: the authoritative lifecycle actually ends the turn only after the Attack's full resolution chain. Non-lethal damage goes straight to Aftermath/turn advance; lethal damage first performs Defeat -> Reward -> required promotion, then resumes that same end-turn continuation.
- The desktop selected-card implementation physically moved the source Vanguard into a fixed overlay, producing the visible "jumping" Trevor reported. The source card now remains anchored and a separate stable inspector renders the same canonical card face for readable Attack/Ability interaction.
- Blocked Attack rows remain inspectable and explain the projected reason without dispatching an Attack command.

The remaining lethal acceptance gate is not the KO itself; it is the now-repaired visible **Reward selection -> Reward to hand -> required promotion -> automatic turn handoff** chain. Ability-ready human proof and the remaining phone gesture checks are still open. Main/live promotion remains on HOLD until those visible gates pass.


## Trevor/Kay paired-video checkpoint — client exception, not server deadlock

The synchronized Trevor desktop / Kay phone recordings from 20 September 2026 show both clients on the same authoritative **Revision 9** while Trevor sees **Opponent turn** and Kay sees **Your turn**. That is the correct complementary view of the same active seat, so the server had advanced the match rather than deadlocking.

The actual stop begins when the Battle client displays `cardNameById is not defined`. Kay reaches her turn, selects Basic Astral Essence and then cannot complete the expected interaction; Trevor continues to see the board waiting for the opponent. The same client error later becomes visible on Trevor's screen as polling/rendering continues.

Root cause: the new stable desktop card inspector referenced `cardNameById` without defining that helper in the Battle controller. The renderer normally masked the older fallback reference, but selecting the Vanguard exercised the inspector call directly and raised a ReferenceError.

Repair:
- define one generic `cardNameById(cardId)` resolver inside the Battle controller;
- prefer the shared card renderer's registry record when available;
- fall back to the authoritative match-view `card_index`;
- keep the match/turn server owners unchanged;
- regression-test that the inspector resolver is present before human retest.

This checkpoint does **not** mark the remaining Reward/promotion/Ability/touch human gates complete. It only removes the proven client exception that prevented the active player from continuing.


## V2.4.54 human-video and database checkpoint — lethal handoff + compact tabletop

Four user-supplied recordings were reviewed together: Trevor's current desktop Battle, Kay's current phone Battle and two interaction/layout reference recordings.

### Lethal lifecycle finding
The real Stream Bandit match shows the complete pre-stall chain:
- Revision 26: a legal lethal Attack commits;
- Revision 27: the attacker takes exactly one required face-down Reward Card;
- Revision 28: the defeated Vanguard's controller promotes a Reserve Creature;
- both clients then remain synchronized on Revision 28 with the replacement Vanguard visible, but the match stays in `phase=resolution` and no next turn begins.

Authoritative database history independently confirms the corresponding `attack`, `take_reward` and `promote` commands all applied successfully and no turn-advance event followed before the later concession.

Source inspection identifies the lifecycle defect in the canonical Match Flow Turn owner: `runtimeV02AdvanceTurn` rotates `active_seat`, increments turn counters and delegates the draw but did not set the ordinary successful phase back to `play`. Normal End Turn masked this because it enters Turn from `play`; lethal Attack continuation enters Turn from `resolution`. V2.4.54 fixes that owner, not the browser and not a second Attack path.

### Layout/readability finding
Trevor's desktop recording demonstrates that the existing full-rule card faces still require browser zoom around 50% to see the complete board/card composition. That fails the normal-zoom acceptance standard.

The two reference recordings establish a better interaction grammar:
- keep the entire battle board visible at normal zoom;
- render in-play cards as compact recognizable art/status objects;
- tap/click a card to open its readable full card view;
- keep the player's hand at the bottom edge instead of expanding the page;
- browse an overflowing phone hand horizontally left/right;
- drag a hand card directly to a legal board destination;
- preserve a tap-based fallback for accessibility/touch reliability.

The implementation uses Stream Bandit's existing shared card renderer and rules only: field/hand previews use `compact` mode and the full inspector uses the canonical Battle card face. No external visual assets or card designs are copied.

### V2.4.54 source implementation
- Match Flow Turn successful advance now returns `phase` to `play`.
- New unit/static proof covers the exact resolution -> next-turn -> play transition while Card-Zone still owns the draw.
- Battlefield cards use compact renderer mode and remain anchored in their zones.
- Hand cards use compact renderer mode in a horizontal bottom tray.
- One generic inspector reads hand, own-field and opponent-field cards; only the own Vanguard exposes authoritative Attack/active-Ability controls.
- Phone/coarse layout is returned to a one-viewport tabletop instead of growing vertically with the hand.
- The existing touch-safe long-hold drag and tap fallback remain routed to the same existing server actions.

Exact-head CI and two-device human acceptance are still required. Main/static live remains untouched.


## V2.4.55 paired-video checkpoint — bounded field cards + hand peek + inspect everywhere

Trevor's desktop recording `Desktop 2026.09.20 - 18.22.38.08.mp4` and Kay's phone recording `WhatsApp Video 2026-09-20 at 18.30.29.mp4` were reviewed against the earlier supplied TCG interaction reference.

### Human visual finding
V2.4.54 solved the previous need to zoom the browser out just to see the board, but its final presentation overcorrected in two places:
- occupied Vanguard/Reserve cards were changed from bounded card objects into height-filled cards, making the active Creature visually dominate the tabletop;
- the player's hand became a strip of complete but very small cards, which preserved every edge of the card at the cost of recognizability and the physical-card feel shown in the accepted interaction reference.

The corrected presentation contract is therefore:
- in-play cards stay bounded compact previews inside their zones;
- the whole battlefield stays visible at normal/default browser zoom;
- hand cards are larger and deliberately **peek/fan from the bottom edge**, so the card bottoms may continue below the visible hand mask;
- the hand scrolls/swipes horizontally;
- clicking/tapping any hand/field card opens the readable canonical inspection face;
- drag/drop and tap-select -> destination continue to use the existing authoritative gameplay commands.

### Shared inspection finding
The existing Battle inspector direction is accepted, but the complete move/Ability area needs more room than the old Battle face allocated. V2.4.55 introduces one shared renderer `inspect` mode with a larger rules/move region.

The same read-only inspection interaction now applies outside Battle:
- **Decks** canonical card recipe tiles;
- **Collection** canonical card tiles;
- card-backed **Battle Pass** reward samples.

Only Battle adds live authoritative Attack/active-Ability controls and current Creature state. Decks/Collection/Battle Pass inspection remains presentation-only and cannot create deck ownership, collection ownership, progression, entitlement or economy authority.

### V2.4.55 source implementation
- shared card renderer internal version moves to 2.4.55 and exposes the `sb-card-face--inspect` presentation class through the existing generic renderer mode;
- inspect CSS gives complete Ability/Attack/move rows substantially more room while retaining the same card data/artwork;
- Battle inspector now renders `mode: "inspect"`;
- desktop and phone field cards return to bounded viewport-driven widths rather than slot-height fill;
- desktop Battle hand uses larger overlapping cards that continue below the smaller hand rail;
- phone/coarse Battle hand uses 152px cards inside a 76px visible hand viewport, producing the intended bottom-edge peek while preserving horizontal swipe;
- Decks, Collection and Battle Pass use one shared read-only modal inspector backed by the canonical renderer;
- keyboard Enter/Space inspection and Escape close behavior are included on non-Battle pages;
- new regression coverage binds the V2.4.55 geometry and verifies product-page inspection does not introduce database/gameplay mutation.

### Code Labs evidence boundary
Code Labs Forge was checked read-only because the user explicitly requested it. The current Code Labs workspace is still synchronized to the historical PR #549 workstream, not PR #591/current V2.4.55 head. Scan Labs also failed closed because the repository exceeds its bounded source-byte limit. No stale Code Labs record was repurposed and no CG Repair Lab, Code God, Writer or Repo Desk path was entered. For this visual slice, GitHub exact-head source and fresh TCG validation remain the current evidence authority.

The previously deployed `tcg-match-actions` v9 lethal-handoff repair remains live and is not part of this visual source change. Main/static live remains untouched. Exact-head CI and Trevor/Kay cross-device acceptance are still required before static promotion.


## V2.4.55 automated source gate — #1116 PASS

TCG Card Pass 2 Validation **#1116** passed on source candidate head `33e68f158e309a442ca1c6ab1d08d319cddfd9e9`.

The passing gate includes:
- shared `inspect` card face with complete structured move/Ability rows;
- bounded Battle Vanguard/Reserve card sizing;
- desktop + phone bottom-edge peek/fan hand geometry;
- existing drag/drop and tap fallback transport guards;
- Decks/Collection canonical card inspection;
- card-backed Battle Pass reward inspection;
- read-only product-page inspection fences;
- all inherited 193-card/runtime tests and Deno type/runtime checks.

The subsequent checklist/progress synchronization is documentation-only and therefore creates one final exact head requiring routine Card Pass validation. Human Trevor/Kay visual acceptance remains open and static/main promotion remains HOLD.


## V2.4.56 — Kay 25-minute Battle evidence and server-projected action repair

Kay's 25-minute Battle recording was reviewed against production command/state history from the same real match.

### What the recording actually proves
The visible red messages included repeated:
- `required_tactic_target_unavailable`;
- `manual_essence_already_used_this_turn`.

Those errors were real, but they did **not** represent one jammed server. Production history from the same match shows:
- a Realm successfully committed and became authoritative;
- multiple later Attacks committed successfully;
- Essence attachment, Creature play, Relic play, Reward and promotion paths continued to execute.

The defect therefore split into presentation/interaction ownership gaps rather than a replacement Attack or Realm engine.

### Root causes
1. Battle classified hand-card intents locally but did not ask the existing server target projections before offering a destination.
2. Tactics had final server legality but no read-only playability projection for the client.
3. Withdraw already had complete server projection/execution but the Battle client exposed no Withdraw control at all.
4. Realm was authoritative but responsive Battle CSS hid the Realm presentation area, making a successful Realm look unusable.
5. Raw implementation error codes were sent straight to the player's red status surface.

### V2.4.56 source repair
- `tcg-tactic-actions` now owns a read-only `play_tactic_preview` action and real `play_tactic` reuses the same generic playability helper.
- Battle preflights Creature/Realm/Evolution/Essence/Relic/Tactic actions through their existing authoritative owners before sending the real mutation.
- In-flight preflight is deduplicated so rapid phone interaction does not issue duplicate read-only checks.
- Known legality codes are translated to useful instructions while the original code is retained as diagnostic evidence.
- Withdraw UI is generated solely from `field_actions.withdraw`, including exact attached-Essence payment options and legal Reserve destinations.
- Active Realm remains visible on compact/touch layouts, resolves its canonical card name and opens the shared inspector.
- Attack remains server-projected through `field_actions.attacks`; no Attack rule moved into the browser.

### Automated checkpoint
TCG Card Pass 2 Validation **#1138 PASS** on source candidate head `29e3ba5aa0259814563a0d8227a48c08a6e67a1e`.

The green run includes inherited Attack, Ability, Essence-orb, touch-drag, tap-fallback and runtime/type checks plus new projected-action/Withdraw/Realm/Tactic-preview guards.

The Tactic preview is an Edge API addition, so the branch is not ready for Trevor/Kay retest until the exact green Tactic source is promoted in place with JWT settings preserved. Static/main promotion remains HOLD.


## V2.4.57 — Release 1 implementation-before-human-E2E reset

Trevor's 20 September paired Battle review changes the execution order, not the Release 1 scope.

The readable Battle surface is now useful enough to expose real rule/runtime gaps. The next acceptance loop must therefore stop treating Trevor/Kay device play as the immediate next gate while Release 1-used v0.2 capability parity remains incomplete.

### Locked execution rule
Before the next full Trevor/Kay Battle acceptance pass:
1. audit all operations/predicates actually used by the frozen 193-card Release 1 registry;
2. reconcile stale capability labels against current generic owners/tests;
3. implement every genuinely missing/partial Release 1-used capability through its rightful shared owner;
4. keep future-only grammar/Fairy/Underworld/product-layer capability out of the Release 1 blocker set;
5. run exact-head automation after each bounded owner slice;
6. only then return to the full two-device G5 journey.

Human recordings remain valuable defect evidence, but no human failure may be treated as surprising when the corresponding launch capability is still knowingly incomplete.

### Fresh 193-card capability audit
The frozen nine Card Pass 2 sources parse to exactly **193 unique cards**, using **61 effect operations** and **97 predicates**.

The current capability manifest contains both genuinely incomplete Release 1-used shapes and stale missing/partial labels whose current owner already exists. Therefore the runtime capability manifest must be reconciled from current source/tests before any missing label is used to justify new code.

### First proven foundational gap — generic predicate tree / IF
Release 1 contains **29 generic IF instances across 27 cards and all eight launch elements**.

Current source has fragmented predicate evaluation:
- Event Listener owns a local recursive predicate tree;
- Attack families own multiple specialized conditional evaluators;
- the shared Requirement evaluator is intentionally narrow;
- Tactic still contains compatibility-only IF_CONDITION / IF_VANGUARD_PRINTED_HP_AT_LEAST branches.

A shared generic v0.2 boolean predicate-tree owner did not exist.

### V2.4.57 implementation A — shared predicate-tree foundation
Added supabase/functions/_shared/tcg-match-predicate-tree-v0-2.ts.

It owns only:
- deterministic all;
- deterministic any;
- deterministic not;
- fail-closed leaf delegation;
- bounded recursion.

It deliberately owns **no gameplay predicate semantics**. Attack, Ability, Tactic, listener and other mechanic owners remain responsible for evaluating their own authoritative leaf context.

Dedicated Deno coverage proves nested composition, short-circuit behavior, malformed-tree rejection and depth protection.

TCG Card Pass 2 Validation **#1143 PASS** on exact source head c14cac7fc4bd655f62dc0d180fe594138ebbbfc4.

IF remains **not complete**. The next implementation loop must migrate existing predicate consumers onto the shared tree and then cover every Release 1 IF leaf/context before the capability may move to implemented.


## V2.4.57 implementation B — Event Listener boolean composition unified

The Event Listener owner previously carried a second recursive implementation of all / any / not.

That duplicate composition logic has now been removed. Event Listener:
- delegates all boolean tree composition to tcg-match-predicate-tree-v0-2.ts;
- retains its existing event-specific leaf evaluator and exact semantics;
- retains current fail-closed unsupported-leaf behavior;
- changes no listener timing, event, pending-choice, limit, mutation or card-specific semantics.

The new shared predicate-tree file is now part of both Match Actions and Tactic Actions exact dependency closures. Release Control fingerprints were updated rather than weakening the drift guard:
- tcg-match-actions closure: **86 files**;
- tcg-tactic-actions closure: **37 files**.

TCG Card Pass 2 Validation **#1149 PASS** at exact fingerprinted source head 0a3f0f8d869d7e88cc9233f4121fb99526e38c92.

Next implementation target: extract/reuse Release 1 leaf predicate semantics that occur in more than one execution family, beginning with the smallest high-confidence state predicates. Generic IF remains incomplete until every launch IF context is covered.


## V2.4.57 implementation C — shared source_damaged leaf meaning

The first repeated Release 1 leaf semantic is now consolidated.

source_damaged was already owned by the shared Requirement evaluator for Active Ability requirements, while Attack conditional self-heal independently checked source Creature damage.

Attack now preserves its own IF program/shape validation but delegates the meaning of source_damaged to evaluateRuntimeV02SourceDamagedRequirement.

This removes one duplicate rule without moving Attack sequencing or healing authority.

TCG Card Pass 2 Validation **#1155 PASS** on exact fingerprinted source head a69ecef888cee4a1d3a2a2a65ca9cd3ec5abc5b7.

The broad Release 1 predicate-leaf task remains open; each repeated leaf is reconciled separately before generic IF is declared complete.


## V2.4.57 implementation D — shared source_has_shield_at_least leaf meaning

Release 1 uses source_has_shield_at_least on Quartzram, Reefback and Abyssalume.

The shared Requirement evaluator now owns the exact source Shield threshold meaning and validation. Attack conditional self-heal delegates to that evaluator instead of directly comparing source Creature Shield.

This preserves Attack sequencing and leaves continuous/Active Ability orchestration for their later generic routes while guaranteeing they can reuse the same leaf meaning.

TCG Card Pass 2 Validation **#1163 PASS** on exact fingerprinted source head 76b409309f41167db6d273bd8d6df2921beb5e3b.

Next proven mismatch: Release 1 Tactic play requirements use lower-case predicate reserve_count_at_least, while the current Tactic gate still recognizes only an older RESERVE_COUNT_AT_LEAST op shape. That mismatch is now the next repair target.


## V2.4.57 implementation E — Release 1 reserve-gated Tactic requirements

A frozen-registry audit found 18 Release 1 Tactics with play requirements. Five use reserve_count_at_least:
- Gale — Cyclone Route;
- Gale — Featherstep;
- Grove — Warden Fern;
- Shade — Quiet Step;
- Volt — Courier Jett.

The Tactic play gate previously recognized only an older RESERVE_COUNT_AT_LEAST op shape even though the frozen cards use the predicate grammar.

The shared Requirement evaluator now owns occupied Reserve count versus threshold. Tactic resolves the controller token and delegates the comparison. The older uppercase form is retained as compatibility input but is translated through the same predicate owner.

TCG Card Pass 2 Validation **#1171 PASS** on exact fingerprinted source head 59d388ae6e9c784324cd33aa18e38a1a8e770fa9.

The remaining Tactic play-requirement families are 12 legal_card_available uses and 1 event_occurred use.


## V2.4.57 implementation F — Release 1 legal-card Tactic requirements

Twelve frozen Release 1 Tactics use legal_card_available play requirements.

The shared Requirement evaluator now owns validation of the predicate envelope plus the rule that at least one legal candidate must exist. Tactic continues to use its existing cardOptions and creatureOptions selectors to determine the authoritative candidates for the requested controller, zone and filters.

The Creature selector was extended only for filter vocabulary already present in frozen Release 1 play requirements:
- card_family Creature;
- damaged;
- conditions_any;
- condition_any_of;
- boolean has_any_condition.

Discard-zone Basic Essence checks continue through the existing card selector.

TCG Card Pass 2 Validation **#1179 PASS** on exact fingerprinted source head 0ee6c1dd96660cfde3927b339cdcf5b9b1910839.

Seventeen of the eighteen frozen Tactics with explicit play requirements are now covered by their current structured requirement family. The final one is Stone — Reversal Seal using event_occurred for a creature defeat during the previous opponent turn.


## V2.4.57 implementation G — canonical turn-owner history

Stone — Reversal Seal requires an event from the previous opponent turn. Release 1 also contains Astral Celestyr — Dream Cartographer with TIMEFOLD, so previous opponent turn cannot safely mean current turn minus one once extra turns exist.

Added a canonical append-only turn-owner history used by Match Flow:
- opening playable turn records its owner;
- ordinary turn advance records the new owner;
- deckout turn start records the new owner before terminal evaluation;
- repeated same turn/owner writes are idempotent;
- conflicting ownership and out-of-order insertion fail closed;
- legacy private-alpha states without explicit history reconstruct ordinary alternating ownership from first_player_seat.

The previous-opponent query walks explicit ownership history rather than subtracting a turn number. A test proves turn ownership 1 → 2 → 1 → 1 resolves Player 1's previous opponent turn as turn 2.

TCG Card Pass 2 Validation **#1189 PASS** on exact source head b30cc8baee0bef938c7a764f37c7319d138fd52b.

Next target: shared event_occured/event history evaluation for Stone — Reversal Seal using this canonical window owner.


## V2.4.58 — visible zone-state presentation requirements captured

Trevor added a second presentation pass after the readable-board tests. These requirements are now part of Release 1 Battle communication, not optional decoration.

### Authoritative visual movement contract
A player should see the important physical-card consequences of the server state:
- both decks remain visible as face-down piles with count;
- every authoritative shuffle receives a visible shuffle effect;
- opening deal visibly moves face-down cards into hand/Reward zones;
- ordinary draw visibly travels from deck to hand;
- the drawing player sees the resulting canonical hand face, while the opponent sees only a face-down hand card/count;
- discard is a visible pile and is inspectable only to the extent Hidden Information says that zone/card is public;
- movement into discard is visibly represented;
- Reward selection uses a large overlay bound to the exact server-required count and eligible face-down Reward positions;
- ordinary Creature reward values 1, 2 and 3 are supported generically;
- selected Rewards visibly travel to hand before the existing suspended defeat/turn continuation resumes;
- condition changes and Ability readiness/firing receive explicit card/field feedback.

All of this is **presentation over authoritative owners**. RNG owns shuffle order. Card-Zone owns movement. Hidden Information owns visibility. Defeat/Reward owns required Reward count. Ability/Event Listener/Condition owners determine whether a state exists. The browser may animate those facts but may not recreate them.

### Resilience rule
Animations are disposable presentation. If a browser refreshes/reconnects halfway through one, the client must immediately render the current authoritative state rather than attempting to replay a stale animation as gameplay.

### Test-order decision retained
Kay's additional phone recording `Screen_Recording_20260920_193339_Chrome.mp4` is retained as evidence for the later cross-device gate. Release 1 runtime capability closeout remains the current implementation priority before another long Trevor/Kay Battle acceptance session.


## V2.4.57 implementation H — shared previous-opponent event requirement

The final frozen Tactic play-requirement family is now covered.

Stone — Reversal Seal uses:
`event_occurred(creature_defeated, controller:self, window:previous_opponent_turn, min_count:1)`.

Tactic playability now resolves the requested event controller seat and delegates the entire event/window count to the shared event-history owner. Previous-opponent lookup uses canonical turn-owner history, so a same-seat extra turn cannot make the client/runtime incorrectly inspect the immediately previous numeric turn.

Dedicated Deno coverage proves a turn ownership chain **1 → 2 → 1 → 1** still resolves Player 1's previous opponent turn as turn 2 and counts only matching controller events on that turn.

The Tactic Edge closure expanded from 37 to **39 files** because the entrypoint now directly depends on event-history and turn-history. Release Control was refreshed rather than weakening the closure guard.

TCG Card Pass 2 Validation **#1200 PASS** on exact source/manifest head `9de2db520b593624c0a12e4be6186e23470eaa72`.

Result: all **18** frozen Release 1 Tactics with explicit play requirements are now covered by current structured requirement families. The next runtime target is generic `IF` execution inside Tactic programs.


## V2.4.57 implementation I — generic IF reaches the Tactic interpreter

The frozen Release 1 registry contains exactly six Tactic-program IF instances:
- Gale — Cyclone Route;
- Shade — False Memory;
- Stone — Reversal Seal;
- Stone — Surveyor Mina;
- Tide — Recovery Spray;
- Volt — Blackout Pulse.

Tactic now delegates all/any/not composition to the shared predicate-tree owner, resolves its six Release 1 leaf meanings from current authoritative state/selectors, and replaces the IF instruction in-place with the selected then/else branch. Pending-choice semantics remain on the existing single Tactic effect cursor.

No launch card identity is referenced by the IF adapter.

TCG Card Pass 2 Validation **#1207 PASS** on exact source/manifest head `bf4dcca6ceb8c56540fdee2dfec17d59731650e2`.

This closes **Tactic IF control flow**, but not every card program downstream of IF:
- Surveyor Mina and Recovery Spray use already-supported branch opcodes and are now structurally runnable.
- Cyclone Route is blocked by generic OPTIONAL.
- False Memory is blocked by RANDOM_SAMPLE_HIDDEN_ZONE.
- Reversal Seal is blocked by ADD_SHIELD_EACH.
- Blackout Pulse is blocked by APPLY_CONDITION.

The next bounded implementation target is ADD_SHIELD_EACH because it is the smallest missing operation that unlocks a complete frozen Tactic program.
## V2.4.59 — visible resolution choreography + deck-search / attach / shuffle feedback

V2.4.58 established that authoritative zone movement must be visible. V2.4.59 extends that rule into a complete **resolution-choreography contract**: every meaningful card movement, Attack, Ability and state-changing effect must have clear player-facing feedback so players can see what the server resolved instead of inferring it from counters or text after the fact.

### Global special-effects contract

Battle presentation must visibly communicate, where applicable:
- card movement between deck, hand, field, discard, Reward and other public/authorized zones;
- shuffles, deals, draws, discards, returns-to-deck and searches;
- Creature play, evolution, Vanguard/Reserve switching and forced promotion;
- Essence/Relic attachment, removal, movement and payment;
- Attack wind-up/targeting, impact, damage, Shield change, healing and defeat;
- active Ability activation and triggered/listener resolution;
- Condition apply/clear/replace/prevent events;
- Reward selection/take and other suspended-resolution continuations.

Effects are **presentation over authoritative owners**. The client consumes the server-approved state transition, pending choice or event/result packet and visualizes it. Animation must never decide legality, random order, targets, amounts, card identities, payment, or the resulting state.

The effects layer must be extensible by event/effect type rather than card ID so future cards, moves, Abilities, Conditions and rules can reuse the same choreography system.

### Search-deck → select → attach → return → shuffle contract

For an effect such as the cited Ability that searches the deck for **3** eligible Essence/Energy cards, attaches the selected cards to legal Adult Creature target(s), returns the remainder and then shuffles:

1. The server opens the authoritative search/pending-choice context and supplies the eligible private options, required/maximum selection count and legal attachment targets.
2. The searching player sees a large private search overlay/grid with the eligible canonical card faces and a live count such as **0/3, 1/3, 2/3, 3/3** for this specific three-card effect.
3. The number is never hard-coded globally. Other effects display their own authoritative required/maximum count.
4. Selected Essence cards visibly lift/focus and can be assigned to only the server-projected legal Adult Creature/Creature target(s). Target highlighting is presentation of server legality, not a browser rule.
5. On authoritative resolution, chosen cards visibly travel from the search/deck context to the relevant Creature attachment/Essence rail.
6. Eligible cards that were inspected but not chosen visibly return to the face-down deck representation without leaking their identities to the opponent.
7. The deck then performs a visible shuffle effect **after the authoritative effect says the deck is shuffled**. The browser never chooses or reconstructs the permutation.
8. The opponent sees only information permitted by Hidden Information — for a private search this is normally a neutral search-in-progress / attachment / shuffle presentation, not the searched card identities unless the rule explicitly reveals them.
9. If the authoritative effect resolves fewer cards because of insufficient eligible cards, targets or another rule, the animation follows the actual result rather than forcing the printed maximum.
10. Refresh/reconnect skips unfinished choreography and renders the latest authoritative attachments, deck count, hand/field state and pending choice.

### Attack and Ability effects

Attack and Ability presentation must make causal order legible:
**source activates → legal target/choice → cost/payment where applicable → effect travel/wind-up → impact/state delta → listener/Condition/Defeat/Reward follow-up → continuation/turn result**.

Different effect families may use distinct visual treatments, but all remain driven by generic event/effect identities and authoritative result packets. Reduced-motion/accessibility mode may shorten or replace motion with fades/highlights while preserving the same information.

### Acceptance boundary

V2.4.59 is now part of Release 1 presentation acceptance. A rule/effect may be server-correct but still fail the player-facing gate if its important resolution is effectively invisible.
## V2.4.60 — video-comparison interaction grammar + Presentation Choreography architecture

The most recent Stream Bandit Trevor/Kay recordings were compared with the two external TCG/Pokémon interaction-reference recordings already retained in the Battle interaction authority.

Detailed comparison: `tcg-video-interaction-comparison-v1.md`.

### Design conclusion

The useful lesson from the external TCG footage is **interaction grammar, not game design**.

Stream Bandit should keep its own:
- card frame and artwork;
- eight launch elements;
- Vanguard / Reserve / Reward / Realm vocabulary;
- structured 193-card rules;
- existing authoritative Match, Card-Zone, RNG, Hidden Information, Attack, Ability, Condition, Essence, Payment, Defeat/Reward and other engines.

What should become similar is the player's ability to **see and understand the authoritative result**:
- whole stable tabletop at normal zoom;
- compact board cards + full inspection on demand;
- bottom-edge physical hand;
- legal-target highlighting;
- visible card travel between zones;
- focused card-selection overlays;
- obvious Attack/Ability source -> target -> impact -> result order;
- face-down physical representation of hidden zones;
- mobile gesture parity without a mobile rules engine.

### New presentation owner

V2.4.60 defines one reusable **Battle Presentation / Choreography Engine**.

It consumes authoritative events/state deltas/pending choices/result envelopes and emits disposable presentation cues. It owns no legality or gameplay mutation.

Its reusable presentation families are:
1. **Zone Motion** — draw/deal/play/discard/return/Reward/evolve/switch/promotion/attach/remove/payment.
2. **Choice Overlay** — server-bound N-of-M Reward/search/target/optional/private choices.
3. **Combat / Ability FX** — source activation, target focus, payment, travel/wind-up, impact, damage, Shield, heal, Condition, listener, defeat, Reward and continuation.
4. **Deck / Hidden-Zone Presentation** — face-down Deck, shuffle, opponent hand, Rewards, public Discard and viewer-specific reveal.
5. **Stable Inspector** — readable canonical copy while the source stays anchored.
6. **Pacing / Recovery** — reduced motion and immediate convergence on the newest authoritative snapshot.

### Video-derived priority

The next presentation build should not be isolated decorative effects. It should implement the generic choreography owner first, then bind Release 1 events to it.

That preserves extensibility for future cards, moves, Abilities, Conditions, rules and new sets while preventing hundreds of per-card animations.

External footage remains interaction reference only; no Pokémon artwork, branding, card designs, names or proprietary assets are to be copied.
## V2.4.61 — authoritative visual receipts + choreography foundation

V2.4.60 established the interaction architecture. V2.4.61 begins the implementation with a deliberately inert foundation before any card-specific visual effect is allowed.

### Source foundation

New shared runtime contract:
- `supabase/functions/_shared/tcg-match-presentation-envelope-v0-2.ts`
- schema: `tcg-presentation-envelope-v1`
- generic cue fields cover ordered effect family, source/target anchors, card-zone movement, state deltas, N-of-M choice metadata, continuation identity, viewer audience and presentation intensity;
- viewer filtering removes seat-private cues before another player's client may receive them;
- the schema has no legality evaluator, damage calculator, RNG seed, target chooser or mutation authority.

New browser owner:
- `stream-bandit-tcg-battle-presentation-v1.js`
- one revision-bound disposable queue;
- deterministic cue ordering;
- duplicate `receipt_id` suppression so two-second polling cannot replay the same effect;
- a newer authoritative revision invalidates stale queued choreography;
- reduced-motion mode collapses timing while retaining cue order/information;
- Battle loads the presentation owner before the existing authoritative controller;
- the controller consumes future viewer-safe `view.presentation` envelopes and broadcasts generic presentation cues without creating gameplay state.

New automated proofs:
- Deno coverage for deterministic ordering, viewer filtering, invalid-family rejection and data-driven selection counts;
- Node coverage for ordered queueing, duplicate-receipt suppression, stale-revision cancellation and Battle/controller integration.

Source candidate before documentation sync: `28828717b301168920452e27f704ca212543eade`.
TCG Card Pass 2 run #1221 is queued/pending for that exact source candidate and is not yet counted as a green checkpoint.

### New design rules adopted from the comparison

#### 1. Authoritative visual receipt instead of snapshot guessing
The preferred long-term binding is for the authoritative action/continuation owner to project a small viewer-filtered visual receipt into each persisted player view at commit time.

That receipt says **what actually happened**. The client must not attempt to deduce hidden searches, RNG, target legality or complex listener order by comparing two snapshots.

#### 2. Three presentation intensity tiers
Generic cues support:
- **micro** — common rapid actions such as ordinary draw/attach/status tick;
- **standard** — play/evolve/switch/Ability/ordinary Attack steps;
- **hero** — decisive impact such as defeat, major Reward resolution, match-ending result or another explicitly projected pivotal event.

Intensity changes pacing/emphasis only. It never changes gameplay order or outcome.

#### 3. Stream Bandit element FX language
Where a public effect has an element, the same generic effect family may receive an element skin:
- Astral — stellar/orbit glyph motion;
- Ember — heat/spark motion;
- Gale — wind/arc motion;
- Grove — growth/leaf/vine motion;
- Shade — shadow/veil motion;
- Stone — weight/shock/dust motion;
- Tide — wave/ripple motion;
- Volt — pulse/arc/electric motion.

The element skin is presentation metadata, never a card-ID branch. Meaning must not depend on colour alone; glyph/shape/text/reduced-motion equivalents remain required.

#### 4. Resolution ribbon / causal breadcrumb
Complex chains may expose a compact temporary accessible breadcrumb generated from the same receipt queue, for example:

`Attack → 80 damage → Stunned → Defeat → Reward 1`

The ribbon is explanation only. It cannot create, delay or reorder the authoritative chain.

#### 5. Private-choice mirror
When one player is in a private search/choice, the opponent should receive a neutral public-safe cue such as “Opponent is choosing cards” or “Opponent is searching their deck” where the rules permit that fact to be public. No private identities/options are mirrored.

#### 6. Animation backlog protection
If polling/reconnect reveals a newer authoritative revision, stale choreography is disposable. Repeated low-importance micro cues may later be visually coalesced for pacing, but only after the full underlying authoritative result is already committed and represented.

### Next implementation target

After the foundation source receives a green exact-head gate, bind the canonical match commit/view path to viewer-filtered presentation receipts, beginning with the existing Attack result payload because it already owns source, target, damage/Shield result, pending choice, Defeat/Reward continuation and turn aftermath evidence.

Visible DOM motion is intentionally **not** marked complete yet.
## V2.4.62 — authoritative server presentation receipt maker accepted

The V2.4.61 choreography foundation is now connected to the canonical Match commit path.

### Accepted implementation

- `runtimeV02BuildMatchPresentationReceipt` maps authoritative committed event families into generic presentation cues.
- Every successful `tcg-match-actions` commit builds one deterministic receipt bound to the **new authoritative revision**.
- The same base receipt is filtered separately through `runtimeV02PresentationEnvelopeForViewer(..., 1|2)` before the two persisted player views are written.
- The browser receives the receipt inside its normal authoritative `view_state.presentation`; it does not infer the event from snapshot differences.
- Receipt families currently cover Attack/Attack continuation, Ability/Ability choice, Creature play, Evolution, Essence/Relic attachment, Realm play, Withdraw, forced promotion, Reward take, End Turn and Concede.
- Attack receipts carry source activation -> target focus -> wind-up -> impact -> damage -> Shield delta -> Reward/promotion/turn continuation when those facts are present in the authoritative post-commit state.
- Private choice cues are seat-scoped while the opponent receives only public-safe in-progress feedback.
- Reward movement deliberately records count/source/destination without hidden Reward card UIDs.
- Receipt identity is deterministic from committed revision + event type; it carries no RNG seed and no browser legality predicates.
- Match Edge release-control dependency closure intentionally expanded from **87 -> 89 files** to include the presentation envelope and receipt maker; exact file hashes and closure digest were refreshed rather than weakening the release-control guard.

### Validation

TCG Card Pass 2 Validation **#1229 SUCCESS** on exact head `52b33b4bd204a0c9dc86b64b4790b24d8a992baa`.

The successful gate includes:
- deterministic runtime tests for receipt ordering and viewer filtering;
- Deno/type-check of the Match dispatcher plus its new presentation dependencies;
- Node source-contract proof that the canonical commit creates the receipt before player views are persisted;
- hidden Reward identity guard;
- event-family/no-card-ID/no-RNG guard;
- corrected Battle controller version assertions;
- exact 89-file Match Edge dependency closure proof.

### Runtime audit correction

The earlier V2.4.57 checklist still listed Stone — Reversal Seal's `ADD_SHIELD_EACH` as missing. Current source and tests prove that is stale:

- the Tactic interpreter owns a generic `ADD_SHIELD_EACH` branch;
- it resolves one-or-many target refs;
- each target delegates to the existing `addRuntimeShield` owner;
- no Reversal Seal/card-ID branch exists;
- the frozen registry test proves Reversal Seal is the Release 1 Tactic consumer.

Therefore Reversal Seal's post-IF opcode blocker is closed. The remaining known Tactic IF downstream gaps are **OPTIONAL**, **RANDOM_SAMPLE_HIDDEN_ZONE** and **APPLY_CONDITION**.
## V2.4.63 — generic Tactic APPLY_CONDITION closes Blackout Pulse IF branch

Fresh Release 1 owner audit showed that Condition mutation already has one canonical shared owner:
`tcg-match-condition-engine-v0-2.ts`.

Event Listener already delegates structured `APPLY_CONDITION` to that owner, including the generic modes:
- `apply`
- `apply_if_empty`
- `apply_if_empty_or_same`
- `replace`

V2.4.63 adds the missing Tactic interpreter adapter only:
- resolve the existing authoritative Creature reference;
- validate the generic condition + mode;
- call `applyRuntimeCondition(..., current turn, mode)`;
- advance the same resumable Tactic effect cursor.

No new Condition rules were created and there is no Blackout Pulse/card-ID branch.

### Frozen Release 1 consumer

**Volt — Blackout Pulse** remains data-only:
- its generic IF checks whether the opponent Vanguard modifier slot is empty or already Silenced;
- its selected branch applies **Silenced** with `apply_if_empty_or_same`;
- Device play-lock remains the following independent effect step.

### Validation

TCG Card Pass 2 Validation **#1234 SUCCESS** on exact head `ecd3d86ce060f5e3349b0af202a9393c58bbb36e`.

The gate proves:
- Blackout Pulse is the frozen Tactic IF consumer of this Tactic `APPLY_CONDITION` path;
- the interpreter delegates to shared `applyRuntimeCondition`;
- all supported generic modes remain explicit;
- no launch-card identity branch exists;
- Tactic Edge type-check passes;
- the exact 39-file Tactic dependency closure and refreshed entrypoint fingerprint pass.

The known downstream blockers for the six Release 1 Tactic IF programs are now reduced to:
1. **Cyclone Route — OPTIONAL**
2. **False Memory — RANDOM_SAMPLE_HIDDEN_ZONE**

Reversal Seal (`ADD_SHIELD_EACH`) and Blackout Pulse (`APPLY_CONDITION`) are closed.
## V2.4.64 — generic Tactic OPTIONAL parity accepted

The frozen Release 1 Tactic inventory contains **three** `OPTIONAL` consumers:
- Gale — Cyclone Route;
- Shade — False Memory;
- Shade — Quiet Step.

V2.4.64 routes all three through the existing authoritative Tactic pending-choice + resumable-cursor owner.

### Generic OPTIONAL contract
- chooser seat is resolved from structured `step.player`;
- the server creates the Yes / No choice;
- the non-chooser receives only the existing waiting view;
- wrong-seat resolution remains rejected by the existing `effect_choice_not_yours` guard;
- choosing Yes splices `steps` into the same effect cursor;
- choosing No splices `else_steps` when present;
- no second Tactic interpreter or card-ID branch exists.

The audit also exposed Shade — Quiet Step's compatibility spelling `CHOOSE_AND_CLEAR_CONTROL_CONDITION`. It now aliases the existing generic `CHOOSE_AND_CLEAR_CONDITION` owner with the control slot forced and an exact-one default when count is omitted. Condition selection/mutation authority is unchanged.

## V2.4.65 — server-only hidden-zone random sampling accepted

The frozen Set One contains three `RANDOM_SAMPLE_HIDDEN_ZONE` consumers overall:
- Shade — Duskstalker triggered Ability;
- Shade — Umbravale — Thought Hunter active Ability;
- Shade — False Memory Tactic.

The shared primitive is intentionally **non-destructive** because Ability consumers inspect/sample without necessarily moving cards.

New shared owner:
`supabase/functions/_shared/tcg-match-hidden-zone-sample-v0-2.ts`

It:
- delegates random index generation to the authoritative v0.2 RNG owner;
- samples without replacement;
- never reorders or mutates the source hidden zone;
- validates requested count and RNG indexes;
- contains no visibility policy or card identity rules.

### Tactic adapter
False Memory's Tactic path is deliberately narrow and fail-closed:
- opponent hand only;
- exact count only for the frozen Tactic shape;
- `rng_owner=match`;
- `visibility=server_only`;
- sampled instances are stored in private effect variables with source provenance;
- the following generic `MOVE_CARDS` honors its structured `player` field and delegates physical movement by exact UIDs to Card-Zone;
- the randomly sampled card becomes public only after the authoritative move reaches public Discard;
- no browser RNG and no False Memory card-ID branch exist.

The audit also corrected a generic `MOVE_CARDS` issue: no-selection movement now respects the declared `step.player` before fallback ownership, which is required for opponent-zone effects.

### Validation
TCG Card Pass 2 Validation **#1250 SUCCESS** on exact head `93c169b63423ef029bf7cbd071eb4e09c27bd74d`.

The accepted gate covers:
- all three frozen Tactic OPTIONAL consumers;
- Yes / No / `else_steps` cursor semantics;
- Quiet Step control-condition compatibility alias;
- non-destructive hidden-zone sampler tests;
- False Memory server-only provenance + Card-Zone movement source contracts;
- Tactic Edge type-check;
- exact Tactic dependency closure expanded **39 -> 40 files** for the new shared sampler.

### Tactic IF closeout
All six frozen Release 1 Tactic IF programs now have executable generic downstream paths:
- Cyclone Route — OPTIONAL ✅
- False Memory — RANDOM_SAMPLE_HIDDEN_ZONE + OPTIONAL ✅
- Reversal Seal — ADD_SHIELD_EACH ✅
- Surveyor Mina ✅
- Recovery Spray ✅
- Blackout Pulse — APPLY_CONDITION ✅

The next Master Plan gate is **generic Attack IF execution across all 13 frozen Attack IF instances**.
## V2.4.66 — shared Attack IF predicate foundation

The frozen Release 1 Attack inventory contains **13 IF instances across 11 cards**.

The eight predicate families are:
- `card_matches`;
- `control_condition_slot_empty`;
- `event_occurred` with `current_action`;
- `reserve_count_at_least`;
- `source_damaged`;
- `source_has_shield_at_least`;
- `target_has_any_condition`;
- `target_remains_in_play_after_damage`.

New shared read-only owner:
`supabase/functions/_shared/tcg-match-attack-if-v0-2.ts`

It:
- routes boolean composition through the shared predicate-tree owner;
- reuses the shared Requirement evaluator for source damage, source Shield and reserve-count semantics;
- reuses the shared Condition engine for target Condition-slot/active-Condition state;
- consumes caller-owned current-action event evidence rather than creating a parallel event log;
- delegates `card_matches` card/filter meaning to the caller because card-selection/filter ownership remains separate;
- performs no damage, healing, Condition mutation, card movement, switching or RNG;
- contains no launch card identity.

### Validation
TCG Card Pass 2 Validation **#1255 SUCCESS** on exact head `00d5f8a7aec223dcd8c5a336d27046ac7d1ad3b7`.

The green gate proves:
- exact inventory: 13 Attack IF instances / 11 cards / eight predicate families;
- nested `all` composition;
- source-state leaf reuse;
- target Condition/survival leaves are read-only;
- current-action event leaf consumes supplied event evidence;
- card_matches delegates to caller filter ownership;
- unknown predicates/event windows fail closed;
- all Edge type-checks remain green.

This is the **predicate/control-flow foundation only**. The Master Plan box “generic Attack IF execution for every Release 1 Attack IF shape” remains open until all 13 instances route their selected branches through existing authoritative effect owners without printed-English fallback or duplicate execution.
## V2.4.67 — generic Attack declaration current-action events

Release 1 Attack `on_declare` contains exactly **two** operations and both are structured `RECORD_EVENT`:
- Volt — Stormmane / Storm Break: record `storm-break-overcharged` when source attached Essence count >= 4;
- Volt — Stormcoil — Living Circuit / Chainstorm: record `chainstorm-borrowed` when source has attached borrowed Essence.

New shared owner:
`supabase/functions/_shared/tcg-match-attack-declaration-events-v0-2.ts`

It:
- reads only structured `on_declare`;
- owns the two frozen declaration predicate shapes;
- returns an action-local event-count map;
- does not persist a second event history;
- reuses the Attack-authority attached-Essence-kind query;
- is card-ID-free and fail-closed on unsupported declaration operations/predicates.

### First migration
The canonical Match Attack dispatcher now creates `attackActionEvents` once after structured Attack authority is resolved.

Storm Break's existing overcharge choice flow now tests:
`attackActionEvents[structuredOverchargeDiscard.event] >= 1`

instead of calling the old bespoke threshold boolean in the dispatcher.

Chainstorm will consume the same event map through the shared Attack IF evaluator in the conditional-Condition migration.

### Validation
TCG Card Pass 2 Validation **#1265 SUCCESS** on exact head `fb494fedd43851acc4302b4e6d1327715214c689`.

The exact Match Edge release-control closure expanded **89 -> 90 files** for the new declaration-event owner and includes the refreshed Attack-authority + Match entrypoint blobs.
## V2.4.68 — conditional Condition Attack IF family migrated

Five frozen Attack IF instances across four cards now execute through the shared Attack IF predicate owner and shared Condition engine:
- Grove — Elderbloom — First Canopy / Forest Awakening: outer reserve+survival IF plus nested control-slot IF;
- Shade — Umbravale — Thought Hunter / Mind Eclipse;
- Tide — Abyssalume / Abyssal Break;
- Volt — Stormcoil — Living Circuit / Chainstorm.

New generic owner:
`supabase/functions/_shared/tcg-match-attack-conditional-condition-v0-2.ts`

It only claims after-damage programs whose reachable operations are:
- `IF`;
- `APPLY_CONDITION`;
- `REPLACE_CONTROL_CONDITION`;

and only when at least one IF exists. Direct condition-only programs remain with the existing direct structured Condition owner.

### Ownership
- IF decisions route through `runtimeV02EvaluateAttackIf`;
- actual Condition mutation routes through `applyRuntimeConditionWithContext`;
- Condition protection/immunity remains authoritative;
- `REPLACE_CONTROL_CONDITION` maps to the shared `replace` mode after validating the structured replacement shape;
- Chainstorm's `event_occurred(current_action)` consumes the V2.4.67 `attackActionEvents` map;
- the dispatcher uses direct structured Condition ownership first, then conditional structured ownership, then legacy compatibility only if neither claims the attack.

### Validation
TCG Card Pass 2 Validation **#1274 SUCCESS** on exact head `cab1a7daa29e8d129050dcde71e69eebe4f50b65`.

The exact Match Edge dependency closure is now **92 files**, adding the shared Attack IF and conditional-Condition modules.

## V2.4.69 — bounded Attack IF owners migrated onto the shared evaluator

The next five frozen Attack IF instances have now moved from owner-local predicate decisions onto `runtimeV02EvaluateAttackIf` while preserving their existing mutation owners:

- Tide — Rillrunner / Rushing Wake: `source_damaged -> HEAL`;
- Tide — Reefback / Guarded Surge: `source_has_shield_at_least -> HEAL`;
- Grove — Verdantusk / Canopy Crash: `reserve_count_at_least -> HEAL_EACH`;
- Shade — Nightmaw / Dread Crush: `target_has_any_condition -> DISCARD_DECK_TOP`;
- Astral — Cosmarch / Known Horizon: `card_matches -> MOVE_CARDS`.

### Ownership preserved

- self-heal and HEAL_EACH still use the existing Attack effect owner and canonical Heal packet/lifecycle owners;
- Nightmaw still uses the Attack Deck-Discard owner, Card-Zone for physical deck -> discard movement, then the existing Event -> Movement -> Heal listener chain;
- Known Horizon still keeps server-only top-deck inspection in its bounded owner and uses Card-Zone for deck -> hand movement;
- only the IF decision moved to the shared Attack IF evaluator;
- no card-ID branch was added.

The deck-discard resolver now receives the authoritative target Creature instead of a precomputed boolean so `target_has_any_condition` is evaluated by the same shared Condition/Attack IF path as other consumers.

### Regression repair

The migration correctly invalidated older source-contract tests that expected direct predicate code. Those guards have been updated to assert the new ownership boundary instead:
- HEAL_EACH -> shared Attack IF;
- self-heal -> shared Attack IF -> Requirement evaluator;
- server top-deck -> inspect -> shared Attack IF -> Card-Zone;
- deck-discard listener-chain test -> actual target Creature state.

TCG Card Pass #1283 proved all Deno/runtime/type-check jobs green after those test repairs. Its only remaining failure was the stale Match Edge release-control digest.

The exact Match Edge dependency closure remains **92 files** and has been rebuilt from the current Git tree. Its independently verified SHA-256 is:
`2b3cac54083c9cd07e94661b157d6719e4ea3007543665a141d8baaede2ffcfe`.

### Current Attack IF progress

- V2.4.68 conditional Condition family: **5 / 13** ✅
- V2.4.69 bounded heal / HEAL_EACH / deck-discard / top-deck family: **+5**
- current total routed through shared Attack IF: **10 / 13**

Remaining frozen Attack IF instances:
1. Gale — Slipwing / Backdraft: reserve-count IF -> selected Reserve switch;
2. Volt — Stormmane / Storm Break outer `event_occurred(current_action)` IF -> attached-Essence discard;
3. Volt — Stormmane / Storm Break nested target-survival IF -> Stunned.

TCG Card Pass 2 Validation **#1284 SUCCESS** on accepted source/manifest head `e542a0060266502d1cb74a93a618a9bb8032a0ed`. V2.4.69 is accepted. Main/live remain untouched.

## V2.4.70 / V2.4.71 — Attack IF source closeout: Backdraft + Storm Break

The final three frozen Release 1 Attack IF instances are now routed through the shared Attack IF predicate owner in branch source.

### V2.4.70 — Gale / Slipwing / Backdraft

Backdraft's structured after-damage program is:
`reserve_count_at_least(self,1) -> SELECT_CREATURE(self reserve, exactly 1) -> SWITCH_WITH_VANGUARD(action_kind=attack)`.

A new card-ID-free bounded owner, `tcg-match-attack-switch-choice-v0-2.ts`, now:
- recognizes only that structured switch family;
- evaluates the reserve-count IF through `runtimeV02EvaluateAttackIf`;
- opens a private authoritative `pending_attack_choice` listing occupied legal Reserve anchors;
- resolves the player's exact-one selection through the existing Atomic Switch owner;
- resumes through the existing Movement Listener -> Heal Listener -> Aftermath continuation;
- never reads a browser-supplied switch target during the original Attack declaration.

The Battle client now routes generic `pending_attack_choice` through its existing server-choice overlay to `resolve_attack_choice`. This also exposes the already-existing Match Attack choice families through one common transport rather than a Backdraft-only control.

### V2.4.71 — Volt / Stormmane / Storm Break

Storm Break's remaining nested IF decisions now use the same shared evaluator:
- outer `event_occurred(current_action)` consumes the authoritative action-local declaration-event map;
- nested `target_remains_in_play_after_damage` consumes the authoritative primary-damage survival snapshot.

The existing overcharge owner still owns the attached-Essence discard choice, Card-Zone transfer and Condition application. The IF migration does not duplicate those mutations.

### Attack IF source status

- Tactic IF: 6 / 6 generic executable paths already accepted.
- Attack IF: **13 / 13 frozen instances now routed through shared Attack IF in source**.
- No launch card identity was added to either generic owner.
- Match Edge dependency closure is **93 files** after the Backdraft choice owner.
- Current release-control digest after the Attack IF closeout source is `0daefbf978518e78751ec327f49a88e7f66122d930a1eee98028e4902b7514b6`.

CI note: Card Pass #1285 proved the new Backdraft owner module itself green. #1287 validated an earlier combined head and exposed stale type/test guards; those exact failures have since been repaired on the branch. The connector has not yet attached a Card Pass run to the current post-repair head, so **Attack IF exact-head acceptance remains open**. No merge/live promotion is implied.
