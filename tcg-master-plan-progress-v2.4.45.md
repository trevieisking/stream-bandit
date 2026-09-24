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

## V2.4.72 — Ability IF inventory + triggered-Ability IF execution

Release 1 structured IF inventory is now reconciled directly from all eight frozen Set One Card Pass files:

- Tactic IF instances: **7** across six Tactic programs;
- Attack IF instances: **13**;
- Ability IF instances: **9**;
- total Release 1 IF instances: **29**.

### Attack IF acceptance

TCG Card Pass 2 Validation **#1288 SUCCESS** on exact head `8db9ac8da165aac56e06ffc466a7892749eb75a1` closes the Attack IF gate. All **13 / 13** frozen Attack IF instances are executable through the shared Attack IF owner without printed-English/card-ID decision fallback.

### Ability IF audit

Three triggered build/evolution Ability IF programs were already executable through the generic Event Listener IF path and shared predicate-tree composition:
- Cinderburrow — Ash Tunnel: `legal_card_available -> SELECT_CREATURE -> HEAL`;
- Briarback — Growing Wall: `reserve_count_at_least -> HEAL`;
- Bloomhare — Spring Growth: `all(friendly_other_creature_matches, target_damaged) -> HEAL`.

Existing deterministic Event Listener tests already prove those paths, including canonical Heal packet emission.

Three attack-declared triggered Ability IF programs were the next genuine gap:
- Furnacefang — Controlled Burn: `source_damaged -> MODIFY_CURRENT_ATTACK_DAMAGE(+20)`;
- Ashcobra — Ash Scent: `event_attack_target_damaged -> MODIFY_CURRENT_ATTACK_DAMAGE(+10)`;
- Thornmantis — Briar Instinct: `any(event_attack_target_has_condition(Venomed), event_attack_target_has_condition(Rooted)) -> MODIFY_CURRENT_ATTACK_DAMAGE(+10)`.

The existing synchronous attack-declared listener owner now accepts a structured IF wrapper around its existing current-Attack modifier mutation. IF composition delegates to the shared predicate-tree owner; source damage, target damage and target Condition state come from authoritative field state. An IF-false branch records a zero-delta resolution without consuming the once-per-turn Ability use.

TCG Card Pass #1289 proved the new Ability IF runtime tests and all Deno/type-check jobs **SUCCESS**. Its only failing job was release-control drift caused by the changed Event Listener blob. The exact 93-file Match closure was then refreshed to the CI-computed digest:
`1fbfb54a7d1fd39b0f6c660adcf9013452d2b3a169cd47b07eab0c7808de0b76`.

Current Ability IF source/accounting status: **6 / 9**.
Remaining active Ability IF programs:
1. Noctivane — Night Reading: `selected_count_at_least -> SCHEDULE_ACTION`;
2. Surgefin — Undertow Supply: `target_damaged -> HEAL`;
3. Marevault — Heart of Tides: `essence_move_count_at_least -> SELECT_CREATURE -> HEAL`.

Exact-head Card Pass after the release-control refresh remains the acceptance gate for V2.4.72. Main/live remain untouched.

## V2.4.73 — Noctivane / Night Reading active Ability IF source closeout

The first remaining active Ability IF family is now implemented through generic owners.

### Generic ownership added

- **Card-Zone within-zone reorder**: `runtimeV02ApplyCardZoneReorder` owns exact-instance same-zone reordering such as opponent deck top -> deck bottom. This avoids effect-local array mutation and preserves Card-Zone authority.
- **Active Ability IF**: `runtimeV02EvaluateActiveAbilityIf` delegates `all/any/not` composition to the shared predicate-tree owner and currently supports the frozen active-Ability leaves `selected_count_at_least`, `target_damaged`, and `essence_move_count_at_least`.
- **Scheduled Action lifecycle**: `runtimeV02ScheduleAction` / `runtimeV02ResolveControllerAftermathScheduledActions` own deferred `controller_aftermath_finished` actions. Current Release 1 scheduled execution supports `DRAW_FIXED` and delegates physical deck -> hand movement to Card-Zone. Incomplete fixed draw records deckout for Match Flow to resolve.
- **Deck-reading active Ability family**: a card-ID-free adapter recognizes inspect opponent deck-top -> optional choose -> deck-bottom reorder -> selected-count IF -> scheduled fixed draw.

### Night Reading execution

For the frozen Noctivane program:
1. Match opens an authoritative private `pending_ability_choice`.
2. Only the controller sees the inspected top-card identity; the opponent sees a waiting choice.
3. Selecting the card moves that exact instance to deck bottom through Card-Zone reorder.
4. Shared Active Ability IF evaluates `selected_count_at_least($bottom,1)`.
5. If true, a deferred opponent `DRAW_FIXED 1` is scheduled for `controller_aftermath_finished`.
6. Immediately before canonical turn advance, Match resolves that controller-aftermath schedule; Card-Zone performs any draw, deckout is recorded if incomplete, then Match Flow retains terminal/turn authority.
7. Public Match receipts expose only selection/movement/schedule counts/booleans, never the privately inspected card identity.

The generic Battle `pending_ability_choice` transport is reused; no Noctivane-specific browser control exists.

### Evidence

Card Pass #1291 on the first combined Night Reading head proved the new scheduled-action tests were discovered. It exposed one Match union exhaustiveness error plus stale release-control; both are repaired. Release-control now reflects:
- `tcg-private-alpha-api`: **8 files**, digest `92913c762cb3660fd92523ef0580e4afb5870588caae04ca6c48cefbffdec434`;
- `tcg-match-actions`: **96 files**, digest `89326ab368dbd8f9af435c27d0bbe8f493aaa23466c78a502c13d7dd234d5348`;
- `tcg-tactic-actions`: **40 files**, digest `5ff943f5d62ee53f5621ba1cbe539e0362b8473ef832c33c036241db1c82cc26`.

The Setup digest independently matches #1291's CI-computed value. A post-repair exact-head Card Pass has not yet attached, so Night Reading remains **source-complete / CI-pending** rather than accepted.

Ability IF source/accounting progress: **7 / 9**.
Next exact target: Tide — Surgefin / Undertow Supply.

## V2.4.74 — Surgefin / Undertow Supply active Ability IF source closeout

The second remaining active Ability IF family is now implemented through generic active-Ability orchestration rather than a card branch.

### Generic ownership

- `tcg-match-active-ability-supply-v0-2.ts` recognizes the structured family:
  `SELECT_CARDS(self discard, 0..1 filtered Basic Essence) -> SELECT_CREATURE(self reserve, exactly 1 filtered element) -> ATTACH_ESSENCE_FROM_ZONE -> IF(target_damaged) -> HEAL`.
- The choice is server-owned and private. It exposes exactly one legal Reserve target plus optional eligible discard Essence options.
- Physical attachment remains owned by the canonical Essence Attachment route; no effect adapter splices discard/attachment arrays.
- Post-attachment IF evaluation remains owned by shared Active Ability IF.
- Healing remains owned by canonical Heal packets.
- A generic active-Ability continuation receipt preserves unfinished Ability work across nested Event -> Movement -> Heal listener choices.
- The Heal Listener facade now has a distinct `resume_active_ability_effect` intent so nested listener healing returns to the unfinished Ability rather than prematurely restoring ordinary Play.

### Undertow Supply semantics

For the frozen Surgefin program:
1. Requirements preflight confirms at least one eligible Basic Tide Essence exists in discard and at least one Reserve exists.
2. Player chooses exactly one legal Tide Reserve target and may choose zero or one eligible discard Essence.
3. If Essence is chosen, that exact instance attaches through the canonical Essence Attachment route.
4. Any attachment-triggered Event/Movement/Heal listener continuation fully resolves first.
5. Shared Active Ability IF evaluates `target_damaged($supply_target)` against authoritative post-listener field state.
6. If true, canonical Ability Heal applies 10, including normal before-heal/listener processing.
7. If false, no Heal packet is emitted.
8. Public Match receipts expose counts/target slot and listener audit only; selected Essence identity is not published.

### Evidence

TCG Card Pass #1305 on pre-refresh head `2431fcd654c61366a3be7a8fd677ea8606ada538`:
- deterministic runtime core: **SUCCESS**;
- new Surgefin semantic-owner tests: discovered and passed;
- new Match/source wiring tests: discovered and passed;
- only failing gate: stale Match release-control count **98 != 96**.

Release-control is refreshed on current exact head `c37660dd4c712055ca027caf18a036684de89e09`:
- Setup: **8 files**, `92913c762cb3660fd92523ef0580e4afb5870588caae04ca6c48cefbffdec434`;
- Match: **98 files**, `89dd8281cdd596083a2bc65ddc6760ac5cda4716fc25691e084962fd8a30fb63`;
- Tactic: **40 files**, `b23e7d6c2c6142087d01fac47ad2ed03664ac5467a008a9553bd413ad9c4ba3a`.

Exact-head Card Pass **#1306 SUCCESS** on `c37660dd4c712055ca027caf18a036684de89e09` accepted the Surgefin / Undertow Supply slice. Surgefin is **source-complete / runtime-tested / exact-head accepted**.

Ability IF source/accounting progress: **8 / 9**.
Final active Ability IF target: Tide — Marevault / Heart of Tides.

## V2.4.75 — Marevault / Heart of Tides + Release 1 IF closeout

The final frozen Release 1 Ability IF is now executable through generic owners and exact-head validation is green.

### Heart of Tides ownership

- `tcg-match-active-ability-essence-redistribution-v0-2.ts` recognizes the generic family:
  `MOVE_ATTACHED_ESSENCE(0..N) -> IF(essence_move_count_at_least) -> SELECT_CREATURE(participated_in_moves + filters) -> HEAL`.
- Movement options are derived from authoritative friendly field state and attached Essence identity; no card ID owns the movement rule.
- The existing Essence Movement engine remains the only mutation/receipt owner for attachment-to-attachment transfer.
- The full selected movement set is preflighted against a cloned authoritative state before any real mutation, preventing partial multi-move application.
- A single Essence instance cannot satisfy more than one selected movement.
- The IF consumes exact movement receipts through shared Active Ability IF rather than reconstructing movement count from browser state.
- A threshold heal target must be currently legal, damaged, match the structured element filter and have participated in one of the selected movements.
- Healing remains canonical Ability Heal packet + existing after-heal listener orchestration.
- Public Match receipts expose movement count / IF result / heal amounts only; raw Essence identities, movement receipts and heal-target UID stay out of the public payload.

### Heart of Tides evidence

TCG Card Pass #1310 proved the generic redistribution owner before live wiring.
The integrated slice then exposed only:
1. a descriptor-range TypeScript narrowing issue, repaired by keeping `min/max` descriptor-driven; and
2. the expected Match Edge dependency closure expansion from 98 -> 99 files.

Release-control on exact accepted head:
- Setup: **8 files**, `92913c762cb3660fd92523ef0580e4afb5870588caae04ca6c48cefbffdec434`;
- Match: **99 files**, `d9c5f8ee7283e60563fc5e700c302d858374d311eaa7e4178ef26db2eb67289e`;
- Tactic: **40 files**, `b23e7d6c2c6142087d01fac47ad2ed03664ac5467a008a9553bd413ad9c4ba3a`.

TCG Card Pass 2 Validation **#1319 SUCCESS** on exact head
`148bcc1164c05cd6c523b8fc3566f748705f5c15`.

### Release 1 IF closeout

Frozen Set One IF inventory is now fully executable through structured generic owners:
- Tactic IF: **7 / 7 instances** across six Tactic programs;
- Attack IF: **13 / 13 instances**;
- Ability IF: **9 / 9 instances**;
- total: **29 / 29 IF instances**.

No remaining Release 1 IF decision requires printed-English or card-ID fallback.

The next Master Plan runtime target is the capability reconciliation/audit: update `tcg-runtime-capabilities-v0.2.json` to reflect proven IF/predicate ownership, then continue the Release 1 operation/predicate audit until every used partial/missing capability is implemented or proven already owned.

## V2.4.76 — accepted IF capability-manifest reconciliation

The runtime capability inventory has been reconciled to the accepted V2.4.75 IF evidence.

### Capability changes

`tcg-runtime-capabilities-v0.2.json` now classifies:
- operation `IF` as **implemented**;
- all 20 predicate families actually consumed by the 29 accepted Release 1 IF instances as **implemented**.

The three former partial predicate classifications
`reserve_count_at_least`, `target_has_condition`, and
`target_printed_hp_at_least` are now implemented, so the obsolete
legacy-predicate-equivalent notes were removed.

The old operation legacy note claiming only narrow IF branches was also removed.
A machine-readable reconciliation evidence block binds the classification change
to accepted runtime head
`148bcc1164c05cd6c523b8fc3566f748705f5c15` / Card Pass #1319.

Two older bounded-owner regression tests were updated so they continue to prove
that Storm Break / Known Horizon stay narrow without incorrectly requiring the
global capability ledger to remain stale.

Release-control capability-manifest fingerprint was refreshed to blob
`daf061a5e539e5880be428256c68d46060ac391e`.

TCG Card Pass 2 Validation **#1326 SUCCESS** on exact head
`5b1eedcee6eb6893e7c8395fd5ab3f814f52ab33`.

Next audit target: reconcile stale Release 1 operation classifications against
their actual generic owners, starting with operations already proven in the
Event Listener / Tactic / bounded Attack paths before writing any new engine.

## V2.4.77 — accepted hidden-zone sampling owner parity + capability reconciliation

The frozen Release 1 hidden-sample inventory contains exactly three `RANDOM_SAMPLE_HIDDEN_ZONE` consumers:
- Shade — Duskstalker: triggered Ability through Event Listener;
- Shade — Umbravale — Thought Hunter: active Ability through the generic hidden-sample owner;
- Shade — False Memory: Tactic interpreter.

All three now delegate random selection to the shared non-destructive Hidden-Zone sampler / canonical Match RNG owner. Event Listener and active-Ability paths preserve controller-private visibility; False Memory keeps its server-only sample until later public Card-Zone movement. No card-ID-specific RNG or browser-owned randomization was added.

The final stale ownership guards were made formatting-independent rather than preserving obsolete source spelling. Card Pass #1346 proved the source/test repair on `fff845a874c570fabbe1bc16ff07ed528ba5a12a`.

`tcg-runtime-capabilities-v0.2.json` now classifies operation `RANDOM_SAMPLE_HIDDEN_ZONE` as **implemented**. Release-control capability-manifest fingerprint was refreshed to blob `230757a376b67516c48fe6cf1f85b401b9539c98`.

TCG Card Pass 2 Validation **#1348 SUCCESS** on exact reconciled head
`cb69519eed59de3700190c11245a5e395187fc77`.

### Next exact runtime target

Continue the usage-driven predicate audit with `control_condition_present`.

Current evidence is deliberately split:
- Thought Hunter already evaluates `control_condition_present` through its generic active hidden-sample requirement owner and canonical Condition state;
- Murkmite's continuous outgoing Attack-damage path is **not yet complete**: the shared outgoing Attack-damage predicate adapter currently recognizes only `target_has_any_condition`, so Murkmite's `control_condition_present` condition would not match there;
- Hollowcrown uses the same predicate in a separate active condition-replacement family and must be audited independently before any global capability classification changes.

Therefore `control_condition_present` remains open and the next implementation pass targets the Murkmite continuous Attack-damage consumer first.

## V2.4.78 — accepted Creature-owned continuous outgoing Attack-damage family

The usage-driven audit found exactly three frozen Release 1 Creature Ability continuous `attack_damage` effects:
- Ember — Glowcub / Warm Blood: `source_damaged` + exact `spark-pounce` filter;
- Shade — Murkmite / Murk Sense: `control_condition_present` on `$current_opponent_vanguard` + exact `murk-nip` filter;
- Stone — Quartzram / Prismatic Bulwark: `source_has_shield_at_least` + exact `prism-ram` filter.

The deeper source audit corrected the initial V2.4.77 assumption: the pre-existing outgoing Attack Damage owner collected attached-Essence continuous modifiers only, so Creature-owned outgoing modifiers did not yet reach that owner.

### Accepted owner repair

`tcg-match-attack-damage-v0-2.ts` now owns one generic source-Creature continuous outgoing Attack-damage lane:
- source Creature continuous effects are discovered from structured Creature Ability metadata, never card IDs;
- `source_damaged` and `source_has_shield_at_least` delegate to the existing canonical Requirement evaluator;
- `control_condition_present` reads authoritative current-opponent-Vanguard control state supplied by Match;
- exact `attack_id` is supplied by Match so structured filters remain data-driven;
- the current-opponent-Vanguard condition is independent of the actual selected attack target, so Murkmite remains correct when a legal attack targets a Reserve;
- attached-Essence outgoing damage modifiers and all incoming-damage / Damage-Protection ownership remain unchanged.

Behavioral tests cover all three frozen Creature consumers and the no-card-ID live-wiring guard. Runtime Pass B attack-damage and Surge materialization guards were extended with the exact fourth canonical Match damage-function shape rather than bypassed.

Release-control Match closure is now:
- Attack Damage blob: `c263c8242aaaeabb37def0fb152efdc537236930`;
- Match Actions blob: `e9b5b89d002be10f92908866e93ceec6cc5e5aa8`;
- closure SHA-256: `8ad4b33ea35d5f9273609b5866176a2cf4a2050e9f1caea64c953549432de3ab`.

TCG Card Pass 2 Validation **#1358 SUCCESS** on exact head
`56acfa6ca8c2e6930cea6a9c14a1de1feb0c7c8d`.

### Next exact runtime target

Shade — Hollowcrown / Hollow Command.

Current audit proves no existing active-Ability runtime module recognizes either `REPLACE_CONTROL_CONDITION` or Hollow Command's `control_condition_present` requirement. Build that family through the existing Active Ability + Condition owners without a Hollowcrown/card-ID branch, then reassess whether `control_condition_present` and `REPLACE_CONTROL_CONDITION` can move to implemented globally.

## V2.4.79 — accepted Hollow Command condition-replacement family + capability reconciliation

Shade — Hollowcrown / Hollow Command is now executable through generic structured owners.

### Hollow Command ownership

The frozen contract is:
- own-turn active Ability;
- once per turn;
- zero additional costs;
- current opponent Vanguard must already have a control condition;
- that existing control condition must not already be Mindbound;
- replace the control slot with Mindbound.

`tcg-match-active-ability-condition-replacement-v0-2.ts` now owns this generic family:
- recognition is shape-driven from structured Ability metadata, never Hollowcrown/card ID;
- the complete activation is preflighted on a cloned authoritative state before the real once-per-turn receipt is written;
- active-seat / source binding / once-per-turn ownership remains with the existing Active Ability activation-cost owner;
- the requirement reads canonical opponent-Vanguard control state;
- the actual mutation delegates to `applyRuntimeConditionWithContext(..., "replace", ...)`, preserving Condition immunity/protection ownership;
- an illegal empty/already-Mindbound target state fails before consuming the Ability use;
- a legal activation prevented by Condition protection still consumes the once-per-turn use because activation was permitted before Condition prevention resolved;
- no Damage, Heal, player-choice or browser-owned condition mutation path was added.

The single Active Ability live router exposes this as its own `condition_replacement` family. Match records only structural/public replacement and prevention data.

### Frozen capability inventory

Release 1 has exactly three `control_condition_present` consumers:
- Shade — Murkmite / Murk Sense continuous Attack-damage modifier;
- Shade — Hollowcrown / Hollow Command active Ability;
- Shade — Umbravale — Thought Hunter active hidden-sample requirement.

Release 1 has exactly two `REPLACE_CONTROL_CONDITION` consumers:
- Hollowcrown / Hollow Command active Ability;
- Thought Hunter / Mind Eclipse conditional after-damage Attack program.

All five consumer paths are now proven through generic owners. Mind Eclipse already routes through the existing conditional-Condition Attack owner, which delegates replacement to the same canonical Condition engine.

### Release-control / CI evidence

The Match Edge closure expanded from 101 -> 102 files to include the new condition-replacement owner.

Accepted Match closure:
- condition-replacement owner blob: `ec40e106d28ff89bf72b31891f57e3450815fc15`;
- Active Ability live-router blob: `9a9accf5d9c3be27c7a97046e7651ac5217da14d`;
- Match Actions blob: `0641a97f47543cc6932a003b92a1e0d024be8d6d`;
- closure SHA-256: `5e931b3692c3b5b36915adea48870fb48595152abeb0ab7c343bc3dfa8ac2ce1`.

Card Pass #1369 proved the complete runtime/source closure before capability reconciliation.

