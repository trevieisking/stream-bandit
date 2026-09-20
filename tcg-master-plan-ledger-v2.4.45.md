# Stream Bandit TCG V2.4.45 Ledger — Pre-Generation Authority

## 029 — GitHub lookup before every generation
The next artwork identity must be resolved from the current PR #576 branch and current art-production ledger immediately before each image-generation call.

## 030 — Memory is not next-card authority
Conversation history, model memory, cached card order and prior assistant text may help continuity but cannot authorize the next card identity. GitHub source must be re-read every time.

## 031 — Required preflight packet
Before image generation, the assistant must possess a fresh packet containing:
- current PR head SHA;
- `card_id`;
- `printing_id`;
- `artwork_id`;
- exact `target_path`;
- locked visual brief;
- confirmation that the canonical PNG is not already present.

If any item is absent or contradictory, image generation stops.

## 032 — Mismatch rejection
If a generated image materially contradicts the bound brief, that candidate is rejected and not handed off for upload. A replacement must be generated against the same already-resolved identity.

## 033 — Loop restart rule
After an upload is verified and control truth is synchronized, the workflow returns to the GitHub preflight. The next-card identity is never merely carried over from the prior turn.

## 034 — Current material checkpoint
Twenty-four canonical Standard/base PNGs are verified: Stardot, Orbitail, Cosmarch, Moonbit, Comettail, Nebulynx, Cometmanta, Orbitortoise, Prismowl, Starwhale, Celestyr — Dream Cartographer, Basic Astral Essence and Star Essence.

Cartographer Lyra is verified at its canonical repository path.

Future Draw is verified at its canonical repository path.

Gravity Shift is verified at its canonical repository path.

Star Chart is verified at its canonical repository path.

Current progress: **24/193 Set One**, **24/24 Astral**.

At this checkpoint the ledger sequence records Astral Standard/base artwork complete at 24/24, subject to a fresh pre-generation GitHub read.

## 035 — Release boundary
This authority change is artwork/control-plane only. It changes no gameplay engine, rules, database, Supabase deployment, main/live/public release state.

## 036 — First completed deck product preview
The first complete player-facing deck product preview is **Astral — Second Sky**. The preview gate opens when Astral Standard/base artwork reaches 24/24 and the existing starter recipe is revalidated. The Shop preview must use real approved card art plus the matching Second Sky sleeves, battle coin and deck box from the existing accessory ledger. It remains branch-only and economy-gated until canonical pricing, purchase, receipt and ownership owners exist.

## 037 — Set One is Battle Pass Season 1
**Set One (SB1)** is the first Battle Pass season identity: **Set One — Season 1**. The already-locked 100-tier / reward-every-tier structure remains. Exact reward assignments, free/premium split, token costs, receipts, progression values and entitlements stay unassigned until the canonical Battle Pass/economy owners implement them. This season identity does not automatically grant all 193 Set One cards.

## 038 — Coordinated first-deck presentation review
After Astral reaches 24/24 and the Second Sky accessory art required for presentation exists, review a branch-only **Shop starter-deck preview** and **Battle Pass Season 1 preview** together. This is a visual/product checkpoint only and must not alter gameplay, randomness, ownership, deck legality, prices, currency balances or grants.

Dreamglass is verified at its canonical repository path.

Orbit Ring is verified at its canonical repository path.

Parallax Window is verified at its canonical repository path.

Astral Standard/base artwork is complete at 24/24. The Second Sky product-preview gate is now open, subject to starter recipe and accessory revalidation.

## 039 — Second Sky canonical presentation integration
Astral artwork completion opened the first starter-product presentation gate. **Second Sky** remains the canonical Astral starter (`deck-astral-second-sky`) at exactly **60 cards / 21 identities**. Live Supabase corroboration agrees and reports the active starter at rules version `set-one-v0.6.1` with **Timefold** as its signature effect.

## 040 — Canonical art resolver cutover
The shared presentation-only art resolver now maps rendered `card_id` values to approved production-ledger `target_path` assets. The runtime no longer depends on the obsolete flat intake path shape for approved Astral cards. Card Renderer and battle gameplay owners remain unchanged.

## 041 — Featured starter product registry
Player-facing product presentation uses `assets/tcg/products/tcg-product-presentation-v1.json` as an extensible presentation registry. Second Sky is the first featured starter. Future official deck products may be added by canonical `starter_id` after their recipe and required art are complete; no page-specific gameplay branch is created.

## 042 — First integrated deck surfaces
Branch-only Second Sky presentation is wired across Game Home, Play, Decks, Collection, Shop and Battle Pass. Battle card faces receive the same canonical Astral art through the shared art resolver. Shop/economy and Battle Pass reward ownership remain deliberately gated; this checkpoint creates no price, purchase, grant, entitlement or reward authority.

## 043 — Accessory art remains open
The accessory identities already exist for Second Sky sleeves, battle coin and deck box, but their artwork remains missing and ownership remains unimplemented. The integrated starter preview must not represent those accessory assets as finished.

## 044 — Second Sky human visual acceptance
Trevor accepted the complete branch-preview presentation on exact head `7d15aec02ee76613a706e4ca491f6c091e57351b`. Game Home, Play/Active Battle, Decks, Collection, Shop, Battle Pass and the shared top rail are visually accepted. This is a presentation acceptance only: Second Sky accessory art remains pending, canonical economy/Battle Pass owners remain gated, and PR merge / `main` / Pages / live release remain separate promotion decisions.


