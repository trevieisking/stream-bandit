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


## V2.4.54 — compact tabletop + lethal Attack handoff correction
- [x] Record Trevor/Kay human evidence that lethal Attack -> Reward take -> forced promotion reached a synchronized authoritative Revision but remained stuck in `phase=resolution` instead of returning to `play`.
- [x] Confirm from authoritative database command/event history that Attack, Reward take and promotion all committed successfully before the stall; do not misdiagnose the completed commands as browser transport failures.
- [x] Fix the canonical Match Flow Turn owner so a successful ordinary turn advance explicitly sets `phase = "play"`; terminal/deckout branches remain unchanged.
- [x] Regression-test the exact lethal continuation boundary: start in `resolution` -> advance next seat/draw -> finish in `play`.
- [x] Preserve Card-Zone as the physical turn-start draw owner and Match Flow as the lifecycle/phase owner.
- [x] Treat the supplied reference videos 3/4 as **interaction/layout reference only**, never as permission to copy external artwork, branding, card identities or visual assets.
- [x] Lock Battle to **normal browser zoom** as the acceptance target; players must not need 50% zoom to see the whole tabletop and hand.
- [x] Lock in-play Creature cards to compact artwork/status previews that remain in their board slots.
- [x] Lock tap/click on a compact field card to open a separate full canonical Stream Bandit card inspector without moving/reflowing the source card.
- [x] Lock the player hand to a fixed bottom horizontal card tray that never makes the whole board taller.
- [x] Lock phone hand navigation to left/right horizontal swipe/scroll.
- [x] Lock hand-card tap/click to readable inspection while preserving the already-approved tap-select -> highlighted-destination fallback after closing the inspector.
- [x] Lock direct desktop/phone drag/drop from hand to the existing legal board destinations and existing server actions; no duplicate layout-specific gameplay owner.
- [x] Implement compact field-card rendering through the existing shared card renderer `compact` mode.
- [x] Implement compact hand-card rendering plus one shared full inspector for hand/field cards.
- [x] Implement one-viewport phone tabletop composition with four Reserve slots, Vanguard, side piles, battle-flow strip and horizontal hand visible without page-height expansion.
- [x] Keep attached Essence rail / HP / live status visible on compact occupied field cards.
- [x] Exact-head TCG Card Pass 2 Validation PASS after V2.4.54 implementation/docs synchronization — **#1091 PASS**.
- [x] Deploy only the proven Match Flow Turn phase-return repair to the existing live `tcg-match-actions` function after exact-head evidence is green — **v9 ACTIVE**, JWT preserved.
- [ ] Trevor desktop PASS at default/100% zoom: whole battlefield + hand visible; no browser zoom-out required.
- [ ] Trevor desktop PASS: click field/hand card -> readable inspector; source card stays anchored; drag/drop still works.
- [ ] Kay phone PASS: whole battlefield + bottom hand visible in one viewport; hand scrolls left/right.
- [ ] Kay phone PASS: tap hand card -> readable inspector; close -> tap fallback remains possible; long-hold drag/drop still works.
- [ ] Trevor/Kay real two-user PASS: lethal Attack -> Reward(s) to hand -> required promotion -> phase returns to play -> active player switches automatically.
- [ ] Promotion to main/live remains HOLD until V2.4.52–V2.4.54 human acceptance is complete.


## V2.4.55 — hand peek/fan + inspect everywhere
- [x] Review Trevor desktop and Kay phone V2.4.54 recordings against the earlier supplied TCG interaction reference.
- [x] Record the V2.4.54 visual regression: slot-height-filled Vanguard cards dominate the tabletop even though the whole board now fits at normal zoom.
- [x] Restore bounded in-play card sizing so Vanguard/Reserve cards read as board pieces rather than filling their available rows.
- [x] Lock the Battle hand to a **bottom-edge peek/fan rail**: larger cards deliberately continue below the visible hand mask instead of shrinking into complete tiny cards.
- [x] Lock desktop and phone hand browsing to horizontal scroll/swipe with overlapping/negative card spacing where required.
- [x] Keep click/tap hand inspection and existing drag/drop plus tap-select -> destination transport; presentation changes must not create another gameplay path.
- [x] Add shared renderer **inspect mode** with substantially more card area dedicated to complete Ability/Attack/move rows.
- [x] Use the shared inspect face for Battle hand/field inspection while preserving live authoritative Attack/active-Ability controls only on the player's own Vanguard.
- [x] Make canonical card tiles on **Decks** inspectable through the shared read-only card inspector.
- [x] Make canonical card tiles on **Collection** inspectable through the shared read-only card inspector.
- [x] Make card-backed **Battle Pass** reward samples inspectable through the shared read-only card inspector.
- [x] Keep non-Battle card inspection presentation-only: no fabricated deck ownership, collection ownership, Battle Pass progression, entitlement or economy authority.
- [x] Add automated coverage for shared inspect mode, product-page inspection, bounded field-card scale and the bottom hand peek/fan rail.
- [x] Exact-head TCG Card Pass 2 Validation PASS after V2.4.55 implementation/docs synchronization — source candidate head `33e68f158e309a442ca1c6ab1d08d319cddfd9e9`, **#1116 PASS**.
- [ ] Trevor desktop PASS at default/100% zoom: Vanguard/Reserve cards no longer dominate the table and the larger hand visibly peeks below the bottom rail.
- [ ] Trevor desktop PASS: horizontal hand browse + click-to-inspect + drag/drop all remain usable.
- [ ] Kay phone PASS: whole battlefield remains visible while larger hand cards peek below the bottom edge and swipe left/right.
- [ ] Kay phone PASS: inspected card shows complete/readable moves/Abilities and touch drag + tap fallback still work.
- [ ] Human PASS on Decks, Collection and card-backed Battle Pass rewards: tap/click opens the same readable read-only inspection face.
- [ ] Main/static live promotion remains HOLD until the V2.4.52–V2.4.55 human acceptance gates are complete.


## V2.4.56 — server-projected action clarity + Withdraw/Realm repair
- [x] Review Kay's 25-minute paired Battle recording `Video Project 8.mp4` frame-by-frame for action failures and red server messages.
- [x] Correlate the recording with authoritative production match command/state history before changing rules.
- [x] Confirm the recording is **not** one global server deadlock: Realm and multiple Attacks committed successfully later in the same match.
- [x] Record repeated raw client errors visible in the recording: `required_tactic_target_unavailable` and `manual_essence_already_used_this_turn`.
- [x] Confirm Realm play is already server-owned and committed successfully; repair visibility/feedback rather than creating another Realm engine.
- [x] Confirm Withdraw is already fully projected/executed by `tcg-match-actions` but had **no Battle client control**.
- [x] Confirm the Battle client was not consuming existing `play_card_targets`, `evolve_targets`, `attach_essence_targets` and `attach_relic_targets` projections before offering destinations.
- [x] Add one read-only `play_tactic_preview` action to the existing Tactic owner and make real `play_tactic` reuse the exact same playability helper.
- [x] Preflight Creature/Realm/Evolution/Essence/Relic/Tactic hand actions through their existing authoritative owners before mutation.
- [x] Deduplicate in-flight hand preflight so rapid selection + destination interaction shares one read-only projection request.
- [x] Translate known server legality codes into useful player guidance while retaining the raw code in diagnostics.
- [x] Render Withdraw from `field_actions.withdraw` only: exact cost, server payment options and legal Reserve targets.
- [x] Submit Withdraw only through existing server `withdraw` with exact `reserve_index` + selected attached-Essence UIDs; browser calculates no Withdraw legality.
- [x] Keep the active Realm visible on compact/mobile Battle layouts and resolve its canonical card name from `view.realm.card.card_id`.
- [x] Make the active Realm inspectable through the same canonical read-only card inspector.
- [x] Preserve Attack ownership/readiness in `field_actions.attacks`; insufficient Essence remains a server-projected block, now explained clearly.
- [x] Refresh the guarded Tactic Edge dependency closure fingerprint after the intentional owner extension.
- [x] Exact-head source candidate TCG Card Pass 2 Validation **#1138 PASS**.
- [ ] Deploy only the exact green `tcg-tactic-actions` preview extension with JWT configuration preserved, after fresh deployment evidence.
- [ ] Kay phone PASS: unusable Tactic is explained before mutation; no raw red `required_tactic_target_unavailable` message.
- [ ] Kay phone PASS: second manual Essence attempt is explained as the one-per-turn rule before mutation.
- [ ] Kay phone PASS: legal Attack becomes clearly available once its server-projected Essence requirement is met.
- [ ] Trevor/Kay PASS: active Realm stays visibly named and opens inspection.
- [ ] Trevor/Kay PASS: own Vanguard inspector exposes Withdraw; exact Essence payment + Reserve target completes one authoritative switch.
- [ ] Main/static live promotion remains HOLD until V2.4.52–V2.4.56 human acceptance is complete.


## V2.4.57 — complete Release 1 runtime before next full Battle acceptance
- [x] Change execution order: do not make Trevor/Kay full Battle acceptance the next target while Release 1-used runtime capability parity is knowingly incomplete.
- [x] Preserve Release 1 scope: 8 launch elements / 193 identities / 8 starters; Fairy, Underworld and product-layer future work remain outside this runtime-completion gate.
- [x] Parse the frozen nine Card Pass 2 sources and confirm exactly **193 unique cards**.
- [x] Inventory actual Release 1 structured usage: **61 operations / 97 predicates**.
- [x] Prove capability manifest contains stale labels as well as genuine gaps; do not blindly implement by label.
- [x] Identify generic IF as a genuine foundational gap: **29 instances / 27 cards / all 8 elements**.
- [x] Prove current predicate logic is fragmented across Event Listener, Attack special evaluators, narrow Requirement evaluation and Tactic compatibility branches.
- [x] Add one shared v0.2 predicate-tree owner for all / any / not / leaf delegation with fail-closed validation.
- [x] Add deterministic Deno tests for nested evaluation, short-circuiting, malformed shapes and bounded recursion.
- [x] Exact-head TCG Card Pass 2 Validation **#1143 PASS** for predicate-tree foundation.
- [x] Migrate existing Event Listener boolean composition onto the shared predicate-tree owner without changing leaf semantics. **Card Pass #1149 PASS** with exact Edge closure fingerprints refreshed.
- [ ] Build/reuse shared Release 1 predicate leaf semantics where multiple runtime families need the same meaning.
- [x] First shared leaf consolidation: source_damaged now has one Requirement-evaluator meaning reused by Active Ability and Attack IF; **Card Pass #1155 PASS**.
- [x] Shared source_has_shield_at_least meaning added to the Requirement evaluator and reused by Attack IF; **Card Pass #1163 PASS**.
- [x] Repair all 5 Release 1 Tactic play requirements using reserve_count_at_least; predicate and legacy forms share one evaluator; **Card Pass #1171 PASS**.
- [x] Repair all 12 Release 1 Tactics using legal_card_available; reuse existing card/Creature selectors and shared candidate-existence semantics; **Card Pass #1179 PASS**.
- [x] Add canonical turn-owner history before previous_opponent_turn/event history support; opening, ordinary and deckout turn starts record ownership; same-seat extra turns resolve correctly; **Card Pass #1189 PASS**.
- [x] Wire generic IF through Tactic execution for every Release 1 Tactic IF shape. All six frozen Tactic IF programs and downstream opcodes pass Card Pass #1250 on `93c169b63423ef029bf7cbd071eb4e09c27bd74d`.
- [x] Wire generic IF through Attack execution for every Release 1 Attack IF shape; 13/13 accepted by Card Pass #1288 on `8db9ac8da165aac56e06ffc466a7892749eb75a1`.
- [x] Wire generic IF through Active/triggered Ability execution for every Release 1 Ability IF shape; 9/9 Ability IF instances accepted by Card Pass #1319.
- [x] Prove all 29 Release 1 IF instances are executable without printed-English/card-ID fallback; 7 Tactic + 13 Attack + 9 Ability.
- [x] Reconcile IF + its proven Release 1 predicate classifications in tcg-runtime-capabilities-v0.2.json; accepted by Card Pass #1326.
- [ ] Continue operation/predicate audit until **every Release 1-used partial/missing capability** is either implemented or proven already implemented by the rightful owner.
- [ ] Only after Release 1 runtime capability closeout return to Trevor/Kay full two-device G5 Battle acceptance.
- [ ] Main/static live promotion remains HOLD until runtime closeout + G5 + final release gates.