`tcg-runtime-capabilities-v0.2.json` now classifies:
- predicate `control_condition_present` as **implemented**;
- operation `REPLACE_CONTROL_CONDITION` as **implemented**.

The capability manifest is fingerprinted by release control at blob
`880b6395d55da7bdfa241609cabd1446a02d34ae`.

TCG Card Pass 2 Validation **#1371 SUCCESS** on exact reconciled head
`d370d0db839456f8e2c83dab247fcd5d0802e315`.

### Next exact runtime target

Continue the Release 1 operation audit with `DISCARD_ATTACHED_ESSENCE` / Volt — Stormmane.

Current source evidence shows one frozen structured consumer but Match still contains a legacy Stormmane card-ID branch that performs the attached-Essence -> discard Card-Zone transfer. The next pass must replace that card-specific fallback with a generic structured Attack operation owner while preserving Card-Zone mutation/event ownership and existing Storm Break IF/target-survival sequencing.

## V2.4.80 — accepted Storm Break attached-Essence discard capability reconciliation

The post-V2.4.79 audit corrected the initial next-target assumption.

The frozen Release 1 inventory contains exactly one `DISCARD_ATTACHED_ESSENCE` consumer:
- Volt — Stormmane / Storm Break.

No new runtime implementation was required.

### Existing generic owner proof

`tcg-match-attack-overcharge-discard-choice-v0-2.ts` already owns the complete structured Storm Break family:
- declaration evidence is captured from structured `RECORD_EVENT`;
- the outer current-action IF is evaluated by the shared Attack IF owner;
- the actual attached-Essence discard is exposed as a private server-owned exact-one choice;
- choice resolution preflights and commits the exact attached-Essence -> discard mutation through Card-Zone;
- exact instance identity is preserved;
- the nested target-survival IF is evaluated from authoritative post-damage state;
- the resulting Stunned application delegates to canonical Condition ownership;
- public receipts expose structural outcome only, never the selected Essence UID/card ID.

The owner is data-driven and contains no Stormmane/card-name authority. Frozen-family tests prove Storm Break is the only Release 1 attack matching this structured family.

The remaining `atk.metadata_source === "legacy" && ad?.id === "volt-stormmane"` Match branch is compatibility-only for unmarked legacy snapshots. Marked v0.2 Stormmane is explicitly guarded away from that fallback and already uses the generic structured owner. Removing the legacy-only branch would risk breaking preserved raw-legacy compatibility and is not required for v0.2 capability parity.

### Capability reconciliation

`tcg-runtime-capabilities-v0.2.json` now classifies operation
`DISCARD_ATTACHED_ESSENCE` as **implemented**.

Release-control capability-manifest fingerprint is refreshed to blob
`12c08d16cb5789a138cb9812be48c3e7e2e288e3`.

### Next exact runtime target

Continue the usage-driven Release 1 operation audit. Prefer the next smallest real gap or stale classification that can be proven without disturbing working compatibility paths; do not rewrite a working generic owner merely to remove a legacy-only fallback.

## V2.4.81 — accepted Attack declaration event capability reconciliation

The frozen Release 1 Attack `on_declare` inventory contains exactly two structured steps:
- Volt — Stormmane / Storm Break;
- Volt — Stormcoil — Living Circuit / Chainstorm.

Both steps are `RECORD_EVENT` and the complete predicate inventory is exactly:
- `event_attack_source_attached_essence_count_at_least`;
- `event_attack_source_has_attached_essence_kind`.

No runtime implementation was required.

`tcg-match-attack-declaration-events-v0-2.ts` already owns the full frozen family:
- it resolves structured Attack definitions from the registry;
- it evaluates attached-Essence count directly from authoritative source Creature attachments;
- attached-Essence kind queries delegate to the shared Attack authority query;
- it emits action-local event counts only when the structured predicate matches;
- it fails closed on unsupported declaration operations, predicates, fields and Essence kinds;
- it contains no Stormmane/Stormcoil/card-name dispatch.

Runtime tests prove both predicate shapes, false/no-event behavior and fail-closed handling. Frozen-family tests prove there are exactly two Release 1 `on_declare` steps and both are owned by this family.

`tcg-runtime-capabilities-v0.2.json` now classifies as **implemented**:
- operation `RECORD_EVENT`;
- predicate `event_attack_source_attached_essence_count_at_least`;
- predicate `event_attack_source_has_attached_essence_kind`.

Release-control capability-manifest fingerprint is
`c4ef4855a334fee0f9fc3d611b4b0de2f0eff471`.

TCG Card Pass 2 Validation **#1381 SUCCESS** on exact reconciled head
`97eca40fe4ea0c991da3077f9bfbca8a2539f3d4`.

### Next exact runtime target

Reconcile `DISCARD_DECK_TOP`.

The frozen inventory contains exactly one Release 1 consumer, Shade — Nightmaw / Dread Crush, and the existing generic Attack Deck-Discard owner already recognizes the structured target-condition -> public opponent deck-top discard family, delegates the physical movement to Card-Zone, and hands the resulting `deck_cards_discarded` event into the established Event -> Movement -> Heal listener chain.

## V2.4.82 — accepted Nightmaw deck-top discard capability reconciliation

The frozen Release 1 `DISCARD_DECK_TOP` inventory contains exactly one consumer:
- Shade — Nightmaw / Dread Crush.

No runtime implementation was required.

`tcg-match-attack-deck-discard-v0-2.ts` already owns the generic structured family:
- shared Attack IF evaluates `target_has_any_condition` against the authoritative attack target;
- when false, no deck mutation or deck-discard event is produced;
- when true, the owner selects only the available top N opponent-deck cards;
- exact deck -> discard movement delegates to Card-Zone and preserves top order / exact instance identity;
- moving fewer than requested because the deck is short is legal and does not create deckout inside this owner;
- successful movement emits the structural `deck_cards_discarded` handoff;
- Match preserves the accepted Deck-Discard Event -> Event Listener -> Movement Listener -> Heal Listener continuation order;
- malformed structured family variants fail closed;
- the owner and live dispatcher contain no Nightmaw/card-name routing.

A legacy printed-English fallback remains singular and guarded behind the absence of the structured owner; it does not define marked v0.2 Nightmaw semantics.

`tcg-runtime-capabilities-v0.2.json` now classifies
`DISCARD_DECK_TOP` as **implemented**.

Release-control capability-manifest fingerprint is
`856ff589ca74faf88f61d106910671ee1b7af233`.

TCG Card Pass 2 Validation **#1386 SUCCESS** on exact reconciled head
`55d2e1c87db956d19c6a08b20a6a3c41ab7eb528`.

### Next exact runtime target

Reconcile `SCHEDULE_ACTION`.

The frozen Release 1 inventory contains exactly one consumer, Shade — Noctivane / Night Reading. V2.4.73 already accepted a generic Active Ability deck-reading owner that delegates deferred-action storage/execution to `tcg-match-scheduled-action-v0-2.ts`, Card-Zone owns the eventual fixed draw, and Match resolves the schedule at the controller-AFTERMATH boundary before canonical turn advance.

## V2.4.83 — accepted Noctivane scheduled-action capability reconciliation

The frozen Release 1 `SCHEDULE_ACTION` inventory contains exactly one consumer:
- Shade — Noctivane / Night Reading.

No new runtime implementation was required.

V2.4.73 already accepted the complete generic ownership chain:
- the active Ability deck-reading owner recognizes the frozen inspect -> optional bottom -> IF -> scheduled-action shape without Noctivane/card-ID dispatch;
- controller-private opponent deck-top inspection is recorded by Hidden Information;
- exact optional deck-top -> deck-bottom reordering delegates to Card-Zone;
- shared Active Ability IF evaluates `selected_count_at_least`;
- `runtimeV02ScheduleAction` records the deferred action in the server-owned scheduled-action ledger;
- only the matching controller / matching turn / `controller_aftermath_finished` trigger resolves it;
- terminal-match guard consumes the schedule without mutation when required;
- nested `DRAW_FIXED` delegates exact deck -> hand movement to Card-Zone and applies deckout only when the fixed draw is incomplete;
- Match resolves controller-AFTERMATH schedules before canonical turn advance;
- public receipts expose structural schedule outcome only, not hidden inspected card identity.

`tcg-runtime-capabilities-v0.2.json` now classifies
`SCHEDULE_ACTION` as **implemented**.

Release-control capability-manifest fingerprint is
`c900277c1a576e2de33c795914a45a676c1e8067`.

TCG Card Pass 2 Validation **#1391 SUCCESS** on exact reconciled head
`1583af90051d837ef3b4d2b500b05359c9c4ec19`.

### Next exact runtime target

Astral — Archivist Sol / Archive Reset.

The frozen program contains two `SHUFFLE_ZONE_INTO_DECK` steps:
1. self hand -> own deck;
2. opponent hand -> opponent deck;
both owner-private, followed by fixed draws of 5 for each player and final deckout check.

Current Tactic runtime owns `SHUFFLE_DECK` but has no `SHUFFLE_ZONE_INTO_DECK` opcode branch. V2.4.84 must add one generic Tactic operation that moves all exact cards from the requested hand into that same player's deck through Card-Zone and then shuffles the resulting deck through the canonical Randomization engine. No Archivist Sol/card-ID branch, no identity exposure, and no duplicate zone/random owner.

## V2.4.84 — accepted Archivist Sol hand-to-deck shuffle runtime family

Astral — Archivist Sol / Archive Reset now executes its frozen two-step hand-to-deck shuffle family through existing canonical owners.

### Frozen family

Release 1 contains exactly two `SHUFFLE_ZONE_INTO_DECK` steps, both on Archivist Sol:
1. self hand -> own deck, owner-private;
2. opponent hand -> opponent deck, owner-private.

They are followed by fixed draws of 5 for self and opponent, then the existing post-resolution deckout check.

### Generic Tactic runtime ownership

`supabase/functions/tcg-tactic-actions/index.ts` now recognizes `SHUFFLE_ZONE_INTO_DECK` generically:
- resolves the requested player through the existing Tactic player-seat owner;
- currently accepts only the frozen Release 1 `zone: "hand"` shape and fails closed on any other source zone;
- requires `visibility: "owner_private"` and never exposes shuffled hand identities;
- captures every exact current hand instance UID;
- delegates hand -> same-player deck movement to Card-Zone;
- preserves exact card instance identity;
- still shuffles the deck when the hand is empty;
- delegates resulting deck permutation to `runtimeV02ShuffleInPlace` in the canonical Randomization engine;
- contains no Archivist Sol/card-ID/name dispatch and adds no helper/owner family.

The existing `DRAW_FIXED` steps continue to delegate exact deck -> hand movement to Card-Zone and apply incomplete-draw deckout semantics. `CHECK_DECKOUT_AFTER_RESOLUTION` remains the final terminal check.

### Regression + release-control evidence

Added frozen-family/wiring regression:
`tcg/tests/card-pass-2-tactic-shuffle-zone-into-deck-runtime.test.mjs`.

The Tactic Edge dependency set remains 40 files; only the entrypoint blob changed:
- Tactic entrypoint blob: `45c0ccd58ee2a85cfe08a9b9f1b1e663b47eff7f`;
- closure SHA-256: `d8ff415928c85b9ea2bec5168eaa1154c6c4e423a58c0a24b818db51c3cebf73`.

Card Pass **#1398 SUCCESS** proved the complete source/runtime family before capability reconciliation.

`tcg-runtime-capabilities-v0.2.json` now classifies
`SHUFFLE_ZONE_INTO_DECK` as **implemented**.

Release-control capability-manifest fingerprint is
`04aab8f975d4e582791fbc550f7ee427f6e3988d`.

TCG Card Pass 2 Validation **#1400 SUCCESS** on exact capability-reconciled head
`fb7a552acffead9da53ca60a33db5c97de66e242`.

### Next exact runtime target

Reconcile `CHOOSE_AND_CLEAR_CONTROL_CONDITION`.

The frozen Release 1 inventory contains exactly one consumer, Shade — Quiet Step. The existing generic Tactic condition-choice branch already aliases `CHOOSE_AND_CLEAR_CONTROL_CONDITION` to the canonical condition-choice/clear flow and has a frozen regression guard. V2.4.85 should be capability reconciliation only if exact evidence remains aligned.

## V2.4.85 — accepted Quiet Step control-condition clear capability reconciliation

The frozen Release 1 `CHOOSE_AND_CLEAR_CONTROL_CONDITION` inventory contains exactly one consumer:
- Shade — Quiet Step.

No runtime implementation was required.

The existing generic Tactic condition-choice path already owns the complete frozen shape:
- resolves `$switch_outgoing_vanguard` from the accepted effect-switch variable binding;
- enumerates current canonical Condition state through the Condition facade;
- when the operation is `CHOOSE_AND_CLEAR_CONTROL_CONDITION`, filters legal options to the target Creature's current control slot only;
- defaults to exactly one selected control condition when `count` is omitted;
- creates the ordinary server-owned pending condition choice;
- selected resolution delegates `clear_condition` through the Tactic compatibility facade to `clearRuntimeCondition`;
- `runtime-v0-2-core.ts` re-exports `clearRuntimeCondition` directly from the canonical shared Condition engine;
- contains no Quiet Step/card-ID/name dispatch.

The frozen regression in `card-pass-2-tactic-if-runtime.test.mjs` already proves the generic alias, control-slot filtering, default choice bound and no card-specific authority.

`tcg-runtime-capabilities-v0.2.json` now classifies
`CHOOSE_AND_CLEAR_CONTROL_CONDITION` as **implemented**.

Release-control capability-manifest fingerprint is
`5464eb9ff86ae65e777a4d6004833bbce0e17475`.

TCG Card Pass 2 Validation **#1405 SUCCESS** on exact reconciled head
`29bda755c8d49c7ce6295e927c5080e62f34c1e7`.

### Next exact runtime target

Stone — Bastion Plate / Bastion Plate Use: `INCREMENT_SOURCE_COUNTER`.

The frozen inventory contains exactly one consumer and the primitive `incrementRuntimeSourceCounter` already exists, but the shared Event Listener currently has no `INCREMENT_SOURCE_COUNTER` opcode dispatch. V2.4.86 must wire that structured listener operation generically to the existing counter primitive, preserving listener-source instance ownership and the following `source_counter_at_least` IF / scheduled-discard sequence.

## V2.4.86 — accepted damage-prevented attached-Relic listener family

The Release 1 Relic prevention family is now executable end-to-end through existing canonical owners, without card-ID dispatch and without adding an owner family.

### Frozen family

Incoming attached-Relic attack-damage modifiers:
- Shade — Gloom Locket: -10 when the opposing attacker has a condition and the attached target is Shade.
- Stone — Bastion Plate: -20 from opposing attack damage.
- Tide — Shellguard Pendant: -20 from opposing attack damage, one actual prevention per attachment.

`damage_prevented` attached-Relic listeners:
- Bastion Plate: attached-source/target prevention predicates -> increment card-instance `prevention_uses` -> after 3 uses schedule source discard after the attack finishes.
- Shellguard Pendant: same prevention predicates with one-use attachment listener limit -> schedule source discard after the attack finishes.

### Canonical ownership

**Attack Damage owner**
`supabase/functions/_shared/tcg-match-attack-damage-v0-2.ts`
now evaluates generic attached-Relic `incoming_attack_damage` continuous effects and returns exact prevention details while preserving the compatibility scalar API. It supports the frozen opponent-source filters, condition/element filters and attachment-scoped one-use consumption without any launch-card identity branches.

**Event Listener owner**
`supabase/functions/_shared/tcg-match-event-listener-v0-2.ts`
now receives exact `damage_prevented` events and generically owns:
- `prevention_target_is_attached_creature`;
- `prevention_source_is_attached_card`;
- `prevention_amount_at_least`;
- card-instance counter lookup/increment for declared Tactic counters;
- `INCREMENT_SOURCE_COUNTER`;
- `source_counter_at_least` at the Bastion listener consumer;
- turn-scoped attachment listener limits;
- attachment-scoped attachment listener limits;
- `SCHEDULE_SOURCE_DISCARD` orchestration.

**Scheduled Action owner**
`supabase/functions/_shared/tcg-match-scheduled-action-v0-2.ts`
now accepts the generic `after_attack_finished` trigger and returns a source-discard plan. It does not physically mutate attached Relics.

**Relic owner**
`supabase/functions/_shared/tcg-match-relic-engine-v0-2.ts`
owns exact attached-Relic -> discard mutation, including unique source identity, scalar-slot validation, destination collision preflight and exact instance preservation.

**Match orchestration**
`supabase/functions/tcg-match-actions/index.ts`
turns detailed attack prevention into Event Listener events and drains due after-attack Scheduled Action plans before defeat scan. Physical Relic discard is delegated back to the Relic owner.

The canonical owner-family count remains **40**.

### Regression evidence

Added:
- `runtime-v0-2-relic-damage-prevention-listener.test.ts`;
- `card-pass-2-relic-damage-prevention-runtime.test.mjs`.

The existing deck-discard ownership guard was made semantic rather than relying on the first Event Listener call in the attack dispatcher. Runtime Pass B Attack Damage and Surge guard scripts were likewise updated to recognize the detailed Attack Damage compatibility bridge while retaining their ownership and duplicate-wiring assertions.

### Release-control evidence

Match Edge closure:
- 102 files;
- SHA-256 `9dc39ff55b849b76ffbf1593c3ea30d2c1a886d7b050c86a962b1c2cb65eb68c`.

Tactic Edge closure:
- 41 files;
- SHA-256 `9a33a92624e4ac058f9c0ee12200344a67479fb7f97c5e2aa43283c5be45ad65`.

TCG Card Pass 2 Validation **#1420 SUCCESS** on exact complete source/runtime head
`9d3bf34346de60559d1952826e6c2bf078f9acc7`.

`tcg-runtime-capabilities-v0.2.json` now classifies as **implemented**:
- `INCREMENT_SOURCE_COUNTER`;
- `SCHEDULE_SOURCE_DISCARD`;
- `prevention_target_is_attached_creature`;
- `prevention_source_is_attached_card`;
- `prevention_amount_at_least`.

`source_counter_at_least` was already labeled implemented; V2.4.86 supplies executable evidence for its sole frozen attached-Relic listener consumer.

Release-control capability-manifest fingerprint is
`b0033085bfce1a529730f25e985e085c4f466754`.

TCG Card Pass 2 Validation **#1422 SUCCESS** on exact capability-reconciled head
`f1aa770437a5a1618c1e8886928561cd3a60dd92`.

### Next exact runtime target

Grove — Sapstone Charm / `MODIFY_CURRENT_HEAL`.

The frozen family has one consumer. Read-only preflight proves Heal owner #21 already contains the complete generic `before_heal_packet` path: target-attached predicate, source-action-kind predicate, turn-scoped attachment limit, `MODIFY_CURRENT_HEAL` validation/application, and invocation before HP mutation inside the canonical Heal Packet owner. V2.4.87 should therefore be capability reconciliation only if exact-head evidence remains aligned.

## V2.4.87 — accepted Sapstone Charm / before-heal capability reconciliation

V2.4.87 required **no runtime source repair**. The existing Heal #21 owners already execute the complete frozen semantics generically; the capability manifest was stale.

### Frozen inventory

- `MODIFY_CURRENT_HEAL`: exactly one frozen consumer — Grove / Sapstone Charm.
- `heal_packet_target_is_attached_creature`: exactly one frozen consumer — Sapstone Charm.
- `heal_packet_source_action_kind_is`: frozen consumers are Sapstone Charm and Grove / Symbiote Essence.

### Existing canonical ownership proved

**Before-Heal owner**
`supabase/functions/_shared/tcg-match-heal-before-v0-2.ts`
already:
- collects attached Relic/Essence/ability before-heal candidates generically;
- evaluates `heal_packet_target_is_attached_creature`;
- evaluates `heal_packet_source_action_kind_is`, including Sapstone's NOT rule exclusion;
- enforces turn-scoped attachment limits;
- validates and applies `MODIFY_CURRENT_HEAL` delta/minimum/maximum;
- consumes the once-per-turn attachment limit only when the modifier is actually eligible.

**Heal Packet owner**
`supabase/functions/_shared/tcg-match-heal-packet-v0-2.ts`
already invokes the before-heal modifier phase after packet authority validation and before HP mutation, then persists the modified requested amount in the canonical packet.

**After-Heal Listener owner**
`supabase/functions/_shared/tcg-match-heal-listener-dispatch-v0-2.ts`
already evaluates `heal_packet_source_action_kind_is` for Symbiote Essence's attack/ability filter, with attachment-scoped turn limits and nested Heal Packet emission.

No card-name or card-ID dispatch is required. The canonical owner-family count remains **40**.

