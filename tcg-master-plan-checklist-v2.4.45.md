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
- [ ] Wire generic IF through Active/triggered Ability execution for every Release 1 Ability IF shape.
- [ ] Prove all 29 Release 1 IF instances are executable without printed-English/card-ID fallback.
- [ ] Reconcile IF + its proven Release 1 predicate classifications in tcg-runtime-capabilities-v0.2.json.
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
- [ ] Exact-head Card Pass must validate the refreshed closure before V2.4.72 is accepted.
- [ ] Active Ability IF remaining: Noctivane / Night Reading.
- [ ] Active Ability IF remaining: Surgefin / Undertow Supply.
- [ ] Active Ability IF remaining: Marevault / Heart of Tides.

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
- [ ] Exact-head Card Pass must validate the post-repair Night Reading head before V2.4.73 is accepted.
- [ ] Next active Ability IF: Surgefin / Undertow Supply.
- [ ] Remaining active Ability IF after Surgefin: Marevault / Heart of Tides.

