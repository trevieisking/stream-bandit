# Stream Bandit TCG V2.4.45 Checklist — Pre-Generation Source-of-Truth Lock

## Mandatory pre-image gate
- [x] Refresh current PR #576 head before each image generation.
- [x] Read the current art-production ledger from that active branch.
- [x] Resolve the next card from repository source-of-truth, not memory.
- [x] Bind exact Card ID, Printing ID, Artwork ID, target path and visual brief before generation.
- [x] Check whether the canonical PNG already exists before generating.
- [x] Stop before generation if branch/ledger/path/sequence evidence disagrees.
- [x] Reject materially mismatched image candidates before upload.
- [x] Return to this source-of-truth gate before every subsequent card.

## Existing upload loop retained
- [x] Generate image only after the source preflight passes.
- [x] Create the canonical GitHub folder after a valid candidate exists.
- [x] Verify the folder before sharing the upload link.
- [x] Provide exact filename, final path, commit message and description.
- [x] Verify Trevor's commit and the real repository file.
- [x] Normalize accidental generated filenames using the same blob bytes.
- [x] Count artwork only after canonical-path verification.
- [x] Synchronize ledger/checklist/progress before advancing.

## Current material progress
- [x] Stardot.
- [x] Orbitail.
- [x] Cosmarch.
- [x] Moonbit.
- [x] Comettail.
- [x] Nebulynx.
- [x] Cometmanta.
- [x] Orbitortoise.
- [x] Prismowl.
- [x] Starwhale.
- [x] Celestyr — Dream Cartographer.
- [x] Basic Astral Essence.
- [x] Star Essence.
- [x] Orbit Essence.
- [x] Nova Essence.
- [x] Archivist Sol.
- [x] Cartographer Lyra.
- [x] Future Draw.
- [x] Gravity Shift.
- [x] Star Chart.
- [x] Celestial Observatory.
- [x] Dreamglass.
- [x] Orbit Ring.
- [x] Parallax Window.
- [ ] Set One Standard/base PNG masters complete: **24/193 -> 193/193**.
- [x] Astral Standard/base PNG masters complete: **24/24**.
- [ ] Final clean backgrounds complete: **0/8 -> 8/8**.

## Safety
- [x] No next-card selection from conversation/model memory alone.
- [x] No generated-only image counted.
- [x] No upload marker counted.
- [x] No user commit counted until canonical path is verified.
- [x] No gameplay/runtime/database/Supabase change.
- [x] No Code Labs Writer / Repo Desk / CG Repair Lab / Code God.

## First deck Shop + Battle Pass preview
- [x] Lock first preview deck identity to **Astral — Second Sky**.
- [x] Lock **Set One (SB1)** as **Battle Pass Season 1** identity.
- [x] Reach Astral Standard/base artwork **24/24**.
- [x] Confirm the existing Second Sky 60-card starter recipe remains valid at the preview head (60 cards / 21 identities).
- [ ] Produce/verify Second Sky sleeve, battle coin and deck-box art for the product preview.
- [x] Build a branch-only Shop preview using real approved Second Sky assets.
- [x] Build a branch-only **Set One — Season 1** Battle Pass preview using real Set One assets.
- [x] Keep purchase, price, currency, entitlement, reward-grant and progression values gated to canonical economy/Battle Pass owners.
- [x] Do not imply that the Battle Pass automatically grants all 193 Set One cards.

## Second Sky runtime/presentation integration
- [x] Shared runtime art resolver reads canonical production-ledger target paths.
- [x] Astral 24/24 printing/intake metadata is synchronized to canonical Standard artwork paths.
- [x] Second Sky exact 60-card / 21-identity recipe is presentation authority.
- [x] Game Home preview wired.
- [x] Play preview wired without replacing server-owned deck selection/matchmaking.
- [x] Decks exact-recipe preview wired without browser deck mutation.
- [x] Collection Astral 24-card visual preview wired without ownership inference.
- [x] Shop featured Second Sky preview wired with purchase disabled.
- [x] Battle Pass Set One — Season 1 visual preview wired with tiers/rewards unassigned.
- [x] Existing battle renderer receives approved Astral art through the shared art resolver.
- [x] Product presentation is driven by an extensible starter-id registry rather than card/deck-specific page branches.
- [ ] Produce/verify Second Sky Card Sleeve Set artwork.
- [ ] Produce/verify Second Sky Battle Coin artwork.
- [ ] Produce/verify Second Sky Deck Box artwork.
- [x] Desktop human visual acceptance of Second Sky surfaces — Trevor PASS on exact head `7d15aec02ee76613a706e4ca491f6c091e57351b`.
- [x] Add V2.4.50 mobile responsive shell: full 3 x 2 navigation rail, vertical page scrolling and stacked core layouts.
- [x] Add complete two-column mobile Collection/Deck card grids so all approved Astral identities remain reachable.
- [x] Mobile human visual acceptance of Second Sky surfaces — Kay PASS after V2.4.50 phone repair.
- [x] Overall cross-device Second Sky visual acceptance — Trevor desktop PASS + Kay mobile PASS.
- [ ] Main/Pages/live release only after inherited end-to-end release gates.