### Deterministic evidence

TCG Card Pass 2 Validation **#1425 SUCCESS** on exact pre-reconciliation head
`a9e4bf3cc9b863ab238ac8cd18b00c7cfcab2c6a`
contained passing tests for:
- `before-heal owner applies Sapstone-style attachment modifier once per turn`;
- `Heal #21 applies before-heal modifier before HP mutation and records modified requested amount`;
- `after-heal dispatcher resolves Shellip and Symbiote while deferring Moonlit`;
- `source instance turn limits block a second trigger and reset next turn`.

### Capability reconciliation

`tcg-runtime-capabilities-v0.2.json` now classifies as **implemented**:
- `MODIFY_CURRENT_HEAL`;
- `heal_packet_target_is_attached_creature`;
- `heal_packet_source_action_kind_is`.

Capability-manifest fingerprint is now
`1b66b2a8455d5ad17535cf7dda2d57db4fea009e`.

TCG Card Pass 2 Validation **#1427 SUCCESS** on exact capability-reconciled head
`0f11dad02f9835733e6046f8f827ba1775f4b275`.

### Next exact runtime target — V2.4.88

`ADD_SHIELD_EACH`.

Frozen inventory has exactly two consumers:
- Stone / Crowncrag — Mountain Warden: Attack `after_damage` fortify up to two selected friendly Stone Creatures;
- Stone / Reversal Seal: Tactic IF branch shield on an optional selected Stone Creature.

Read-only preflight proves the Tactic interpreter already executes `ADD_SHIELD_EACH` generically, covering the Reversal Seal shape. The first Attack-owner audit found no matching `ADD_SHIELD_EACH` handler, so V2.4.88 must prove and, if required, repair **Attack/Tactic parity** without duplicating Shield ownership.

## V2.4.88 — accepted ADD_SHIELD_EACH Attack/Tactic parity

The frozen `ADD_SHIELD_EACH` operation is now executable across both of its Release 1 consumers without card-ID routing and without adding an owner family.

### Frozen inventory

Exactly two consumers:
- Stone / Crowncrag — Mountain Warden, attack `Crown of Stone`;
- Stone / Reversal Seal, Tactic IF branch.

### Canonical ownership

**Tactic interpreter**
`supabase/functions/tcg-tactic-actions/index.ts`
already resolved `ADD_SHIELD_EACH` generically from a variable-backed Creature selection and delegated every real gain to the existing `addRuntimeShield` 60-cap primitive. Reversal Seal required no source change.

**Attack shield-choice specialist**
`supabase/functions/_shared/tcg-match-attack-shield-choice-v0-2.ts`
now owns the generic mixed Attack program shape:
`ADD_SHIELD $source_creature -> SELECT_CREATURE self/field min..max -> ADD_SHIELD_EACH selected`.

It:
- validates the complete three-step shape before mutation;
- supports optional 0..N selection;
- evaluates generic `element` and `exclude_source` filters;
- binds the exact source Vanguard instance and turn;
- rebinds every selected field position before mutation;
- preflights all selected targets before any selected-target Shield mutation;
- delegates every Shield gain to `addRuntimeShield`.

**Match orchestration**
`supabase/functions/tcg-match-actions/index.ts`
reuses the existing private `pending_attack_choice` transport for the new multi-select kind, preserves the canonical pure `ADD_SHIELD` ordering anchor, and delegates resolution to the specialist.

The existing pure Attack Shield owner remains whole-program-only and still returns `null` for mixed programs. The canonical owner-family count remains **40**.

### Regression evidence

Added:
- `runtime-v0-2-attack-shield-each-choice.test.ts`;
- `card-pass-2-shield-each-parity.test.mjs`.

Coverage proves:
- Crown-style mixed program parsing is generic;
- source Shield resolves before the optional selection;
- only legal filtered targets are exposed;
- zero, one or two targets are legal according to declared bounds;
- all target anchors are rebound before mutation;
- the shared 60-Shield cap remains authoritative;
- frozen inventory is exactly Crowncrag + Reversal Seal;
- the Tactic and Attack routes are both card-ID-free.

TCG Card Pass 2 Validation **#1436** proved the complete deterministic runtime suite and all type-checks green after the implementation/test corrections; its sole remaining failure was expected release-control closure drift.

### Release-control evidence

Match Edge closure now:
- 103 files;
- entrypoint blob `ed4f299504ab477fa89f506386ca37f317999061`;
- Attack shield-choice blob `01514decbf44b7d5b165285c7de7a4ecf10fa202`;
- SHA-256 `3e288b0c448d1456f508ff680a0153bded59a118c403ebbbdf0e6a57fe76edcc`.

Tactic Edge closure remains:
- 41 files;
- SHA-256 `9a33a92624e4ac058f9c0ee12200344a67479fb7f97c5e2aa43283c5be45ad65`.

TCG Card Pass 2 Validation **#1438 SUCCESS** on exact source/runtime + release-control head
`0d875a926b6cb23740ca7f3a2a3ca84b93e24913`.

### Capability reconciliation

`ADD_SHIELD_EACH` is now classified **implemented**.

Capability-manifest fingerprint:
`e0751516e3687601095f88f68e0a8d5e706b68b7`.

TCG Card Pass 2 Validation **#1440 SUCCESS** on exact capability-reconciled head
`5da730d086d817faa71a6a0cc1ee21160cec2fd2`.

### Next exact runtime target — V2.4.89

Ember / Heatguard Bracer — `MODIFY_CURRENT_DAMAGE_PACKET`.

Read-only preflight proves Damage owner #20 already:
- collects `before_damage_packet` attachment listeners;
- evaluates Heatguard's target/class/condition requirements;
- enforces turn-scoped attachment limits;
- validates and applies `MODIFY_CURRENT_DAMAGE_PACKET` delta/minimum semantics;
- records before/after packet evidence;
- already has a deterministic Heatguard recoil-contract test.

Therefore the operation itself is expected to be reconciliation-only. Shared `damage_packet_*` predicates will remain unpromoted until every frozen consumer, including Thorn Crown's after-damage listener family, is separately proved.

## V2.4.89 — accepted Heatguard damage-packet modifier reconciliation

V2.4.89 required **no runtime source repair**. Damage owner #20 already executes Ember Heatguard Bracer's frozen before-damage modifier generically.

### Frozen operation inventory

`MODIFY_CURRENT_DAMAGE_PACKET` has one frozen Release 1 consumer:
- Ember / Heatguard Bracer.

Its listener shape is:
- event: `before_damage_packet`;
- target: attached Creature;
- classes: recoil OR Scorched condition damage;
- turn-scoped attachment limit: once;
- modifier: -10, minimum 0.

### Existing canonical ownership proved

**Damage Packet Listener owner**
`supabase/functions/_shared/tcg-match-damage-packet-listener-v0-2.ts`
already:
- discovers structured before-damage listeners from attached sources;
- evaluates target/class/condition packet requirements;
- enforces the declared attachment turn limit;
- validates `MODIFY_CURRENT_DAMAGE_PACKET`;
- applies delta/minimum semantics against the current packet amount;
- records exact modification evidence.

**Damage Packet owner**
`supabase/functions/_shared/tcg-match-damage-packet-v0-2.ts`
already persists canonical before/after damage-packet evidence around the resolved packet.

Existing deterministic coverage includes:
- `Damage #20 generic packet owner also satisfies existing Heatguard recoil contract`;
- `Damage #20 attachment packet modifier consumes once per turn`.

No card-ID dispatch, helper or new owner family is required.

### Capability reconciliation

`MODIFY_CURRENT_DAMAGE_PACKET` is now classified **implemented**.

The shared predicates
`damage_packet_target_is_attached_creature`,
`damage_packet_class_is`, and
`damage_packet_condition_is`
remain separately gated. They are not promoted from Heatguard-only evidence because some have other frozen consumers, including Thorn Crown's after-damage listener family.

Capability-manifest fingerprint:
`9f858522a544b1098fe7457f4472d122c91e8630`.

TCG Card Pass 2 Validation **#1445 SUCCESS** on exact capability-reconciled head
`46e44d58e0b4b57b9b5c2aff6d2b5cfd00f65680`.

### Next exact runtime target — V2.4.90

Gale / Highwind Spires:
`before_voluntary_withdrawal_cost -> MODIFY_CURRENT_WITHDRAWAL_COST`.

Frozen schema requires:
- controller scope any;
- `event_active_seat_is_controller`;
- once per turn per event controller;
- -1 current voluntary Withdrawal cost, minimum 0.

First-pass exact-head audit found no matching listener execution in the current Withdrawal base-cost or Withdrawal transaction owners. V2.4.90 is therefore treated as a **real implementation target** until a canonical existing owner is proven otherwise. The fix must integrate with Withdrawal/Cost ownership and must not duplicate Payment or Atomic Switch.

## V2.4.90 — accepted Highwind voluntary-withdrawal current-cost listener

Gale — Highwind Spires is now executable through the existing Withdrawal / Event Listener / Payment / Atomic Switch ownership chain with no card-identity dispatch and no new owner family.

### Frozen family
Exactly one Release 1 consumer uses this family:
- `gale-highwind-spires`
- event: `before_voluntary_withdrawal_cost`
- predicate: `event_active_seat_is_controller`
- limit: `turn / count 1 / owner event_controller`
- operation: `MODIFY_CURRENT_WITHDRAWAL_COST`
- modifier: `delta -1 / minimum 0`.

### Canonical ownership
- Withdrawal computes the canonical base voluntary-withdrawal cost.
- Event Listener owns Realm discovery, controller scope, predicate evaluation, turn-limit/receipt state and the packet-local current-cost modifier.
- Match invokes the synchronous current-cost listener after base cost is known and before Payment. Read-only `field_actions` projection runs the same resolver on `structuredClone(state)`, so merely viewing legal actions cannot consume the once-per-turn listener.
- Payment still validates/commits exact attached-Essence payment.
- Atomic Switch still owns the Vanguard/Reserve transaction.

The opcode grammar remains exact to Release 1: `op + delta + minimum`; undeclared `maximum` widening is rejected.

### Regression / release evidence
- deterministic lifecycle: `runtime-v0-2-withdrawal-cost-listener.test.ts`;
- frozen inventory and no-card-ID guard: `card-pass-2-withdrawal-cost-listener.test.mjs`;
- Match Edge closure: 103 files / `c8d1b9180312565b25fe29c522e5454fe867074ea423c43cb6e046886116f404`;
- Tactic Edge closure: 41 files / `a1793729e2efc333bc20f1a14ec711d416b607db79bb4de3096b118ab4b83bd6`;
- source/runtime exact-head Card Pass **#1457 SUCCESS** on `558b007ff66bab4bfd7515d049c2a0c2105434c0`;
- capability-reconciled Card Pass **#1459 SUCCESS** on `69d6f8074fc6c3da96bdcd32b5b52ca5e10871b1`;
- capability blob: `fb01a78198a18155f55bbc395330ce0d3299aad4`.

`MODIFY_CURRENT_WITHDRAWAL_COST` and `event_active_seat_is_controller` are now classified **implemented**.

The canonical owner-family count remains **40**. Main/live Supabase remains untouched by V2.4.90.

### Next exact runtime target — V2.4.91
Gale — Pilot Sera / `SET_ATTACK_ELIGIBILITY`.

Read-only preflight shows:
- frozen Release 1 has exactly one `SET_ATTACK_ELIGIBILITY` consumer, Pilot Sera;
- the Tactic interpreter already executes the operation and stores a turn-scoped final-Vanguard anchor;
- Match already enforces `lifecycle_attack_eligibility.mode === "final_vanguard_only"` before Attack;
- capability truth still labels `SET_ATTACK_ELIGIBILITY` partial.

V2.4.91 therefore begins as reconciliation proof. It must verify the exact frozen `scope: controller_turn / rule: only_final_vanguard_may_attack` grammar, expiry/reset semantics and the complete Pilot Sera repeated-switch -> final-Vanguard attack restriction before moving the capability label.



## V2.4.91 — accepted Pilot Sera Attack Eligibility reconciliation

Gale — Pilot Sera now uses one canonical Attack Eligibility owner for both projection and authoritative Attack enforcement. The frozen card remains data only; no card-ID dispatch and no new owner family were introduced.

### Frozen family
Exactly one Release 1 consumer uses `SET_ATTACK_ELIGIBILITY`:
- `gale-pilot-sera`
- after `REPEAT_OPTIONAL max:2` effect switches
- `scope: controller_turn`
- `rule: only_final_vanguard_may_attack`.

### Canonical ownership
- `supabase/functions/_shared/tcg-match-attack-eligibility-v0-2.ts` owns grammar normalization, final-Vanguard anchor installation, current-turn validity and Attack block-reason evaluation.
- Tactic installs the rule only after Pilot Sera's preceding optional switches resolve.
- Match `field_actions` projection and authoritative `attack` command call the same Attack Eligibility owner.
- Creature evolution preserves eligibility because the anchored Creature identity remains in the Vanguard stack; a later same-turn switch to a different Creature is blocked.
- Turn change expires the controller-turn receipt semantically.

### Regression / release evidence
- deterministic owner lifecycle: `runtime-v0-2-attack-eligibility.test.ts`;
- frozen inventory + no-card-ID guard: `card-pass-2-attack-eligibility-runtime.test.mjs`;
- Match Edge closure: 104 files / `8651b93e05cac1e995575563ecfef5e618f4e4348d016d51d8e04dd25f71333f`;
- Tactic Edge closure: 42 files / `3deacabefcaf906388cf32dfbb347ac4b5484fd62554ac0c6f779b5817bcec91`;
- source/runtime accepted head `ccb995b99131c2292e79d84a4bd0ba415c0564de` / Card Pass **#1468 SUCCESS**;
- exact capability-reconciled PR head `f913b23bcc7064258a18fe1011a877ed5679c95f` / Card Pass **#1472 SUCCESS**;
- capability blob `99955f0f5cff5fed252ad737f4020fb178d89353`.

`SET_ATTACK_ELIGIBILITY` is now classified **implemented**.

The canonical owner-family count remains **40**. Main/live Supabase remains untouched by V2.4.91.

### Next exact runtime target — V2.4.92

`SET_WITHDRAWAL_MODIFIER` lifecycle ownership reconciliation.

Read-only preflight proves the current capability is genuinely partial:
- frozen Release 1 has exactly nine consumers across triggered Creature abilities, an Essence listener and Tactic programs;
- Event Listener currently writes `flags.lifecycle_withdrawal_cost` itself;
- Tactic still owns a separate legacy `SET_WITHDRAWAL_COST` write path and does not execute the v0.2 opcode;
- active-Ability structured routes do not execute `SET_WITHDRAWAL_MODIFIER`;
- Match already consumes `lifecycle_withdrawal_cost`, but only as a same-`turn_seq` scalar;
- frozen cards require set/delta forms, formula amounts, multiple expiry boundaries, source-aware caps and opponent-turn persistence.

V2.4.92 must therefore create one canonical Withdrawal-modifier lifecycle owner and make Event Listener, Tactic and Ability producers delegate to it. It must not create a second Withdrawal, Payment or Atomic Switch engine, and it must remain card-ID-free.


## V2.4.92 — accepted Withdrawal modifier lifecycle ownership

`SET_WITHDRAWAL_MODIFIER` is now fully implemented through one canonical structured lifecycle owner instead of separate Event Listener and Tactic flag mutation.

### Frozen Release 1 inventory

Exactly nine consumers use `SET_WITHDRAWAL_MODIFIER`:
- Astral / Starwhale;
- Gale / Featherstep;
- Gale / Jetstream Essence;
- Gale / Pinionserpent;
- Gale / Slipwing;
- Gale / Whiffin;
- Stone / Keeper Tor;
- Tide / Undertow Net;
- Volt / Copperkite.

### Canonical ownership

`supabase/functions/_shared/tcg-match-withdrawal-modifier-v0-2.ts` now owns:
- set and delta modifier records;
- integer and frozen conditional amount formula evaluation;
- minimum floor and `maximum_after_this_source`;
- source category semantics;
- Granite-style opponent Withdrawal-increase immunity;
- `end_of_turn`, `controller_aftermath` and `target_controller_aftermath_started` expiry;
- one-use `legal_voluntary_withdrawal_declared` consumption.

Producer/consumer split:
- Event Listener installs triggered Creature/Essence modifiers through the shared owner;
- Tactic installs structured Tactic modifiers through the same owner;
- Match resolves lifecycle modifiers after canonical base/continuous Withdrawal calculation and before the packet-local Highwind current-cost listener;
- authoritative legal withdrawal consumes one-use lifecycle records;
- Aftermath expires declared lifecycle records at the correct boundary;
- Payment + Atomic Switch remain owned by `tcg-match-withdrawal-transaction-v0-2.ts`.

No frozen card identity is runtime dispatch authority. The legacy Tactic `SET_WITHDRAWAL_COST` compatibility route remains for legacy snapshots but is not structured v0.2 authority.

### Validation / release evidence

Source/runtime + release-control accepted head:
`e8bb4026e3950d6cec947feb241655c7eedc9524`.

TCG Card Pass 2 Validation **#1480 SUCCESS**:
- 537 Node validation tests;
- deterministic runtime tests;
- Match, Tactic, setup, Withdrawal, Attack and Surge type-checks;
- Runtime Pass B Withdrawal, Attack Damage and Surge guarded wiring checks.

Exact Edge closures:
- Match: 105 files / `4a48a1c2de811cef3303f0408baf513823737d33477e071313dcb025a847bfba`;
- Tactic: 43 files / `45bb40d0caf00dbce9e1450c768998fd296b6f8a2ecf786fb28774dedce9d84b`.

Capability reconciliation:
- `SET_WITHDRAWAL_MODIFIER` moved from **partial** to **implemented**;
- capability blob: `9b33834f794be37a9814b9f6bbb9a6dee37c58d8`;
- exact capability-reconciled head:
  `45164fad24d17037a58102d305996d755722425a`;
- Card Pass **#1481 SUCCESS**.

Owner-family count remains **40**. No database migration, Supabase Edge deployment, main merge or live promotion was performed.

### Next exact runtime target — V2.4.93

`HEAL_EACH` all-consumer parity.

Frozen Release 1 has exactly four consumers:
- Grove / Verdantusk — Attack `after_damage`;
- Grove / Elderbloom — First Canopy — active Ability;
- Tide / Marevault — Heart of Tides — mixed Attack `after_damage_finished`;
- Tide / Reef Medic Olan — Tactic.

Read-only preflight proves:
- Verdantusk already has a structured Attack HEAL_EACH owner and canonical heal-packet/listener wiring;
- Reef Medic Olan already executes through Tactic HEAL_EACH and canonical heal packets;
- Elderbloom's `SELECT_CREATURE -> HEAL_EACH` active-Ability shape is not executed by the current active-Ability owners;
- Marevault's mixed `MOVE_ATTACHED_ESSENCE -> SELECT_CREATURE -> HEAL_EACH -> OPTIONAL switch` `after_damage_finished` program is outside the existing after-damage HEAL_EACH owner.

Therefore V2.4.93 is a real parity target. The repair must reuse the canonical Heal/Heal Packet/listener owners and existing private-choice transports, remain operation-shaped and card-ID-free, and must not create a second Heal engine.


## V2.4.93 — accepted HEAL_EACH all-consumer parity

`HEAL_EACH` is now fully implemented across every frozen Release 1 execution surface while preserving one canonical Heal Packet / Heal Listener mutation chain.

### Frozen Release 1 inventory

Exactly four consumers use `HEAL_EACH`:
- Grove / Verdantusk — Attack `after_damage`;
- Grove / Elderbloom — First Canopy — active Ability;
- Tide / Marevault — Heart of Tides — mixed Attack `after_damage_finished`;
- Tide / Reef Medic Olan — Tactic.

### Canonical ownership

Existing accepted paths remain authoritative:
- Verdantusk Attack executes through the structured Attack HEAL_EACH owner;
- Reef Medic Olan executes through the generic Tactic interpreter;
- every physical heal delegates to the canonical Heal Packet owner and then the canonical after-heal listener chain.

V2.4.93 closed the two missing surfaces without creating a second Heal engine:

#### Elderbloom active Ability
- the existing Active-Ability Selected-Heal system was generalized operation-first for
  `SELECT_CREATURE self field 0..2 damaged -> HEAL_EACH`;
- it reuses the existing private choice transport and once-per-turn active-Ability receipt;
- every selected target is rebound before the first heal mutation so a stale later target cannot partially mutate an earlier target;
- every selected heal emits the canonical Heal Packet and continues through the existing Heal Listener owner;
- runtime dispatch contains no Elderbloom/card-ID branch.