## V2.4.58 — visible card-zone state + authoritative Battle motion
- [x] Record Kay's additional phone recording `Screen_Recording_20260920_193339_Chrome.mp4` as deferred human evidence for the next full Battle acceptance pass; do not use it to bypass Release 1 runtime closeout.
- [x] Lock presentation rule: authoritative card-zone/state changes must be visually understandable without requiring the player to infer what happened from counters alone.
- [ ] Render both players' decks as visible **face-down card piles** with count; never expose hidden card identities.
- [ ] Trigger a clear deck **shuffle animation/effect every time the authoritative RNG/Card-Zone path records a shuffle**; animation is presentation-only and cannot reorder cards client-side.
- [ ] Opening setup/deal must visibly move face-down cards from deck to hand/Rewards before settling into their authoritative zones.
- [ ] Ordinary draw must visibly move one face-down card from deck toward hand; the drawing player then sees the canonical face-up hand card while the opponent sees only face-down hand presence/count.
- [ ] Render opponent hand as count-correct face-down card backs at the opponent edge; no hidden identity leakage.
- [ ] Render discard as a visible pile and allow read-only inspection of cards whose visibility is public/authorized by Hidden Information; no hidden-zone bypass.
- [ ] Animate visible card movement into discard when the authoritative Card-Zone owner moves a card there.
- [ ] Reward taking must open a prominent large-screen overlay showing the exact authoritative required count and eligible face-down Reward positions.
- [ ] Reward overlay must support ordinary reward values **1 / 2 / 3** from the defeated Creature's authoritative reward value and require exactly the server-owned selection count.
- [ ] Selected Reward cards move visibly from Reward zone to the winner's hand, then the suspended Attack/Defeat continuation resumes.
- [ ] Conditions must have a clear visible field/card state indicator when authoritatively applied, replaced, cleared or prevented.
- [ ] Triggered/active Abilities that fire or become usable must have a clear visual state/feedback tied to authoritative listener/capability output; animation must not invent legality.
- [ ] Zone movement/shuffle/draw/discard/Reward animation must consume authoritative events/state deltas and never become a second mutation engine.
- [ ] Reconnect/refresh must reconstruct the final authoritative board immediately even if an animation was interrupted.
- [ ] Add automated presentation/source guards for deck backs, shuffle/draw motion hooks, discard inspection visibility fences, opponent hidden hand, Reward overlay count binding and condition/Ability indicators.
- [ ] Add later human acceptance: both devices can identify shuffle, deal, draw, discard, Reward selection and condition/Ability changes without relying on raw logs/counters.
- [ ] Deckout acceptance remains server-owned: after runtime closeout, a pass-only two-user test may verify repeated draws end through the canonical deckout/terminal owner while the visual deck count reaches zero.
- [ ] These presentation requirements do **not** move the next human Battle gate forward; Release 1 runtime capability closeout remains first.


### V2.4.57 implementation H — previous-opponent event Tactic requirement
- [x] Confirm Stone — Reversal Seal is the only frozen Release 1 Tactic using `event_occurred` with `previous_opponent_turn`.
- [x] Reuse canonical turn-owner history so extra turns cannot break previous-opponent resolution.
- [x] Route the Tactic play gate through the shared event-history predicate owner; no `turn_seq - 1` arithmetic and no card-ID exception.
- [x] Add Deno proof that ownership history 1 → 2 → 1 → 1 resolves Player 1's previous opponent turn as turn 2.
- [x] Add frozen-registry/source-contract proof for Reversal Seal wiring.
- [x] Refresh the exact Tactic Edge closure to include shared event-history + turn-history dependencies.
- [x] TCG Card Pass 2 Validation **#1200 PASS** on exact source/manifest head `9de2db520b593624c0a12e4be6186e23470eaa72`.
- [x] All 18 frozen Release 1 Tactics with explicit play requirements now have structured requirement ownership.


### V2.4.57 implementation I — generic Tactic IF control flow
- [x] Inventory frozen Release 1 Tactic-program IF usage: **6 IF instances / 6 Tactics**.
- [x] Confirm the six predicate meanings: reserve_count_at_least, hand_count_at_least, legal_card_available, target_printed_hp_at_least, target_has_condition, modifier_condition_slot_empty.
- [x] Route Tactic IF boolean composition through the shared predicate-tree owner.
- [x] Keep Tactic-specific leaf resolution data-driven with zero launch card-ID/name branches.
- [x] Reuse shared reserve-count and legal-card requirement semantics.
- [x] Preserve current target/condition owners for Tactic target predicates.
- [x] Splice selected then/else steps into the same resumable effect cursor; no second Tactic interpreter.
- [x] Frozen-registry/source-contract tests bind all six Tactic IF cards and predicate inventory.
- [x] TCG Card Pass 2 Validation **#1207 PASS** at exact source/manifest head `bf4dcca6ceb8c56540fdee2dfec17d59731650e2`.
- [x] Surveyor Mina and Recovery Spray IF programs are executable through already-supported downstream opcodes.
- [x] Cyclone Route IF branch: generic server-owned OPTIONAL uses the existing pending-choice + same-cursor continuation; Card Pass #1250 SUCCESS on `93c169b63423ef029bf7cbd071eb4e09c27bd74d`.
- [x] False Memory IF branch: server-only RANDOM_SAMPLE_HIDDEN_ZONE delegates RNG to the shared non-destructive sampler and later movement to Card-Zone; Card Pass #1250 SUCCESS on `93c169b63423ef029bf7cbd071eb4e09c27bd74d`.
- [x] Reversal Seal IF branch: generic ADD_SHIELD_EACH is implemented through the existing Shield owner and covered by frozen-registry/source-contract tests; included in Card Pass #1229 SUCCESS.
- [x] Blackout Pulse IF branch: generic Tactic APPLY_CONDITION delegates to the shared Condition owner; Card Pass #1234 SUCCESS on `ecd3d86ce060f5e3349b0af202a9393c58bbb36e`.
- [x] All six frozen Release 1 Tactic IF cards are executable through generic downstream owners; final downstream closeout Card Pass #1250 SUCCESS on `93c169b63423ef029bf7cbd071eb4e09c27bd74d`.
## V2.4.59 — visible special effects + search/attach/shuffle choreography
- [x] Lock the Release 1 rule that important authoritative card movement, Attack, Ability and state changes require visible player-facing feedback; effects are not optional decoration.
- [x] Lock the effects layer as generic event/effect choreography, not card-ID-specific branches, so future cards/moves/Abilities/Conditions can reuse it.
- [x] Add one presentation mapper from authoritative state/event/result packets to reusable movement/effect cues without creating another gameplay owner.
- [ ] Visibly animate deck -> hand draw, hand/field/discard/Reward movement, returns-to-deck, evolution, switching/promotion, Essence/Relic attach/remove and other Release 1 card-zone transitions.
- [ ] Add clear generic Attack choreography: source activation/wind-up -> target -> payment if applicable -> impact -> damage/Shield/heal/Condition/listener/Defeat/Reward feedback -> authoritative continuation.
- [ ] Add clear active-Ability and triggered/listener choreography, including usable/fired state and visible resulting deltas.
- [ ] Add private deck-search overlay driven only by the authoritative pending-choice/search options and Hidden Information visibility.
- [ ] For an effect that requires/selects N cards, show the authoritative live selection count (for the cited three-card ability: 0/3 -> 3/3); do not hard-code 3 as a global search rule.
- [ ] For search-and-attach effects, show only server-projected legal Adult Creature/Creature attachment targets and visually assign each chosen Essence card to its authoritative target.
- [ ] After authoritative resolution, animate chosen searched cards to their Creature attachment/Essence rails, return unchosen inspected cards to the deck representation, then show the authoritative shuffle effect.
- [ ] Keep opponent search information private: show only permitted public search/attachment/shuffle feedback unless the authoritative rule explicitly reveals card identities.
- [ ] Make shuffle animation cosmetic only; RNG/shuffle owner determines order and the client never reconstructs, predicts or replays the permutation.
- [ ] Support reduced-motion/accessibility equivalents that preserve event meaning without requiring full motion.
- [ ] Reconnect/refresh test: interrupt any movement/search/attack animation and prove the client immediately renders the newest authoritative snapshot with no replay-owned mutation.
- [ ] Automated test: generic three-card search example renders a server-bound selection counter, legal assignment targets, attachment results and post-resolution shuffle without browser legality/randomness.
- [ ] Trevor/Kay Battle acceptance: visible card movement, Attack impact, Ability feedback and at least one search/select/attach/shuffle sequence are understandable on desktop and phone without hidden-information leakage.
## V2.4.60 — video-comparison interaction grammar / choreography architecture
- [x] Compare the recent Trevor desktop and Kay phone Battle evidence with the retained external TCG/Pokémon interaction-reference recordings.
- [x] Record the evidence set and detailed comparison in `tcg-video-interaction-comparison-v1.md`.
- [x] Lock the principle that external footage contributes interaction grammar only; Stream Bandit keeps its own art, rules, names, card identities and terminology.
- [x] Lock one generic Battle Presentation / Choreography Engine rather than card-ID-specific effects or a second browser rules engine.
- [x] Lock six presentation responsibilities: Zone Motion, Choice Overlay, Combat/Ability FX, Deck/Hidden-Zone Presentation, Stable Inspector and Pacing/Recovery.
- [x] Define the authoritative presentation-envelope schema consumed by the choreography engine: source anchor, effect family, viewer visibility, card/zone movements, legal choice anchors, state deltas, continuation identity and ordering.
- [x] Implement the generic presentation queue so one authoritative resolution can produce an ordered visual sequence while the latest server snapshot always remains truth.
- [ ] Bind Deck shuffle/deal/draw/return/discard/Reward events to Zone Motion.
- [ ] Bind Creature play/evolution/switch/promotion and Essence/Relic attach/remove/payment to Zone Motion.
- [ ] Bind Reward, search, optional and other Release 1 multi-card choices to one server-count-bound Choice Overlay.
- [ ] Bind Attack and active/triggered Ability result packets to Combat/Ability FX.
- [ ] Bind Condition apply/clear/replace/prevent and listener/trigger feedback to generic effect families.
- [ ] Keep Deck, opponent hand and unrevealed Rewards physically visible as card backs/counts without revealing private identities.
- [ ] Keep public Discard visibly populated and inspectable through authoritative Hidden Information.
- [ ] Preserve the accepted bounded field-card + bottom peek/fan hand + full inspector geometry while adding effects.
- [ ] Desktop and phone must consume the same presentation semantics; only gesture/layout treatment may differ.
- [ ] Add reduced-motion equivalents for every required information-bearing animation.
- [ ] Test that refresh/reconnect during every major effect family skips stale choreography and converges immediately on authoritative state.
- [ ] Test that no choreography branch can submit gameplay mutations, calculate legality, choose RNG outcomes or retain hidden information beyond the viewer-authorized envelope.
- [ ] Trevor/Kay acceptance: complete Battle can be followed visually without relying on debug text to understand draws, plays, Attacks, Abilities, Conditions, Rewards, searches, shuffles and turn handoff.
## V2.4.61 — presentation receipt / queue foundation
- [x] Add shared `tcg-presentation-envelope-v1` schema with generic cue family, source/target anchors, movement, state delta, choice count/targets, continuation, audience and intensity.
- [x] Add server-side viewer filtering so seat-private cues can be removed before another viewer receives a receipt.
- [x] Add one browser Battle choreography queue with deterministic ordering and no gameplay mutation API.
- [x] Suppress duplicate `receipt_id` playback so normal polling cannot replay the same animation.
- [x] Cancel/drop stale queued choreography when a newer authoritative revision arrives.
- [x] Load the choreography owner before the Battle controller and allow the controller to consume future `view.presentation` envelopes.
- [x] Add Deno tests for envelope validation/viewer filtering/data-driven selection counts.
- [x] Add Node tests for cue ordering, duplicate suppression, stale-revision cancellation and Battle wiring.
- [x] Exact-head TCG Card Pass 2 gate for the presentation foundation + server receipt integration: #1229 SUCCESS on `52b33b4bd204a0c9dc86b64b4790b24d8a992baa`.
- [x] Bind canonical match commit/view persistence to viewer-filtered presentation receipts without adding presentation data to gameplay legality/state ownership.
- [x] First real receipt producer: canonical Attack result/continuation, including source activation, target focus, impact, damage/Shield delta, Reward/promotion and turn continuation from authoritative commit data.
- [ ] Add the reusable Stream Bandit eight-element FX skin map; element metadata changes presentation only and never card rules.
- [ ] Add compact accessible resolution ribbon generated from the same cue queue for complex chains.
- [ ] Add opponent private-choice mirror using only public-safe search/choice facts.
- [ ] Add safe micro-cue coalescing/backlog protection without hiding the final authoritative state.
- [ ] Bind visible DOM motion/impact handlers only after the server receipt path is green.

## V2.4.62 — server receipt maker / Release 1 truth correction
- [x] Create generic server Match presentation receipt maker keyed by committed event family, not card ID.
- [x] Persist one separately viewer-filtered receipt in each player view at the canonical commit boundary.
- [x] Cover Attack, Ability, play/evolve/attach/Realm, Withdraw/promotion, Reward, End Turn and Concede event families with reusable cues.
- [x] Keep hidden Reward movement count-visible but identity-free.
- [x] Prove private choice cues are visible only to the authorized seat while the opponent receives public-safe progress feedback.
- [x] Refresh exact Match Edge dependency closure from 87 to 89 files and preserve the release-control guard.
- [x] Card Pass 2 #1229 SUCCESS on exact head `52b33b4bd204a0c9dc86b64b4790b24d8a992baa`.
- [x] Correct stale Reversal Seal truth: ADD_SHIELD_EACH already exists generically and is covered by source-contract tests.
- [x] Owner comparison complete: APPLY_CONDITION was the smallest genuine gap and now delegates to the shared Condition engine; #1234 SUCCESS. Next blocker: generic Tactic OPTIONAL.

