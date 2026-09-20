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