#### Marevault mixed after-damage-finished Attack
`supabase/functions/_shared/tcg-match-attack-after-damage-finished-v0-2.ts` owns the exact frozen mixed program shape:

`MOVE_ATTACHED_ESSENCE -> SELECT_CREATURE -> HEAL_EACH -> OPTIONAL SWITCH_WITH_VANGUARD`.

It is orchestration only:
- Essence movement delegates to the existing Essence Movement owner;
- Movement Listener completes before the heal selection is offered;
- HEAL_EACH delegates every mutation to Heal Packet;
- Heal Listener completes before the later optional switch;
- optional switch delegates to Atomic Switch;
- existing generic `pending_attack_choice` min/max/options transport is reused, so no Battle-client rules patch was required;
- the mixed owner returns compatibility authority when ordinary `after_damage` is non-empty, preventing competing partial ownership.

### Validation / release evidence

Elderbloom selected-HEAL_EACH source/runtime was proven on exact head
`eba5eb0ac6490eb1efc9d2653d758c6edac53c9c` by Card Pass **#1484 SUCCESS**.

The mixed Marevault owner was first proved in isolation on
`b4319c73dc02b8e2c60db244bcd7c5d69d660cb1` by Card Pass **#1486 SUCCESS**.

Complete V2.4.93 source/runtime + release-control acceptance:
- exact head: `60ea34dfe7bf23663e7903df99b47f254afc4eae`;
- Card Pass **#1488 SUCCESS**;
- deterministic runtime tests and all Match/Tactic/setup/Withdrawal/Attack/Surge type-checks green;
- Set One structure/effect grammar and all guarded Runtime Pass B checks green.

Exact Edge closures:
- Match: 106 files / `fba619ffb652ab1365a4b290b15069379f7f6678cf4e17491da01a3bfe90293e`;
- Tactic: 43 files / `df7154b1d85c37dfc1c36f2aba500dea2a369a0c92173ab181689853b3b209f2`.

Capability reconciliation:
- `HEAL_EACH` moved from **partial** to **implemented**;
- capability blob: `2e5596630d16932c7ebfc6dcff0fbc9f370da290`;
- exact capability-reconciled head:
  `fec2fb546a976ab67003acc4133d7fc3f5fe9a69`;
- Card Pass **#1489 SUCCESS**.

The canonical owner-family count remains **40**. No database migration, Supabase Edge deployment, main merge or live promotion was performed.

### Next exact runtime target — V2.4.94

`SELECT_CARDS` all-surface selection ownership and resume parity.

Frozen Release 1 has exactly seven consumers:
- Grove / Capscout — triggered Creature ability;
- Grove / Myceliarch — Attack `after_damage`;
- Grove / Forager Nia — Tactic;
- Tide / Surgefin — active Ability;
- Volt / Tinkit — triggered Creature ability;
- Volt / Stormcoil — Living Circuit — active Ability;
- Volt / Quickcharge Cell — Tactic.

Read-only preflight proves this is the highest-leverage current unblocker:
- Event Listener already owns generic triggered `SELECT_CARDS` choice/revalidation, covering the Capscout/Tinkit family;
- the existing Attack Discard-Recycle specialist already owns Myceliarch's exact `SELECT_CARDS -> MOVE_CARDS` family;
- active-Ability owners do not yet expose generic `SELECT_CARDS`;
- the Tactic interpreter does not yet execute the frozen `SELECT_CARDS` operation;
- Surgefin, Living Circuit and Quickcharge continue afterward into the still-partial `ATTACH_ESSENCE_FROM_ZONE` family, so that downstream attachment capability remains a separate later target.

V2.4.94 must therefore add/reuse one generic private card-selection transport for the missing active-Ability and Tactic surfaces, preserve Event Listener and Attack specialist ownership, revalidate selected card identity/zone before continuation, and remain card-ID-free. It must not create a second Card-Zone engine.

Deferred rather than falsely promoted:
- `ATTACH_ESSENCE_FROM_ZONE` remains partial because several consumers are still blocked by `SELECT_CARDS` and Magmagecko also requires missing `DIRECT_DAMAGE`;
- `CHOOSE_FROM_SET` remains partial because at least Noctivane is upstream-blocked by missing `INSPECT_ZONE`.

## V2.4.94 — SELECT_CARDS all-surface closeout (in progress)

### Accepted active-Ability selection sub-slice

The active-Ability half of the missing `SELECT_CARDS` surface is now source/runtime/release-control accepted without changing Card-Zone ownership.

The generic sequential Ability route is operation-shaped rather than card-ID-shaped:

`SELECT_CARDS self discard -> SELECT_CREATURE self field -> ATTACH_ESSENCE_FROM_ZONE`.

For the frozen Release 1 family this covers the active-Ability selection transport needed by Tide / Surgefin and Volt / Stormcoil — Living Circuit.

Ownership is split deliberately:
- `SELECT_CARDS` owns the private legal card options, exact one-card choice, stale choice rejection, current-zone/card-identity revalidation and variable binding;
- the following `SELECT_CREATURE` stage receives a fresh reconnect-safe server choice ID and revalidates the current field target;
- physical Essence attachment still delegates to the canonical external Essence Attachment route/engine;
- effect attachment disposition/lifecycle metadata is normalized by one shared attachment-state owner used by producers rather than duplicated in Ability/Event code;
- nested Event Listener and Movement Listener continuations complete before the unfinished active Ability returns to ordinary play;
- public receipts expose only structural outcome such as selected count and public field slot, never the selected discard card identity or private anchor UID.

Existing owners remain authoritative:
- Capscout and Tinkit stay on the generic triggered Event Listener `SELECT_CARDS` route;
- Myceliarch stays on the existing Attack Discard-Recycle specialist;
- no second Card-Zone engine and no card-ID/name dispatch was added.

### Exact acceptance evidence

Source/runtime proof head before closure refresh:
- `40607a749e3bd586a46cd12507d6ee3ace5c6782`;
- Card Pass **#1495** runtime job: deterministic runtime suite + Match/Tactic/setup/Withdrawal/Attack/Surge type-checks all **SUCCESS**;
- its only remaining structure failure was the intentionally stale Edge dependency closure.

Exact source/runtime + release-control accepted head:
- `d88af8f3a1047c38a8935974709c6a6389f43be4`;
- Card Pass **#1496 SUCCESS**;
- Set One structure/effect grammar, guarded Runtime Pass B checks, deterministic runtime suite and all type-checks green.

Exact Edge closures:
- Match: **108 files** / `26a48f4d98d62d22010bc1a79616c0dce7b12899e1f7ca93070fd2294ab7d286`;
- Tactic: **44 files** / `b2df5e5e605e9cdab570c55af6199e48a785c4ff2af456ecf015f27118b823f9`.

`SELECT_CARDS` remains **not implemented in the capability manifest** because the frozen Tactic surface is still open. This is intentional truth preservation, not a failed acceptance of the active-Ability sub-slice.

No database migration, Supabase Edge deployment, main merge or live promotion was performed. Canonical owner-family count remains **40**.

### Next exact target inside V2.4.94

Close the remaining Tactic `SELECT_CARDS` surface generically for:
- Grove / Forager Nia;
- Volt / Quickcharge Cell.

The next pass must freeze both exact Tactic programs first, then reuse one server-private card-selection/resume transport. Selection may bind a variable for later program steps, but any physical move/attachment stays with the canonical downstream engine. Only after Event Listener + Attack + active Ability + Tactic cover all seven frozen consumers may `SELECT_CARDS` move from missing to implemented.

## V2.4.94 — SELECT_CARDS all-surface closeout — ACCEPTED

V2.4.94 is complete across all seven frozen Release 1 consumers.

### Frozen seven-consumer execution map

- Grove / Capscout — triggered Ability / Event Listener: optional discard Device selection -> Card-Zone deck-bottom move.
- Grove / Myceliarch — Attack after-damage specialist: optional discard Device selection -> Card-Zone deck-bottom move.
- Grove / Forager Nia — Tactic: select 0-2 discard Devices -> fresh private order choice when two are chosen -> Card-Zone deck-bottom move -> draw 1.
- Tide / Surgefin — active Ability: select 0-1 Basic Tide Essence -> fresh Creature-target choice -> canonical Essence Attachment -> conditional Heal.
- Volt / Tinkit — triggered Ability / Event Listener: optional discard Device selection -> Card-Zone deck-bottom move.
- Volt / Stormcoil — Living Circuit — active Ability: exact Basic Volt Essence -> fresh field-target choice -> canonical borrowed Essence Attachment.
- Volt / Quickcharge Cell — Tactic: exact Basic Volt Essence -> field-target choice -> canonical temporary Essence Attachment until controller Aftermath.

### Accepted ownership

`SELECT_CARDS` now owns one generic operation contract:
- server-private legal option construction;
- declared min/max enforcement;
- exact current zone + card identity + filter revalidation;
- reconnect/stale choice fencing;
- variable binding only.

It does **not** own later physical mutation:
- physical card movement/order remains owner #30 Card-Zone;
- physical Essence attachment remains owner #22 Essence Attachment;
- condition/heal/event/movement continuations remain with their existing owners.

The shared Card Selection module is a submodule serving existing owner families. It does not create owner #41. Canonical Release 1 owner-family count remains **40**.

### Exact acceptance evidence

Generic Card Selection owner:
- isolated test-bearing head: `1470dd8ebc79b43749dc58cd827c7a2764ff3cee`;
- Card Pass **#1499 SUCCESS**.

Complete Tactic source/runtime before release-control refresh:
- `23c2fa0af3ed423674444102473e0ced6979f299`;
- Card Pass **#1501** runtime job fully green; the only failing gate was intentionally stale Tactic closure count.

Complete all-surface source/runtime + release-control:
- `795a9e94da7e5eadedf41c653fed3cc44be8c8e5`;
- Card Pass **#1502 SUCCESS**;
- Match closure: **108 files** / `26a48f4d98d62d22010bc1a79616c0dce7b12899e1f7ca93070fd2294ab7d286`;
- Tactic closure: **45 files** / `ea17df9e55af4e18d80585113fe73045321d70d60b2d6c6160880a9c18bfb5d6`.

Capability reconciliation:
- `SELECT_CARDS` moved from **missing** to **implemented**;
- capability blob: `092d25f4091326e31d3b78cd0987867fd8125174`;
- capability/control head: `ff6af2fde6029158eb63c74df01b4232412f94e3`;
- Card Pass **#1503 SUCCESS**.

No database migration, Supabase Edge deployment, main merge or live promotion was performed. Production remains unchanged and promotion remains HOLD while the master-plan capability closeout loop continues.

### Next exact runtime target — V2.4.95

`APPLY_CONDITION` all-surface Condition-owner reconciliation.

Read-only frozen inventory currently contains exactly **20 Release 1 operation uses**, making it the largest remaining used missing opcode:
- active/triggered Ability producers;
- Attack after-damage / conditional Attack producers;
- triggered Tactic/Event Listener producers;
- one ordinary Tactic-program conditional producer.

V2.4.95 belongs to existing Condition owner #19. It must begin by freezing all 20 exact shapes, targets, condition names, application modes and timing boundaries. Producers may orchestrate, but condition slot legality, application/replacement/protection/lifecycle mutation stays with the canonical Condition Engine. No owner #41 and no card-ID/name dispatch.

## V2.4.95 — APPLY_CONDITION all-surface closeout (freeze)

Read-only inventory is frozen before source changes.

### Frozen Release 1 inventory

Exactly **20** `APPLY_CONDITION` operation uses exist:
- **6 Event Listener consumers** — four triggered Creature Abilities plus two triggered Tactic/attachment listeners;
- **12 Attack after_damage consumers** — direct and nested conditional families;
- **1 Attack after_attack_finished consumer** — Gale / Aeralith — Storm Shepherd;
- **1 Tactic program consumer** — Volt / Blackout Pulse.

Exactly **9** condition names are used:
- Scorched ×2;
- Blinded ×2;
- Venomed ×2;
- Rooted ×2;
- Silenced ×2;
- Dazed ×4;
- Crushed ×3;
- Drenched ×1;
- Stunned ×2.

Exactly two application modes are used:
- `apply_if_empty` ×19;
- `apply_if_empty_or_same` ×1 (Blackout Pulse).

Condition owner #19 already owns:
- canonical condition names and slot mapping;
- `apply_if_empty` / `apply_if_empty_or_same` legality;
- condition immunity;
- source-aware temporary condition protection;
- lifecycle state.

### Surface ownership audit

Event Listener surface:
- Ember / Cindercrest — Ash Mark;
- Shade / Veiljaw — Frayed Thought;
- Shade / Umbraspider — Web of Doubt;
- Volt / Sparkmoth — Flash Dust;
- Shade / Mirror Fang listener;
- Stone / Faultstone listener.

These six already execute through Event Listener, but the current APPLY_CONDITION branch calls the legacy context-free condition adapter. V2.4.95 must route structured producer context through the source-aware Condition owner without changing listener discovery, limits or target binding.

Attack after_damage surface:
- Kilnback;
- Pinionserpent;
- Sporeling;
- Mossram;
- Elderbloom — First Canopy ×2;
- Noctivane;
- Cragroller;
- Monolithorn;
- Abyssalume;
- Stormmane;
- Stormcoil — Living Circuit.

Nested conditional Attack programs already use the source-aware Condition owner. The direct pure-condition Attack owner still uses the legacy context-free adapter and must be reconciled without changing its narrow operation-shaped claim.

Attack after_attack_finished surface:
- Aeralith — Storm Shepherd / Eye of the Storm applies Blinded to the **current opponent Vanguard after the Attack's optional switch has completed**.

This timing is distinct from ordinary after_damage. The existing Marevault after-damage-finished specialist intentionally claims only its four-step Essence-move / HEAL_EACH / optional-switch family and must not be widened accidentally. Aeralith requires a separate generic after-attack-finished Condition subroute under Attack owner #14.

Tactic program surface:
- Volt / Blackout Pulse.

The Tactic interpreter already executes APPLY_CONDITION but currently uses the legacy context-free adapter. It must pass source/controller/target/action context into Condition owner #19 while preserving Tactic orchestration and later SET_DEVICE_PLAY_LOCK ownership.

### Repair rule

V2.4.95 does **not** create a Condition engine or owner #41.

The repair must:
1. preserve Condition owner #19 as the only condition-state mutation authority;
2. upgrade structured Event Listener / direct Attack / Tactic producers to source-aware application;
3. preserve already-correct conditional Attack ownership;
4. add one bounded after-attack-finished Condition subroute for Aeralith timing;
5. keep card IDs/names out of runtime dispatch;
6. prove all 20 frozen uses before moving APPLY_CONDITION from missing to implemented.

## V2.4.95 — APPLY_CONDITION all-surface closeout — ACCEPTED

V2.4.95 is complete across all **20** frozen Release 1 `APPLY_CONDITION` uses.

### Accepted execution ownership

- Event Listener: 6 uses now provide source/controller/target/action context to Condition owner #19.
- Attack after_damage: 12 uses are covered across direct pure-condition and nested conditional Attack owners.
- Attack after_attack_finished: Aeralith — Storm Shepherd resolves Blinded only after its optional switch plus emitted Movement/Heal listener continuations complete.
- Tactic program: Blackout Pulse uses source-aware Condition owner context and preserves its later Device-play-lock step.
- Condition owner #19 remains the sole state mutation authority.
- No card-ID/name dispatch was introduced.
- Canonical owner-family count remains **40**; no owner #41.

### Exact acceptance evidence

Source-context producer reconciliation:
- `9f0d2eb1e9e236374a3aa35b6d15daec9289674a` — initial producer-context slice;
- `45405aa64b62990a2c30e74c3c4d5488fecef264` — Card Pass **#1509 SUCCESS** after release-control closure refresh.

After-attack-finished Condition timing:
- `10dcfa6278eb7a683901c91fa203d0ab5dd064fb` — bounded Aeralith timing subroute;
- `196b1901add715b259a3c5fbe37158508872d00e` — Card Pass **#1511 SUCCESS** after exact Match closure refresh.

Capability reconciliation:
- `4d65cbc55e1cde5cdc36c0f5bcd3873d76efb4fd`;
- `APPLY_CONDITION` moved from **missing** to **implemented**;
- capability blob `702e41f5f72ead9cc17abb4290bfec11f0aa664c`;
- Match closure **109 files** / `0eab3c83084c2ee60230be602cf22e1e5b451b713ad9655838008b9300c105c0`;
- Tactic closure **45 files** / `c8ffe22b77007b382e7ae2897dc9c01fb31d668489a700a5c0ceb97145cd8ed2`;
- Card Pass **#1512** runtime/type job fully green; one structure test was stale because it still asserted APPLY_CONDITION was missing.

Final exact-head acceptance:
- `2b09549535ab7df9dd25a57e5e139400fd8dd48f`;
- only change from the capability head is the stale switch-foundation test expectation;
- Card Pass **#1513 SUCCESS** — both structure/effect-grammar and deterministic runtime/type jobs green.

No database migration, Supabase Edge deployment, main merge or live promotion occurred. Production remains unchanged and promotion remains HOLD while the Release 1 capability closeout loop continues.

### Next exact runtime target — V2.4.96

`OPTIONAL` all-surface reconciliation.

The frozen 193-card inventory currently contains exactly **19 Release 1 OPTIONAL uses**, the largest remaining used missing opcode. V2.4.96 must begin read-only by freezing every consumer surface, nested program shape, choice timing and downstream owner before any source change. OPTIONAL owns player consent/resume only; it must never absorb the semantics of the nested operation.

## V2.4.96 — OPTIONAL all-surface closeout (freeze)

Read-only Release 1 inventory is frozen before source changes.

### Frozen inventory — exactly 19 uses

**9 Event Listener OPTIONALs**
- Astral / Celestial Observatory — optional top-deck to bottom move;
- Ember / Bristleflare — optional self effect damage + draw;
- Gale / Gustfox — optional self switch;
- Gale / Zephyrhare — optional Gale Reserve selection + switch;
- Gale / Draft Essence — optional voluntary Withdrawal;
- Grove / Vinecoil — optional condition clear;
- Tide / Moonlit Reef — optional draw then discard;
- Volt / Circuit Essence — optional draw then discard;
- Volt / Stormgrid City — optional resolving-card destination override.

Event Listener already owns a generic server-private accept/decline choice, replaces the OPTIONAL node with the accepted nested steps, and then resumes the same canonical interpreter. Nested operations remain owned by their existing engines.

**6 ordinary Attack after_damage OPTIONALs**
- Ember / Sootwing;
- Gale / Skyweaver;
- Gale / Tempestalon;
- Gale / Aeralith — Storm Shepherd;
- Shade / Wispbat;
- Tide / Mistmarten.

All six are the same bounded family:
`OPTIONAL self -> SELECT_CREATURE self reserve count 1 -> SWITCH_WITH_VANGUARD self`,
with the frozen cards differing only in declared Reserve filters and optional `action_kind: attack`.

Current exact-head audit proves these six are **not** claimed by the structured Attack switch specialist. That owner currently parses a different `IF reserve_count_at_least -> SELECT -> SWITCH` family. The six OPTIONAL cards can therefore fall toward legacy effect-text / caller-supplied `switch_reserve_index` handling instead of receiving a canonical server choice.

This is the actual V2.4.96 repair target.

**3 Tactic program OPTIONALs**
- Gale / Cyclone Route — optional opponent Reserve selection + opponent switch;
- Shade / False Memory — optional discard 1 -> draw 2, else draw 1;
- Shade / Quiet Step — optional clear outgoing Vanguard control condition.

Tactic already owns a generic private accept/decline choice and deterministic nested-step/else-step resume. Nested operations remain with their existing owners.

**1 mixed after_damage_finished OPTIONAL**
- Tide / Marevault — Heart of Tides.

The mixed Attack owner already models this as a 0..1 Reserve switch stage after Movement and HEAL_EACH listener boundaries and delegates accepted mutation to Atomic Switch.

### V2.4.96 ownership rule

`OPTIONAL` owns **player consent + deterministic resume only**.

It must not own:
- Atomic Switch;
- Card-Zone movement;
- Damage;
- Draw/discard;
- Condition clearing;
- voluntary Withdrawal;
- resolving-card destination;
- Creature selection legality beyond the nested operation's declared filters.

### Exact repair boundary