## V2.4.63 — generic Tactic APPLY_CONDITION
- [x] Confirm Blackout Pulse is the frozen Tactic IF consumer of Tactic-program APPLY_CONDITION.
- [x] Reuse the shared Condition engine; do not create Tactic-specific condition slot/replacement rules.
- [x] Support the existing generic modes: apply / apply_if_empty / apply_if_empty_or_same / replace.
- [x] Resolve the structured target through the existing Creature-ref machinery and advance the same Tactic cursor.
- [x] Add source-contract proof that the branch calls shared applyRuntimeCondition and contains no Blackout Pulse/card-ID exception.
- [x] Refresh the exact Tactic Edge entrypoint fingerprint and 39-file dependency closure.
- [x] TCG Card Pass 2 Validation #1234 SUCCESS on exact head `ecd3d86ce060f5e3349b0af202a9393c58bbb36e`.
- [x] Generic Tactic OPTIONAL complete for Cyclone Route, False Memory and Quiet Step, including False Memory else_steps and Quiet Step control-condition compatibility alias; included in #1250 SUCCESS.

## V2.4.64 / V2.4.65 — Tactic IF downstream closeout
- [x] Inventory every frozen Tactic OPTIONAL consumer: Cyclone Route, False Memory, Quiet Step.
- [x] Route OPTIONAL through the existing server pending-choice / same-effect-cursor owner.
- [x] Support generic Yes `steps` and No `else_steps`.
- [x] Keep chooser-seat privacy and wrong-seat rejection in the existing choice owner.
- [x] Alias CHOOSE_AND_CLEAR_CONTROL_CONDITION to the generic condition-choice owner with control-slot restriction and exact-one default.
- [x] Add shared non-destructive RANDOM_SAMPLE_HIDDEN_ZONE primitive over canonical match RNG.
- [x] Keep the False Memory Tactic sample server-only and exact-count/fail-closed.
- [x] Preserve private sampled-source provenance until the later movement step.
- [x] Make generic no-selection MOVE_CARDS honor structured `step.player`.
- [x] Delegate hidden sampled hand -> Discard movement by exact UID to Card-Zone; do not duplicate/remove cards locally.
- [x] Expand exact Tactic Edge dependency closure 39 -> 40 files for the new shared sampler.
- [x] TCG Card Pass 2 Validation #1250 SUCCESS on exact head `93c169b63423ef029bf7cbd071eb4e09c27bd74d`.
- [x] All six frozen Release 1 Tactic IF programs now have generic executable downstream paths.
- [x] Generic Attack IF execution for all 13 frozen Attack IF instances; accepted by Card Pass #1288.
## V2.4.66 — shared Attack IF predicate foundation
- [x] Inventory the frozen Release 1 Attack IF set: 13 IF instances / 11 cards.
- [x] Inventory the exact eight Attack IF predicate families.
- [x] Add one read-only Attack IF evaluator over the shared predicate-tree owner.
- [x] Reuse shared source_damaged / source_has_shield_at_least / reserve_count_at_least semantics.
- [x] Reuse shared Condition state for control-slot-empty and target-has-any-condition.
- [x] Accept caller-owned current-action event evidence; do not create a second event log.
- [x] Delegate card_matches filter semantics to the existing card/filter owner boundary.
- [x] Prove the Attack IF owner has no mutation authority and no launch card identity.
- [x] TCG Card Pass 2 Validation #1255 SUCCESS on exact head `00d5f8a7aec223dcd8c5a336d27046ac7d1ad3b7`.
- [x] Migrate each frozen Attack IF effect family onto this common predicate owner without double execution; all 13 frozen Attack IF instances are source-migrated.
- [x] Parent generic Attack IF execution gate closed: all 13 instances proven executable without printed-English/card-ID decision fallback by Card Pass #1288.
## V2.4.67 — Attack declaration current-action events
- [x] Inventory Release 1 Attack on_declare: exactly two RECORD_EVENT steps.
- [x] Add one card-ID-free declaration-event collector for the two frozen predicate shapes.
- [x] Reuse the shared Attack source attached-Essence-kind query.
- [x] Keep current-action events action-local; do not create duplicate persistent history.
- [x] Create attackActionEvents once in the canonical Attack dispatcher.
- [x] Migrate Storm Break overcharge trigger to consume the generic event map.
- [x] Preserve the existing overcharge pending-choice / discard / Condition owner.
- [x] Expand exact Match Edge dependency closure 89 -> 90 files.
- [x] TCG Card Pass 2 Validation #1265 SUCCESS on exact head `fb494fedd43851acc4302b4e6d1327715214c689`.
- [x] Migrate Chainstorm's event_occurred IF leaf to consume the same event map through the shared Attack IF owner; accepted in V2.4.68.
## V2.4.68 — conditional Condition Attack IF migration
- [x] Identify the exact conditional-Condition family: 5 IF instances / 4 cards.
- [x] Add one generic nested IF -> Condition owner; reject mixed heal/discard/switch programs.
- [x] Route every IF decision through the shared Attack IF evaluator.
- [x] Route Condition mutation through applyRuntimeConditionWithContext so protection/immunity remain authoritative.
- [x] Support nested IF and REPLACE_CONTROL_CONDITION without card-ID branches.
- [x] Consume Chainstorm declaration evidence from the generic attackActionEvents map.
- [x] Keep the old direct structured Condition owner first and legacy English fallback last to prevent duplicate application.
- [x] Expand exact Match Edge closure 90 -> 92 files.
- [x] TCG Card Pass 2 Validation #1274 SUCCESS on exact head `cab1a7daa29e8d129050dcde71e69eebe4f50b65`.
- [x] Attack IF migration count: **5 / 13** instances now route through the shared IF owner.
- [x] Migrate the bounded self-heal / HEAL_EACH / deck-discard / server-top-deck IF owners onto the shared Attack IF evaluator; source migration complete in V2.4.69.

## V2.4.69 — bounded Attack IF owner migration
- [x] Route Rillrunner source_damaged self-heal through shared Attack IF.
- [x] Route Reefback source_has_shield_at_least self-heal through shared Attack IF.
- [x] Route Verdantusk reserve_count_at_least HEAL_EACH through shared Attack IF.
- [x] Route Nightmaw target_has_any_condition deck-discard through shared Attack IF using the actual authoritative target Creature.
- [x] Route Cosmarch Known Horizon card_matches through shared Attack IF while keeping server-only inspection/filter ownership and Card-Zone movement.
- [x] Preserve existing Heal/Heal Packet, Deck-Discard, Card-Zone, Event/Movement/Heal listener and hidden-inspection owners; no duplicate mutation engine.
- [x] Update stale regression guards to assert the shared Attack IF ownership boundary.
- [x] TCG Card Pass #1283: deterministic runtime core + all Edge type-checks SUCCESS; only the pre-refresh release-control digest failed.
- [x] Rebuild exact 92-file Match Edge closure from the current Git tree; digest `2b3cac54083c9cd07e94661b157d6719e4ea3007543665a141d8baaede2ffcfe`.
- [x] Attack IF shared-owner migration count is now **10 / 13** frozen IF instances.
- [x] TCG Card Pass 2 Validation #1284 SUCCESS on accepted source/manifest head `e542a0060266502d1cb74a93a618a9bb8032a0ed`; V2.4.69 accepted.
- [x] Slipwing Backdraft switch IF + Stormmane Storm Break outer current-action event IF + nested target-survival IF are source-migrated through shared Attack IF in V2.4.70/V2.4.71.

## V2.4.70 / V2.4.71 — final Attack IF source closeout
- [x] Backdraft reserve-count IF delegates to shared Attack IF.
- [x] Backdraft creates an authoritative private exact-one Reserve switch choice; browser does not invent the original Attack switch target.
- [x] Backdraft choice resolution delegates the actual field mutation to Atomic Switch and existing Movement/Heal listener continuation owners.
- [x] Battle client routes generic `pending_attack_choice` to Match `resolve_attack_choice` through the existing server-choice overlay.
- [x] Storm Break outer current-action event IF delegates to shared Attack IF using the declaration-event map.
- [x] Storm Break nested target-remains-in-play IF delegates to shared Attack IF using authoritative post-primary-damage state.
- [x] Preserve existing Storm Break attached-Essence discard / Card-Zone / Condition mutation ownership.
- [x] Attack IF source migration count: **13 / 13** frozen Release 1 instances.
- [x] Match Edge release-control closure: **93 files**, digest `0daefbf978518e78751ec327f49a88e7f66122d930a1eee98028e4902b7514b6`.
- [x] Card Pass #1288 SUCCESS on exact head `8db9ac8da165aac56e06ffc466a7892749eb75a1`; parent Attack IF gate accepted.

## V2.4.72 — Ability IF inventory + triggered execution
- [x] Reconcile all Release 1 IF nodes directly from the eight frozen Set One files: **29 total = 7 Tactic + 13 Attack + 9 Ability**.
- [x] Credit existing generic Event Listener IF execution for Cinderburrow / Ash Tunnel.
- [x] Credit existing generic Event Listener IF execution for Briarback / Growing Wall.
- [x] Credit existing generic Event Listener IF execution for Bloomhare / Spring Growth.
- [x] Extend the existing attack-declared modifier owner to execute structured IF wrappers through shared predicate-tree composition.
- [x] Furnacefang / Controlled Burn: `source_damaged -> +20 current Attack damage`.
- [x] Ashcobra / Ash Scent: `event_attack_target_damaged -> +10 current Attack damage`.
- [x] Thornmantis / Briar Instinct: `any(Venomed, Rooted target Condition) -> +10 current Attack damage`.
- [x] Prove IF-false attack-declared Ability resolution does not consume the once-per-turn use.
- [x] Card Pass #1289: new Ability IF runtime tests + all Deno/type-check jobs SUCCESS; only pre-refresh Match release-control digest failed.
- [x] Refresh exact 93-file Match closure to CI-computed digest `1fbfb54a7d1fd39b0f6c660adcf9013452d2b3a169cd47b07eab0c7808de0b76`.
- [x] Ability IF source/accounting progress: **6 / 9**.
- [x] Later exact-head validation through Card Pass #1306/#1319 supersedes the V2.4.72 pending closure gate; triggered Ability IF paths remain green.
- [x] Noctivane / Night Reading complete through the generic deck-reading / scheduled-action family; retained green through Card Pass #1306 and #1319.
- [x] Surgefin / Undertow Supply complete and accepted by Card Pass #1306.
- [x] Marevault / Heart of Tides complete and accepted by Card Pass #1319.

## V2.4.73 — Night Reading active Ability IF
- [x] Add Card-Zone-owned exact-instance within-zone reorder for top/bottom effects.
- [x] Add shared Active Ability IF leaf adapter over the common predicate-tree owner.
- [x] Add server-owned scheduled-action lifecycle for `controller_aftermath_finished` + `DRAW_FIXED`.
- [x] Recognize the frozen inspect -> optional choose -> deck-bottom -> IF -> schedule family without card-ID branches.
- [x] Keep inspected opponent deck-top identity controller-private.
- [x] Route optional top-card bottom move through Card-Zone reorder.
- [x] Route `selected_count_at_least` through shared Active Ability IF.
- [x] Resolve scheduled fixed draw before canonical turn advance and leave terminal/deckout authority with Match Flow.
- [x] Reuse generic `pending_ability_choice` Battle transport; no Noctivane-specific client rule.
- [x] Public resolve receipt exposes structural counts/boolean only; no inspected card UID/card ID.
- [x] Refresh all affected Edge closures: Setup 8 / Match 96 / Tactic 40.
- [x] Ability IF source/accounting progress: **7 / 9**.
- [x] Night Reading retained green through later exact-head Card Pass #1306 and #1319; V2.4.73 accepted.
- [x] Surgefin / Undertow Supply complete and accepted in V2.4.74; Card Pass #1306 SUCCESS.
- [x] Marevault / Heart of Tides complete and accepted in V2.4.75 / Card Pass #1319.

## V2.4.74 — Surgefin / Undertow Supply active Ability IF
- [x] Recognize the generic optional discard-Essence -> Reserve target -> attach -> target-damaged IF -> Heal family without card-ID branches.
- [x] Project one authoritative private choice with exactly one legal target and zero-or-one eligible Essence.
- [x] Keep physical discard -> attachment mutation in the canonical Essence Attachment owner.
- [x] Add generic active-Ability continuation receipt across nested Event / Movement / Heal listener choices.
- [x] Add `resume_active_ability_effect` Heal Listener resume intent.
- [x] Evaluate `target_damaged` after nested attachment listeners complete using shared Active Ability IF.
- [x] Emit canonical Ability Heal packet only when the IF matches.
- [x] Prove optional zero-Essence path remains legal when requirements were satisfied.
- [x] Prove exact selected Essence instance reaches the target without cloning.
- [x] Prove opponent/public choice view does not expose private option identities.
- [x] Prove Match public receipt does not publish selected Essence UID/card ID.
- [x] Card Pass #1305 deterministic runtime core + Surgefin tests SUCCESS; only stale 96-file Match closure failed.
- [x] Refresh release-control to Setup 8 / Match 98 / Tactic 40.
- [x] Ability IF source/accounting progress: **8 / 9**.
- [x] Card Pass #1306 SUCCESS on exact head `c37660dd4c712055ca027caf18a036684de89e09`; Surgefin / Undertow Supply accepted.
- [x] Final active Ability IF Marevault / Heart of Tides accepted by Card Pass #1319; Ability IF total 9/9.