## 045 — Mobile visual acceptance reopened
Trevor's desktop visual PASS on exact head `7d15aec02ee76613a706e4ca491f6c091e57351b` remains valid, but Kay's phone review proved that the fixed desktop shell did not constitute cross-device acceptance. The phone viewport could hide part of the six-item navigation rail and could prevent the complete Collection card set from being reachable.

V2.4.50 introduces a mobile-only responsive presentation contract: a visible 3 x 2 navigation rail, vertically scrollable phone pages, single-column core layouts and complete two-column card grids. This changes presentation only; gameplay, ownership, economy, database, Edge Function and Supabase runtime authority remain unchanged.

Cross-device Second Sky visual acceptance is reopened until Kay/Trevor pass the repaired phone layout.


## 046 — Cross-device Second Sky visual PASS
Kay re-tested the V2.4.50 phone layout and passed it. Trevor's desktop PASS and Kay's mobile PASS together close the Second Sky cross-device presentation gate. The accepted baseline includes the complete desktop six-control rail, mobile 3 x 2 rail, vertical phone scrolling, stacked mobile core pages, complete two-column mobile card grids and the accepted Play/Decks/Collection/Shop/Battle Pass artwork-fit behaviour.

## 047 — Canonical deck-presentation template
Second Sky is the reusable visual/layout baseline for later completed launch decks. Future deck art should be composed to survive the same desktop and mobile card/product containers: strong center-safe focal subject, readable silhouette, no critical detail placed only at extreme crop edges. Page-specific deck branches are not required; the starter-ID presentation registry remains the extension point.

## 048 — One-deck-per-day working cadence
The working production target is one completed launch deck per working day. This is a cadence target, never a reason to skip the locked source preflight, canonical upload verification, desktop/mobile human review, exact-head CI, or promotion controller. The next starter identity in the current registry is **Ember — Ashrush** (`deck-ember-ashrush`).


## 049 — Canonical global card-face priority
Card readability and playability now take priority over the next deck-art batch. Ember/Ashrush generation is paused until one shared renderer makes every current Set One identity readable on its real card face, including identities whose artwork is still missing.

## 050 — Canonical visual reference
The accepted Orbitortoise reference is https://chatgpt.com/s/m_6aafc9a916c88191b0f63b164d1923cc . It is visual authority for frame/layout only. Structured card data remains the sole rules/stat authority and may not be overridden by numbers or text baked into concept art.

## 051 — Creature card placement contract
Creature cards place HP at the top-left beside the name, element/energy type at the top-right, large art in the upper window, Ability plus every canonical Attack in the rules area, Reward Cards at bottom-left, and rarity at bottom-right with Withdraw directly beneath rarity. The prior two-row visual restriction is superseded when a Creature canonically has an Ability plus two Attacks.

## 052 — Missing-art cards are real playable cards
Missing artwork never hides or delays gameplay identity. The same renderer must show the complete frame, stats, rules, Ability/Attack rows, footer and an element-themed Artwork Pending window. Missing art is presentation state only, not legality state.

## 053 — One renderer / server-owned legality
Battle, hand, Collection, Decks, Shop, pack/reward and Battle Pass card surfaces use one shared renderer with full/battle/hand/compact modes. Active Ability glow comes only from authoritative server capability projection; triggered Abilities are not manual buttons. Attack legality/damage/effects remain server-owned. No card-ID-specific renderer or browser rules engine is permitted.

## 054 — Astral first proof set
Astral is the first renderer acceptance set because its 24/24 Standard/base artworks already exist at canonical GitHub paths. Existing Astral image bytes are fitted/cropped into the canonical card window; they are not regenerated merely to embed frames or rule text.


## 055 — Attack means damage plus automatic turn completion
A legal Attack is not accepted merely because its control fires. The server must calculate and place damage automatically, resolve required Attack follow-up work, then end the attacking player's turn. Browser code displays readiness and submits intent only; it never owns damage or turn progression.

## 056 — Defeat immediately owns Reward resolution
A Creature reduced to zero remaining HP is processed by canonical Defeat. The opposing player receives the defeated Creature's Reward value through the existing Reward queue, followed by any required forced Vanguard promotion and Match Flow continuation. No browser shortcut or card-specific KO dispatcher is allowed.

## 057 — Post-Attack human acceptance reopened
No Trevor/Kay test has yet visibly completed a real Attack that placed damage. Therefore damage, KO/Reward flow and all later Battle lifecycle remain **human-test pending** even where automated runtime tests already exist.

## 058 — Explicit Quit Match is concession
The small Battle cog owns a single destructive action: **Quit Match**. It calls the existing server `concede` command. The quitter loses; the opponent wins. Closing/reloading the page is not automatically a loss because authoritative matches must remain resumable unless the user explicitly concedes.

## 059 — Terminal result returns only to fresh matchmaking
Victory/Defeat ends the match. The result action returns to `tcg-play.html` without a match id; no old match is resumed and the player must select **Find Opponent** for another opponent.