V2.4.96 must:
1. preserve the existing 9 Event Listener, 3 Tactic and 1 Marevault OPTIONAL routes;
2. extend the existing Attack Reserve-switch specialist to the six frozen OPTIONAL after_damage programs;
3. represent decline as a legal zero-selection outcome;
4. represent accept as one server-owned Reserve choice with current-source/current-turn/current-target rebinding;
5. preserve declared Reserve filters, including Aeralith's Gale filter;
6. delegate accepted mutation to Atomic Switch and preserve Movement/Heal listener continuation;
7. remove the six structured cards from dependence on legacy effect-text / caller-supplied switch indexes without deleting legacy compatibility;
8. add no card-ID/name dispatch and no owner #41.

## V2.4.96 — OPTIONAL all-surface closeout — ACCEPTED

V2.4.96 is complete across all **19** frozen Release 1 `OPTIONAL` uses.

### Accepted surface map

- **9 Event Listener** consumers retain the existing private accept/decline continuation and resume their nested operations through their original semantic owners.
- **6 ordinary Attack after_damage** consumers now use the canonical server-owned Attack Reserve-switch choice instead of legacy effect-text / caller-supplied switch indexes.
- **3 Tactic** consumers retain the generic private accept/decline plus nested/else-step interpreter resume.
- **1 Marevault mixed after_damage_finished** consumer retains its existing 0..1 switch stage after movement/heal boundaries.

For the six ordinary Attack consumers:
- decline is a legal zero-selection result and performs no Atomic Switch;
- accept rebinds source turn, source Vanguard identity and selected Reserve anchor;
- declared Reserve filters are data-driven, including Aeralith's Gale-only filter;
- accepted mutation remains Atomic Switch;
- Movement Listener and resulting Heal Listener remain authoritative after the switch;
- structured ownership disables the legacy switch fallback for those attacks;
- no card-ID/name dispatch was added.

`OPTIONAL` therefore owns consent + deterministic resume only. Nested semantics remain with their existing owners. Canonical owner-family count remains **40**; no owner #41.

### Exact acceptance evidence

Freeze:
- `c2bfe680b86242d8b7a1f67a2da989310e90fece`;
- Card Pass **#1515 SUCCESS**.

Source/runtime repair:
- `9772e30eed24a1acbb35c1714b3ab569a8586823`;
- #1516 identified only nullable-test typing + expected release-control drift.

Required-switch test narrowing:
- `0ed4a7f22e4a9f4ec9e02ad184429796a8a17316`;
- Card Pass **#1517** deterministic runtime + all type-checks green; structure failure only stale release-control digest.

Source/runtime + release-control acceptance:
- `f3fc2343ee9c3484045f9c291ee2595e222c91ac`;
- Match closure **109 files** / `8a29ec22c8b6db539c6f0bae4f4c2ce0301b0e411bee7d44c493e6cf804637b6`;
- Tactic closure unchanged **45 files** / `c8ffe22b77007b382e7ae2897dc9c01fb31d668489a700a5c0ceb97145cd8ed2`;
- Card Pass **#1518 SUCCESS**.

Capability reconciliation:
- `6c3151a6cee9f2c4794200898a4b761c41a147ae`;
- `OPTIONAL` moved from **missing** to **implemented**;
- capability blob `0e3dad5932f8511637d36fcd342c7e645944d506`;
- #1519 runtime/type job green; one stale switch-foundation structure assertion still expected OPTIONAL to be missing.

Final exact-head acceptance:
- `3f247763c86a03eb3c8986f409acd5ecc4d8eb16`;
- stale foundation guard now requires OPTIONAL implemented while still requiring overall runtime parity false;
- Card Pass **#1520 SUCCESS**.

No database migration, Supabase Edge deployment, main merge or live promotion occurred. Production remains unchanged; promotion remains HOLD while remaining Release 1 capability debt is closed.

### Next exact runtime target — V2.4.97

`INSPECT_ZONE` all-surface reconciliation.

A fresh frozen 193-card scan after V2.4.96 finds **13** remaining `INSPECT_ZONE` uses, making it the largest currently used missing/partial operation:
- `INSPECT_ZONE` 13;
- `CHOOSE_FROM_SET` 10;
- `DIRECT_DAMAGE` 8;
- `ATTACH_ESSENCE_FROM_ZONE` 7.

V2.4.97 must begin read-only by freezing all 13 zones, viewers, counts, visibility/ordering semantics, bound variables and downstream consumers. Inspection owns authoritative sampling/view state only; later choose/move/search effects remain with their existing owners.

## V2.4.97 — INSPECT_ZONE all-surface closeout (freeze)

Read-only Release 1 inventory and ownership are frozen before source changes.

### Frozen inventory — exactly 13 uses

Only two source zones exist:
- **deck_top ×8**;
- **rewards ×5**.

Visibility/return families:
- controller-private + same-position;
- one server-only + same-position (Cosmarch);
- one controller-private + effect-owned-set (Seer Nyx).

Exact consumers:
1. Astral / Cosmarch — Attack, self deck-top 1, server-only, then card_matches IF / Card-Zone move-to-hand.
2. Astral / Moonbit — triggered Ability/Event Listener, self Reward 1.
3. Astral / Comettail — creature-evolved Reward inspection, self Reward 0..2 distinct.
4. Astral / Nebulynx — active Ability, self Reward 1.
5–6. Astral / Nebulynx — Attack Starfall Path, self deck-top 1 then self Reward 1.
7. Astral / Parallax Window — Tactic, self Reward 1 then LOOK_TOP/order/draw.
8. Shade / Gloamkin — triggered Ability/Event Listener, opponent deck-top 1.
9. Shade / Noctivane — active Ability, opponent deck-top 1 then optional bottom move/schedule.
10. Shade / Wispbat — triggered Ability/Event Listener, opponent deck-top 1.
11. Shade / Graveglider — triggered Ability/Event Listener, opponent deck-top 2 then controller-chosen top order.
12. Shade / Veil Essence — Event Listener, opponent deck-top 1.
13. Shade / Seer Nyx — Tactic, opponent deck-top 3 as effect-owned set -> CHOOSE_FROM_SET 1 -> Card-Zone discard -> return remainder to deck top in controller-chosen order.

### Existing accepted coverage — 11/13 nodes

- Cosmarch uses the bounded server-only Attack top-deck owner.
- Nebulynx Starfall Path uses the bounded ordered deck-top + Reward Attack inspection owner.
- Noctivane uses the active Ability deck-reading owner.
- Nebulynx active Reward inspection uses the active Ability Reward owner.
- Comettail uses the evolution Reward inspection owner.
- Moonbit, Gloamkin, Wispbat, Graveglider and Veil Essence route through the generic Event Listener INSPECT_ZONE implementation.
- Event Listener already supports deck-top controller-private inspection, self Reward inspection, variable binding, CHOOSE_FROM_SET and ordered deck-top return.

### Proven gap — exactly two Tactic INSPECT_ZONE nodes

`tcg-tactic-actions/index.ts` contains no `INSPECT_ZONE` execution branch.

Therefore the exact V2.4.97 repair target is:
- Astral / Parallax Window;
- Shade / Seer Nyx.

### Canonical ownership

Existing owner #31 — Card Search / Filter / Inspection Engine — owns inspection identity/sample/set semantics.
Existing owner #33 — Hidden Information / Private Visibility — owns who may view inspected identities.
Existing owner #32 — Reward Card Engine — owns Reward inspection ledger/private Reward view.
Existing owner #30 — Card-Zone — owns any later physical card movement/order.

V2.4.97 must not create owner #41.

### Exact repair boundary

The Tactic route must:
1. recognize only the frozen `INSPECT_ZONE` grammar used by Parallax Window and Seer Nyx;
2. use server-owned current zone identity and declared min/max/visibility/return policy;
3. keep inspected identities private to the effect controller;
4. for Reward inspection, delegate the inspection ledger/private Reward identity to the existing Reward inspection owner;
5. for opponent deck-top effect-owned-set inspection, bind exact current top-card refs/provenance without physically moving them during inspection;
6. allow later CHOOSE_FROM_SET to select from that bound set;
7. delegate selected discard and final top ordering to Card-Zone;
8. fail closed on stale deck/reward state before downstream mutation;
9. add no card-ID/name dispatch.

## V2.4.97 — INSPECT_ZONE all-surface closeout — ACCEPTED

All **13** frozen Release 1 inspection nodes now have canonical execution coverage.

- Parallax Window uses a server-owned Reward-position choice; Reward identity/ledger/private view remains owner #32 and the Reward stays in place.
- Seer Nyx binds exact opponent deck-top provenance without moving cards during inspection; selection rebinds current top identities; selected discard uses Card-Zone positional partition; final top order uses Card-Zone same-zone reorder.
- Hidden identities stay controller-private. Stale Reward/deck/order identity fails closed before mutation.
- Shared inspection code is a submodule of owner #31; no owner #41 and no card-ID/name dispatch.

Exact evidence:
- inspection owner/test head `3eefcabf4e07c7934f23661a3b8ef4a8d6bdde03` — Card Pass **#1524 SUCCESS**;
- Tactic source head `b671ed372ed46b2d853770bbc8c9726fb7e39171` — deterministic/runtime/type checks green; only closure drift remained;
- source/runtime + release-control head `aae70b4fa61ce193301e9e4ca7a33e4351c52d69` — Card Pass **#1526 SUCCESS**;
- Match closure **109** / `8a29ec22c8b6db539c6f0bae4f4c2ce0301b0e411bee7d44c493e6cf804637b6`;
- Tactic closure **46** / `5defbc3ccf666ee96191aea62b2f98bfda7800ed56f86c5e4e8e7501f1cef876`;
- capability head `90a3ed4e8a592d379e1e252ed143f871fb6a4a44`; `INSPECT_ZONE` moved missing -> implemented; capability blob `b3ed5b6640a8213491479bf7c7fb4fdb63e0d30f`;
- final guard head `369917d9ccca815a3857f3c38f9a88d932eb97a5` — Card Pass **#1528 SUCCESS**.

Production/main/live remain unchanged. Release promotion remains **HOLD** while Release 1 capability debt is closed.

## V2.4.98 — CHOOSE_FROM_SET all-surface closeout (freeze)

Frozen Release 1 inventory: exactly **10** nodes.

Surface split:
- Event Listener **3**: Stardot, Star Essence, Orbit Ring.
- Active Ability **2**: Celestyr — Dream Cartographer, Noctivane.
- Attack **1**: Celestyr — Dream Ray.
- Tactic **4**: Future Draw, Scout Zeph, Seer Nyx, Circuit Scanner.

Grammar families:
- **9** nodes use a previously bound set via `source` plus top-level `min/max`, with optional filters.
- **1** node, Scout Zeph, uses `set + selection` with min 0/max 2 and Gale-Creature filtering.

Owner #31 Card Search / Filter / Inspection owns bound-set choice identity, filtering, min/max, private server choice, current-set revalidation and result binding. Owner #33 keeps hidden-information visibility; owner #30 keeps every later physical move/reorder. The preceding LOOK_TOP/INSPECT_ZONE remains with its own inspection route.

V2.4.98 begins with a read-only all-10 coverage audit. Existing Event Listener, Ability and Attack specialists must be preserved. Only proven gaps may be repaired; no card-ID/name dispatch and no owner #41.

### V2.4.98 ownership audit

Read-only execution audit after the 10-node freeze:

**Preserve unchanged — 6/10 selection nodes already execute through accepted private-choice specialists**
- Event Listener ×3: Stardot, Star Essence, Orbit Ring use generic private `choose_from_set` state and bound-set membership revalidation.
- Active Ability ×1: Noctivane uses the bounded deck-reading specialist and Card-Zone reorder.
- Attack ×1: Celestyr / Dream Ray uses the bounded top-deck choice specialist and Card-Zone partition transfer.
- Tactic ×1: Seer Nyx now uses the V2.4.97 inspection provenance route and Card-Zone partition/reorder.

**Proven repair target — 4/10**
- Celestyr — Dream Cartographer active Ability: no live family recognizes `LOOK_TOP 4 -> CHOOSE_FROM_SET 0..1 -> deck-bottom selected -> controller-order remainder top`.
- Future Draw: Tactic choice grammar is recognized, but the LOOK_TOP family currently detaches cards from Deck and later mutates destination/order inline rather than through Card-Zone.
- Circuit Scanner: same Tactic ownership debt plus frozen `filters.any` is not recognized by current Tactic card filtering.
- Scout Zeph: alternate `set + selection` CHOOSE grammar is unsupported; downstream frozen aliases `destination`, `set`, and `exclude` are also not recognized.

Exact repair boundary:
1. add one shared owner-#31 bound-set choice contract for the two frozen CHOOSE grammars and filters;
2. use that contract in the three affected Tactics while keeping inspected/bound identities server-private;
3. keep their inspected/LOOK_TOP deck window authoritative until Card-Zone performs chosen movement/reorder;
4. add one bounded active-Ability deck-planning family for Celestyr's declared sequence using the same owner-#31 choice semantics and owner-#30 Card-Zone mutation;
5. do not modify the six accepted routes unless a guard proves ownership drift;
6. no card-ID/name dispatch and no owner #41.

## V2.4.98 — CHOOSE_FROM_SET all-surface closeout — ACCEPTED

All **10** frozen Release 1 `CHOOSE_FROM_SET` nodes now have canonical runtime coverage.

### Preserved accepted routes — 6/10
- Stardot, Star Essence and Orbit Ring remain on Event Listener private bound-set choice ownership.
- Noctivane remains on the active deck-reading specialist.
- Celestyr / Dream Ray remains on the bounded Attack top-deck choice specialist.
- Seer Nyx remains on the V2.4.97 inspection-provenance Tactic route.

### Repaired routes — 4/10
- Future Draw — Tactic bound-set choice + Card-Zone mutation/order.
- Circuit Scanner — same family plus frozen `filters.any`.
- Scout Zeph — alternate `set + selection` grammar plus frozen destination/set/exclude aliases.
- Celestyr — Dream Cartographer — bounded active-Ability deck-planning family:
  `LOOK_TOP 4 -> CHOOSE_FROM_SET 0..1 -> selected to deck bottom -> controller-order remainder top`.

### Canonical ownership
Owner #31 owns:
- bound-set identity;
- both frozen CHOOSE grammars;
- filters and `filters.any`;
- min/max;
- private choice state;
- stale/current-set revalidation;
- result binding.

Owner #33 retains hidden-information visibility.
Owner #30 alone performs later physical deck/hand transfer and reorder.

The shared bound-set module is a submodule of existing owner #31. No owner #41 and no card-ID/name dispatch were added.

### Exact evidence
All-surface source/runtime + release-control:
- head `4d3781c12c8b42f953de203eb4acdf14b09ee5e2`;
- Card Pass **#1541 SUCCESS**;
- Match closure **111** / `e1035dbc68dae15d980843b8a7a3d8a11fc076ba9fab72100ccc4f78e7fe09bc`;
- Tactic closure **47** / `5fe799462c53855691f0901fba11740c79d99d691d40bc2173ee6c1a40ae70ac`.

Capability/control:
- head `f4dc9db69e741718abe3f7ed136a824334037fb1`;
- `CHOOSE_FROM_SET` moved **partial -> implemented**;
- capability blob `f6d4ba6118a60dc44d7b63794724295423f1b77e`;
- Card Pass **#1542 SUCCESS**.

Production/main/live remain unchanged. Promotion remains HOLD while remaining Release 1 capability debt is closed.

## V2.4.99 — DIRECT_DAMAGE all-surface closeout (freeze)

Fresh frozen 193-card inventory after V2.4.98 contains exactly **8** `DIRECT_DAMAGE` nodes, the largest remaining used missing opcode.

Surface split:
- **3 Ability/effect consumers**
  - Ember / Bristleflare — Heat Up optional self 10 effect damage;
  - Ember / Magmagecko — selected friendly Ember target 10 effect damage;
  - Ember / Pyrohorn — Ash Crown — modifier-consume target 20 effect damage.
- **2 Attack recoil consumers**
  - Ember / Bristleflare — Reckless Rush self 10 recoil;
  - Ember / Furnacefang — Meltline Charge self 20 recoil.
- **1 ordinary Tactic program**
  - Ember / Ashen Gamble — selected friendly Ember target 20 effect damage.
- **2 triggered Tactic listeners**
  - Ember / Volcanic Caldera — moved-to-reserve event subject 10 effect damage;
  - Grove / Thorn Crown — damage-packet source Creature 10 effect damage.

Frozen grammar:
- targets are already-bound Creature refs;
- amounts are fixed 10 or 20;
- damage classes are only `effect` and `recoil`;
- recoil nodes carry declared `source_attack_id`;
- no DIRECT_DAMAGE node itself performs selection or target discovery.

V2.4.99 must begin with a read-only execution audit against the existing Damage engine / Damage Packet ownership. Producers may sequence DIRECT_DAMAGE, but damage application, protection/prevention, packet history, defeat interaction and listener emission stay with the canonical Damage owners. No owner #41 and no card-ID/name dispatch.

## V2.4.99 — DIRECT_DAMAGE all-surface closeout — ACCEPTED

All **8** frozen Release 1 DIRECT_DAMAGE consumers are now covered through canonical Damage ownership.

### Accepted surface map
- Bristleflare — Heat Up: triggered Ability / Event Listener, self 10 effect damage.
- Magmagecko — Ember Feed: active Ability, selected friendly Ember target 10 effect damage.
- Pyrohorn — Ash Crown: Attack modifier-consume rider, modifier target 20 effect damage.
- Bristleflare — Reckless Rush: Attack after_damage, source Creature 10 recoil.
- Furnacefang — Meltline Charge: Attack after_damage, source Creature 20 recoil.
- Ashen Gamble: ordinary Tactic, selected friendly Ember target 20 effect damage.
- Volcanic Caldera: triggered Tactic / Event Listener, moved-to-reserve subject 10 effect damage.
- Thorn Crown: triggered Tactic / Event Listener, damage-packet source Creature 10 effect damage.

### Canonical ownership
The shared DIRECT_DAMAGE owner validates the bound target request, amount, damage class and recoil attack identity, then delegates physical mutation/protection/history to the canonical Damage Packet / Damage Engine owners.

Producers retain only orchestration:
- Event Listener owns triggered listener sequencing;
- Attack recoil owner owns the two exact recoil shapes;
- Attack modifier completion owns the Pyrohorn rider timing;
- bounded active Ability ownership handles Magmagecko;
- Tactic interpreter handles Ashen Gamble while preserving packet listeners and canonical Defeat #34.

Ashen Gamble now completes the full effect lifecycle:
`DIRECT_DAMAGE -> after_damage_packet Event Listener -> Defeat scan/queue -> remaining Tactic steps`.
If Defeat queues Reward taking or forced promotion, the Tactic completes with the match left in `resolution`, not incorrectly returned to ordinary play.

No card-ID/name dispatch and no owner #41 were added. Canonical owner-family count remains **40**.

### Exact acceptance evidence
All-eight source/runtime before release-control refresh:
- head `1c97fdce71c85846ff158d5c824410a27ffbfcfd`;
- Card Pass **#1557** deterministic/runtime/type job **SUCCESS**;
- all-eight DIRECT_DAMAGE static guard **SUCCESS**;
- only expected Tactic closure drift remained.

All-eight source/runtime + release-control:
- head `27b3cb2b5a041fae1bc8e7c389d7319cb55ff121`;
- Card Pass **#1558 SUCCESS**;
- Match closure **116** / `383ab7bf0eefafb1a41a767cb5f41374d50e76922f03f4c0432ed786851a0c02`;
- Tactic closure **53** / `9698a8aa2aeb63d7d10b3e4aa224a90f0d27bc1d492f949c3bb28aaa6048409f`.

Capability/control:
- head `f6f9d23cd22f890786e653bb760b68d9e41feeb6`;
- `DIRECT_DAMAGE` moved **missing -> implemented**;
- capability blob `aa3d9e4d719d4cb2596abd1b811d7b8613453974`;
- Card Pass **#1559 SUCCESS**.

Production/main/live remain unchanged. Promotion remains HOLD while remaining Release 1 capability debt is closed.

## V2.4.100 — ATTACH_ESSENCE_FROM_ZONE all-surface closeout (freeze)

Fresh frozen inventory contains exactly **7** Release 1 nodes, the largest remaining used partial/missing operation.

Surface split:
- **4 active Creature Abilities**
  - Ember / Magmagecko — hand, exact 1 Basic Ember Essence -> selected damaged Ember Creature;
  - Tide / Surgefin — prior optional discard selection 0..1 Basic Tide -> selected Tide Reserve;
  - Volt / Dynamozer — discard, exact 1 Basic Volt -> source Creature, temporary until controller Aftermath;
  - Volt / Stormcoil — Living Circuit — prior exact discard selection -> selected Volt field target, borrowed until controller Aftermath.