## Canonical deck presentation + daily cadence
- [x] Lock Second Sky desktop layout as the presentation baseline for future completed launch decks.
- [x] Lock V2.4.50 mobile layout: six-item 3 x 2 rail, vertical page scroll, stacked panels and two-column card grids.
- [x] Lock artwork-fit rule: future art must preserve its focal subject inside accepted card/product/reward containers on desktop and phone.
- [x] Lock Play Active Battle, Decks, Collection, Shop and Battle Pass presentation patterns for reuse.
- [x] Set working cadence target to **one completed launch deck per working day**, without bypassing source truth, CI or human acceptance.
- [x] Confirm next canonical starter is **Ember — Ashrush** (`deck-ember-ashrush`).
- [ ] Begin Ember/Ashrush artwork only after a fresh repository pre-generation source-of-truth read.


## V2.4.51 — canonical global card face priority
- [x] Lock the accepted Orbitortoise card-face reference URL in repository authority.
- [x] Lock HP top-left beside name.
- [x] Lock element / energy type top-right.
- [x] Lock Reward Cards bottom-left.
- [x] Lock rarity bottom-right with Withdraw directly beneath rarity.
- [x] Supersede the old two-row restriction so a canonical Ability + Attack 1 + Attack 2 can all remain visible.
- [x] Lock one shared renderer for Battle, hand, Collection, Decks, Shop, packs/rewards and Battle Pass previews.
- [x] Lock Artwork Pending cards as fully readable/playable card faces.
- [x] Lock active-Ability glow to authoritative server capability data; triggered Abilities are never manual buttons.
- [x] Pause Ember/Ashrush artwork until renderer acceptance.
- [x] Generate a deterministic browser display registry from all **193** SB1 structured identities plus printing/art metadata.
- [x] Implement the shared full/battle/hand/compact card renderer with no card-ID-specific branches.
- [x] Fit all **24/24 Astral** approved images into the shared renderer without baking rules text into the image bytes.
- [x] Prove the remaining **169** missing-art identities render complete Artwork Pending card faces with correct structured data.
- [x] Replace Battle placeholder cards with the shared real card face while preserving accepted board geometry.
- [x] Make active Ability availability visibly glow from server `field_actions.ability_sources` and route use through existing `use_ability`.
- [x] Show every canonical Attack row with Essence cost, damage/formula display and readable effect summary; legality remains server-owned.
- [x] Collection and Deck previews use the same renderer rather than artwork-only tiles.
- [ ] Desktop human readability PASS for Astral Battle + Collection + Decks.
- [ ] Mobile/coarse-touch human readability PASS for Astral Battle + Collection + Decks.
- [x] Exact-head TCG Card Pass 2 Validation PASS.
- [ ] Promotion decision before merge/main/live.


## V2.4.52 — real Attack / result / quit acceptance
- [x] Lock Attack as a server-owned action that automatically places damage and ends the attacking player's turn after its required effect/resolution chain.
- [x] Lock Creature defeat -> opponent Reward Card resolution -> required promotion -> Match Flow continuation.
- [x] Lock explicit **Quit Match** as server `concede`: quitter loses, opponent wins.
- [x] Lock reload/navigation as resumable rather than an automatic concession.
- [x] Lock terminal result continuation to fresh `tcg-play.html` matchmaking with no carried match id.
- [x] Lock active Ability glow/pulse to server capability projection and disappearance after use/limit consumption.
- [x] Lock Attack Ready/blocked presentation to server-projected readiness, including insufficient-Essence explanation.
- [x] Lock touch Essence fallback: tap Essence -> tap highlighted Creature; V2.4.53 additionally requires phone/tablet finger drag/drop.
- [x] Lock the Trevor-supplied Orbitortoise card as the global card-face layout reference for current/future identities.
- [x] Add the small Battle settings/cog control and wire **Quit Match** through authoritative `concede`.
- [x] Rename terminal continuation to **Back to Matchmaking** and prove it returns to `tcg-play.html` without `match_id`.
- [x] Automated Attack journey proves legal Attack -> exact damage -> automatic turn advance/draw.
- [x] Automated defeat journey proves lethal Attack -> Creature removed -> Reward resolution queued.
- [x] Automated concession journey proves quitter loss / opponent win and no unrelated state mutation.
- [x] Automated active Ability projection proves usable -> glow eligible -> use -> projection disappears.
- [x] Exact-head TCG Card Pass 2 Validation PASS after V2.4.52.
- [x] Trevor/Kay real two-user PASS: at least one Attack visibly places damage.
- [ ] Trevor/Kay real two-user PASS: lethal damage visibly triggers Reward handling and subsequent state. **Human evidence already proves the lethal KO itself and entry into Reward resolution; face-down Reward selection -> hand -> promotion/turn continuation still requires retest.**
- [ ] Trevor/Kay real two-user PASS: Ability usable glow appears and disappears after activation.
- [ ] Trevor/Kay real two-user PASS: phone tap Essence attachment succeeds without drag.
- [x] Trevor/Kay real two-user PASS: Quit Match gives quitter DEFEAT, opponent VICTORY, then both can return to fresh matchmaking.
- [ ] Promotion decision only after the real two-user post-Attack gate is complete.