## 060 — Interaction-state clarity
The canonical card face is also the control surface. Active Abilities pulse/glow only while server capability projection says they are usable and stop after use. Attack rows show server-projected readiness/block reasons. On phones/tablets, card play and Essence attachment support finger drag/drop **and** the equal tap-select -> highlighted-destination fallback. Both paths reuse the same authoritative server actions.

## 061 — Orbitortoise layout applies globally
The Trevor-supplied Orbitortoise image remains the reference structure for all card types/surfaces: identity/HP/type header, large artwork window, readable Ability/Attack/effect area and lower metadata/footer. Missing art uses the same finished frame with an Artwork Pending window so every identity is game-ready before its final PNG arrives.


## 062 — Attached Essence has a visible element-orb rail
Every battlefield Creature exposes its authoritative attached Essence as tiny colored sphere/orb/pip markers attached visually to that Creature. The display exists so players can read resource availability without remembering a hidden count. It is derived from authoritative attached Essence plus structured `provides`; it does not create client-side resource authority.

## 063 — Essence orbs represent effective payable units
The resource rail represents effective Essence units available from attached sources. Element color/glyph comes from the canonical Stream Bandit element identity. Multi-unit providers produce the equivalent visible quantity. Individual unit orbs remain visible while the rail fits; only rendered overflow compresses the rail to one counted orb **per element**, with that element's current total inside the orb. The Attack's printed/canonical cost remains visible beside the Attack for direct visual comparison.

## 064 — Essence removal removes its visual resource immediately
Discard, expiry, movement, removal or any authoritative loss of attached Essence removes the corresponding orb contribution on the next authoritative Battle render. The browser may not keep stale attachment pips after the server state changes.

## 065 — Element color never stands alone
Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt use their canonical element palette, but every Essence orb also exposes the element glyph/mark and accessible text. Resource readability may not depend on color vision alone.

## 066 — Phone/tablet drag and tap share one gameplay path
Phone/tablet require finger drag/drop **and** retain tap-select -> highlighted destination. Both paths submit the same authoritative server command and legality remains server-owned; ledger 060 is synchronized to this current rule.

## 067 — Touch drag requires pointer-safe transport
The current coarse-touch Battle client sets playable hand cards to `draggable="false"`, which explains Kay's observed inability to drag on phone. Mobile parity must use a Pointer Events/touch-safe gesture path rather than depending exclusively on native HTML5 drag/drop. It must preserve page scrolling outside an active card drag and must not change the accepted board geometry.

## 068 — Board decoration is a final presentation pass
Trevor/Kay have accepted the Battle layout geometry. Realm/background/table decoration is deliberately deferred until the playable interaction chain has passed: card readability -> attachment -> Attack/damage -> defeat/Reward -> result/quit plus phone drag/drop. Decoration may not alter rules, slots, zones, touch targets or server ownership.


## 069 — Essence overflow collapses to one counted orb per element
When the rendered individual Essence rail would exceed its allocated card bounds, repeated units collapse to **one orb per element with that element's live numeric count inside it**. The count is always whatever authoritative state currently provides; no particular number triggers compression. If multiple elements are attached, each element keeps its own counted orb so type information is never lost.

## 070 — Counted-orb compression is responsive presentation only
The threshold for switching from individual tiny orbs to counted orbs is determined by available card space/responsive layout, not by gameplay rules. The underlying authoritative Essence instances and `provides` values remain unchanged. A counted orb is only a compact view of those units.

## 071 — V2.4.53 does not displace the card/Attack priority
Essence-orb compression, mobile drag parity and other micro-interactions are required polish within the current playable-card slice. They do not overtake the primary sequence: canonical card visuals/readability -> real Attack/damage/reward lifecycle -> cross-device interaction acceptance -> final board decoration.


## 072 — Counted Essence activates only when the rail exceeds its card bounds
The counted-orb presentation has **no fixed Essence-number trigger**. Individual orbs remain visible for as long as the rail fits within the card's allocated Essence area. Compression begins only when rendering the current authoritative units individually would breach those card parameters.

## 073 — Compression counts each Essence type separately
When compression is active, each element present receives its own orb and its own current numeric count. Different elements are never summed into one generic total. The displayed number is dynamic authoritative state, not a predetermined value or threshold. A prior use of `12` was an illustrative example only and is not a rule.


## 074 — One shared element-orb primitive owns resource presentation
Attached Essence and Attack cost presentation reuse the same generic element-orb renderer. Battle supplies authoritative attached-unit totals; the card renderer supplies only visual element identity and layout. No card-ID-specific Essence UI branch is permitted.

## 075 — Essence compression is measured against rendered card width
The implementation chooses expanded versus counted Essence presentation by comparing the expanded rail's rendered width with the rail's available card width. It does not use a gameplay count threshold. Every authoritative re-render recalculates the rail, so attachment removal can reduce the count or return the rail to individual-orb mode.


## 076 — Phone drag is transport, never gameplay authority
Touch drag only selects an existing hand-card UID, highlights existing destinations and delegates a legal drop to the same `runSetupPlace` / `runPlayHandTarget` functions used by tap mode. It may not define a separate mobile legality, payment, Creature, Essence, Relic or evolution engine.

## 077 — Hold activation preserves phone scrolling
Coarse-touch drag activates only after a deliberate short hold. Movement before activation cancels the drag gesture so the hand/page can still scroll normally. Once the hold has activated card dragging, the active gesture may prevent scrolling until drop/cancel.