- **2 triggered Creature Abilities / Event Listener**
  - Volt / Arcprowler — on evolve, optional 0..1 Basic Volt from hand -> source Creature;
  - Volt / Coilclank — on evolve after Device resolved, optional 0..1 Basic Volt from discard -> source Creature, temporary until controller Aftermath.
- **1 Tactic**
  - Volt / Quickcharge Cell — prior exact discard selection -> selected Volt field target, temporary until controller Aftermath.

Frozen source grammars:
1. inline `selection` from hand;
2. inline `selection` from discard;
3. prior `SELECT_CARDS` refs via `cards: "$var"`.

Frozen attachment-state families:
- permanent/default attachment;
- temporary until `controller_aftermath`, then discard;
- borrowed until `controller_aftermath`, then discard.

V2.4.100 must begin with a read-only audit of all seven against Essence Attachment owner #22, shared attachment-state normalization, Event/Movement/Heal listener boundaries and current Ability/Tactic routes. Selection remains with its existing owner; physical attachment remains owner #22. No second attachment engine and no owner #41.

## V2.4.100 — audit and repair result

The seven-consumer execution audit found **one** actual all-surface parity gap.

### Preserved canonical routes — 6 / 7
- Magmagecko keeps the existing active hand-attachment + damage family; selection remains private and physical attachment delegates to Essence Attachment owner #22.
- Surgefin keeps the accepted supply route and prior optional `SELECT_CARDS` binding.
- Stormcoil — Living Circuit keeps the accepted supply-attachment route and borrowed attachment state.
- Arcprowler keeps the triggered Event Listener inline-hand attachment route.
- Coilclank keeps the triggered Event Listener inline-discard temporary attachment route.
- Quickcharge Cell keeps the Tactic prior-`SELECT_CARDS` route and temporary attachment state.

None of those six routes was replaced or given card-ID/name dispatch.

### Proven gap and bounded repair — Dynamozer
Dynamozer's structured paid self-attachment owner already existed and passed isolated tests, but it was not connected to the single live active-Ability router / Match private-choice continuation.

V2.4.100 therefore added only the missing generic live composition:
`paid activation cost -> fresh eligible discard Essence choice -> Essence Attachment owner #22 -> existing Event / Movement / Heal continuation`.

The new route:
- is operation-shaped and card-ID-free;
- delegates Device discard payment to the existing active-Ability Payment/cost gate;
- revalidates the current source, turn, paid limit receipt and selected Essence before mutation;
- preserves temporary attachment state through shared normalization;
- delegates physical attachment to owner #22;
- reuses the established post-attachment active-Ability continuation instead of creating a second resolver.

Owner-family count remains **40**; no owner #41.

### Source/runtime + release-control acceptance
- exact head `d0d37294f7cd9e81196691d6e91bf117923862de`;
- Card Pass **#1576 SUCCESS**;
- all seven frozen consumers covered;
- new Dynamozer live-route invariant tests green;
- Deno deterministic runtime green;
- Match / Tactic / Private Alpha type-checks green;
- Match closure **118** / `ec0c2f31fca865d652d822ade620df9377aa2fcab570e4068a4c362ef8e7f1f1`;
- Tactic closure **53** / `ac815498f6ed48b2e233703d1664c6e0165eb040c77568d68467a4702758f50e`.

### Capability reclassification
`ATTACH_ESSENCE_FROM_ZONE` is now **implemented** for the frozen Release 1 grammar:
- source grammars: inline hand 2 / inline discard 2 / prior `SELECT_CARDS` refs 3;
- attachment states: permanent/default 3 / temporary 3 / borrowed 1;
- capability blob `1bb0014f731cc3d2baf7329e04df2a6f148d8ea1`.

Production, main and live remain unchanged. Promotion remains **HOLD** while the synchronized plan/checklist/ledger capability-control head completes fresh exact-head validation and the remaining singleton Release 1 operation debt is closed.

## V2.4.100 — FINAL ACCEPTANCE

The synchronized capability/control checkpoint is green.

- synchronized head `6fa819d30ddb952b437b7b77318dfe2d0feb11fe`;
- Card Pass **#1581 SUCCESS**;
- Set One structure / starter / effect-grammar / release-control validation **SUCCESS**;
- deterministic v0.2 runtime **SUCCESS**;
- Match dispatcher and dependency type-check **SUCCESS**;
- Tactic interpreter type-check **SUCCESS**;
- Private Alpha setup API type-check **SUCCESS**;
- structured withdrawal / attack-damage / Surge type-checks **SUCCESS**;
- capability blob `1bb0014f731cc3d2baf7329e04df2a6f148d8ea1`;
- `ATTACH_ESSENCE_FROM_ZONE` = **implemented**;
- frozen Release 1 attachment consumers = **7 / 7 covered**;
- owner-family count = **40**.

V2.4.100 is complete. Production, main and live remain unchanged. Promotion remains **HOLD** because Release 1 still contains unresolved singleton operation debt; the next target must be selected from the remaining frozen missing-operation inventory rather than by card preference.

## V2.4.101 — ATTACH_ESSENCE_FROM_SELECTION singleton closeout (freeze)

Fresh structured Set One inventory contains exactly **1** current Release 1 consumer:
- Prismatic Founder — active Ability `bandits-current`.

Frozen operation sequence:
1. `SEARCH_DECK` — self deck, public reveal, optional 0..1 Basic Essence whose element is not already attached to the source Creature; hidden failure allowed; destination is logical `effect_owned_selection` bound as `$founder_new_essence`.
2. `ATTACH_ESSENCE_FROM_SELECTION` — attach `$founder_new_essence` to `$source_creature`, non-manual, normal/permanent attachment state.
3. `SHUFFLE_DECK` — self deck.

### Read-only execution audit
The current single live active-Ability router has no family for this search -> effect-owned selection -> attach -> shuffle sequence. Existing active-Ability modules contain no `SEARCH_DECK`, `effect_owned_selection`, or `ATTACH_ESSENCE_FROM_SELECTION` route.

Essence Attachment owner #22 already owns physical attachment, receipt/event creation and lifecycle state, but deliberately rejects `effect_owned_selection` as a physical source zone. That is correct: the effect-owned selection is a logical bound set, while the selected card remains physically in the deck until owner #22 removes it from the true `deck` origin during attachment.

V2.4.101 therefore requires one bounded, operation-shaped active-Ability composition that:
- keeps deck search/selection and hidden-information semantics with their existing owners;
- binds exact selected card identity plus true deck provenance without moving it to a fake zone;
- revalidates source Creature, current turn, selected card identity and dynamic element eligibility before mutation;
- delegates physical deck -> Creature attachment to Essence Attachment owner #22;
- waits for the existing attachment Event / Movement / Heal continuation before the following shuffle step;
- delegates the final shuffle to the existing Randomization engine;
- supports the legal zero-selection path by shuffling without attaching;
- consumes the ordinary once-per-turn active-Ability limit at activation;
- contains no Founder/card-ID/name dispatch and creates no new owner family.

Because the preceding `SEARCH_DECK` is already classified implemented but lacks this active-Ability surface, V2.4.101 may repair that dependent surface only as required to make the frozen ATTACH_ESSENCE_FROM_SELECTION consumer executable. It must not broaden into a generic catch-all Ability interpreter.

## V2.4.101 — IMPLEMENTATION ACCEPTANCE

The frozen Prismatic Founder singleton is now executable through the live active-Ability path without adding card-specific authority.

### Bounded owner-#31 active-Ability composition
The new `tcg-match-active-ability-search-attachment-v0-2.ts` module is a **submodule of existing owner #31 — Card Search / Filter / Inspection**, not a new owner family.

It owns only the frozen search/private-choice composition:
`SEARCH_DECK -> ATTACH_ESSENCE_FROM_SELECTION -> SHUFFLE_DECK`.

The route:
- recognizes the exact operation shape rather than Founder/card IDs or names;
- requires the source to remain the current friendly Vanguard;
- consumes the ordinary once-per-turn active-Ability receipt;
- records the private deck view through Hidden Information owner #33;
- projects only eligible Basic Essence choices to the controller;
- excludes elements already attached to the source Creature;
- revalidates turn, active seat, source identity, definition, receipt, chosen deck-card identity and dynamic element eligibility before mutation;
- treats `effect_owned_selection` as logical selection provenance only;
- leaves the selected card physically in deck until canonical attachment;
- supports the legal zero-selection branch and still shuffles;
- contains no card-ID/name dispatch.

### Canonical downstream ownership
Physical deck -> Creature attachment remains **Essence Attachment owner #22** through `runtimeV02BeginExternalEssenceAttachmentRoute(..., "deck", ...)`.

Post-attachment Event / Movement / Heal processing remains the existing active-Ability continuation pipeline. The search family installs `search_selection_attachment_after_attachment`; only after those listeners finish does the shared Randomization engine shuffle the remaining deck.

No fake `effect_owned_selection` physical zone was introduced. No owner #41 was created. Owner-family count remains **40**.

### Runtime / wiring proof
New deterministic runtime coverage proves:
- private controller search view / opponent waiting view;
- dynamic exclusion of already-attached Essence elements;
- true deck provenance before attachment;
- owner #22 physical attachment;
- zero-selection -> shuffle without attachment;
- stale dynamic eligibility rejection before mutation;
- post-attachment shuffle continuation.

Static wiring proof freezes:
- exactly one Release 1 consumer — Prismatic Founder / `bandits-current`;
- exact `SEARCH_DECK -> ATTACH_ESSENCE_FROM_SELECTION -> SHUFFLE_DECK` shape;
- no Founder/card-name authority in owner, live facade, continuation or Match;
- shared Match attachment-listener continuation;
- count-shaped public activation receipts with no searched-card identity leakage.

### Source/runtime + release-control acceptance
- exact source/runtime head: `8cadb7ce31e98548c868aa1817fe2ab59f5abcac`;
- Card Pass **#1595 SUCCESS**;
- Set One structure / starter / effect-grammar validation **SUCCESS**;
- deterministic v0.2 runtime **SUCCESS**;
- Match dispatcher/dependency type-check **SUCCESS**;
- Tactic interpreter type-check **SUCCESS**;
- Private Alpha setup API type-check **SUCCESS**;
- structured withdrawal / attack-damage / Surge type-checks **SUCCESS**;
- Match closure **119** / `96455602ed13a5acfb37e2cca7a4b267398d49db739a60371569cac122fb005d`;
- Tactic closure **53** / `ac815498f6ed48b2e233703d1664c6e0165eb040c77568d68467a4702758f50e`.

### Capability reclassification
`ATTACH_ESSENCE_FROM_SELECTION` is now **implemented** for the frozen Release 1 grammar.

Capability blob:
`bca64acae1cb4cb7370e4b8fd2a03bedfa7f8a8f`.

Production, main and live remain unchanged. Promotion remains **HOLD** while this synchronized capability/control + plan/checklist/ledger head receives fresh exact-head validation and the remaining singleton Release 1 operation debt is closed.

## V2.4.101 — FINAL ACCEPTANCE

The synchronized capability/control + plan/checklist/ledger checkpoint is green.

- synchronized head `220f9875884ff08e169980c8a72ca17950b9c8ef`;
- Card Pass **#1600 SUCCESS**;
- Set One structure / starter / effect-grammar / release-control validation **SUCCESS**;
- deterministic v0.2 runtime **SUCCESS**;
- Match dispatcher and dependency type-check **SUCCESS**;
- Tactic interpreter type-check **SUCCESS**;
- Private Alpha setup API type-check **SUCCESS**;
- structured withdrawal / attack-damage / Surge type-checks **SUCCESS**;
- Match closure **119** / `96455602ed13a5acfb37e2cca7a4b267398d49db739a60371569cac122fb005d`;
- Tactic closure **53** / `ac815498f6ed48b2e233703d1664c6e0165eb040c77568d68467a4702758f50e`;
- capability blob `bca64acae1cb4cb7370e4b8fd2a03bedfa7f8a8f`;
- `ATTACH_ESSENCE_FROM_SELECTION` = **implemented**;
- frozen Release 1 consumer = **1 / 1 covered**;
- owner-family count = **40**.

V2.4.101 is complete. Production, main and live remain unchanged. Promotion remains **HOLD** because Release 1 still contains unresolved singleton operation debt.

Read-only inventory selects the next used missing operation deterministically: `MOVE_ZONE_POSITION`, with exactly one Release 1 consumer — Astral Celestial Observatory.

## V2.4.102 — MOVE_ZONE_POSITION singleton closeout (freeze)

Fresh Release 1 inventory contains exactly **1** current use of `MOVE_ZONE_POSITION`:
- Astral / Celestial Observatory — Realm listener `celestial-observatory-topshift`.

Frozen listener:
- event = `hidden_information_viewed`;
- `controller_scope = any`;
- requirement = `event_zone_is(deck_top)`;
- limit = once per turn, owner `event_controller`;
- player consent = existing generic Event Listener `OPTIONAL`;
- acting player = `$event_controller`;
- accepted operation = move exactly 1 card in that player's `deck` from `top` to `bottom`;
- visibility = `no_additional_reveal`.

### Upstream trigger audit — shared owner debt exposed by this singleton
The source/runtime audit proves `MOVE_ZONE_POSITION` is not the only missing seam required to make the frozen consumer live.

There are exactly **5 Astral `hidden_information_viewed` listeners** in the accepted structured set:
1. Orbitortoise / Forecast Shell — Shield;
2. Prismowl / Wide Eyes — draw then discard;
3. Starwhale / Star Current — withdrawal modifier;
4. Celestial Observatory / Observatory Topshift — optional top-to-bottom deck reorder;
5. Dreamglass / Foresight Heal — heal after Ability/Attack hidden-information views.

Their nested operations are already owned by existing systems except Observatory's still-missing `MOVE_ZONE_POSITION`. The shared trigger bridge itself is absent: Hidden Information owner #33 records private view metadata, but those views are not emitted into the generic Event Listener runtime.

V2.4.102 therefore includes the minimum generic trigger parity needed by the frozen consumer and the already-declared hidden-information listener family:
- Hidden Information owner #33 must remain the canonical owner of view occurrence and private metadata;
- each actual view occurrence must have canonical event identity, controller seat, viewed zone and source action metadata sufficient for Event Listener predicates/history;
- `event_zone_is` must evaluate the canonical viewed zone;
- `$event_controller` must resolve only from the current Event Listener event context;
- existing Event Listener `OPTIONAL` and `event_controller` turn-limit ownership remain unchanged;
- hidden-view listener execution must preserve the source action's pending private choice/continuation and resolve listener choices first without exposing hidden card identity;
- Match and Tactic live routes must both project/resume the same Event Listener choice contract;
- Dreamglass's emitted Heal Packet must still pass through the canonical Heal Listener continuation;
- no card ID/name dispatch may be introduced.

### MOVE_ZONE_POSITION ownership
Card-Zone owner #30 already exposes `runtimeV02ApplyCardZoneReorder`, the canonical same-zone exact-instance reorder primitive. V2.4.102 must delegate physical deck mutation to that owner.

The Event Listener interpreter may own only operation validation / event-context binding:
- player token = `$event_controller`;
- zone = `deck`;
- from = `top`;
- to = `bottom`;
- count = 1;
- visibility = `no_additional_reveal`.

At resolution, the exact **current** top card UID must be bound and passed to Card-Zone #30. The operation must not inspect/reveal the card, clone it, move any previously viewed stale UID, or fabricate a new zone.

### Safety boundary
This is a shared systems repair, not an Observatory special case. No production/main/live promotion occurs in V2.4.102. Owner-family count must remain **40**; no owner #41.


## V2.4.102 — freeze addendum: complete hidden-view trigger grammar

Exact-head audit at `1e3a1254740830eb9ca5192f6b679715b7d4f08d` adds one required shared predicate seam to the V2.4.102 freeze.

The accepted effect grammar explicitly declares all of:
- predicate `event_zone_is`;
- predicate `source_is_attached_creature`;
- context variable `$event_controller`;
- operation `MOVE_ZONE_POSITION(player, zone, from, to, count[, visibility])`.

The current Event Listener runtime implements none of `event_zone_is`, `source_is_attached_creature` or `$event_controller`, and it has no `MOVE_ZONE_POSITION` branch. Hidden Information owner #33 records only de-duplicated turn metadata and does not currently emit actual per-occurrence listener events.

This means V2.4.102 must preserve two distinct concepts:
1. **history metadata** — the existing de-duplicated current-turn ledger used by current-turn checks; and
2. **trigger occurrences** — one canonical event per actual hidden-information view, carrying no hidden card identity but carrying exact controller, viewed zone, action kind, source controller, source action, source card and source Creature context where applicable.

The per-occurrence trigger record must not be de-duplicated merely because the history ledger already contains the same controller/zone pair. Listener limits and Event Listener receipts decide whether a later occurrence has gameplay effect.

Dreamglass proves why source metadata is required: its accepted listener matches `source_is_attached_creature`, `source_controller_is_self`, and action kind Ability/Attack. For a hidden-view event, `source_is_attached_creature` therefore binds the event's source Creature UID to the Creature carrying the Relic. Tactic-only views have no source Creature and cannot satisfy that predicate.

Card identities, inspected/search results, deck ordering and private choice options remain forbidden from the trigger event. The existing private-view owners remain authoritative for those values.

Freeze checkpoint: Card Pass **#1604 SUCCESS** on `1e3a1254740830eb9ca5192f6b679715b7d4f08d`; both validation jobs green; combined commit status contains no external statuses. No production/main/live change.


## V2.4.102 — implementation acceptance

**Implementation acceptance head:** `d91e1ec293a29991f03519bba3092599758333e1`  
**Card Pass:** #1636 — **SUCCESS**  
**Validation:** Set One 193-card / effect-grammar / release-control ✅; deterministic v0.2 runtime + Match/Tactic type-checks ✅; combined external commit statuses: none found.

V2.4.102 is accepted as the shared Hidden Information -> Event Listener parity slice:

- Hidden Information owner #33 now preserves the de-duplicated current-turn history ledger **and** records distinct source-only trigger occurrences for every actual hidden-information view.
- Trigger occurrence payloads carry controller, viewed zone, action kind, source controller, source action, source card and source Creature provenance only; viewed card identity, ordering and private choice payloads remain private.
- Event Listener now generically adapts `hidden_information_viewed` occurrences, records canonical effect-history events, evaluates `event_zone_is` and `source_is_attached_creature`, and resolves `$event_controller` from the current event.
- `MOVE_ZONE_POSITION` is implemented only for the accepted bounded shape used by Celestial Observatory: event-controller deck, top -> bottom, count 1, no additional reveal. Event Listener validates/binds the operation and Card-Zone owner #30 performs the reorder via `runtimeV02ApplyCardZoneReorder`.
- The current top card is rebound at resolution. The previously viewed top UID is never trusted as the mutation target and is never exposed in public effect history.
- Match and Tactic source flows drain hidden-view listener work before returning their source choice, preserve resumable Event Listener choices, and route emitted Heal Packets through the canonical Heal Listener before resuming.
- Deterministic coverage proves all five accepted Astral listeners: Orbitortoise / Forecast Shell, Prismowl / Wide Eyes, Starwhale / Star Current, Celestial Observatory / Observatory Topshift, and Dreamglass / Foresight Heal.
- Coverage additionally proves repeat-occurrence semantics, private-state non-projection, event-controller ownership, stale-top rebinding and Dreamglass Ability/Attack source matching.
- Runtime capability inventory now classifies `MOVE_ZONE_POSITION`, `event_controller_is_self`, `event_zone_is` and `source_is_attached_creature` as implemented.
- Release-control fingerprints were refreshed against the exact Edge dependency closures: Match **119 files / `dd577d4492b6753a8f7ac5563ce3d133867e12499fb1cf4bd4551ff3ed457263`**; Tactic **53 files / `09067b17567483869def6e55204e45b25ee77d0a8161fb1dfd41367a13920461`**; Private Alpha unchanged at 8 files.
- Owner-family count remains **40**. No owner #41, no card-ID/name dispatch was added for this slice, and no production/main/live promotion occurred.

The documentation synchronization that follows this accepted implementation head is record-only and does not alter runtime behavior.


## V2.4.103 — Damage-Packet predicate family reconciliation (freeze)

**Freeze head:** `6c0e95ae025d1babd09cf63413e1ed1afee8ff95`  
**Inherited exact-head gate:** Card Pass #1637 **SUCCESS**; both validation jobs green; no external combined statuses.

### Exact Release 1 consumers

The structured-card audit finds exactly two Release 1 identities in this capability family.