## V2.4.75 — Heart of Tides + Release 1 IF closeout
- [x] Recognize generic attached-Essence redistribution -> movement-count IF -> participating damaged Creature -> Heal family without card-ID branches.
- [x] Enumerate authoritative exact Essence/source/destination movement options from current friendly field state.
- [x] Keep exact attachment mutation + movement receipts in the existing Essence Movement owner.
- [x] Preflight the complete selected multi-move sequence on cloned authoritative state before first real mutation.
- [x] Reject reuse of the same Essence instance across two selected moves.
- [x] Route `essence_move_count_at_least` through shared Active Ability IF using exact local movement receipts.
- [x] Require threshold heal target to be damaged, match structured element filters and participate in selected movements.
- [x] Route Heal through canonical Ability Heal packets + existing after-heal listener continuation.
- [x] Reuse generic `pending_ability_choice` transport; no Marevault-specific browser rule.
- [x] Public Match receipt exposes structural movement/heal data only; no raw Essence UID, movement receipt or heal-target UID.
- [x] Refresh release-control to Setup **8** / Match **99** / Tactic **40** files.
- [x] TCG Card Pass 2 Validation **#1319 SUCCESS** on exact head `148bcc1164c05cd6c523b8fc3566f748705f5c15`.
- [x] Ability IF execution: **9 / 9** frozen instances.
- [x] Release 1 IF execution: **29 / 29** frozen instances = 7 Tactic + 13 Attack + 9 Ability.
- [x] Reconcile IF + proven predicate classifications in `tcg-runtime-capabilities-v0.2.json`; Card Pass #1326 SUCCESS.
- [ ] Continue operation/predicate audit until every Release 1-used partial/missing capability is implemented or proven already implemented.

## V2.4.76 — IF capability-manifest reconciliation
- [x] Move global `IF` operation capability to implemented from 29/29 accepted runtime evidence.
- [x] Move all 20 predicate families consumed by those 29 IF instances to implemented.
- [x] Remove obsolete partial predicate legacy-equivalent entries after accepted generic migration.
- [x] Remove obsolete narrow-IF legacy operation note.
- [x] Update stale bounded Storm Break / Known Horizon guards so owner narrowness is independent of global capability truth.
- [x] Refresh release-control capability-manifest fingerprint to `daf061a5e539e5880be428256c68d46060ac391e`.
- [x] TCG Card Pass 2 Validation **#1326 SUCCESS** on exact head `5b1eedcee6eb6893e7c8395fd5ab3f814f52ab33`.
- [ ] Next operation audit: reconcile already-implemented Event Listener / Tactic / bounded Attack opcodes before adding new engine code.

## V2.4.77 — hidden-zone sampling owner parity + capability reconciliation
- [x] Prove the frozen Release 1 inventory contains exactly three `RANDOM_SAMPLE_HIDDEN_ZONE` consumers: Duskstalker, Thought Hunter and False Memory.
- [x] Route Duskstalker Event Listener sampling through the shared non-destructive Hidden-Zone sampler / Match RNG owner.
- [x] Route Thought Hunter active Ability sampling through the generic active hidden-sample owner with controller-private inspection.
- [x] Keep False Memory in the Tactic interpreter while delegating random selection to the same shared Hidden-Zone sampler and preserving server-only identity.
- [x] Remove stale source-format assumptions from ownership/privacy regression tests without weakening the semantic assertions.
- [x] TCG Card Pass 2 Validation **#1346 SUCCESS** on source/test head `fff845a874c570fabbe1bc16ff07ed528ba5a12a`.
- [x] Move `RANDOM_SAMPLE_HIDDEN_ZONE` from missing to implemented in `tcg-runtime-capabilities-v0.2.json`.
- [x] Refresh release-control capability-manifest fingerprint to `230757a376b67516c48fe6cf1f85b401b9539c98`.
- [x] TCG Card Pass 2 Validation **#1348 SUCCESS** on exact reconciled head `cb69519eed59de3700190c11245a5e395187fc77`.
- [ ] Next predicate target: implement the missing Murkmite `control_condition_present` path in the shared continuous outgoing Attack-damage predicate adapter.
- [ ] Audit Hollowcrown's active condition-replacement use of `control_condition_present` before changing that predicate's global capability status.

## V2.4.78 — Creature-owned continuous outgoing Attack damage
- [x] Audit all frozen Release 1 Creature Ability continuous `attack_damage` consumers: Glowcub, Murkmite and Quartzram.
- [x] Correct the earlier assumption that Murkmite already reached the attachment-only outgoing continuous collector.
- [x] Add one generic source-Creature continuous outgoing Attack-damage lane to the existing Attack Damage owner.
- [x] Reuse canonical `source_damaged` and `source_has_shield_at_least` Requirement evaluators.
- [x] Evaluate Murkmite's `control_condition_present` against authoritative current-opponent-Vanguard control state.
- [x] Keep the opponent-Vanguard predicate independent of the selected attack target.
- [x] Supply exact structured `attack_id` context so all three continuous filters remain data-driven.
- [x] Prove Glowcub, Murkmite and Quartzram behavior with runtime tests and card-ID-free wiring guards.
- [x] Extend guarded Runtime Pass B attack-damage and Surge verifiers with the exact new canonical Match damage shape.
- [x] Refresh Match release-control closure to `8ad4b33ea35d5f9273609b5866176a2cf4a2050e9f1caea64c953549432de3ab`.
- [x] TCG Card Pass 2 Validation **#1358 SUCCESS** on exact head `56acfa6ca8c2e6930cea6a9c14a1de1feb0c7c8d`.
- [ ] Next target: implement Hollowcrown / Hollow Command as a generic active Ability `control_condition_present` → `REPLACE_CONTROL_CONDITION` family through canonical Condition ownership.
- [ ] Only after Hollowcrown is proven, reassess global capability status for `control_condition_present` and `REPLACE_CONTROL_CONDITION`.

## V2.4.79 — Hollow Command + control-condition capability closeout
- [x] Prove Hollowcrown / Hollow Command is an own-turn, once-per-turn, zero-cost active Ability that requires an existing non-Mindbound opponent-Vanguard control condition.
- [x] Add one generic active-Ability condition-replacement owner; no Hollowcrown/card-ID dispatch.
- [x] Preflight the full activation on cloned authoritative state before the real once-per-turn receipt is written.
- [x] Reuse the Active Ability activation-cost owner for active-seat/source binding/turn-limit semantics.
- [x] Reuse the canonical Condition engine for `replace`, immunity and protection semantics.
- [x] Reject empty-control-slot and already-Mindbound requirements before consuming the Ability use.
- [x] Preserve legal-activation turn consumption when Condition protection prevents the requested Mindbound replacement.
- [x] Route the family through the single Active Ability live router and Match without Damage/Heal/player-choice duplication.
- [x] Prove the frozen `control_condition_present` inventory is exactly Murkmite, Hollowcrown and Thought Hunter.
- [x] Prove the frozen `REPLACE_CONTROL_CONDITION` inventory is exactly Hollow Command and Mind Eclipse.
- [x] Prove Mind Eclipse remains generic Attack conditional-Condition-owned and delegates replacement to Condition.
- [x] Refresh Match closure to 102 files / `5e931b3692c3b5b36915adea48870fb48595152abeb0ab7c343bc3dfa8ac2ce1`.
- [x] Card Pass **#1369 SUCCESS** on complete Hollow Command source/closure head `fdef1ac7fa8099222079373aa31c0509235d7efb`.
- [x] Move `control_condition_present` from missing to implemented in `tcg-runtime-capabilities-v0.2.json`.
- [x] Move `REPLACE_CONTROL_CONDITION` from missing to implemented in `tcg-runtime-capabilities-v0.2.json`.
- [x] Refresh release-control capability fingerprint to `880b6395d55da7bdfa241609cabd1446a02d34ae`.
- [x] TCG Card Pass 2 Validation **#1371 SUCCESS** on exact reconciled head `d370d0db839456f8e2c83dab247fcd5d0802e315`.
- [ ] Next target: migrate Volt — Stormmane structured `DISCARD_ATTACHED_ESSENCE` away from the remaining legacy card-ID Match branch into a generic Attack operation owner.

## V2.4.80 — Storm Break attached-Essence discard reconciliation
- [x] Re-audit the frozen `DISCARD_ATTACHED_ESSENCE` inventory: exactly one Release 1 consumer, Volt — Stormmane / Storm Break.
- [x] Confirm the existing overcharge-discard Attack owner is card-ID-free and already recognizes the complete structured Storm Break family.
- [x] Confirm exact-one attached-Essence choice is server-owned and private.
- [x] Confirm selected attachment -> discard mutation preflights/commits through Card-Zone and preserves exact instance identity.
- [x] Confirm outer current-action event IF and nested target-survival IF remain shared Attack-IF-owned.
- [x] Confirm Stunned application remains canonical Condition-owned.
- [x] Confirm public overcharge resolution receipt does not expose selected Essence identity.
- [x] Confirm marked v0.2 Stormmane is guarded away from the legacy `volt-stormmane` fallback.
- [x] Preserve the legacy-only branch for unmarked snapshot compatibility; do not rewrite working v0.2 runtime merely to delete compatibility debt.
- [x] Move `DISCARD_ATTACHED_ESSENCE` from missing to implemented in `tcg-runtime-capabilities-v0.2.json`.
- [x] Refresh release-control capability fingerprint to `12c08d16cb5789a138cb9812be48c3e7e2e288e3`.
- [ ] Continue the Release 1 used-operation/predicate audit with the next proven stale classification or smallest genuine generic-owner gap.

## V2.4.81 — Attack declaration event capability reconciliation
- [x] Prove the frozen Release 1 Attack `on_declare` inventory contains exactly two steps: Storm Break and Chainstorm.
- [x] Prove both frozen steps are structured `RECORD_EVENT`.
- [x] Prove the complete frozen declaration-predicate inventory is exactly `event_attack_source_attached_essence_count_at_least` and `event_attack_source_has_attached_essence_kind`.
- [x] Confirm the existing Attack declaration-event owner is registry-driven and card-ID/name-free.
- [x] Confirm attached-Essence count is read from authoritative source-Creature attachments.
- [x] Confirm attached-Essence kind delegates to the shared Attack authority query.
- [x] Confirm false predicates emit no action-local event and malformed operations/predicates fail closed.
- [x] Move `RECORD_EVENT` from missing to implemented in `tcg-runtime-capabilities-v0.2.json`.
- [x] Move both frozen declaration predicates from missing to implemented.
- [x] Refresh release-control capability fingerprint to `c4ef4855a334fee0f9fc3d611b4b0de2f0eff471`.
- [x] TCG Card Pass 2 Validation **#1381 SUCCESS** on exact reconciled source/capability head `97eca40fe4ea0c991da3077f9bfbca8a2539f3d4`.
- [x] Progress-document head retained green in TCG Card Pass **#1382 SUCCESS** on `b61b3cfde168247099cae652c49d4acb12c49260`.
- [ ] Next target: reconcile Shade — Nightmaw / Dread Crush `DISCARD_DECK_TOP` against the existing generic Attack Deck-Discard + Card-Zone owner.

## V2.4.82 — Nightmaw deck-top discard capability reconciliation
- [x] Prove the frozen Release 1 `DISCARD_DECK_TOP` inventory has exactly one consumer: Nightmaw / Dread Crush.
- [x] Confirm the existing Attack Deck-Discard owner is card-ID/name-free.
- [x] Confirm the shared Attack IF owns `target_has_any_condition` evaluation.
- [x] Confirm false IF leaves deck/discard unchanged and emits no deck-discard event.
- [x] Confirm true IF moves only available top cards through Card-Zone while preserving exact instance identity/order.
- [x] Confirm deck exhaustion from this effect does not independently create deckout.
- [x] Confirm successful movement emits the canonical `deck_cards_discarded` handoff.
- [x] Confirm live continuation order remains Deck-Discard Event -> Event Listener -> Movement Listener -> Heal Listener.
- [x] Move `DISCARD_DECK_TOP` from missing to implemented.
- [x] Refresh release-control capability fingerprint to `856ff589ca74faf88f61d106910671ee1b7af233`.
- [x] TCG Card Pass 2 Validation **#1386 SUCCESS** on exact reconciled head `55d2e1c87db956d19c6a08b20a6a3c41ab7eb528`.
- [ ] Next target: reconcile Noctivane / Night Reading `SCHEDULE_ACTION` against the accepted scheduled-action lifecycle owner.

## V2.4.83 — Noctivane scheduled-action capability reconciliation
- [x] Prove the frozen Release 1 `SCHEDULE_ACTION` inventory has exactly one consumer: Noctivane / Night Reading.
- [x] Confirm the generic deck-reading owner recognizes the inspect -> optional bottom -> IF -> schedule family without card-ID/name authority.
- [x] Confirm Hidden Information owns the private opponent deck-top inspection record.
- [x] Confirm optional exact deck reorder delegates to Card-Zone.
- [x] Confirm shared Active Ability IF owns `selected_count_at_least`.
- [x] Confirm deferred action storage/execution is server-owned by `tcg-match-scheduled-action-v0-2.ts`.
- [x] Confirm schedule trigger is controller-specific, same-turn `controller_aftermath_finished`.
- [x] Confirm terminal-match guard skips mutation while consuming the due schedule.
- [x] Confirm nested `DRAW_FIXED` delegates movement to Card-Zone and owns incomplete-draw deckout semantics.
- [x] Confirm Match resolves due schedules before canonical turn advance.
- [x] Move `SCHEDULE_ACTION` from missing to implemented.
- [x] Refresh release-control capability fingerprint to `c900277c1a576e2de33c795914a45a676c1e8067`.
- [x] TCG Card Pass 2 Validation **#1391 SUCCESS** on exact reconciled head `1583af90051d837ef3b4d2b500b05359c9c4ec19`.
- [ ] Next runtime repair: implement generic Tactic `SHUFFLE_ZONE_INTO_DECK` for Archivist Sol / Archive Reset through Card-Zone + Randomization ownership.