## V2.4.53 — Essence orb readability + mobile drag/drop
- [x] Lock attached Essence as tiny colored sphere/orb/pip markers on the Creature in Battle.
- [x] Lock orb identity to canonical Astral/Ember/Gale/Grove/Shade/Stone/Tide/Volt element palette plus element glyph/accessibility label.
- [x] Lock orb quantity to authoritative effective payable Essence units from attached sources / structured `provides`, never a browser-owned counter.
- [x] Lock overflow compression to card bounds only: individual orbs remain until the Essence rail would overflow its allocated card area; then each element becomes one counted orb with that element's live numeric total inside it. No fixed Essence count triggers compression.
- [x] Lock orb removal to authoritative discard/removal/movement/expiry of the attached source.
- [x] Lock Attack cost display beside Attack so required colored Essence can be compared directly with attached colored Essence.
- [x] Preserve the existing server-owned Essence/Payment/Attack engines; visual orbs are presentation only.
- [x] Record the proven phone gap: current coarse-touch Battle hand cards disable native drag transport.
- [x] Supersede desktop-only drag: phone/tablet must support finger drag/drop and keep tap-select -> destination as a fallback.
- [x] Lock mobile drag transport to pointer/touch-safe gesture handling with the same server commands as tap/desktop.
- [x] Freeze Trevor/Kay accepted Battle board geometry while adding interaction parity.
- [x] Defer decorative board/realm polish until core playable cross-device Battle acceptance is complete.
- [x] Reconfirm priority: canonical card visuals + real Attack/damage lifecycle remain ahead of final board decoration; counted Essence orbs are part of that playable-card readability work.
- [x] Clarify that any numeric examples used during design discussion are illustrative only; the compression trigger is available card space, not a particular Essence count.
- [x] Implement authoritative attached-Essence orb rail on own and opponent Creature cards without leaking private information.
- [x] Implement effective-unit/multi-element grouping from canonical structured Essence `provides`, using one counted orb per element when the individual-orb rail would crowd the card.
- [x] Implement phone/tablet pointer/touch-safe hand-card drag/drop transport for setup/play/evolve/Essence/Relic legal destinations.
- [x] Keep tap-select -> tap highlighted destination fully working after touch-drag implementation.
- [x] Automated test: attaching Essence adds the correct element orb(s); compression starts only when the rendered rail would exceed its allocated card bounds; discard/removal can expand or reduce the rail again from authoritative state.
- [x] Automated test: when compressed, every Essence type keeps its own counted orb and numeric total; different element totals are never merged.
- [x] Automated test: Attack-cost orb presentation and attached-resource orb presentation use the same canonical element identities.
- [x] Automated test: coarse-touch drag uses the same intent/action payload as tap mode and contains no duplicate gameplay legality.
- [x] Exact-head TCG Card Pass 2 Validation PASS after V2.4.53 implementation.
- [x] Clarify Attack timing in card presentation: **Turn ends after full resolution**. A non-lethal Attack proceeds straight through Aftermath/turn advance; a lethal Attack pauses that continuation for Defeat -> Reward -> required promotion, then resumes the same end-of-turn path.
- [x] Keep server-blocked Attacks inspectable without dispatch: clicking a blocked Attack explains the authoritative reason (including insufficient matching Essence) and never sends an Attack command.
- [x] Keep the battlefield Vanguard anchored while opening a separate readable desktop card inspector; selecting a Creature must not physically relocate/jump the source card.
- [x] Fix the human-video client freeze where Vanguard/Essence interaction raised `cardNameById is not defined`; define the shared card-name resolver in the Battle controller and regression-guard the inspector so a browser exception cannot stall the active player's turn.
- [ ] Trevor desktop PASS: drag/drop still works and board geometry is unchanged.
- [ ] Kay phone PASS: finger drag/drop works for a playable hand card to a legal destination.
- [ ] Kay phone PASS: tap-select -> destination still works as fallback.
- [ ] Trevor/Kay PASS: attached Essence colors/counts are readable on every occupied Creature and update immediately when Essence leaves.
- [ ] Final board decoration/art polish only after these interaction gates and the V2.4.52 real Attack/damage gate pass.
- [ ] Promotion decision remains HOLD until V2.4.52 + V2.4.53 human gates pass.