**Ember — Heatguard Bracer / `heatguard-first-risk-reduction`**
- event: `before_damage_packet`;
- `damage_packet_target_is_attached_creature`;
- `damage_packet_class_is(recoil)` OR `damage_packet_class_is(condition)` + `damage_packet_condition_is(Scorched)`;
- limit: once per turn per attachment;
- operation: `MODIFY_CURRENT_DAMAGE_PACKET(delta -10, minimum 0)`.

**Grove — Thorn Crown / `thorn-crown-reflect`**
- event: `after_damage_packet`;
- `damage_packet_class_is(attack)`;
- `damage_packet_target_is_attached_creature`;
- `damage_packet_target_zone_is(vanguard)`;
- `damage_packet_source_controller_is_opponent`;
- `damage_packet_amount_at_least(1)`;
- operation: `DIRECT_DAMAGE($damage_packet_source_creature, 10, effect)`.

No other Release 1 structured consumer was found for:
`damage_packet_condition_is`,
`damage_packet_amount_at_least`,
`damage_packet_source_controller_is_opponent`,
or `damage_packet_target_zone_is`.
The shared `damage_packet_class_is` and `damage_packet_target_is_attached_creature` predicates are used by both identities.

### Existing generic ownership

This slice is a capability-reconciliation pass, not a new engine.

**Before-Damage Packet owner**
`supabase/functions/_shared/tcg-match-damage-packet-listener-v0-2.ts`
already evaluates all six frozen predicates generically against canonical `RuntimeV02DamagePacketContext`, including `damage_packet_condition_is`.

**Damage Packet context**
`supabase/functions/_shared/tcg-match-damage-packet-context-v0-2.ts`
already carries normalized optional `condition` provenance alongside packet class, source, target and packet identity.

**After-Damage Event Listener owner**
`supabase/functions/_shared/tcg-match-event-listener-v0-2.ts`
already evaluates the five predicates used by Thorn Crown:
class, attached target, target zone, opponent source controller and final packet amount.

The accepted current shapes therefore require **no gameplay runtime code change**.

### Existing proof and one missing proof

Already deterministic:
- generic before-packet modifier ordering / attachment limit;
- Heatguard recoil branch;
- Thorn-style after-packet reflect through canonical `DIRECT_DAMAGE`;
- Thorn non-attack / non-Vanguard rejection.

One proof gap remains before capability promotion:
- direct Heatguard **condition + Scorched** packet test proving `damage_packet_condition_is` matches Scorched, rejects a different condition, and preserves the existing attachment limit semantics.

### Bounded V2.4.103 action

1. Add only the missing deterministic Scorched-condition proof to the existing Damage #20 packet test file.
2. Run exact-head Card Pass.
3. If green, reclassify exactly these six predicates from missing -> implemented:
   - `damage_packet_target_is_attached_creature`
   - `damage_packet_class_is`
   - `damage_packet_condition_is`
   - `damage_packet_source_controller_is_opponent`
   - `damage_packet_target_zone_is`
   - `damage_packet_amount_at_least`
4. Synchronize Release Control's capability-manifest fingerprint atomically with the capability change.
5. Re-run exact-head Card Pass and then close master plan/checklist/ledger.

Owner-family count remains **40**. No card-ID/name dispatch, helper owner, main merge, deployment or live promotion is authorized by this slice.


## V2.4.103 — implementation acceptance

**Accepted head:** `6d37f636b806a6701eab45ef7b0c2e92ba38b9ae`  
**Card Pass:** #1640 — **SUCCESS**  
**Proof head:** `cfb91e4c866df8cdebed684441e8c274eab80fba`, Card Pass #1639 — **SUCCESS**.

V2.4.103 closed as a stale-capability reconciliation with no gameplay-runtime modification:

- the Before-Damage Packet owner already supported all six accepted predicates, including normalized `damage_packet_condition_is`;
- the canonical packet context already carried condition provenance;
- the generic Event Listener already supported the five after-packet predicates used by Thorn Crown;
- existing Thorn Crown tests proved the after-packet reflect path and rejection cases;
- the new proof-only Heatguard test proves the full accepted nested branch: Scorched condition packets match, the same attachment consumes its once-per-turn limit, and Venomed does not match;
- exactly six predicates moved missing -> implemented:
  `damage_packet_target_is_attached_creature`,
  `damage_packet_class_is`,
  `damage_packet_condition_is`,
  `damage_packet_source_controller_is_opponent`,
  `damage_packet_target_zone_is`,
  `damage_packet_amount_at_least`;
- Release Control points at capability blob `6c01e3298efb9c21e5d040b8db3940eb76147187`;
- Edge closure identities were not changed by this proof/capability-only slice.

Owner-family count remains **40**. PR #591 remains draft/unmerged. Production/main/live are unchanged.


## V2.4.104 — core Event Listener predicate reconciliation (freeze)

**Freeze head:** `282602754bede1a54e01068792d5e52c3d36150b`  
**Inherited gate:** V2.4.103 documentation head Card Pass #1641 **SUCCESS**.

### Exact capability family

The current capability manifest still marks eight predicates missing even though `tcg-match-event-listener-v0-2.ts` already owns generic executable cases for each:

- `event_subject_is_source` — 33 Release 1 card identities;
- `event_origin_zone_is` — 32;
- `event_controller_is_active_seat` — 22;
- `event_destination_zone_is` — 17;
- `source_is_self` — 17;
- `event_phase_is` — 9;
- `event_subject_matches` — 4 identities / 5 predicate occurrences;
- `event_subject_is_attached_creature` — 3 identities.

The structured audit finds these uses only inside triggered Creature Ability, Essence-listener or Tactic-listener requirement trees currently owned by the generic Event Listener engine. No Attack-program or Tactic-program interpreter requires a second semantic implementation for these accepted shapes.

### Existing generic semantics

The shared requirement evaluator already implements:

- source identity against current candidate/event controller;
- exact event origin and destination zone comparison;
- exact event phase comparison;
- event-controller vs current active-seat comparison;
- event subject top-instance identity against the listener source;
- attached Creature identity against the listener candidate's field;
- subject-definition filtering through canonical `filtersMatch`;
- source/self controller relation.

No card ID/name dispatch or per-card branch participates.

### Existing proof

Broad deterministic Event Listener suites already exercise:
- `event_subject_is_source`;
- `event_origin_zone_is`;
- `event_destination_zone_is`;
- `event_phase_is`;
- `source_is_self`;

across creature-entered, evolved and frozen essence-attachment listener paths.

Three direct proof gaps remain before capability promotion:
1. `event_controller_is_active_seat` must match the current active seat and reject the inactive controller;
2. `event_subject_matches` must evaluate the current event subject definition and reject a mismatching filter;
3. `event_subject_is_attached_creature` must match a Relic/Essence carrier and reject another Creature's event.

### Bounded action

V2.4.104 adds **proof only** for those three semantics. If exact-head Card Pass is green, exactly the eight frozen predicates may move missing -> implemented and Release Control's capability-manifest fingerprint may be updated atomically.

Owner-family count remains **40**. No gameplay-runtime source, main merge, deployment or live promotion is authorized by this slice.


## V2.4.104 — implementation acceptance

**Proof head:** `5b68a60ff79a4eea0829da0deb596d63f5b6852a` — Card Pass #1643 **SUCCESS**.  
**Accepted capability head:** `445759beccccde2c60afaf93905c0f074ce093cc` — Card Pass #1644 **SUCCESS**.

V2.4.104 closed as a proof/capability reconciliation with **no gameplay-runtime change**.

The generic Event Listener engine already owned the accepted semantics. New deterministic proofs established:
- `event_controller_is_active_seat` matches only when the event controller is the authoritative active seat;
- `event_subject_matches` resolves the current event subject definition and rejects a mismatching element filter;
- `event_subject_is_attached_creature` matches only the Creature carrying the listening Relic and rejects an event for another Creature.

Existing deterministic suites already covered the other five frozen predicates across creature-entered, evolved and essence-attached flows:
`event_subject_is_source`,
`event_origin_zone_is`,
`event_destination_zone_is`,
`event_phase_is`,
and `source_is_self`.

Exactly eight predicates moved missing -> implemented:
- `event_subject_is_source`;
- `event_origin_zone_is`;
- `event_controller_is_active_seat`;
- `event_destination_zone_is`;
- `source_is_self`;
- `event_phase_is`;
- `event_subject_matches`;
- `event_subject_is_attached_creature`;

Release Control now points to capability blob `73d94115359b28379301c50a38fee4556f4a8ac4`. The proof commit touched test files only and the reconciliation commit touched capability/release-control metadata only; no Edge runtime closure changed.

Owner-family count remains **40**. PR #591 remains draft/unmerged. Production/main/live are unchanged.


## V2.4.105 — Heal predicate capability reconciliation (freeze)

**Freeze head:** `2d3b17186a3df64b32531bfef31aa864c4782554`  
**Inherited gate:** V2.4.104 documentation head Card Pass #1645 **SUCCESS**.

### Exact Release 1 consumers

The structured-card audit finds exactly three identities in this family:

**Grove — Symbiote Essence**
- `heal_packet_source_is_attached_creature`;
- `heal_packet_target_controller_is_self`;
- `heal_packet_target_is_not_source`.

**Tide — Shellip / Tidepool Shell**
- `heal_packet_target_is_self`;
- `heal_source_is_card_effect`;
- `heal_actual_amount_at_least(1)`.

**Tide — Moonlit Reef**
- `heal_actual_amount_at_least(1)`;
- `heal_target_element_is(Tide)`;
- `heal_controller_is_active_seat`;
- `heal_source_is_card_effect`.

No other Release 1 structured identity uses any of the eight frozen predicates.

### Existing canonical ownership

`supabase/functions/_shared/tcg-match-heal-listener-dispatch-v0-2.ts` already evaluates all eight generically from the canonical persisted Heal Packet and current listener attachment/source context. It owns:
- exact source/target Creature identity;
- target controller;
- active-seat comparison;
- actual healed amount;
- card-effect source flag;
- target element;
- source-vs-target distinction.

No card ID/name dispatch participates.

### Existing deterministic proof

`runtime-v0-2-heal-listener-dispatch.test.ts` already builds all three accepted listener shapes together.

The test **"after-heal dispatcher resolves Shellip and Symbiote while deferring Moonlit"** proves:
- Symbiote matches its three packet/source predicates and emits the reciprocal Heal Packet;
- Shellip matches target-self + card-effect + actual-heal threshold and gains Shield;
- Moonlit matches actual-heal + Tide target + active-seat + card-effect and is correctly deferred as an optional choice for the event controller.

Companion tests prove:
- per-source/attachment turn limits;
- next-turn reset;
- persisted packet idempotency;
- nested Symbiote packet non-recursion;
- malformed listener metadata fails closed.

### Bounded V2.4.105 action

This is a **metadata reconciliation only** unless validation contradicts the existing proof.

If the exact freeze head remains green:
1. move exactly the eight frozen Heal predicates missing -> implemented;
2. update Release Control's capability-manifest fingerprint atomically;
3. pass exact-head Card Pass;
4. close master plan/checklist/ledger.

Owner-family count remains **40**. No gameplay-runtime source, Edge closure, main merge, deployment or live promotion is authorized by this slice.


## V2.4.105 — implementation acceptance

**Freeze head:** `395a88b63cc4f61ef75245878feb2c62919b9958` — Card Pass #1646 **SUCCESS**.  
**Accepted capability head:** `ebece9cef2872d205bfa2e4dfc080e4ff2e02071` — Card Pass #1647 **SUCCESS**.

V2.4.105 closed as a pure capability/release-control reconciliation with **no gameplay-runtime or test change**.

The existing canonical Heal Listener dispatcher and deterministic tests already prove all accepted Release 1 semantics across:
- Symbiote Essence;
- Shellip / Tidepool Shell;
- Moonlit Reef.

Exactly eight predicates moved missing -> implemented:
- `heal_packet_source_is_attached_creature`;
- `heal_packet_target_controller_is_self`;
- `heal_packet_target_is_not_source`;
- `heal_packet_target_is_self`;
- `heal_actual_amount_at_least`;
- `heal_source_is_card_effect`;
- `heal_controller_is_active_seat`;
- `heal_target_element_is`;

Release Control now points to capability blob `c7d8c34be26d54c804e6bc70f9f243be838cbc8d`. Edge runtime source and dependency closures did not change.

Owner-family count remains **40**. PR #591 remains draft/unmerged. Production/main/live are unchanged.


## V2.4.106 — Essence Movement predicate reconciliation (freeze)

**Freeze head:** `23cd8971eaa23e15367d326f9d1b21280f748c6b`  
**Inherited gate:** V2.4.105 documentation head Card Pass #1648 **SUCCESS**.

### Exact Release 1 consumers

The structured-card audit finds exactly three Tide identities in this family:

**Rillrunner / Running Current**
- `essence_move_element_is(Tide)`;
- `essence_move_source_is_self` OR `essence_move_destination_is_self`.

**Reefshell / Breakwater Current**
- `essence_move_destination_is_self`;
- `essence_move_element_is(Tide)`.

**Tidal Lens / Tidal Lens Heal**
- `essence_move_source_is_attached_creature`;
- `essence_move_element_is(Tide)`.

No other Release 1 identity uses these four predicates.

### Existing canonical ownership

`supabase/functions/_shared/tcg-match-movement-listener-v0-2.ts` already evaluates all four generically from the canonical `essence_moved` event and listener candidate context.

The accepted semantics remain:
- exact source Creature identity;
- exact destination Creature identity;
- exact moved Essence element;
- attached-carrier identity for Relic listeners.

No card ID/name dispatch participates.

### Existing deterministic proof

`runtime-v0-2-movement-listener.test.ts` directly proves the frozen consumers:

- **Reefshell**: matching Tide movement to self grants Shield; a second same-turn trigger is limited.
- **Rillrunner**: Tide Essence leaving or reaching self installs the one-use Attack bonus; wrong element does not trigger.
- **Tidal Lens**: movement from the attached Creature emits a canonical Heal Packet; second same-turn trigger is limited.
- the suite also proves wrong-controller rejection and legacy-state no-op.

### Bounded V2.4.106 action

This is a **metadata reconciliation only** unless exact-head validation contradicts the existing runtime proof.

If the freeze head remains green:
1. move exactly the four frozen predicates missing -> implemented;
2. update Release Control capability-manifest fingerprint atomically;
3. pass exact-head Card Pass;
4. close master plan/checklist/ledger.

Owner-family count remains **40**. No gameplay-runtime/test source, main merge, deployment or live promotion is authorized.


## V2.4.106 — implementation acceptance

**Freeze head:** `2c91679ce009e452369ba31cfebff9a6cd4d620d` — Card Pass #1649 **SUCCESS**.  
**Accepted capability head:** `921ff4d0e26efc2f619a7daaaefc8cc17688cb9e` — Card Pass #1650 **SUCCESS**.

V2.4.106 closed as a pure capability/release-control reconciliation with **no gameplay-runtime or test change**.

Existing Movement Listener ownership and deterministic proof cover Rillrunner, Reefshell and Tidal Lens. Exactly four predicates moved missing -> implemented:
- `essence_move_destination_is_self`;
- `essence_move_element_is`;
- `essence_move_source_is_attached_creature`;
- `essence_move_source_is_self`;

Release Control now points to capability blob `ce8ed09b5a6623a483504427d43a238ff604e5c2`. Edge runtime source and dependency closures did not change.

Owner-family count remains **40**. PR #591 remains draft/unmerged. Production/main/live are unchanged.

## V2.4.107 — `source_has_relic` predicate reconciliation (freeze)

**Freeze head:** `146cf553704447e79a7979d638074de32f6ddfda` — Card Pass #1651 **SUCCESS**.

### Exact Release 1 consumers

The structured Set One audit finds exactly three frozen uses:

- **Stone — Rampartusk / Rampart Plating**: continuous `incoming_attack_damage`, gated by `source_has_relic`, amount -10.
- **Stone — Rampartusk / Wall Break**: Attack `conditional_add`, +20 when `source_has_relic`.
- **Stone — Citadelhorn / Fortress Heart**: continuous `incoming_attack_damage`, gated by `source_has_relic`, amount -20.

No other Release 1 structured consumer uses this predicate.

### Existing canonical ownership and proof

This is a stale-capability reconciliation, not a new engine:

- `tcg-match-attack-damage-v0-2.ts` generically evaluates `source_has_relic` for continuous incoming self-Ability damage from the live Creature Relic slot.
- `tcg-match-attack-conditional-add-evaluator-v0-2.ts` generically evaluates the same predicate from declaration-time context.
- `tcg-match-actions/index.ts` constructs that context from `!!p.vanguard.relic`, so Wall Break reads authoritative current battlefield state.
- `runtime-v0-2-attack-conditional-add-evaluation.test.ts` proves the Wall Break-style positive and negative branches.
- `runtime-v0-2-attack-damage-prevention-authority.test.ts` proves the Fortress Heart shape with and without a Relic. Rampart Plating is the same generic continuous predicate family with a different numeric amount.

No card ID/name dispatch participates. No gameplay runtime or new proof is required.

### Bounded V2.4.107 action

1. Move exactly `source_has_relic` missing -> implemented.
2. Synchronize Release Control's capability-manifest fingerprint in the same commit.
3. Require fresh exact-head Card Pass.
4. Close master plan/checklist/ledger only after that gate passes.

Owner-family count remains **40**. No runtime/test source, Edge Function, database, main merge, deployment or live promotion is authorized by this slice.


## V2.4.107 — implementation acceptance

**Freeze head:** `146cf553704447e79a7979d638074de32f6ddfda` — Card Pass #1651 **SUCCESS**.  
**Accepted capability head:** `830ac7dbec6614500b9135f0b2f800bcd3ae77ec` — Card Pass #1652 **SUCCESS**.

V2.4.107 closed as a pure capability/release-control reconciliation with **no gameplay-runtime or test change**.

Exactly one predicate moved missing -> implemented: `source_has_relic`.

Release Control now points to capability blob `e6763c176e840b757d3886cde050b4c2ed30ae77`. Match/Tactic/Private Alpha runtime source and dependency closures did not change.

Owner-family count remains **40**. PR #591 remains draft/unmerged. Production/main/live are unchanged.

## V2.4.108 — `source_became_vanguard_this_turn` predicate reconciliation

**Freeze head:** `84d7b824fde3a6e2f4e5e6922b88cc2d4311dbad` — Card Pass #1653 **SUCCESS**.

### Exact Release 1 consumers
Exactly two structured consumers use this predicate:
- **Gale Gustfox / Tailwind Strike** — base 60, +20 when the source became Vanguard this turn.
- **Gale Zephyrhare / Zephyr Kick** — base 30, +20 when the source became Vanguard this turn.

### Canonical ownership and proof
- Atomic Switch ownership in `tcg-match-switch-context-v0-2.ts` writes `incoming.became_vanguard_turn = turn_seq` for both ordinary and forced post-defeat Vanguard transitions.
- Match constructs the declaration-time predicate context by comparing the authoritative current Vanguard `became_vanguard_turn` to the current `turn_seq`.
- `tcg-match-attack-conditional-add-evaluator-v0-2.ts` owns the direct-state predicate.
- `runtime-v0-2-attack-conditional-add-evaluation.test.ts` proves both matching and non-matching branches for this exact predicate family.

No card identity dispatch and no duplicate switch state are needed.

## V2.4.108 — implementation acceptance

**Accepted capability head:** `d99ce641ba85a1eeb922337af67eafc5e34237eb` — Card Pass #1654 **SUCCESS**.

Exactly `source_became_vanguard_this_turn` moved missing -> implemented. Release Control now points to capability blob `9661f21edda0bb8dfc7d710cdf94ae54fc6496db`.

This was a pure capability/release-control reconciliation. Runtime source, tests, Edge closures, database, main and live are unchanged. Owner-family count remains **40**; PR #591 remains draft/unmerged.

## V2.4.109 — `source_is_current_friendly_vanguard` predicate reconciliation

**Baseline authority head:** `7f415b3137c35d1e8fd62cfb74c72a73143ecd21` — Card Pass #1655 **SUCCESS**.

### Exact Release 1 consumer
Exactly one structured consumer uses this predicate:
- **Prismatic Founder / Bandit's Current** active Ability.

The frozen Ability is the already-accepted owner-#31 search/private-choice sequence:
`SEARCH_DECK -> ATTACH_ESSENCE_FROM_SELECTION -> SHUFFLE_DECK`.

### Canonical ownership and proof
`tcg-match-active-ability-search-attachment-v0-2.ts` requires the exact `source_is_current_friendly_vanguard` descriptor shape. Before creating any private search choice it:
- requires `source.where === "vanguard"`;
- requires `source.index === null`;
- rebinds the supplied source identity to the live current Vanguard;
- only then records the active-Ability use receipt through the shared live facade.