## 078 — Setup slots must be discoverable before touch selection
Eligible empty setup locations expose their destination coordinates during the player's setup turn even before a hand card is selected. Their legal highlight remains conditional on a selected eligible Creature. This lets touch drag discover a destination without re-rendering away the held DOM card and does not change server setup legality.


## 079 — Automated V2.4.53 proof does not replace device acceptance
Regression tests may prove authoritative refresh behavior, layout-driven compression, per-element grouping and command transport parity. They do not mark Trevor desktop or Kay phone visual/gesture checks complete. Exact-head CI closes the automated slice only; human cross-device gates remain separately required.


## 080 — Ability glow is a capability projection, not a card-side guess
A manual active Ability may glow/pulse only when the authoritative `field_actions.ability_sources` projection contains that exact field source anchor. `use_ability` consumes/changes authoritative state; the next projection removes the glow when the Ability is no longer usable. Triggered Abilities remain non-manual.


## 081 — Attack end-turn is a continuation, not a competing rule
The Attack rule remains one lifecycle: a legal Attack resolves damage/effects, then the attacking player's turn ends **after the full required resolution chain**. If no Creature is defeated, the path proceeds directly to Aftermath/turn advance. If a Creature is defeated, the same end-turn continuation pauses for Defeat -> Reward Card taking -> any required Vanguard promotion, then resumes. Reward handling is therefore conditional on defeat, never on ordinary non-lethal damage.

## 082 — Blocked Attack explanation is presentation-only
When authoritative Attack capability says an Attack is blocked, the card may remain clickable only to explain that server-projected reason. Insufficient Essence must read clearly as **Needs more matching Essence** and may point the player back to the Attack cost orbs and attached Essence rail. A blocked explanatory click must not submit an Attack command or recreate legality in the browser.

## 083 — Creature inspection must not relocate the battlefield source card
Selecting the Vanguard may open a larger readable card context, but the original battlefield card remains anchored in its Vanguard slot. Desktop readability uses a separate inspector copy of the same canonical card face and the same card-owned Attack/Ability controls. Phone/coarse-touch layout remains on its accepted in-board presentation unless separately approved.


## 084 — Client exceptions cannot masquerade as a server turn deadlock
A paired Battle may legitimately show **Opponent turn** on one device and **Your turn** on the active player's device while both are on the same authoritative revision. If the active player then cannot act and the browser displays a JavaScript exception, treat that as a client-render/interaction failure unless server evidence proves otherwise. The Battle controller must define every helper used by card inspection/fallback rendering; the stable inspector's card-name lookup is now a local resolver backed by the shared renderer or authoritative `card_index`. No server engine, turn owner or match state may be altered to compensate for a client ReferenceError.


## 085 — Successful turn advance always returns to play
The canonical Match Flow Turn owner must set `phase = "play"` whenever an ordinary turn successfully advances after its Card-Zone draw. This is required both for ordinary End Turn and for a suspended lethal-Attack continuation. Terminal and deckout routes retain their own complete-state behavior. The dispatcher may not patch the phase separately.

## 086 — Reward and forced promotion suspend one Attack end-turn continuation
A lethal Attack does not create a second turn rule. Attack resolution pauses the same end-turn continuation for Defeat -> Reward Card taking -> required Vanguard promotion. Once that queue is empty, Aftermath and the canonical Turn owner advance the seat, draw and return the phase to `play`. Human evidence at revisions 26-28 proved Attack/Reward/promotion committed while the missing Turn phase transition left the match in `resolution`.

## 087 — Full card readability belongs to inspection, not permanent battlefield scale
The Battle board may use compact canonical card previews so the whole tabletop fits at normal browser zoom. Compact field cards retain artwork, identity and live status/Essence information; full Ability/Attack/rule text opens through the shared canonical card inspector. The original field card remains anchored in its zone while inspected.

## 088 — Hand is a bottom horizontal interaction rail
The player hand is a fixed bottom-edge horizontal tray that does not increase page height. Desktop and touch devices may scroll the tray left/right when the hand exceeds available width. A hand card can be clicked/tapped to read, while drag/drop uses the existing setup/play/evolve/Essence/Relic destinations and server commands. Tap-select -> destination remains an equal fallback.

## 089 — External TCG footage is interaction reference only
User-supplied footage of another TCG may establish interaction grammar such as whole-board viewport, compact field cards, click-to-read inspection, horizontal hand browsing and drag/drop. Stream Bandit must not copy the external game's artwork, branding, proprietary card designs, names or assets. Stream Bandit's existing card renderer, board identity and server-owned rules remain authoritative.


## 090 — Battlefield cards are bounded previews
In-play Creature cards are compact canonical previews whose size is bounded by the viewport and card slot, not stretched to fill the entire available row height. Vanguard may be visually emphasized over Reserve, but neither may dominate the tabletop. Full rules remain available through inspection.

## 091 — Hand is a bottom-edge peek/fan rail
The Battle hand deliberately behaves like a physical hand of cards rather than a grid of miniature complete cards. Cards may extend below the visible bottom hand mask so their upper identity/art area remains large enough to recognize. The rail scrolls horizontally on desktop and touch; selected/dragged cards may rise or scale slightly. This is presentation only and does not change card-zone ownership.