## V2.4.84 — Archivist Sol SHUFFLE_ZONE_INTO_DECK runtime closeout
- [x] Prove the frozen Release 1 `SHUFFLE_ZONE_INTO_DECK` inventory is exactly Archivist Sol / Archive Reset steps 0 and 1.
- [x] Confirm both frozen steps are owner-private hand -> same-player deck operations, one for self and one for opponent.
- [x] Add one generic Tactic dispatcher branch; no Archivist Sol/card-ID/name routing.
- [x] Fail closed on unsupported source zone or visibility shape.
- [x] Move every exact current hand instance through Card-Zone into that same player's deck.
- [x] Preserve exact instance identity and avoid browser-owned/card-cloning mutation.
- [x] Shuffle the resulting deck through the canonical Randomization engine.
- [x] Preserve legal empty-hand behavior by still shuffling the existing deck.
- [x] Preserve the following fixed-draw / deckout sequence unchanged.
- [x] Add frozen-family/wiring regression `card-pass-2-tactic-shuffle-zone-into-deck-runtime.test.mjs`.
- [x] Refresh Tactic Edge entrypoint blob to `45c0ccd58ee2a85cfe08a9b9f1b1e663b47eff7f`.
- [x] Refresh Tactic 40-file closure to `d8ff415928c85b9ea2bec5168eaa1154c6c4e423a58c0a24b818db51c3cebf73`.
- [x] Card Pass **#1398 SUCCESS** on complete source/runtime head `99e09efd1fab4380e30822bb23dc573a480b79db`.
- [x] Move `SHUFFLE_ZONE_INTO_DECK` from missing to implemented in `tcg-runtime-capabilities-v0.2.json`.
- [x] Refresh release-control capability fingerprint to `04aab8f975d4e582791fbc550f7ee427f6e3988d`.
- [x] TCG Card Pass 2 Validation **#1400 SUCCESS** on exact capability-reconciled head `fb7a552acffead9da53ca60a33db5c97de66e242`.
- [ ] Next target: reconcile Quiet Step `CHOOSE_AND_CLEAR_CONTROL_CONDITION` against the existing generic Tactic condition-choice/clear owner.

## V2.4.85 — Quiet Step control-condition clear reconciliation
- [x] Prove the frozen `CHOOSE_AND_CLEAR_CONTROL_CONDITION` inventory has exactly one Release 1 consumer: Shade — Quiet Step.
- [x] Confirm the generic Tactic condition-choice branch recognizes the operation without card-ID/name dispatch.
- [x] Confirm `$switch_outgoing_vanguard` is the accepted effect-switch outgoing Creature binding.
- [x] Filter legal choices to the current control-condition slot only.
- [x] Preserve default exact-one selection when `count` is omitted.
- [x] Preserve server-owned pending-choice seat authority.
- [x] Confirm selected resolution delegates through `clearRuntimeCondition` to the canonical shared Condition engine.
- [x] Confirm the existing frozen regression guards the alias, control-slot filtering and generic ownership.
- [x] Move `CHOOSE_AND_CLEAR_CONTROL_CONDITION` from missing to implemented.
- [x] Refresh release-control capability fingerprint to `5464eb9ff86ae65e777a4d6004833bbce0e17475`.
- [x] TCG Card Pass 2 Validation **#1405 SUCCESS** on exact reconciled head `29bda755c8d49c7ce6295e927c5080e62f34c1e7`.
- [ ] Next runtime repair: wire Bastion Plate `INCREMENT_SOURCE_COUNTER` generically in Event Listener to the existing source-counter primitive.

## V2.4.86 — damage-prevented attached-Relic listener family closeout
- [x] Prove the frozen incoming attached-Relic attack-damage family is exactly Gloom Locket, Bastion Plate and Shellguard Pendant.
- [x] Prove the frozen `damage_prevented` attached-Relic listener family is exactly Bastion Plate and Shellguard Pendant.
- [x] Keep incoming Relic reduction generic and card-ID-free in Attack Damage.
- [x] Preserve Shellguard's one-use attachment continuous-effect consumption only when actual prevention is at least 1.
- [x] Emit exact prevention source/target/amount identity from Attack Damage without replacing the existing aggregate prevention-history marker.
- [x] Add generic Event Listener support for the three frozen prevention predicates.
- [x] Store Bastion `prevention_uses` on the exact Relic card instance according to its declared counter schema.
- [x] Execute `INCREMENT_SOURCE_COUNTER` generically.
- [x] Execute Bastion's existing `source_counter_at_least` IF against the exact source instance.
- [x] Support turn-scoped attachment listener limits without taking ownership away from Event Listener.
- [x] Support attachment-scoped attachment listener limits for Shellguard.
- [x] Execute `SCHEDULE_SOURCE_DISCARD` by delegating timing to Scheduled Action.
- [x] Extend Scheduled Action with `after_attack_finished` source-discard planning while preserving existing aftermath draw actions.
- [x] Add exact attached-Relic -> discard mutation to the Relic owner with preflight and identity preservation.
- [x] Drain due source-discard plans at the canonical attack-completion boundary before defeat scan.
- [x] Add deterministic Bastion/Shellguard/Gloom lifecycle coverage.
- [x] Add frozen Set One family and no-card-ID runtime guard.
- [x] Preserve the accepted attack deck-discard owner chain through semantic rather than first-occurrence source ordering.
- [x] Preserve Runtime Pass B Attack Damage and Surge ownership gates with the detailed compatibility bridge.
- [x] Match Edge closure = 102 files / `9dc39ff55b849b76ffbf1593c3ea30d2c1a886d7b050c86a962b1c2cb65eb68c`.
- [x] Tactic Edge closure = 41 files / `9a33a92624e4ac058f9c0ee12200344a67479fb7f97c5e2aa43283c5be45ad65`.
- [x] Card Pass **#1420 SUCCESS** on source/runtime head `9d3bf34346de60559d1952826e6c2bf078f9acc7`.
- [x] Move `INCREMENT_SOURCE_COUNTER` and `SCHEDULE_SOURCE_DISCARD` from missing to implemented.
- [x] Move all three frozen `prevention_*` predicates from missing to implemented.
- [x] Preserve `source_counter_at_least` as implemented and add its exact Bastion consumer evidence.
- [x] Refresh capability fingerprint to `b0033085bfce1a529730f25e985e085c4f466754`.
- [x] Card Pass **#1422 SUCCESS** on exact capability-reconciled head `f1aa770437a5a1618c1e8886928561cd3a60dd92`.
- [ ] Next target: reconcile Grove Sapstone Charm `MODIFY_CURRENT_HEAL` against Heal owner #21's existing before-heal modifier path.

## V2.4.87 — Sapstone Charm / before-heal capability reconciliation closeout
- [x] Prove frozen `MODIFY_CURRENT_HEAL` inventory is exactly one consumer: Grove / Sapstone Charm.
- [x] Prove `heal_packet_target_is_attached_creature` is Sapstone-only in the frozen set.
- [x] Audit every frozen `heal_packet_source_action_kind_is` consumer, including Symbiote Essence.
- [x] Prove Before-Heal owner already evaluates Sapstone target/source predicates generically.
- [x] Prove Before-Heal owner already enforces the turn-scoped attachment limit.
- [x] Prove Before-Heal owner already validates/applies `MODIFY_CURRENT_HEAL` with bounded delta semantics.
- [x] Prove Heal Packet applies the modifier before HP mutation and persists the modified requested amount.
- [x] Prove After-Heal Listener owner already executes Symbiote's attack/ability source-action-kind filter generically.
- [x] Reuse existing attachment/listener state; add no helper and no owner family.
- [x] Card Pass **#1425 SUCCESS** on exact pre-reconciliation head `a9e4bf3cc9b863ab238ac8cd18b00c7cfcab2c6a`.
- [x] Move `MODIFY_CURRENT_HEAL` from missing to implemented.
- [x] Move `heal_packet_target_is_attached_creature` from missing to implemented.
- [x] Move `heal_packet_source_action_kind_is` from missing to implemented after proving all frozen consumers.
- [x] Refresh capability fingerprint to `1b66b2a8455d5ad17535cf7dda2d57db4fea009e`.
- [x] Card Pass **#1427 SUCCESS** on exact capability-reconciled head `0f11dad02f9835733e6046f8f827ba1775f4b275`.
- [ ] Next target: `ADD_SHIELD_EACH` Attack/Tactic parity for Crowncrag + Reversal Seal.

## V2.4.88 — ADD_SHIELD_EACH Attack/Tactic parity closeout
- [x] Prove frozen `ADD_SHIELD_EACH` inventory is exactly Crowncrag + Reversal Seal.
- [x] Preserve Reversal Seal on the existing generic Tactic interpreter path.
- [x] Prove the existing Tactic route resolves variable-backed target sets and delegates every gain to `addRuntimeShield`.
- [x] Keep the existing pure Attack `ADD_SHIELD` owner whole-program-only.
- [x] Add a generic Attack specialist for `ADD_SHIELD source -> SELECT_CREATURE -> ADD_SHIELD_EACH selected`.
- [x] Keep the Attack specialist card-ID-free.
- [x] Support optional 0..N friendly field selection with declared min/max bounds.
- [x] Support generic `element` and `exclude_source` selection filters.
- [x] Bind the exact source Vanguard instance and current turn before mutation.
- [x] Rebind all selected targets and recheck legality before any selected-target Shield mutation.
- [x] Delegate source and selected-target Shield gain to the shared 60-cap `addRuntimeShield` owner.
- [x] Reuse the existing private `pending_attack_choice` transport; add no parallel UI/rules engine.
- [x] Preserve existing HEAL_EACH, self-heal and pure Shield ordering guards.
- [x] Add deterministic Crown-style multi-select/staleness tests.
- [x] Add frozen Set One Attack/Tactic parity and no-card-ID structure guard.
- [x] Card Pass **#1436** proves all deterministic runtime tests and type-checks green before closure rebinding.
- [x] Match Edge closure = 103 files / `3e288b0c448d1456f508ff680a0153bded59a118c403ebbbdf0e6a57fe76edcc`.
- [x] Tactic Edge closure remains 41 files / `9a33a92624e4ac058f9c0ee12200344a67479fb7f97c5e2aa43283c5be45ad65`.
- [x] Card Pass **#1438 SUCCESS** on exact source/runtime + release-control head `0d875a926b6cb23740ca7f3a2a3ca84b93e24913`.
- [x] Move `ADD_SHIELD_EACH` from missing to implemented.
- [x] Refresh capability fingerprint to `e0751516e3687601095f88f68e0a8d5e706b68b7`.
- [x] Card Pass **#1440 SUCCESS** on exact capability-reconciled head `5da730d086d817faa71a6a0cc1ee21160cec2fd2`.
- [ ] Next target: Ember Heatguard Bracer `MODIFY_CURRENT_DAMAGE_PACKET` operation reconciliation; audit shared damage-packet predicates across all consumers before promoting those predicates.

## V2.4.89 — Heatguard damage-packet modifier reconciliation closeout
- [x] Prove frozen `MODIFY_CURRENT_DAMAGE_PACKET` inventory is exactly Ember / Heatguard Bracer.
- [x] Prove Damage Packet Listener already discovers structured before-damage attachment listeners generically.
- [x] Prove Heatguard target/class/condition requirements are supported by Damage owner #20.
- [x] Prove turn-scoped attachment limit ownership and once-per-turn consumption.
- [x] Prove `MODIFY_CURRENT_DAMAGE_PACKET` delta/minimum application is generic and packet-local.
- [x] Prove Damage Packet owner records canonical before/after packet evidence.
- [x] Reuse existing Damage owners; add no card-ID dispatch, helper or owner family.
- [x] Preserve shared damage-packet predicates as separately gated where other frozen consumers exist.
- [x] Move `MODIFY_CURRENT_DAMAGE_PACKET` from missing to implemented.
- [x] Refresh capability fingerprint to `9f858522a544b1098fe7457f4472d122c91e8630`.
- [x] Card Pass **#1445 SUCCESS** on exact capability-reconciled head `46e44d58e0b4b57b9b5c2aff6d2b5cfd00f65680`.
- [ ] Next target: Highwind Spires `before_voluntary_withdrawal_cost -> MODIFY_CURRENT_WITHDRAWAL_COST`; treat as a real implementation gap unless a canonical existing listener owner is proved.