V2.4.109 added one bounded negative regression proving that a Reserve source is rejected with `tcg_v0_2_search_attachment_source_must_be_vanguard` and that the turn-limit receipt remains unconsumed.

**Proof head:** `1364263b1fe85828d84d2072416a927a43dfa5a0` — Card Pass #1656 **SUCCESS**.

### Implementation acceptance
**Accepted capability head:** `e2c48ab21b0dfa351c4dc282050c38215dcbbfb6` — Card Pass #1657 **SUCCESS**.

Exactly `source_is_current_friendly_vanguard` moved missing -> implemented. Release Control now points to capability blob `ae2a92997fca04a47f25b77283a45f330794a805`.

No gameplay runtime source changed. The only proof change is the negative active-Ability regression. No database, Edge deployment, main merge or live promotion occurred. Owner-family count remains **40**; PR #591 remains draft/unmerged.

## V2.4.110 — `hand_contains` predicate reconciliation

**Baseline authority head:** `af233e9a5452e54a77f40c8d5857b06338e02e4b` — Card Pass #1658 **SUCCESS**.

### Exact Release 1 consumer
Exactly one structured consumer uses this predicate:
- **Volt Dynamozer / Overcharge Engine** active Ability.

The frozen requirement/cost pair is:
- `hand_contains` with Device filters `Tactic + Device`;
- mandatory `CHOOSE_HAND_TO_DISCARD` count 1 with the exact same filters;
- independent legal Basic Volt Essence availability in discard.

### Canonical ownership and proof
The paid active-Ability family validates that the `hand_contains` requirement filters agree with the mandatory Card-Cost filters. Canonical Card-Cost choice then enumerates the controller's actual private hand, applies the structured filters, and fails closed if fewer than the mandatory count exist.

V2.4.110 added one direct negative regression with an eligible Volt Essence still present in discard but **no Device in hand**. The activation fails with the canonical insufficient-hand-cost error and the once-per-turn Ability receipt remains unconsumed.

**Proof head:** `8722b23477354adf417ab51ac2be2cba519b9976` — Card Pass #1659 **SUCCESS**.

### Implementation acceptance
**Accepted capability head:** `c93625b3456ae7a3cc8f177a84665071fd8912dd` — Card Pass #1660 **SUCCESS**.

Exactly `hand_contains` moved missing -> implemented. Release Control now points to capability blob `d0e78fbd34f748da52c4443859edb6dd8b22ecb9`.

No gameplay-runtime source changed. The only proof change is the no-matching-Device regression. No database, Edge deployment, main merge or live promotion occurred. Owner-family count remains **40**; PR #591 remains draft/unmerged.

## V2.4.111 — `event_attachment_target_is_source` + Relic Attachment event parity

**Baseline authority head:** `25304a5e327a6bf15014b11189497bdf38f8715b` — Card Pass #1661 **SUCCESS**.

### Exact Release 1 consumers
Exactly four structured consumers use this predicate:
- **Stone Gravibble / Pebble Guard** — `essence_attached`;
- **Stone Flintkin / Layered Hide** — `relic_attached`;
- **Tide Puddlepip / Freshwater Coat** — `essence_attached`;
- **Volt Railhorn / Power Rail** — `essence_attached`.

The three Essence consumers were already owned by immutable trigger-time Essence Attachment snapshots. Flintkin exposed a real parity gap: marked v0.2 Relic attachment still bypassed generic `relic_attached` event ownership and used a temporary card-ID heal fallback.

### Generic repair
V2.4.111 adds a Relic Attachment route submodule parallel to the existing Essence route:
`Relic owner receipt -> relic_attached event -> Event Listener -> Movement/Heal continuation -> defeat scan -> play`.

The generic Event Listener now evaluates `event_attachment_target_is_source` as exact event `attachment_target_uid` equality to the candidate source Creature uid.

Marked v0.2 Match orchestration no longer dispatches `stone-flintkin` by card ID. The old raw-heal fallback remains only on the unmarked legacy path.

### Validation correction history
The first bounded runtime head `ac9cf0d6eaa9942127aa6081799e881cfc53075c` failed Card Pass #1662 because validation bindings were stale: Edge closure fingerprints, one forced-promotion resume assertion, and one test type annotation.

The repaired binding head `159e018ead3e2024f83104bed3383cae1c12ce64` failed Card Pass #1663 with **983 existing runtime tests passing and only the two new Relic route tests failing**. That failure exposed a separate generic schema-parity defect: the authoritative card schema permits triggered Ability timing `any_turn`, while Event Listener accepted `any` but rejected `any_turn`.

The schema-valid timing correction is generic and card-ID free. Triggered Ability `any_turn` now means unrestricted turn ownership, while existing `own_turn` and `build` gates remain unchanged.

**Accepted runtime head:** `42e871cb63ca34c43207ef4bceee8c2dcbbf4553` — Card Pass #1664 **SUCCESS**.

### Capability acceptance
**Accepted capability head:** `59a6e4afdd524ded1f57054184b7781ace2c12ee` — Card Pass #1665 **SUCCESS**.

Exactly `event_attachment_target_is_source` moved missing -> implemented. Capability blob is `8546a44b79fd9de595a4279557221997b9cea562`.

Release Control is synchronized to the repaired Edge closures and capability manifest. Owner-family count remains **40**. No database migration, Supabase Edge deployment, main merge or live promotion occurred; production TCG functions remain Match v9 / Tactic v4 / Private Alpha v3.

## V2.4.112 — `target_stage_in` predicate reconciliation

**Baseline authority head:** `ffb8db05095c3ebaf6a7d33cc89e9264dd475637` — Card Pass #1666 **SUCCESS**.

### Exact Release 1 consumers and owners
Exactly two structured consumers use this predicate:
- **Grove Bloom Essence / Bloom Attach Heal** — `essence_attached`, owned by immutable Essence Attachment eligibility snapshot;
- **Grove Symbiote Essence / Symbiote Reciprocal Heal** — `after_heal_packet`, owned by canonical Heal Listener dispatch.

Bloom's owner snapshots the attached Creature's printed stage at trigger time and tests membership in the declared stages. Symbiote's Heal Listener resolves the attached Creature definition and applies the same structured stage-membership requirement generically.

### Bounded proof history
Proof head `90b9a24192824eb5e4d76d1dd2e0b12406dd24c0` added a negative Essence Attachment snapshot regression proving a frozen Teen target fails an Adult-only stage list. Card Pass #1667 **SUCCESS**.

A subsequent exact-consumer audit caught that Symbiote is an `after_heal_packet` consumer, not an `essence_attached` consumer. No metadata was reconciled at that point.

Proof head `64cb430b1aa6067d97d18f5c7e2d11dd1d744a16` added a Heal Listener negative regression: changing the attached Grove source from Teen to Baby blocks only Symbiote while unrelated Shellip and Moonlit listener behaviour remains intact. Card Pass #1668 **SUCCESS**.

No gameplay-runtime source changed in either proof commit.

### Capability acceptance
**Accepted capability head:** `80b74c688042ae90cc9d2aa94f6905e6b21e51cd` — Card Pass #1669 **SUCCESS**.

Exactly `target_stage_in` moved missing -> implemented. Capability blob is `a4a515fc213a1a0d86704ed0dd2a9e63505436bd`.

Release Control capability fingerprint is synchronized. Owner-family count remains **40**. No database migration, Supabase Edge deployment, main merge or live promotion occurred.

## V2.4.113 — `target_zone_is` predicate reconciliation

**Baseline authority head:** `8eca7b8bb245a7d4af4cc4aaca8af112f1c2a0da` — Card Pass #1670 **SUCCESS**.

### Exact Release 1 consumer
Exactly one frozen consumer uses `target_zone_is`:
- **Gale Draft Essence / Draft Attach Withdrawal** — `essence_attached`, requiring `$attached_creature` to be in `reserve`.

The canonical Essence Attachment eligibility owner already freezes the target Creature's battlefield zone at trigger time and evaluates the predicate generically. There is no Draft Essence/card-ID/name dispatch.

### Bounded proof
Proof head `9ce5d45ecddc6a13d52b4dda053ccc84290c05ee` adds an explicit negative regression: the same frozen Reserve attachment target rejects a Vanguard-only `target_zone_is` requirement.

Card Pass #1671 **SUCCESS**. No gameplay-runtime source changed.

### Capability acceptance
Accepted capability head `a632fa67be0024e5ca64b98d8965fa00399f5f67` passed Card Pass #1672 **SUCCESS**.

Exactly `target_zone_is` moved missing -> implemented. Capability blob is `f1361fca48abfebdbdc5525d768a88f48fec51c7`.

### Draft Essence remains partially open
V2.4.113 does **not** accept:
- `voluntary_withdrawal_legal_with_incoming`;
- `PERFORM_VOLUNTARY_WITHDRAWAL`.

The audit found the current attachment snapshot's withdrawal-legality quote is incomplete relative to authoritative normal Withdrawal. Normal Withdrawal resolves:
`base/continuous cost -> structured withdrawal modifiers -> before_voluntary_withdrawal_cost listeners -> exact attached-Essence Payment -> Atomic Switch`.

Draft Essence must reuse that complete ownership chain, including player-selected exact Essence payment. Its current snapshot legality must not be stretched into acceptance until the same quote is used.

Owner-family count remains **40**. No database migration, Supabase Edge deployment, main merge or live promotion occurred.

## V2.4.114 — `target_element_is` multi-owner parity + Cinder Charm outgoing Relic Attack Damage

**Baseline authority head:** `4d782a56357a654d3fdbca6a3a9c4b3d727dff34` — Card Pass #1673 **SUCCESS**.

### Exact Release 1 inventory
The frozen structured registry has **13 card consumers** of `target_element_is` across four runtime owner surfaces:
- Essence Attachment snapshot: Hearth Essence, Smolder Essence, Draft Essence, Bloom Essence, Veil Essence, Fault Essence, Calm Essence, Flow Essence, Brine Essence, Surge Essence;
- Heal Listener: Symbiote Essence;
- Withdrawal continuous: Granite Essence;
- outgoing Relic Attack Damage: Cinder Charm.

The first three owner families already evaluated the predicate generically. The exact audit found one real parity gap: Cinder Charm is a Relic with a continuous outgoing `attack_damage` effect, while Attack Damage previously collected outgoing Essence continuous effects and Creature continuous Abilities but not outgoing Relics.

### Generic repair
V2.4.114 extends existing Damage/Shield owner #20 rather than creating another owner family:
- attached Relic continuous effects with `kind: attack_damage` and `target: $attached_creature` enter outgoing Attack Damage generically;
- Cinder's `target_element_is` reads the attached Creature's structured definition element;
- Cinder's `value.default / value.cases` formula resolves without card identity;
- its case predicate `target_printed_hp_at_least` delegates to the shared Requirement evaluator rather than duplicating numeric comparison semantics;
- the existing Tactic IF `target_printed_hp_at_least` branch now delegates to that same Requirement owner.

Cross-owner proof also adds explicit negative `target_element_is` checks for Essence Attachment and Heal Listener; existing Withdrawal tests already prove Granite works for Stone and rejects non-Stone.

### Fail-closed correction history
Initial runtime head `da93fa4684ba8b09e9c39c7001487ee3615a8a70` passed the new Cinder test but failed Card Pass #1674 with **985 runtime tests passing / 5 failing**. All five failures were existing damage-prevention-authority tests.

Cause: the structured-runtime probe was unnecessarily widened to inspect attached Relic identity. Legacy-compatible prevention test states intentionally had an attached Relic outside structured `card_index`, so the damage resolver returned `null` instead of entering the already-marked structured Creature authority.

Repair head `821362b42b853e70067bafd0ef204ac555936cd3` restores the prior structured probe boundary while retaining generic outgoing Relic execution. Card Pass #1675 **SUCCESS**.

### Capability acceptance
Capability head `21237c037b1e1668d3fba16ad7b47c112855b1b3` passed Card Pass #1676 **SUCCESS**.

Exactly `target_element_is` moved missing -> implemented. Capability blob is `195391418a8490a16e7e0b61b141e5f262522e29`.

Release Control is synchronized to the repaired Match/Tactic closures and capability manifest. Owner-family count remains **40**. No database migration, Supabase Edge deployment, main merge or live promotion occurred.


## V2.4.115 — `source_element_is` Event Listener parity

**Baseline authority head:** `597efafa9f9cf460046819e3441cd9211c046b7e` — Card Pass #1677 **SUCCESS**.

### Exact Release 1 inventory
The frozen structured-card sweep across Astral, Ember, Gale, Grove, Shade, Stone, Tide, Volt and Founder finds exactly **one** `source_element_is` consumer:
- Astral — Orbit Ring / `orbit-ring-after-attack` / `attack_finished`.

Its companion requirements `source_is_attached_creature` and `source_controller_is_self` were already generic Event Listener predicates.

### Generic repair
V2.4.115 extends the existing Event Listener owner only:
- read `event.source_creature_uid`;
- resolve that exact current battlefield Creature;
- read the Creature's structured definition `element`;
- compare it with the listener's declared `element`;
- fail closed when the source uid is absent or no longer resolves.

No Orbit Ring/card-name dispatch, helper owner or new owner family is introduced.

### Deterministic proof
Runtime head `4d141b15f3393cd07048727457b2616fba0340f6` passed Card Pass #1678 **SUCCESS**.

The Event Listener regression proves both sides of the predicate:
- Astral attack source -> Orbit Ring listener is processed;
- the same source changed to Gale -> Orbit Ring listener is rejected.

### Capability acceptance
Capability head `39eb324e1ca57f372693a263589240998659f5e5` passed Card Pass #1679 **SUCCESS**.

Exactly `source_element_is` moved missing -> implemented. Capability blob is `230f0eb0b01333b4885c5134e39bfed1dda515cd`.

Owner-family count remains **40**. Supabase production remains `tcg-match-actions` v9, `tcg-tactic-actions` v4 and `tcg-private-alpha-api` v3. No database migration, Edge deployment, main merge or live promotion occurred.

## V2.4.116 — `source_has_condition` cross-surface parity

**Baseline authority head:** `36c09307c9934a16d98c76cba0ab6794b2775d7a` — Card Pass #1680 **SUCCESS**.

### Exact Release 1 inventory
The frozen structured-card sweep finds exactly **two** `source_has_condition` consumers, both Ember:
- Cinderburrow / Burrow Burst — Attack `conditional_add`, source must be Scorched.
- Kilnback / Furnace Hide — continuous `incoming_attack_damage`, source Creature must be Scorched.

### Ownership audit
Cinderburrow was already generic:
- Attack formula metadata includes `source_has_condition`;
- conditional-add evaluator matches against normalized `source_conditions`;
- Match Attack authority supplies current source conditions at legal declaration.

Kilnback exposed the missing execution seam. The existing Damage/Shield owner now delegates that incoming self-Ability predicate to canonical Condition Engine `hasRuntimeCondition`. No duplicated condition-slot logic, card-ID/name dispatch, helper owner or owner-family expansion was introduced.

### Deterministic proof
Runtime head `ff88bf0a4b05414d051d5eae45ee4e476175fa60` passed Card Pass #1681 **SUCCESS**:
- Kilnback while Scorched: 80 incoming Attack damage -> 70.
- Kilnback while not Scorched: remains 80.
- existing Cinderburrow direct-state positive/negative conditional-add proofs remain green.
- release-control Match Edge closure updated and validated.

### Capability acceptance
Capability head `0001fdca5b9f7d063f2496fff8b5e5f88128f5b9` passed Card Pass #1682 **SUCCESS**.

Exactly `source_has_condition` moved missing -> implemented. Capability blob is `6993a45b193e482d29be63cd05c7cbd83031a6ae`.

Owner-family count remains **40**. Supabase production remains `tcg-match-actions` v9, `tcg-tactic-actions` v4 and `tcg-private-alpha-api` v3. No database migration, Edge deployment, main merge or live promotion occurred.

## V2.4.117 — `target_became_vanguard_this_turn` attached-Relic parity

**Baseline authority head:** `0eaaa29eb4230dbfca7186afe2065c138d6ff6b4` — Card Pass #1683 **SUCCESS**.

### Exact Release 1 inventory
The frozen structured-card sweep finds exactly **one** `target_became_vanguard_this_turn` consumer:
- Gale Wingclip Charm / `wingclip-vanguard-pressure` — outgoing `attack_damage` on `$attached_creature`.

### Semantic audit
Wingclip also declares `filters.target_element = "Gale"`. The schema target is `$attached_creature`, so the target-element filter belongs to the attached Creature, not to the opposing Creature being attacked. The prior outgoing Relic bridge supplied attacked-target element through the shared Attack context; V2.4.117 corrects that binding generically for outgoing attached-Relic effects.

The canonical Atomic Switch / forced-promotion owner already writes `incoming.became_vanguard_turn = turn_seq`. No new movement flag or duplicate switch state is introduced.

### Generic repair
The existing outgoing Relic Attack-Damage owner now:
- accepts `target_became_vanguard_this_turn` only for `$attached_creature`;
- compares the attached Creature's canonical `became_vanguard_turn` marker with the current `turn_seq`;
- binds outgoing Relic `target_element` filters to the attached Creature definition;
- preserves the existing `target_element_is` Relic predicate.

No Wingclip/card-name dispatch, helper owner or new owner family is introduced.

### Deterministic proof
Runtime head `ca6bc8967064788178ba55ed8538c7b7d7f783af` passed Card Pass #1684 **SUCCESS**:
- current-turn Gale attached Creature: +20;
- prior-turn Gale attached Creature: +0;
- current-turn non-Gale attached Creature: +0;
- the attacked Creature in the positive case is Stone, proving the filter is not accidentally bound to the opponent target.

### Capability acceptance
Capability head `9a07306ae6fd312b00ce0ef511228a277a440794` passed Card Pass #1685 **SUCCESS**.

Exactly `target_became_vanguard_this_turn` moved missing -> implemented. Capability blob is `1890db166b4dceb38a3ea6a02e28596f7307941f`.

Owner-family count remains **40**. Supabase production remains `tcg-match-actions` v9, `tcg-tactic-actions` v4 and `tcg-private-alpha-api` v3. No database migration, Edge deployment, main merge or live promotion occurred.

## V2.4.118 — Skyrend attack-declared metadata parity

**Baseline authority head:** `befce93659c63b9238148b8f461e26e157d06d7a` — Card Pass #1686 **SUCCESS**.

### Exact Release 1 inventory
The frozen structured-card sweep finds exactly **one** consumer for each of the following predicates, all on Gale Skyrend / Open Sky Hunter:
- `event_attack_id_is` -> `sky-rend`;
- `event_attack_target_zone_is` -> `reserve`;
- `event_attack_target_controller_is_opponent`.

The same listener already uses implemented `event_attack_source_is_self`, and its only step is implemented `MODIFY_CURRENT_ATTACK_DAMAGE`.

### Generic repair
The existing synchronous `attack_declared` Event Listener owner now evaluates the three metadata predicates directly from the authoritative attack input:
- exact attack id;
- exact bound target zone;
- target controller relative to the listener source controller.

Every predicate validates only its declared grammar fields and fails closed on unsupported shapes. No Skyrend/card-name dispatch, helper owner or new owner family is introduced.

### Deterministic proof and closure correction
Runtime commit `0f4e1e68f22d945f2796c52951610a9741dde288` added the generic predicates and deterministic Skyrend proof. Card Pass #1687 reported **FAIL** only in the structure/release-control gate because the shared Event Listener file also belongs to the Tactic Edge closure; the deterministic runtime core and all type-check jobs were green.

Head `10936bfb16c8e4dff5f2490ea94b4e8b0b9f761f` synchronized the Tactic closure fingerprint and passed Card Pass #1688 **SUCCESS** end-to-end.

The regression proves:
- Sky Rend -> opponent Reserve: 110 becomes 90;
- wrong attack id: remains 110;
- opponent Vanguard target: remains 110;
- self-controlled Reserve target: remains 110.

### Capability acceptance
Capability head `9ede8792b2f03b3a996c0018586eba624acfd7d1` passed Card Pass #1689 **SUCCESS**.

Exactly `event_attack_id_is`, `event_attack_target_zone_is`, and `event_attack_target_controller_is_opponent` moved missing -> implemented. Capability blob is `f6bbb7ff69357da5a284db77ecf806cc079d9915`.

Owner-family count remains **40**. Supabase production remains `tcg-match-actions` v9, `tcg-tactic-actions` v4 and `tcg-private-alpha-api` v3. No database migration, Edge deployment, main merge or live promotion occurred.