## 092 — Inspect mode owns complete card readability
The shared card renderer exposes one canonical `inspect` presentation mode for complete readable card context. Inspect mode preserves the same card identity, artwork and structured data while allocating more area to Ability/Attack/move rows than compact battlefield/hand previews. Battle may add authoritative live controls/status to this face; inspection itself never becomes a second rules engine.

## 093 — Decks, Collection and Battle Pass share read-only card inspection
Canonical card tiles in Decks and Collection and card-backed Battle Pass reward samples open the same shared inspect face. These non-Battle surfaces are read-only presentation: inspection does not infer or mutate deck ownership, collection ownership, season progression, entitlement, reward claiming or economy state.


## 094 — Red legality codes are not proof of a server deadlock
A visible server rejection must be correlated with authoritative command/state history before game rules are changed. The V2.4.56 paired recording contained repeated legality rejections while the same match continued to commit Realm, Essence, Attack, Reward and promotion actions. Browser UX must distinguish an unavailable action from a stalled server.

## 095 — Hand action availability is server-projected
Battle may classify a hand card for presentation, but legal destinations and current playability come from existing authoritative projections: `play_card_targets`, `evolve_targets`, `attach_essence_targets`, `attach_relic_targets`, and Tactic-owner `play_tactic_preview`. The real mutation command validates again. The browser may not become a competing legality engine.

## 096 — Tactic preview and Tactic play share one legality helper
`tcg-tactic-actions` owns both read-only Tactic playability projection and final Tactic execution. `play_tactic_preview` performs no mutation/commit and reuses the same generic playability helper as `play_tactic`, including first-player Ally restrictions, play requirements, required targets/resources and supported lifecycle opcodes.

## 097 — One manual Essence per turn must be explained before mutation
The existing manual-Essence rule remains unchanged. When the server projects `manual_essence_already_used_this_turn`, Battle explains that the player already used their one manual attachment and does not send a doomed attachment command. This is UX around an existing rule, not a new Essence rule.

## 098 — Withdraw is a server-projected card action
Withdraw belongs to the existing Match/Withdrawal/Payment/Switch owners. Battle reads `field_actions.withdraw` for eligibility, exact cost, attached-Essence payment options and legal Reserve targets. The browser submits only the chosen server-projected payment UIDs and Reserve index; it does not calculate cost or legality.

## 099 — Realm state must remain visibly legible
A successfully played Realm cannot disappear merely because the responsive tabletop hides decorative space. Battle keeps the authoritative active Realm visible by canonical card name and makes it inspectable. Realm placement/replacement remains entirely server-owned.

## 100 — Player-facing errors and diagnostic codes are separate
Known machine legality codes are translated into concise player guidance. The raw code remains available in diagnostic state/console evidence. A user should see what action is required, not an implementation identifier such as `required_tactic_target_unavailable`.


## 101 — Full Release 1 runtime completion precedes the next full human Battle gate
Human Battle remains essential acceptance evidence, but it is no longer the immediate next loop while the 193-card launch registry still consumes capabilities classified partial/missing. Automation and owner-level source work continue first. The next full Trevor/Kay two-device journey starts only after Release 1-used capability reconciliation is complete.

## 102 — Release 1 capability scope is usage-driven
A grammar operation/predicate becomes a Release 1 blocker only when the frozen 193-card launch registry actually uses it. Future-only grammar, Fairy, Underworld, Packs, Shop, Trading and Battle Pass capability must not expand the launch runtime-completion queue.

## 103 — Capability labels require current owner evidence
tcg-runtime-capabilities-v0.2.json is an inventory, not source authority. A missing or partial label may be stale after later owner work. Before coding, inspect current generic source/tests and the exact usage context. Reclassify only when the existing owner proves the full Release 1-used shape; otherwise repair that rightful owner.

## 104 — Predicate-tree composition has one shared owner
Boolean structure (all, any, not) belongs to tcg-match-predicate-tree-v0-2.ts. The tree owner never interprets gameplay semantics. Each mechanic supplies an authoritative leaf evaluator for its context. No Attack/Ability/Tactic/listener route may create another independent boolean composition grammar.

## 105 — Generic IF is not complete until every Release 1 context is covered
The shared predicate tree is foundation only. IF remains incomplete until all 29 frozen Release 1 IF instances can execute through structured owners across Attack, Ability and Tactic/listener contexts without printed-English or card-ID gameplay fallback.


## 106 — Event Listener no longer owns boolean-tree syntax
Event Listener keeps authoritative meanings for its event-context leaf predicates, but all / any / not composition is delegated to the shared predicate-tree owner. This migration is behavior-preserving and does not make Event Listener the global owner of those leaf predicates in Attack, Ability or Tactic contexts.


## 107 — Shared leaf semantics are migrated one predicate at a time
A shared predicate tree does not automatically create shared leaf semantics. Repeated leaf meanings are consolidated only when current contexts prove they are semantically identical. source_damaged is the first accepted case: Active Ability and Attack now reuse the same Requirement-evaluator meaning while retaining their separate orchestration.


## 108 — Source Shield threshold is a shared state predicate
source_has_shield_at_least means the source Creature's current Shield is at least the positive configured threshold. That semantic belongs to the shared Requirement evaluator; Attack, Ability and continuous owners may orchestrate it but must not redefine the comparison.