## V2.4.90 — Highwind voluntary-withdrawal current-cost closeout
- [x] Freeze the Release 1 `before_voluntary_withdrawal_cost` family to exactly Highwind Spires.
- [x] Freeze `MODIFY_CURRENT_WITHDRAWAL_COST` to exactly one Release 1 consumer.
- [x] Freeze `event_active_seat_is_controller` to that same Highwind listener.
- [x] Preserve Withdrawal as canonical base-cost owner.
- [x] Resolve the current-cost listener after base cost and before Payment.
- [x] Keep Realm discovery, scope, predicate tree, turn limit and receipts in Event Listener.
- [x] Keep opcode grammar exact to `op + delta + minimum`; reject undeclared `maximum`.
- [x] Make field-action cost projection use the same resolver on a cloned state so previews cannot consume the listener.
- [x] Keep authoritative withdrawal resolution on real match state.
- [x] Preserve exact attached-Essence Payment ownership.
- [x] Preserve Atomic Switch ownership and transaction preflight.
- [x] Add deterministic active/inactive-seat, once-per-turn, next-turn reset, zero-floor and preview-isolation coverage.
- [x] Add frozen Set One inventory + no-card-ID runtime guard.
- [x] Match Edge closure = 103 files / `c8d1b9180312565b25fe29c522e5454fe867074ea423c43cb6e046886116f404`.
- [x] Tactic Edge closure = 41 files / `a1793729e2efc333bc20f1a14ec711d416b607db79bb4de3096b118ab4b83bd6`.
- [x] Card Pass **#1457 SUCCESS** on exact source/runtime head `558b007ff66bab4bfd7515d049c2a0c2105434c0`.
- [x] Move `MODIFY_CURRENT_WITHDRAWAL_COST` from missing to implemented.
- [x] Move `event_active_seat_is_controller` from missing to implemented.
- [x] Refresh capability fingerprint to `fb01a78198a18155f55bbc395330ce0d3299aad4`.
- [x] Card Pass **#1459 SUCCESS** on exact capability-reconciled head `69d6f8074fc6c3da96bdcd32b5b52ca5e10871b1`.
- [ ] V2.4.91: reconcile Pilot Sera `SET_ATTACK_ELIGIBILITY` only after proving exact frozen grammar + final-Vanguard enforcement + turn expiry/reset.



## V2.4.91 — Pilot Sera Attack Eligibility closeout
- [x] Freeze `SET_ATTACK_ELIGIBILITY` to exactly one Release 1 consumer: Gale / Pilot Sera.
- [x] Freeze grammar to `scope: controller_turn / rule: only_final_vanguard_may_attack`.
- [x] Add one canonical Attack Eligibility owner instead of leaving Tactic + Match lifecycle parsing duplicated.
- [x] Install the final-Vanguard anchor only after Pilot Sera's repeated optional switches finish.
- [x] Make `field_actions` Attack projection and authoritative `attack` use the same block-reason owner.
- [x] Preserve eligibility when the anchored Creature evolves in place.
- [x] Block a different Vanguard after a later same-turn switch.
- [x] Prove controller-seat isolation.
- [x] Prove turn change expires the controller-turn rule.
- [x] Keep Pilot Sera as data only; add no card-ID dispatch and no owner family.
- [x] Match Edge closure = 104 files / `8651b93e05cac1e995575563ecfef5e618f4e4348d016d51d8e04dd25f71333f`.
- [x] Tactic Edge closure = 42 files / `3deacabefcaf906388cf32dfbb347ac4b5484fd62554ac0c6f779b5817bcec91`.
- [x] Card Pass **#1468 SUCCESS** on source/runtime accepted head `ccb995b99131c2292e79d84a4bd0ba415c0564de`.
- [x] Move `SET_ATTACK_ELIGIBILITY` from partial to implemented.
- [x] Refresh capability fingerprint to `99955f0f5cff5fed252ad737f4020fb178d89353`.
- [x] Card Pass **#1472 SUCCESS** on exact capability-reconciled head `f913b23bcc7064258a18fe1011a877ed5679c95f`.
- [ ] V2.4.92: centralize `SET_WITHDRAWAL_MODIFIER` lifecycle ownership across Event Listener, Tactic and Ability producers; preserve Withdrawal/Payment/Atomic Switch ownership.


## V2.4.92 — Withdrawal modifier lifecycle closeout
- [x] Freeze `SET_WITHDRAWAL_MODIFIER` inventory to exactly nine Release 1 consumers.
- [x] Add one canonical structured Withdrawal-modifier lifecycle owner.
- [x] Support frozen set/delta modifier modes.
- [x] Support frozen integer and target-condition case amount forms.
- [x] Support minimum floor and `maximum_after_this_source`.
- [x] Preserve source-category semantics and canonical Granite opponent-increase immunity.
- [x] Support `end_of_turn`, `controller_aftermath` and `target_controller_aftermath_started` expiry.
- [x] Support one-use consumption on legal voluntary Withdrawal declaration.
- [x] Make Event Listener delegate structured modifier installation.
- [x] Make Tactic delegate structured modifier installation.
- [x] Preserve legacy `SET_WITHDRAWAL_COST` compatibility without making it v0.2 authority.
- [x] Make Match resolve shared lifecycle modifiers after base/continuous Withdrawal and before Highwind current-cost listener.
- [x] Consume one-use lifecycle modifiers only on authoritative legal declaration.
- [x] Expire lifecycle modifiers at canonical Aftermath boundaries.
- [x] Preserve Payment and Atomic Switch ownership unchanged.
- [x] Preserve no-card-ID dispatch and owner-family count 40.
- [x] Rebind old Whiffin/static ownership regression checks to the canonical owner.
- [x] Reconcile the guarded Runtime Pass B Withdrawal wire check to the canonical lifecycle supersession without weakening its structured-ownership assertions.
- [x] Match Edge closure = 105 files / `4a48a1c2de811cef3303f0408baf513823737d33477e071313dcb025a847bfba`.
- [x] Tactic Edge closure = 43 files / `45bb40d0caf00dbce9e1450c768998fd296b6f8a2ecf786fb28774dedce9d84b`.
- [x] Card Pass **#1480 SUCCESS** on exact source/runtime + release-control head `e8bb4026e3950d6cec947feb241655c7eedc9524`.
- [x] Move `SET_WITHDRAWAL_MODIFIER` from partial to implemented.
- [x] Refresh capability fingerprint to `9b33834f794be37a9814b9f6bbb9a6dee37c58d8`.
- [x] Card Pass **#1481 SUCCESS** on exact capability-reconciled head `45164fad24d17037a58102d305996d755722425a`.
- [x] V2.4.93: close `HEAL_EACH` parity across Verdantusk Attack, Elderbloom active Ability, Marevault mixed after-damage-finished Attack and Reef Medic Olan Tactic without duplicating Heal ownership.


## V2.4.93 — HEAL_EACH all-consumer parity closeout
- [x] Freeze `HEAL_EACH` inventory to exactly Verdantusk, Elderbloom — First Canopy, Marevault — Heart of Tides and Reef Medic Olan.
- [x] Preserve Verdantusk on the existing structured Attack HEAL_EACH owner.
- [x] Preserve Reef Medic Olan on the generic Tactic HEAL_EACH route.
- [x] Generalize the existing Active-Ability Selected-Heal owner for bounded `SELECT_CREATURE -> HEAL_EACH`.
- [x] Reuse the existing active-Ability private choice and once-per-turn receipt.
- [x] Rebind every Elderbloom-style selected target before the first heal mutation.
- [x] Route every active-Ability HEAL_EACH mutation through canonical Heal Packet + Heal Listener ownership.
- [x] Add one operation-shaped mixed Attack owner for Marevault's `after_damage_finished` grammar.
- [x] Delegate mixed-program Essence moves to the existing Essence Movement owner.
- [x] Complete Movement Listener handling before the mixed-program HEAL_EACH selection.
- [x] Route mixed-program HEAL_EACH through canonical Heal Packet + Heal Listener ownership.
- [x] Complete Heal Listener handling before the mixed program's optional switch.
- [x] Delegate the optional mixed-program switch to Atomic Switch.
- [x] Reuse the generic `pending_attack_choice` min/max/options browser transport; add no card-specific client rule.
- [x] Make the mixed owner return compatibility authority when ordinary `after_damage` is non-empty.
- [x] Keep Elderbloom and Marevault as data; add no card-ID/name dispatch.
- [x] Card Pass **#1484 SUCCESS** on Elderbloom source/runtime head `eba5eb0ac6490eb1efc9d2653d758c6edac53c9c`.
- [x] Card Pass **#1486 SUCCESS** on isolated mixed Attack owner head `b4319c73dc02b8e2c60db244bcd7c5d69d660cb1`.
- [x] Match Edge closure = 106 files / `fba619ffb652ab1365a4b290b15069379f7f6678cf4e17491da01a3bfe90293e`.
- [x] Tactic Edge closure = 43 files / `df7154b1d85c37dfc1c36f2aba500dea2a369a0c92173ab181689853b3b209f2`.
- [x] Card Pass **#1488 SUCCESS** on exact complete source/runtime + release-control head `60ea34dfe7bf23663e7903df99b47f254afc4eae`.
- [x] Move `HEAL_EACH` from partial to implemented.
- [x] Refresh capability fingerprint to `2e5596630d16932c7ebfc6dcff0fbc9f370da290`.
- [x] Card Pass **#1489 SUCCESS** on exact capability-reconciled head `fec2fb546a976ab67003acc4133d7fc3f5fe9a69`.
- [x] Preserve canonical owner-family count 40 and leave main/live Supabase untouched.
- [x] V2.4.94: close `SELECT_CARDS` selection/resume ownership across all seven frozen consumer surfaces without duplicating Card-Zone ownership.

## V2.4.94 — SELECT_CARDS all-surface closeout (in progress)
- [x] Freeze the Release 1 `SELECT_CARDS` inventory to exactly seven consumers across Event Listener, Attack, active Ability and Tactic surfaces.
- [x] Preserve Capscout and Tinkit on the existing generic triggered Event Listener selection owner.
- [x] Preserve Myceliarch on the existing Attack Discard-Recycle specialist.
- [x] Add one operation-shaped active-Ability sequential selection route for the Surgefin / Living Circuit family.
- [x] Make the first Ability stage a private server-owned discard-card choice with exact min/max validation.
- [x] Give the following Creature-target stage a fresh reconnect-safe private choice ID.
- [x] Revalidate selected discard card identity + zone before any attachment mutation.
- [x] Revalidate the current field target before any attachment mutation.
- [x] Centralize effect attachment disposition/lifecycle normalization instead of duplicating producer state.
- [x] Delegate physical Essence attachment to the canonical external Essence Attachment route/engine.
- [x] Preserve nested Event Listener / Movement Listener continuation before the active Ability returns to play.
- [x] Keep public Ability receipts structural only; expose no selected discard UID/card ID or private target anchor.
- [x] Keep Surgefin / Living Circuit as data; add no card-ID/name runtime dispatch.
- [x] Card Pass **#1495** proves deterministic runtime + all TypeScript checks green on source/runtime head `40607a749e3bd586a46cd12507d6ee3ace5c6782`; only release-control drift remained.
- [x] Match Edge closure = 108 files / `26a48f4d98d62d22010bc1a79616c0dce7b12899e1f7ca93070fd2294ab7d286`.
- [x] Tactic Edge closure = 44 files / `b2df5e5e605e9cdab570c55af6199e48a785c4ff2af456ecf015f27118b823f9`.
- [x] Card Pass **#1496 SUCCESS** on exact active-Ability source/runtime + release-control head `d88af8f3a1047c38a8935974709c6a6389f43be4`.
- [x] Implement/reuse generic Tactic `SELECT_CARDS` private selection/resume for Forager Nia and Quickcharge Cell.
- [x] Preserve Tactic variable binding while delegating later card movement/attachment to canonical downstream owners.
- [x] Prove all seven frozen `SELECT_CARDS` consumers execute through their canonical surfaces.
- [x] Move `SELECT_CARDS` from missing to implemented only after all seven consumers are green.
- [x] Refresh the capability-manifest release-control fingerprint and pass a fresh exact-head Card Pass after capability reconciliation.
- [x] Close V2.4.94 and select the next master-plan target.

### V2.4.94 final acceptance
- [x] Generic Card Selection owner isolated head `1470dd8ebc79b43749dc58cd827c7a2764ff3cee` / Card Pass **#1499 SUCCESS**.
- [x] Forager Nia player-chosen multi-card ordering uses a fresh private continuation and canonical Card-Zone movement.
- [x] Quickcharge Cell consumes its already-selected exact discard Essence and delegates temporary attachment to canonical Essence Attachment ownership.
- [x] Card Pass **#1501** proves all runtime/type checks green before Tactic closure refresh.
- [x] Tactic Edge closure = 45 files / `ea17df9e55af4e18d80585113fe73045321d70d60b2d6c6160880a9c18bfb5d6`.
- [x] Card Pass **#1502 SUCCESS** on exact all-surface source/runtime + release-control head `795a9e94da7e5eadedf41c653fed3cc44be8c8e5`.
- [x] `SELECT_CARDS` capability moved from missing to implemented.
- [x] Capability fingerprint refreshed to `092d25f4091326e31d3b78cd0987867fd8125174`.
- [x] Card Pass **#1503 SUCCESS** on exact capability/control head `ff6af2fde6029158eb63c74df01b4232412f94e3`.
- [x] Preserve canonical owner-family count **40**; no owner #41.
- [x] Leave Supabase production, main and live promotion untouched.
- [x] V2.4.95: freeze and reconcile all **20** Release 1 `APPLY_CONDITION` uses through Condition owner #19 without card-specific dispatch.

## V2.4.95 — APPLY_CONDITION all-surface closeout
- [x] Freeze Release 1 `APPLY_CONDITION` inventory to exactly **20** operation uses.
- [x] Freeze surface split to **6 Event Listener / 12 Attack after_damage / 1 Attack after_attack_finished / 1 Tactic**.
- [x] Freeze condition inventory to 9 names and exact counts.
- [x] Freeze application modes to `apply_if_empty` ×19 and `apply_if_empty_or_same` ×1.
- [x] Confirm Condition owner #19 already owns names, slots, immunity, temporary protection and lifecycle state.
- [x] Confirm the four Ability consumers are triggered Abilities and therefore Event Listener-owned, not Active Ability-owned.
- [x] Confirm nested conditional Attack Condition programs already use source-aware Condition application.
- [x] Upgrade Event Listener APPLY_CONDITION producer path to source-aware Condition owner context.
- [x] Upgrade direct pure-condition Attack owner to source-aware Condition owner context.
- [x] Upgrade Tactic APPLY_CONDITION producer path to source-aware Condition owner context.
- [x] Add bounded Attack after-attack-finished Condition subroute for Aeralith timing without widening Marevault ownership.
- [x] Prove all 20 frozen consumers through their canonical surfaces.
- [x] Move `APPLY_CONDITION` from missing to implemented only after all 20 are green.
- [x] Refresh capability fingerprint + release-control closures as required.
- [x] Pass exact-head Card Pass and synchronize Master Plan / Checklist / Ledger acceptance.

### V2.4.95 final acceptance
- [x] Producer-context source slice accepted by Card Pass **#1509 SUCCESS**.
- [x] Aeralith after-attack-finished Condition timing preserves optional switch plus Movement/Heal listener completion before Blinded application.
- [x] Match closure = **109 files** / `0eab3c83084c2ee60230be602cf22e1e5b451b713ad9655838008b9300c105c0`.
- [x] Tactic closure = **45 files** / `c8ffe22b77007b382e7ae2897dc9c01fb31d668489a700a5c0ceb97145cd8ed2`.
- [x] Card Pass **#1511 SUCCESS** on exact source/runtime/release-control head `196b1901add715b259a3c5fbe37158508872d00e`.
- [x] `APPLY_CONDITION` capability moved from missing to implemented.
- [x] Capability fingerprint = `702e41f5f72ead9cc17abb4290bfec11f0aa664c`.
- [x] Card Pass **#1513 SUCCESS** on final exact head `2b09549535ab7df9dd25a57e5e139400fd8dd48f`.
- [x] Preserve canonical owner-family count **40**; no owner #41.
- [x] Leave Supabase production, main and live promotion untouched.
- [x] V2.4.96: freeze and reconcile all **19** Release 1 `OPTIONAL` uses through a generic consent/resume contract without absorbing nested-operation ownership.

## V2.4.96 — OPTIONAL all-surface closeout
- [x] Freeze Release 1 `OPTIONAL` inventory to exactly **19** uses.
- [x] Freeze surface split to **9 Event Listener / 6 ordinary Attack after_damage / 3 Tactic / 1 Marevault after_damage_finished**.
- [x] Confirm Event Listener already owns generic private accept/decline + nested-step resume for its 9 consumers.
- [x] Confirm Tactic already owns generic private accept/decline + nested/else resume for its 3 consumers.
- [x] Confirm Marevault already owns its bounded 0..1 optional switch stage and delegates mutation to Atomic Switch.
- [x] Identify the missing parity as exactly six ordinary Attack OPTIONAL Reserve-switch programs.
- [x] Confirm current Attack switch specialist parses a different IF-based family and does not claim those six OPTIONAL programs.
- [x] Confirm the six structured cards can otherwise fall toward legacy text / caller-supplied switch-index handling.
- [x] Extend the existing Attack Reserve-switch specialist with the exact frozen OPTIONAL grammar.
- [x] Preserve declared Reserve filters generically.
- [x] Allow decline without performing Atomic Switch.
- [x] On accept, rebind the current source/turn/selected Reserve anchor before Atomic Switch.
- [x] Preserve Movement Listener then Heal Listener continuation after accepted switch.
- [x] Keep legacy compatibility available only for legacy/unclaimed attacks.
- [x] Prove all 19 frozen OPTIONAL consumers through canonical ownership.
- [x] Move `OPTIONAL` from missing to implemented only after all 19 are green.
- [x] Refresh release-control closures/capability fingerprint as required and pass a fresh exact-head Card Pass.

### V2.4.96 final acceptance
- [x] Freeze checkpoint `c2bfe680b86242d8b7a1f67a2da989310e90fece` / Card Pass **#1515 SUCCESS**.
- [x] Six ordinary Attack OPTIONAL switch programs use server-owned min 0 / max 1 choice state.
- [x] Aeralith's Gale-only Reserve filter is enforced generically from card data.
- [x] Decline produces no Atomic Switch or movement events.
- [x] Accept delegates to Atomic Switch, then Movement Listener, then Heal Listener.
- [x] Legacy effect-text / caller-index compatibility remains outside structured ownership.
- [x] Match closure = **109** / `8a29ec22c8b6db539c6f0bae4f4c2ce0301b0e411bee7d44c493e6cf804637b6`.
- [x] Tactic closure = **45** / `c8ffe22b77007b382e7ae2897dc9c01fb31d668489a700a5c0ceb97145cd8ed2`.
- [x] Card Pass **#1518 SUCCESS** on exact source/runtime + release-control head `f3fc2343ee9c3484045f9c291ee2595e222c91ac`.
- [x] `OPTIONAL` moved from missing to implemented.
- [x] Capability blob = `0e3dad5932f8511637d36fcd342c7e645944d506`.
- [x] Card Pass **#1520 SUCCESS** on final exact capability/control head `3f247763c86a03eb3c8986f409acd5ecc4d8eb16`.
- [x] Preserve owner-family count **40**; no owner #41.
- [x] Leave production/main/live unchanged.
- [x] V2.4.97: freeze and reconcile all **13** Release 1 `INSPECT_ZONE` uses through one authoritative inspection contract without absorbing later choice/move ownership.

## V2.4.97 — INSPECT_ZONE all-surface closeout
- [x] Freeze Release 1 `INSPECT_ZONE` inventory to exactly **13** nodes.
- [x] Freeze source-zone split to deck_top ×8 / rewards ×5.
- [x] Freeze visibility/return-policy families, including Cosmarch server-only and Seer Nyx effect-owned-set.
- [x] Confirm owner #31 Card Search / Filter / Inspection remains canonical inspection authority.
- [x] Confirm owner #33 owns private visibility and owner #30 owns later physical movement/order.
- [x] Confirm existing structured coverage for Cosmarch, Nebulynx Attack, Noctivane active Ability, Nebulynx Reward Ability and Comettail Reward evolution.
- [x] Confirm generic Event Listener coverage for Moonbit, Gloamkin, Wispbat, Graveglider and Veil Essence.
- [x] Prove current Tactic interpreter has no `INSPECT_ZONE` execution branch.
- [x] Identify the missing parity as exactly Parallax Window + Seer Nyx.
- [x] Add one generic Tactic INSPECT_ZONE route under owner #31 semantics.
- [x] Delegate Reward inspection identity/ledger to the existing Reward inspection owner.
- [x] Bind Seer Nyx's exact opponent top-3 as a private effect-owned set without moving it during inspection.
- [x] Revalidate bound inspection provenance before CHOOSE_FROM_SET / Card-Zone mutation.
- [x] Preserve player/controller-chosen ordering through existing Card-Zone routes.
- [x] Prove all 13 frozen INSPECT_ZONE nodes through canonical ownership.
- [x] Move `INSPECT_ZONE` from missing to implemented only after all 13 are green.
- [x] Refresh release-control closures/capability fingerprint and pass fresh exact-head Card Pass.

### V2.4.97 final acceptance
- [x] Inspection submodule remains under owner #31; no owner #41.
- [x] Card Pass **#1524 SUCCESS** on isolated owner/test head `3eefcabf4e07c7934f23661a3b8ef4a8d6bdde03`.
- [x] Parallax delegates same-position Reward inspection to owner #32.
- [x] Seer inspects top three without moving them; discard and final top order delegate to Card-Zone.
- [x] Match closure = **109** / `8a29ec22c8b6db539c6f0bae4f4c2ce0301b0e411bee7d44c493e6cf804637b6`.
- [x] Tactic closure = **46** / `5defbc3ccf666ee96191aea62b2f98bfda7800ed56f86c5e4e8e7501f1cef876`.
- [x] Card Pass **#1526 SUCCESS** on source/runtime + release-control head `aae70b4fa61ce193301e9e4ca7a33e4351c52d69`.
- [x] `INSPECT_ZONE` moved missing -> implemented; capability blob `b3ed5b6640a8213491479bf7c7fb4fdb63e0d30f`.
- [x] Card Pass **#1528 SUCCESS** on final exact head `369917d9ccca815a3857f3c38f9a88d932eb97a5`.
- [x] Production/main/live unchanged; promotion HOLD.

## V2.4.98 — CHOOSE_FROM_SET all-surface closeout
- [x] Freeze Release 1 inventory to exactly **10** nodes.
- [x] Freeze surface split to **3 Event Listener / 2 active Ability / 1 Attack / 4 Tactic**.
- [x] Freeze ordinary `source + min/max` family to **9** nodes.
- [x] Freeze Scout Zeph `set + selection` filtered family to **1** node.
- [x] Keep later physical card move/order under Card-Zone #30.
- [x] Audit exact current execution ownership for all 10 nodes before source changes.
- [ ] Preserve every already-working Event Listener / Ability / Attack specialist.
- [ ] Close only proven CHOOSE_FROM_SET gaps generically.
- [ ] Prove all 10 nodes with private server choice + current bound-set revalidation.
- [ ] Move `CHOOSE_FROM_SET` partial -> implemented only after all 10 are green.
- [ ] Refresh release-control/capability evidence and close V2.4.98.

### V2.4.98 audit result
- [x] Preserve Event Listener ×3 CHOOSE_FROM_SET routes unchanged.
- [x] Preserve Noctivane active deck-reading specialist unchanged.
- [x] Preserve Celestyr Dream Ray Attack specialist unchanged.
- [x] Preserve Seer Nyx Tactic inspection-provenance route unchanged.
- [x] Add shared bound-set choice grammar for `source + min/max` and Scout Zeph `set + selection`.
- [x] Support frozen `filters.any` without weakening existing filter grammar.
- [x] Canonicalize Future Draw / Circuit Scanner / Scout Zeph deck-window movement/order through Card-Zone.
- [x] Add bounded Celestyr active deck-planning family with private staged choice and Card-Zone mutation.
- [x] Prove the four repaired consumers plus six preserved consumers = all 10.

### V2.4.98 final acceptance
- [x] Tactic bound-set owner supports both frozen grammar families and `filters.any`.
- [x] Future Draw / Circuit Scanner / Scout Zeph delegate physical movement/reorder to Card-Zone #30.
- [x] Celestyr deck-planning live route is operation-shaped, private and Card-Zone-owned for mutation.
- [x] Preserve six previously accepted CHOOSE_FROM_SET routes.
- [x] Match Edge closure = 111 / `e1035dbc68dae15d980843b8a7a3d8a11fc076ba9fab72100ccc4f78e7fe09bc`.
- [x] Tactic Edge closure = 47 / `5fe799462c53855691f0901fba11740c79d99d691d40bc2173ee6c1a40ae70ac`.
- [x] Card Pass **#1541 SUCCESS** on exact all-surface source/runtime + release-control head `4d3781c12c8b42f953de203eb4acdf14b09ee5e2`.
- [x] Move `CHOOSE_FROM_SET` from partial to implemented.
- [x] Capability fingerprint = `f6d4ba6118a60dc44d7b63794724295423f1b77e`.
- [x] Card Pass **#1542 SUCCESS** on exact capability/control head `f4dc9db69e741718abe3f7ed136a824334037fb1`.
- [x] Preserve owner-family count **40**; no owner #41.
- [x] Leave Supabase production, main and live promotion untouched.

## V2.4.99 — DIRECT_DAMAGE all-surface closeout
- [x] Freeze Release 1 inventory to exactly **8** DIRECT_DAMAGE nodes.
- [x] Freeze surface split to 3 Ability/effect / 2 Attack recoil / 1 Tactic program / 2 Tactic listeners.
- [x] Freeze damage classes to `effect` and `recoil`, amounts to 10/20, and bound Creature targets only.
- [x] Audit all eight against canonical Damage Engine / Damage Packet ownership.
- [x] Preserve source/action/controller context for protection, history and listeners.
- [x] Repair only proven execution gaps; no duplicate damage mutation owner.
- [x] Prove all eight frozen consumers.
- [x] Move `DIRECT_DAMAGE` from missing to implemented only after all eight are green.
- [x] Refresh capability/release-control evidence and exact-head validation.

### V2.4.99 final acceptance
- [x] Event Listener covers triggered Bristleflare / Volcanic Caldera / Thorn Crown DIRECT_DAMAGE.
- [x] Attack recoil owner covers Reckless Rush + Meltline Charge.
- [x] Attack modifier completion rider covers Pyrohorn effect DIRECT_DAMAGE.
- [x] Active Ability route covers Magmagecko's selected-target effect DIRECT_DAMAGE.
- [x] Tactic route covers Ashen Gamble packet listeners + canonical Defeat/Reward/promotion queue semantics.
- [x] All-eight DIRECT_DAMAGE guard passes.
- [x] Card Pass **#1558 SUCCESS** on exact source/runtime + release-control head `27b3cb2b5a041fae1bc8e7c389d7319cb55ff121`.
- [x] Match Edge closure = 116 / `383ab7bf0eefafb1a41a767cb5f41374d50e76922f03f4c0432ed786851a0c02`.
- [x] Tactic Edge closure = 53 / `9698a8aa2aeb63d7d10b3e4aa224a90f0d27bc1d492f949c3bb28aaa6048409f`.
- [x] `DIRECT_DAMAGE` moved missing -> implemented; capability blob `aa3d9e4d719d4cb2596abd1b811d7b8613453974`.
- [x] Card Pass **#1559 SUCCESS** on exact capability/control head `f6f9d23cd22f890786e653bb760b68d9e41feeb6`.
- [x] Preserve owner-family count **40**; no owner #41.
- [x] Leave Supabase production, main and live promotion untouched.