## 109 — Tactic play requirements follow the frozen predicate grammar
Release 1 structured Tactics use predicate records for play requirements. Compatibility-only uppercase operation names may be accepted as input, but they must translate into the same shared predicate semantics and may not remain a second rules path.


## 110 — legal_card_available delegates selection, not card rules
The shared requirement layer owns only the predicate envelope and candidate-count meaning. Zone traversal and card/Creature filter matching stay with the existing selector owners. A legal-card requirement is true only when those owners return at least one candidate; the requirement evaluator must not invent a parallel card-search engine.


## 111 — Previous opponent turn is ownership-based, not arithmetic
Any rule that refers to a previous opponent turn must resolve from canonical turn ownership history. It may not assume turn_seq - 1 because Release 1 includes TIMEFOLD and therefore same-seat extra turns. Match Flow is the only ordinary turn-history writer; future extra-turn owners must append through the same history owner.


## 112 — Card-zone movement must be legible but never authoritative in the browser
Deck shuffle, deal, draw, discard and Reward movement are rendered from authoritative state/events. RNG continues to own shuffle order and Card-Zone continues to own physical movement. Client animation may explain a transition but may not determine or replay the mutation.

## 113 — Hidden zones have physical presence without identity leakage
Opponent deck, opponent hand and face-down Rewards may be visually represented as card backs and counts. Their identities remain governed by Hidden Information. A face-down card back is presentation, not permission to inspect the card.

## 114 — Public discard inspection follows Hidden Information
Discard is a visible pile. Read-only inspection is allowed only for cards/zones that the authoritative visibility model exposes. The inspector cannot become a shortcut around private/hidden information.

## 115 — Reward selection is a server-count-bound overlay
When Defeat requires Reward taking, Battle presents a large face-down Reward-selection overlay. The required selection count and eligible positions come from the existing pending Reward owner. Reward values 1, 2 and 3 are generic data, not hard-coded Creature identities. Selection moves the chosen authoritative cards to hand, then resumes the same suspended resolution continuation.

## 116 — Conditions and Abilities require visible state feedback
An authoritative Condition application/clear/replace/prevention and an authoritative Ability usable/fired transition must be visible on the relevant card/field. Presentation may animate or highlight the event, but Condition/Event Listener/Ability owners remain the sole legality/state authority.

## 117 — Interrupted animations never block state recovery
Reconnect/refresh renders the latest authoritative snapshot immediately. A partially displayed shuffle/draw/discard/Reward animation has no gameplay receipt and may be abandoned without changing match state.


## 118 — Previous-opponent event requirements use canonical turn ownership
A Tactic/event requirement that names `previous_opponent_turn` delegates to shared event history plus canonical turn-owner history. Numeric previous-turn arithmetic is forbidden because Release 1 includes extra-turn capability. Stone — Reversal Seal is the current Release 1 consumer.

## 119 — Tactic play requirements are structurally complete before program execution
The frozen Release 1 registry contains 18 Tactics with explicit play requirements. Their current families — reserve count, legal card availability and event occurrence — now resolve through shared owners. This does not imply every Tactic program opcode is implemented; program execution remains the next independent gate.


## 120 — Tactic IF is control flow, not effect authority
The Tactic interpreter may evaluate a shared predicate tree and splice the chosen then/else steps into its existing effect cursor. IF itself does not own Shield, Condition, hidden sampling or Optional-choice mutation. Those downstream operations remain with their rightful owners and must fail closed until implemented.

## 121 — A green IF does not imply every IF card is complete
A Release 1 Tactic with a working IF predicate is still incomplete when its selected branch contains an unsupported opcode. Current post-IF blockers are Cyclone Route OPTIONAL and False Memory RANDOM_SAMPLE_HIDDEN_ZONE. Reversal Seal ADD_SHIELD_EACH and Blackout Pulse APPLY_CONDITION are now implemented generically. Surveyor Mina and Recovery Spray also have no remaining downstream IF-branch opcode gap.
## 122 — Every meaningful authoritative resolution needs legible feedback
Release 1 presentation must make important card movement, Attack, Ability and state-changing outcomes visible. A server-correct mutation can still fail the player-facing gate when the player cannot tell what moved, triggered, changed or resolved.

## 123 — Special effects are a projection, never a gameplay owner
The effects layer consumes authoritative state deltas, pending choices and event/result packets. It may animate source, target, movement and result, but it never chooses legality, amounts, targets, random order, payments or final state.

## 124 — Effect choreography is generic and extensible
Visual effects are keyed by reusable event/effect families — movement, search, shuffle, attach, attack, heal, damage, Shield, Condition, switch, evolve, defeat, Reward and listener/Ability activity — rather than card IDs. New cards and rules should plug into these families without creating per-card UI engines.

## 125 — Deck search is a private server-count-bound choice surface
A deck-search overlay receives its eligible options and selection limits from the authoritative search/pending-choice owner. The searching player may inspect only the cards they are authorized to inspect. A three-card effect displays 0/3 through 3/3 because that effect says three; the UI never treats three as a universal search constant.

## 126 — Search attachment targets come from existing legality owners
When searched Essence/Energy cards may attach to Adult Creature/Creature targets, the client highlights only server-projected legal destinations. Assigning a selected card to a target is choice transport; Attachment/Essence/Requirement owners remain authoritative.

## 127 — Chosen searched cards attach before the visual shuffle
For search -> attach -> shuffle effects, authoritative chosen cards are shown moving to their Creature attachment/Essence rails, inspected-but-unchosen cards return to the deck representation, and the visible shuffle follows the server's shuffle step. Presentation order mirrors the canonical effect sequence.

## 128 — Shuffle visuals never expose or recreate permutation
RNG/shuffle authority determines the resulting deck order. The animation may mix/fan/cut card backs, but it must not know, predict, preserve or reveal the actual hidden permutation beyond the authoritative state available to the viewer.

## 129 — Public and private choreography are viewer-specific
The searching player may receive private eligible card identities and assignment controls. The opponent receives only the public-safe representation of a search, attachment or shuffle unless a rule explicitly reveals identities. Hidden Information remains authoritative throughout animation.

## 130 — Attack and Ability choreography preserves causal order
Attack and Ability presentation follows the authoritative sequence: source activation -> legal target/choice -> payment/cost where applicable -> effect/impact -> state deltas -> listeners/Conditions/Defeat/Reward -> continuation. Visual timing may be shortened, but must not reorder gameplay semantics.

## 131 — Animation interruption is never a gameplay fault
Reduced-motion mode, dropped frames, navigation, refresh or reconnect may skip unfinished effects. The newest authoritative snapshot always wins immediately; no animation has a gameplay receipt or permission to replay mutations.
## 132 — External TCG footage is interaction grammar, never Stream Bandit rules or assets
Reference footage may teach viewport composition, physical-card motion, inspection, target highlighting, choice overlays and causal feedback. It may not import external artwork, branding, card frames, names, card identities, proprietary assets or gameplay rules.

## 133 — One Battle Presentation / Choreography Engine owns visual sequencing
Release 1 uses one generic presentation owner for movement, choices and effect feedback. Card IDs do not own bespoke gameplay presentation branches when the same event/effect family can be reused.

## 134 — The tabletop remains spatially stable during inspection and resolution
Vanguard, Reserve, Realm, Deck, Discard, Rewards and hand remain anchored to their canonical zones. Full-card inspection and effect overlays are separate presentation layers and do not physically relocate source cards.

## 135 — Physical card movement should explain authoritative zone changes
When a physical card changes an authorized visible zone, presentation should show the movement where practical: Deck -> hand, hand -> field, field -> Discard, Reward -> hand, return to Deck, evolution stack, switch/promotion and attachment changes.

## 136 — Choice overlays are authoritative N-of-M surfaces
Reward, search, optional and other multi-card choices use one generic overlay driven by server-authorized options, exact selection bounds, legal targets and continuation identity. Browser prompts and free-form debug choice controls are not Release 1 interaction UI.

## 137 — Target highlighting is a projection of server legality
A glowing/highlighted destination means the authoritative owner currently exposes that destination as legal. The browser may render that fact but may not independently infer or expand target legality.

## 138 — Combat and Ability feedback follows source-to-result causality
Presentation preserves the logical order source activation -> target/choice -> payment -> effect/impact -> state delta -> listeners/Conditions/Defeat/Reward -> continuation. Visual effects may be shortened but cannot reverse or fabricate this sequence.

## 139 — Hidden zones remain physically present without identity leakage
Deck, opponent hand and unrevealed Rewards remain visible as face-down physical objects/counts. Search and other private-choice presentation is viewer-specific and never leaks identities outside Hidden Information authority.

## 140 — Desktop and touch have semantic parity
Desktop drag/drop and phone hold-drag/tap fallback may differ as gestures, but both consume the same authoritative options, submit the same actions and receive the same presentation semantics.

## 141 — Presentation pacing never outranks authoritative state
Animation queues are disposable. Newer authoritative state, reconnect, refresh or reduced-motion mode may cancel/shorten queued cues. The rendered state must converge immediately on the server snapshot.

## 142 — Player-facing completion includes comprehensibility
A Release 1 mechanic is not visually accepted merely because the mutation succeeded. The player must be able to identify the important source, target/movement and resulting state change without relying on raw diagnostic text.
## 143 — Authoritative visual receipts are preferred over client snapshot inference
Complex presentation should be driven by a receipt projected by the authoritative action/continuation owner at commit time. Snapshot comparison may help render final state but must not guess hidden choices, RNG, target legality or listener ordering.

## 144 — Presentation receipts are viewer-filtered before consumption
A receipt may contain public cues and seat-private cues internally, but each persisted player view receives only the cues authorized for that viewer. The browser never becomes the Hidden Information filter.

## 145 — Receipt identity makes presentation idempotent
Each presentation receipt is bound to an authoritative revision and stable receipt ID. Polling the same match view must not replay the same effect. A newer authoritative revision invalidates older queued choreography.

## 146 — Presentation intensity is pacing metadata only
Micro, standard and hero tiers control emphasis/timing only. They never alter effect order, legality, amounts, random results or continuation.

## 147 — Element FX skins are generic Stream Bandit presentation
Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt may each apply a reusable visual skin to generic cue families. Element styling is keyed by public structured element metadata, never by individual card ID, and must remain understandable without colour alone.

## 148 — Resolution breadcrumbs mirror authority instead of replacing it
A temporary accessible resolution ribbon may summarize a complex authoritative cue chain such as Attack -> damage -> Condition -> Defeat -> Reward. It is generated from the same receipt and cannot create, delay or reorder gameplay.