## V2.4.100 — ATTACH_ESSENCE_FROM_ZONE all-surface closeout
- [x] Freeze Release 1 inventory to exactly **7** nodes.
- [x] Freeze surface split to **4 active Ability / 2 triggered Ability / 1 Tactic**.
- [x] Freeze source grammars to hand selection / discard selection / prior SELECT_CARDS refs.
- [x] Freeze attachment-state families to permanent/default / temporary / borrowed.
- [x] Audit all seven against Essence Attachment owner #22 and current listener/resume boundaries.
- [x] Preserve every already-working attachment route unchanged.
- [x] Repair only proven all-surface parity gaps generically.
- [x] Prove all seven frozen consumers.
- [x] Move `ATTACH_ESSENCE_FROM_ZONE` partial -> implemented only after all seven are green.
- [x] Refresh release-control/capability evidence and exact-head validation.

### V2.4.100 audit result
- [x] Six existing routes remain unchanged: Magmagecko / Surgefin / Living Circuit / Arcprowler / Coilclank / Quickcharge Cell.
- [x] The sole proven parity gap was Dynamozer's paid self-attachment owner missing from the live active-Ability router / Match continuation.
- [x] Dynamozer now uses the generic paid cost -> discard Essence choice -> owner #22 attachment route.
- [x] Existing Event / Movement / Heal continuation is reused after attachment.
- [x] Paid attachment route and Match orchestration contain no Dynamozer/card-name dispatch.
- [x] Temporary/borrowed attachment-state normalization and controller-Aftermath cleanup remain shared ownership.
- [x] All-seven invariant coverage is green.
- [x] Card Pass **#1576 SUCCESS** on exact source/runtime + release-control head `d0d37294f7cd9e81196691d6e91bf117923862de`.
- [x] Match closure = **118** / `ec0c2f31fca865d652d822ade620df9377aa2fcab570e4068a4c362ef8e7f1f1`.
- [x] Tactic closure = **53** / `ac815498f6ed48b2e233703d1664c6e0165eb040c77568d68467a4702758f50e`.
- [x] `ATTACH_ESSENCE_FROM_ZONE` moved partial -> implemented; capability blob `1bb0014f731cc3d2baf7329e04df2a6f148d8ea1`.
- [x] Preserve owner-family count **40**; no owner #41.
- [x] Leave Supabase production, main and live promotion untouched.
- [x] Final synchronized capability/control exact-head Card Pass is green and recorded.

### V2.4.100 final acceptance
- [x] Card Pass **#1581 SUCCESS** on synchronized capability/control head `6fa819d30ddb952b437b7b77318dfe2d0feb11fe`.
- [x] Set One structure / effect grammar / release-control checks green.
- [x] Deterministic runtime and all required type-checks green.
- [x] `ATTACH_ESSENCE_FROM_ZONE` = implemented at capability blob `1bb0014f731cc3d2baf7329e04df2a6f148d8ea1`.
- [x] Seven frozen consumers = 7 / 7.
- [x] Owner-family count remains 40.
- [x] Production/main/live unchanged; promotion HOLD pending remaining Release 1 singleton operation debt.

## V2.4.101 — ATTACH_ESSENCE_FROM_SELECTION singleton closeout
- [x] Freeze current Release 1 inventory to exactly **1** consumer: Prismatic Founder / Bandit's Current.
- [x] Freeze sequence to `SEARCH_DECK -> ATTACH_ESSENCE_FROM_SELECTION -> SHUFFLE_DECK`.
- [x] Freeze search to optional 0..1 Basic Essence with a new attached element, public reveal, hidden failure allowed.
- [x] Freeze effect-owned selection as logical bound provenance, not a physical card zone.
- [x] Confirm current live active-Ability router has no execution family for the frozen sequence.
- [x] Keep physical attachment with Essence Attachment owner #22.
- [x] Keep final deck randomization with the existing Randomization engine.
- [x] Add only the bounded operation-shaped active-Ability family required by the frozen sequence.
- [x] Revalidate source, turn, selected deck card and dynamic element eligibility before mutation.
- [x] Preserve legal zero-selection -> shuffle path.
- [x] Wait for attachment listener continuation before shuffle when a card is attached.
- [x] Prove no Founder/card-ID/name dispatch and no new owner family.
- [x] Prove the single frozen consumer end-to-end through the live Match choice path.
- [x] Move `ATTACH_ESSENCE_FROM_SELECTION` missing -> implemented only after the consumer is green.
- [x] Refresh capability/release-control evidence and final synchronized exact-head validation.
- [x] Leave production/main/live unchanged until Release 1 closeout permits promotion.

### V2.4.101 source/runtime acceptance
- [x] Card Pass **#1595 SUCCESS** on exact source/runtime + release-control head `8cadb7ce31e98548c868aa1817fe2ab59f5abcac`.
- [x] Match closure = **119** / `96455602ed13a5acfb37e2cca7a4b267398d49db739a60371569cac122fb005d`.
- [x] Tactic closure = **53** / `ac815498f6ed48b2e233703d1664c6e0165eb040c77568d68467a4702758f50e`.
- [x] Deterministic runtime + Match/Tactic/API/withdrawal/attack/Surge type-checks green.
- [x] Private deck search hides option identities from opponent.
- [x] Dynamic already-attached-element exclusion revalidates before mutation.
- [x] `effect_owned_selection` remains logical provenance; physical source stays `deck`.
- [x] Physical attachment remains owner #22.
- [x] Event / Movement / Heal continuation completes before shuffle.
- [x] Randomization engine owns the final shuffle.
- [x] Zero-selection branch shuffles without attachment.
- [x] No Founder/card-name dispatch and no owner #41.
- [x] `ATTACH_ESSENCE_FROM_SELECTION` = implemented at capability blob `bca64acae1cb4cb7370e4b8fd2a03bedfa7f8a8f`.
- [x] Final synchronized capability/control + plan/checklist/ledger exact-head Card Pass is green and recorded.

### V2.4.101 final acceptance
- [x] Card Pass **#1600 SUCCESS** on synchronized head `220f9875884ff08e169980c8a72ca17950b9c8ef`.
- [x] Match closure **119** / `96455602ed13a5acfb37e2cca7a4b267398d49db739a60371569cac122fb005d`.
- [x] Tactic closure **53** / `ac815498f6ed48b2e233703d1664c6e0165eb040c77568d68467a4702758f50e`.
- [x] `ATTACH_ESSENCE_FROM_SELECTION` = implemented at capability blob `bca64acae1cb4cb7370e4b8fd2a03bedfa7f8a8f`.
- [x] Frozen consumer = Prismatic Founder / Bandit's Current = 1 / 1.
- [x] Owner-family count remains 40.
- [x] Production/main/live unchanged; promotion HOLD pending remaining Release 1 singleton operation debt.
- [x] Next used missing operation selected by capability order: `MOVE_ZONE_POSITION` (Astral Celestial Observatory).


### V2.4.102 freeze and implementation checklist
- [x] Freeze sole Release 1 `MOVE_ZONE_POSITION` consumer: Astral Celestial Observatory.
- [x] Freeze all 5 accepted Astral `hidden_information_viewed` listeners: Orbitortoise, Prismowl, Starwhale, Celestial Observatory, Dreamglass.
- [x] Confirm grammar declares `event_zone_is`, `source_is_attached_creature`, `$event_controller`, and `MOVE_ZONE_POSITION`.
- [x] Confirm Hidden Information #33 currently stores de-duplicated history metadata but emits no per-occurrence Event Listener trigger.
- [x] Confirm Event Listener currently lacks `event_zone_is`, `source_is_attached_creature`, `$event_controller`, and `MOVE_ZONE_POSITION` execution.
- [x] Confirm Event Listener already owns generic OPTIONAL and event-controller turn limits.
- [x] Confirm Card-Zone #30 already owns exact same-zone reorder via `runtimeV02ApplyCardZoneReorder`.
- [x] Freeze hidden-view trigger privacy: no card UID/ID, ordering, inspected value or private option may enter the public/event-history record.
- [x] Freeze occurrence semantics: actual hidden views produce distinct trigger occurrences even when current-turn history metadata is de-duplicated.
- [x] Freeze Dreamglass source semantics: `source_is_attached_creature` compares event source Creature UID to the Relic's attached Creature; Tactic-only views have no source Creature.
- [x] Extend Hidden Information #33 with exact per-occurrence event provenance while preserving the existing de-duplicated history ledger.
- [x] Add the generic hidden-view -> Event Listener adapter/factory and record the event in canonical effect history.
- [x] Add `event_zone_is` and `source_is_attached_creature` to Event Listener predicate evaluation.
- [x] Add `$event_controller` player-token resolution from the current event only.
- [x] Add bounded Event Listener `MOVE_ZONE_POSITION` validation and delegate physical mutation to Card-Zone #30.
- [x] Rebind the exact current top card UID at resolution; never reuse a stale viewed UID and never reveal it.
- [x] Preserve Match source choice/continuation while hidden-view listeners resolve first.
- [x] Add equivalent Tactic Event Listener choice projection/resume without duplicating Event Listener ownership.
- [x] Route Dreamglass emitted Heal Packets through canonical Heal Listener continuation before resuming the source action.
- [x] Add deterministic runtime tests for all 5 hidden-view listeners plus repeat-occurrence, stale-top, privacy and opponent-event-controller cases.
- [x] Add static wiring proof: no card ID/name dispatch, owner-family count 40, Card-Zone #30 mutation only.
- [x] Refresh Match/Tactic release closures after source stabilizes.
- [x] Move `MOVE_ZONE_POSITION` missing -> implemented only after the singleton is green end-to-end.
- [x] Synchronize capability + release control + master plan/checklist/ledger and pass final exact-head Card Pass.
- [x] No production/main/live promotion during V2.4.102 implementation.


**V2.4.102 acceptance evidence:** implementation head `d91e1ec293a29991f03519bba3092599758333e1`; Card Pass #1636 SUCCESS with both workflow jobs green; capability/release-control synchronized; owner-family count 40; production/main/live unchanged.


### V2.4.103 — Damage-Packet predicate family reconciliation
- [x] Freeze exact consumers: Heatguard Bracer before-packet + Thorn Crown after-packet.
- [x] Confirm all six predicates are declared by accepted structured card data.
- [x] Confirm Before-Damage Packet owner already implements all six generically.
- [x] Confirm canonical Damage Packet context already carries condition provenance.
- [x] Confirm Event Listener already implements Thorn Crown's five after-packet predicates.
- [x] Confirm existing deterministic proof for Heatguard recoil and Thorn-style reflect/rejection.
- [x] Confirm no Release 1 consumer requires after-packet `damage_packet_condition_is`.
- [x] Freeze scope as capability reconciliation; no gameplay runtime code change.
- [x] Add deterministic Heatguard Scorched-condition match + non-match proof.
- [x] Pass exact-head Card Pass after proof-only test change.
- [x] Move exactly six frozen Damage-Packet predicates missing -> implemented.
- [x] Update Release Control capability-manifest fingerprint atomically.
- [x] Pass exact-head Card Pass after capability/release-control reconciliation.
- [x] Append V2.4.103 acceptance to master plan/checklist/ledger.
- [x] Preserve owner-family count 40; no main/live promotion in this slice.


**Acceptance:** `6d37f636b806a6701eab45ef7b0c2e92ba38b9ae` / Card Pass #1640 SUCCESS; proof head `cfb91e4c866df8cdebed684441e8c274eab80fba` / #1639 SUCCESS; no gameplay-runtime or live change.

### V2.4.104 — core Event Listener predicate reconciliation
- [x] Freeze exactly eight missing-but-executable core Event Listener predicates.
- [x] Audit Release 1 consumer counts and confirm all accepted uses are Event Listener requirement trees.
- [x] Confirm generic Event Listener cases already exist for all eight.
- [x] Confirm broad deterministic proof for subject source, origin, destination, phase and source/self.
- [x] Confirm no card-ID/name dispatch or second interpreter is required.
- [x] Add direct active-seat controller match/non-match proof.
- [x] Add direct subject-definition filter match/non-match proof.
- [x] Add direct attached-creature subject match/non-match proof.
- [x] Pass exact-head Card Pass after proof-only tests.
- [x] Move exactly eight frozen predicates missing -> implemented.
- [x] Update Release Control capability-manifest fingerprint atomically.
- [x] Pass exact-head Card Pass after capability reconciliation.
- [x] Append V2.4.104 acceptance across plan/checklist/ledger.
- [x] Preserve 40 owner families; no main/live promotion in this slice.


**Acceptance:** proof `5b68a60ff79a4eea0829da0deb596d63f5b6852a` / Card Pass #1643 SUCCESS; capability head `445759beccccde2c60afaf93905c0f074ce093cc` / #1644 SUCCESS; owner families 40; no gameplay-runtime/main/live change.