## 149 — Private choices may have a public-safe opponent mirror
The opponent may be told that a search/choice is in progress only when that fact is public. Card identities, eligible options, assignments and other private details remain absent unless the authoritative visibility rule explicitly reveals them.

## 150 — Stale animation backlog is disposable
A newer authoritative revision, reconnect or refresh may cancel old presentation cues. Repeated low-importance cues may be coalesced for pacing in a later visual layer, but the latest committed match snapshot and all rule outcomes remain complete and immediate.
## 151 — Presentation receipts are created at the canonical commit boundary
A successful Match mutation projects presentation from the same committed event type, public payload and authoritative post-mutation state immediately before player views are persisted. This is the single server receipt-maker boundary for Match actions.

## 152 — Persisted player views receive separately filtered presentation
Player 1 and Player 2 views are not given one unfiltered receipt to interpret locally. The server filters the receipt for each viewer first, preserving Hidden Information before persistence and transport.

## 153 — Presentation dependency closure is release-controlled
The presentation envelope and receipt-maker modules are part of the exact `tcg-match-actions` Edge dependency closure. Any future receipt dependency must update the release-control closure rather than bypassing or weakening the fingerprint guard.

## 154 — Reversal Seal ADD_SHIELD_EACH is generic runtime capability, not a card exception
Release 1 `ADD_SHIELD_EACH` resolves one-or-many Creature refs then delegates each actual Shield mutation to the existing Shield owner. Reversal Seal is a registry consumer of that generic operation and must not own a card-specific runtime branch.
## 155 — Tactic APPLY_CONDITION delegates to the shared Condition owner
The Tactic interpreter may resolve a Creature reference and transport the structured condition request, but the actual Condition mutation belongs to `applyRuntimeCondition` in the shared Condition engine.

## 156 — Condition application modes are shared grammar
Tactic `APPLY_CONDITION` accepts the same generic modes already used by other runtime owners: `apply`, `apply_if_empty`, `apply_if_empty_or_same`, and `replace`. Tactics may not create alternate slot/replacement semantics.

## 157 — Blackout Pulse is a consumer, not a runtime owner
Volt — Blackout Pulse supplies structured IF + `APPLY_CONDITION` data. Its card identity must never appear in the generic Tactic condition adapter.
## 158 — Tactic OPTIONAL reuses the existing pending-choice and effect-cursor owner
OPTIONAL is a server-owned Yes/No choice. The selected branch is spliced into the same resumable Tactic cursor; OPTIONAL does not create a second interpreter or continuation model.

## 159 — OPTIONAL else_steps are first-class generic branch semantics
A No choice may execute structured `else_steps` when supplied. Absence of `else_steps` means an empty No branch. This behavior is data-driven and not tied to False Memory.

## 160 — Control-condition choice compatibility aliases the generic condition-choice owner
`CHOOSE_AND_CLEAR_CONTROL_CONDITION` is accepted as a compatibility spelling of the shared condition-choice operation with the control slot constrained. Quiet Step remains a consumer, never an owner.

## 161 — Hidden-zone random sampling is non-destructive
The shared hidden-zone sampler chooses distinct instances without reordering or removing the source zone. Later movement, if any, must be an independent authoritative Card-Zone operation.

## 162 — Hidden-zone sampling RNG belongs to the shared match RNG owner
Sampling delegates random index selection to the canonical v0.2 randomization engine. Browsers, presentation receipts and card identities never supply the random result.

## 163 — Private hidden-sample provenance stays server-side until movement
When a Tactic samples a hidden source, its source controller/zone provenance stays in private effect state. A later MOVE_CARDS may use that provenance to move exact sampled UIDs through Card-Zone; the provenance itself is never a player-view permission.

## 164 — MOVE_CARDS honors the structured player controller
Generic no-selection MOVE_CARDS resolves `step.player` before fallback ownership. Cross-controller effects must not silently move cards into the Tactic owner's zones.

## 165 — False Memory is a consumer, not a random-sampling owner
False Memory supplies structured opponent-hand sample + later public discard data. It owns no RNG, hidden-information or Card-Zone runtime branch.
## 166 — Attack IF boolean composition has one shared read-only owner
All Release 1 Attack IF trees must evaluate through the shared predicate-tree composition and the Attack IF leaf adapter. Effect mutation remains with existing mechanic owners.

## 167 — Attack IF leaf semantics reuse existing shared state owners
Source damage, source Shield and reserve count reuse the Requirement evaluator; target Condition state reuses the Condition engine. Attack IF may not redefine those meanings.

## 168 — current_action event evidence is caller-owned
The Attack IF evaluator may test supplied current-action event counts but does not record those events itself. Attack declaration/event ownership remains a separate authoritative phase.

## 169 — card_matches remains a selection/filter boundary
Attack IF resolves the structured variable reference but delegates card/filter matching to the caller's canonical card-definition/filter semantics. The IF owner does not become a card-search engine.

## 170 — Attack IF foundation is not Attack effect parity
A green predicate evaluator does not imply HEAL, Condition, switch, discard, MOVE_CARDS or other selected branches execute generically. The parent Attack IF gate remains open until branch effects are migrated and proven.

