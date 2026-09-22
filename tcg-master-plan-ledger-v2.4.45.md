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
## 171 — Attack declaration RECORD_EVENT has one action-local owner
Release 1 Attack on_declare event production is evaluated once from structured declaration data and returns an in-memory current-action event-count map.

## 172 — Attack declaration events do not create a second event-history system
The action-local map exists only for the current Attack resolution. Persistent turn/history queries remain with the canonical event-history owner.

## 173 — Storm Break and Chainstorm share declaration-event semantics
Attached-Essence-count and attached-Essence-kind RECORD_EVENT predicates are generic declaration shapes. Storm Break and Chainstorm are registry consumers and must not own separate event booleans.

## 174 — Specialized Attack flows migrate by consuming generic evidence
A specialized effect owner may remain responsible for its mutation while its IF/event decision moves onto shared predicate/event evidence. Migration must not duplicate the mutation path.
## 175 — Conditional Attack Condition programs have one generic IF-to-Condition owner
Nested after-damage programs composed only of IF / APPLY_CONDITION / REPLACE_CONTROL_CONDITION use one generic owner. Mixed effect families remain with their own owners until migrated.

## 176 — Attack Condition mutation is protection-aware
Generic conditional Attack Conditions use applyRuntimeConditionWithContext, preserving Condition immunity/protection and source/controller context instead of bypassing the shared Condition lifecycle.

## 177 — Direct and conditional Condition ownership are mutually exclusive
The existing direct structured Condition owner has first claim. The conditional IF owner runs only when direct ownership returns null. Printed-English compatibility runs only when both structured owners return null.

## 178 — Chainstorm consumes shared declaration evidence
Chainstorm's event_occurred(current_action) predicate reads the action-local event map created by the generic declaration owner. Its card identity does not own event detection.

## 179 — Bounded Attack effect owners must consume shared IF semantics
A specialized Attack mutation owner may remain narrow, but its Release 1 IF decision must delegate to the shared Attack IF evaluator once that predicate family is supported. Owner-local copies of reserve-count, source-damage, source-Shield, target-Condition or card-match semantics are not authoritative.

## 180 — Predicate migration does not transfer mutation ownership
Moving an IF decision to the shared evaluator does not move Heal, HEAL_EACH, Deck-Discard, Card-Zone or listener authority. The established mutation/lifecycle owner remains responsible for the selected branch.

## 181 — Deck-discard IF receives authoritative target state, not a caller boolean
The Deck-Discard owner evaluates `target_has_any_condition` from the actual Attack target Creature through shared Attack IF/Condition state. Dispatchers must not precompute and pass an alternate boolean interpretation.

## 182 — Server-only card inspection precedes shared card_matches and Card-Zone movement
For bounded top-deck Attack flows, hidden inspection remains server-side, `card_matches` is evaluated through shared Attack IF with caller-owned card-filter semantics, and any resulting movement remains Card-Zone-owned.

## 183 — Mandatory post-Attack switch choices are server-owned
When a structured Attack requires selecting a friendly Reserve Creature and switching it with the Vanguard, the Match owner creates a private exact-one pending Attack choice. The browser must not preselect or invent the Reserve target in the original Attack request.

## 184 — Attack switch mutation remains Atomic Switch-owned
The bounded Attack switch-choice adapter owns recognition, validation and choice transport only. The actual Vanguard/Reserve mutation, condition clearing and movement-event emission remain with the canonical Atomic Switch owner.

## 185 — Generic Battle choice UI must route Match Attack choices
`pending_attack_choice` is a first-class server choice in the Battle client. It uses the same generic choice overlay/selection-count transport as other server-owned choices and returns only the authoritative option IDs to `resolve_attack_choice`.

## 186 — Storm Break IF decisions use shared current-action evidence
Storm Break's outer `event_occurred(current_action)` decision is evaluated by shared Attack IF from the declaration-event map. The dispatcher must not recreate the decision with a direct event-count boolean.

## 187 — Post-damage target survival is an IF input, not a later mutation guess
The target-survival result is computed from authoritative post-primary-damage state, supplied to shared Attack IF, and frozen into the suspended overcharge choice before player input. Later listeners or UI state must not redefine whether that nested IF matched.

## 188 — Attack IF source parity and CI acceptance are separate gates
All 13 frozen Release 1 Attack IF instances may be source-migrated before an exact-head workflow run exists. Source completion may be recorded, but the parent accepted/green gate remains open until Card Pass validates the post-repair head.

## 189 — Release 1 IF inventory is 29 exact instances
The frozen eight-element Set One definitions contain 29 structured IF nodes: 7 Tactic IF instances, 13 Attack IF instances and 9 Ability IF instances. Program count and IF-node count must not be conflated.

## 190 — Generic Event Listener already owns build/evolution Ability IF execution
Triggered Ability programs that enter the ordinary Event Listener continuation use the shared predicate tree for IF composition. Existing Cinderburrow, Briarback and Bloomhare IF programs therefore remain Event Listener-owned; no separate Ability IF engine should duplicate those mutations.

## 191 — Attack-declared Ability IF wraps the existing modifier owner
For synchronous `attack_declared` triggered Abilities, IF decides whether the existing current-Attack damage modifier is applied. The listener owner may recursively evaluate IF wrappers, but it must not create a second Attack/Damage mutation engine.

## 192 — False triggered-Ability IF does not spend a once-per-turn use
If the triggered Ability's requirements match but its nested IF branch does not select a current-Attack modifier, the event is resolved as a zero-delta no-op and the Ability's per-turn use is not consumed.

## 193 — Ability IF leaves read authoritative source/target state
`source_damaged`, `event_attack_target_damaged` and `event_attack_target_has_condition` are evaluated from the bound authoritative field source/target for the current attack declaration. Browser state and printed English never decide these leaves.

## 194 — Same-zone card reorder belongs to Card-Zone
Effects that move an exact card within one authoritative zone, including deck top -> deck bottom, use the Card-Zone reorder primitive. Effect adapters must not splice/reconstruct authoritative zone arrays themselves.

## 195 — Active Ability IF uses the shared predicate-tree owner
Active Ability conditional programs delegate boolean composition to the common predicate-tree engine. The Active Ability IF adapter owns only its authoritative leaf context and may not become a second generic predicate-composition implementation.

## 196 — Scheduled actions are lifecycle records, not delayed browser commands
A structured `SCHEDULE_ACTION` is stored server-side with owner, trigger, source identity and structured steps. The client neither schedules nor replays it.

## 197 — controller_aftermath_finished resolves before ordinary turn advance
Deferred actions with trigger `controller_aftermath_finished` resolve after the controller's Aftermath/resolution queue has finished and immediately before canonical Match Flow turn advance. Any resulting deckout is visible to Match Flow before seat rotation.

## 198 — Night Reading hidden identity remains controller-private
The inspected opponent deck-top identity may be shown only to the Ability controller. Opponent/public receipts expose structural counts and waiting state, never the inspected card UID/card ID unless another rule explicitly reveals it.

## 199 — Night Reading optional selection controls scheduling through Ability IF
Declining the optional inspected-card bottom move leaves the deck order unchanged and causes `selected_count_at_least` to fail, so no deferred draw is scheduled. Selecting exactly one card reorders it through Card-Zone and schedules the deferred draw.

## 200 — Effect-driven discard Essence attachment remains Attachment Engine-owned
An active Ability may select an eligible discard Essence, but physical removal, exact-instance attachment, attachment receipts and `essence_attached` listener creation remain with the canonical Essence Attachment route.

## 201 — Active Ability continuation survives nested listener choices
If an active Ability mutates state and that mutation opens Event, Movement or Heal listener choices before the Ability's remaining steps execute, the unfinished Ability is represented by a server-side continuation receipt. Browser choice state must never become the Ability program counter.

## 202 — Nested Ability listener healing resumes the Ability, not ordinary Play
The Heal Listener coordinator uses `resume_active_ability_effect` when packets originate from nested listeners inside an unfinished active Ability. Only after that listener queue clears may Match resume the active-Ability continuation.

## 203 — Supply-family player choice preserves sequential structured semantics
A combined private choice UI may present the optional Essence and mandatory target together, but server validation must preserve the original program constraints: exactly one legal target and zero or one eligible Essence.

## 204 — Active Ability IF observes post-listener authoritative target state
For supply-family effects, `target_damaged` is evaluated after the selected Essence attachment and all listener continuations have completed. It must not be frozen from pre-attachment browser state.

## 205 — Supply-family public receipts do not reveal selected hidden-zone identities
Public receipts may expose selected Essence count, target field slot and listener/heal audit. They do not expose the selected discard Essence UID/card ID unless another rule makes that identity public.

## 206 — Attached-Essence redistribution remains Essence Movement-owned
Active Ability orchestration may enumerate legal source/destination combinations, but exact attached-Essence transfer and movement receipts remain with `applyRuntimeV02EssenceTransfer`. Ability adapters must not splice attachment arrays directly.

## 207 — Multi-move Ability transactions preflight before first mutation
When one Ability selection contains multiple Essence moves, the complete selected sequence is executed against an isolated authoritative clone before any real move occurs. A stale or illegal later move must fail the whole selection without partially applying an earlier move.

## 208 — One Essence instance cannot satisfy multiple moves in one resolution
A single attached Essence UID may appear in at most one selected redistribution move for the same Ability resolution. Movement count is receipt count, not option count or browser intent.

## 209 — participated_in_moves is receipt-derived
A Creature satisfies `participated_in_moves` only when its authoritative anchor UID appears as the source or destination of a selected, successfully preflighted movement receipt for that Ability resolution.

## 210 — Essence-move-count Ability IF consumes exact movement receipts
`essence_move_count_at_least` receives the server-owned movement receipt set through the shared Active Ability IF context. The browser, printed English and aggregate current-turn movement history do not decide this local IF.

## 211 — Redistribution healing remains Heal Packet-owned
After the movement threshold is met and a legal participating damaged Creature is selected, the Ability adapter invokes the canonical Ability Heal packet owner. Before-heal modifiers and after-heal listeners remain unchanged.

## 212 — Release 1 IF closeout is 29 / 29
The frozen Set One contains 29 structured IF instances: 7 Tactic, 13 Attack and 9 Ability. All 29 now have executable structured paths through generic owners, with exact-head Card Pass evidence; printed-English/card-ID IF decision fallback is no longer required for Release 1.

## 213 — Capability status follows executable owner evidence
A capability may move to `implemented` only when a generic structured runtime path exists for the accepted Release 1 shape and is backed by source/tests. A stale historical test must be updated rather than forcing the capability ledger to remain false.

## 214 — Bounded-owner narrowness does not imply global capability absence
A specialized owner may remain intentionally narrow even after another shared owner establishes global structured parity for the same operation or predicate. Regression tests must distinguish owner scope from global capability status.

## 215 — IF predicate classification is evidence-bound
The 20 predicate families consumed by the accepted 29 Release 1 IF instances are classified implemented from their exact accepted Tactic/Attack/Ability owner evidence. This does not automatically promote unrelated predicates.

## 216 — Capability-manifest changes are release-control fingerprinted
Every capability-ledger classification change must refresh the release-control capability-manifest blob fingerprint and pass exact-head Card Pass before the reconciliation is accepted.

## 217 — Hidden-zone random sampling has one Release 1 RNG owner
Duskstalker, Thought Hunter and False Memory all delegate exact hidden-zone random sampling to the shared non-destructive Hidden-Zone sampler and canonical Match RNG owner. Event Listener, active Ability and Tactic remain orchestration/visibility consumers rather than independent RNG owners.

## 218 — Hidden-sample visibility stays family-appropriate
Triggered and active Ability hidden samples may expose controller-private inspection only through their existing private viewer boundary. False Memory's sample remains server-only until a later authoritative Card-Zone movement makes any resulting discard public. Capability parity never authorizes browser visibility.

## 219 — Ownership regression tests assert semantics, not source formatting
A regression guard may prove that a shared owner is still called and that privacy/error boundaries remain present, but it must not require obsolete minified/switch-case spelling when the same semantic owner is preserved.

## 220 — Global predicate capability requires every Release 1 consumer family
One working consumer does not promote a predicate globally. `control_condition_present` remains open until Thought Hunter, Murkmite and Hollowcrown are all proven through their rightful generic runtime owners.

## 221 — Murkmite control-condition bonus belongs in the shared outgoing Attack-damage predicate adapter
Murkmite's continuous Attack-damage bonus is data-driven and already reaches the shared outgoing Attack-damage modifier path. The missing work is only support for the structured `control_condition_present` leaf against authoritative opponent Vanguard Condition state; no Murkmite/card-ID branch or second Attack engine is permitted.

## 222 — Rule 221 is corrected by the complete Creature-continuous audit
Rule 221 correctly located Murkmite in the outgoing Attack-damage domain but overstated the pre-existing execution path. The accepted V2.4.78 audit proved that the shared outgoing owner collected attached-Essence continuous effects only. Creature-owned continuous `attack_damage` required a new generic lane inside the same Attack Damage owner.

## 223 — Source-Creature continuous outgoing Attack damage has one generic owner
Glowcub, Murkmite, Quartzram and future cards using the same structured Creature Ability continuous `attack_damage` family are discovered from metadata by the Attack Damage engine. Match and card IDs do not own per-card modifier logic.

## 224 — Existing predicate owners must be reused inside continuous Attack damage
`source_damaged` and `source_has_shield_at_least` are evaluated by the canonical Requirement evaluator. Attack Damage may adapt authoritative context but must not fork their semantics.

## 225 — Current-opponent-Vanguard predicates are independent of the chosen attack target
A predicate targeting `$current_opponent_vanguard` reads the opponent Vanguard's authoritative state even when the attack itself legally targets a Reserve. Attack-target context must never be substituted for explicit Vanguard context.

## 226 — Creature continuous Attack filters bind to canonical attack IDs
Structured `filters.attack_id` is evaluated against the resolved structured Attack ID supplied by Match. Card names, slots and English parsing are not alternate filter authority.

## 227 — Hollow Command blocks global control-condition capability closeout
Thought Hunter and Murkmite now have executable `control_condition_present` paths, but Hollowcrown / Hollow Command remains without a structured active-Ability `REPLACE_CONTROL_CONDITION` owner. Global predicate/operation capability classification must remain open until that family is implemented and exact-head validated.

## 228 — Active Ability condition replacement is shape-owned, not card-owned
Own-turn active Abilities whose structured program requires an existing opponent-Vanguard control condition and then performs `REPLACE_CONTROL_CONDITION` are recognized by one generic Active Ability condition-replacement owner. Card ID, printed English and browser logic are not dispatch authority.

## 229 — Condition replacement preflights before once-per-turn mutation
The complete legal activation is executed against an isolated authoritative clone before the real activation receipt is written. Requirement or source-state failure cannot partially consume the once-per-turn use.

## 230 — Condition prevention occurs after legal Ability activation
Once an active Ability has passed requirements and the canonical activation owner permits it, the Ability use is spent even if the canonical Condition owner later prevents the requested condition because of immunity/protection. Prevention does not rewind a legal activation receipt.

## 231 — REPLACE_CONTROL_CONDITION has one Condition mutation owner across Ability and Attack
Hollow Command and Mind Eclipse may be orchestrated by different runtime families, but both delegate the actual control-slot replacement/protection semantics to `applyRuntimeConditionWithContext(..., "replace", ...)`. No second replacement engine is permitted.

## 232 — control_condition_present is globally implemented only after all three frozen consumers
Release 1 `control_condition_present` is accepted only because Thought Hunter, Murkmite and Hollowcrown are each executable through their rightful generic owner. One consumer family alone is insufficient evidence.

## 233 — Stormmane attached-Essence discard must leave legacy card-ID Match dispatch
The frozen structured `DISCARD_ATTACHED_ESSENCE` operation has exactly one Release 1 consumer, Volt — Stormmane / Storm Break. Its mutation must remain Card-Zone-owned, but recognition/choice must move into a generic structured Attack operation owner so Match no longer dispatches gameplay by `volt-stormmane`.

## 234 — Rule 233 is corrected by the Storm Break owner audit
Rule 233 correctly requires v0.2 Stormmane gameplay to be generic, but it incorrectly implied that the structured discard still depended on the legacy card-ID Match branch. The accepted owner audit proves marked v0.2 Stormmane already routes through the card-ID-free overcharge-discard Attack owner; the remaining `volt-stormmane` branch is legacy-only compatibility.

## 235 — DISCARD_ATTACHED_ESSENCE is implemented for the complete Release 1 shape
The frozen Set One has exactly one `DISCARD_ATTACHED_ESSENCE` consumer. Storm Break's exact-one attached-Essence selection, validation and sequencing are owned by the generic overcharge-discard Attack family, while physical attachment -> discard movement remains Card-Zone-owned.

## 236 — Legacy compatibility branches do not invalidate structured capability parity
A card-specific branch that is explicitly gated to unmarked legacy snapshots does not make the corresponding marked v0.2 capability missing when all frozen structured consumers are already served by generic owners. Such compatibility code may remain until legacy support is deliberately retired.

## 237 — Do not rewrite a green structured owner solely to remove legacy compatibility debt
Capability reconciliation must prefer proven current ownership over unnecessary runtime churn. Legacy-only cleanup is a separate compatibility decision and must not be conflated with Release 1 structured engine completion.

## 238 — Attack declaration RECORD_EVENT has one generic Release 1 owner
Structured Attack `on_declare` `RECORD_EVENT` steps are evaluated by the Attack declaration-event owner from registry data. Match consumes the resulting action-local event counts; card IDs and printed English are not declaration-event authority.

## 239 — Attack-source Essence declaration predicates read authoritative attachment state
`event_attack_source_attached_essence_count_at_least` reads the current authoritative source Creature attachment count. `event_attack_source_has_attached_essence_kind` delegates attachment-kind classification to the shared Attack authority query. Browser state does not decide either predicate.

## 240 — False declaration predicates emit no synthetic event
When a structured declaration predicate does not match, the action-local event map remains unchanged. Unsupported declaration operations, predicate names, fields or Essence kinds fail closed rather than degrading to printed-English interpretation.

## 241 — Action-local declaration events feed later shared Attack IF decisions
Storm Break and Chainstorm may consume their declaration evidence later in the same Attack through shared `event_occurred(current_action)` IF evaluation. The declaration owner records evidence only; it does not duplicate Attack IF or downstream effect mutation.

## 242 — Nightmaw deck-top discard is the next used-operation audit
The frozen Set One has exactly one `DISCARD_DECK_TOP` consumer, Shade — Nightmaw / Dread Crush. Existing evidence indicates the structured Attack Deck-Discard owner already delegates its physical deck -> discard movement to Card-Zone and emits the canonical deck-discard event; capability status must be reconciled only after exact owner/test evidence is confirmed.

## 243 — Attack deck-top discard is a structured owner family, not a card rule
Release 1 `DISCARD_DECK_TOP` is owned by the generic Attack Deck-Discard family. Nightmaw is the sole frozen consumer but is not runtime dispatch authority.

## 244 — Attack deck discard delegates physical mutation to Card-Zone
The Deck-Discard owner decides structured eligibility/count/reveal semantics only. Exact opponent deck -> discard movement, card identity and ordering are Card-Zone-owned.

## 245 — Deck-discard effect exhaustion is not draw-deckout
Moving all remaining cards from a deck to discard because of an effect does not itself assign a deckout loser. Deckout remains with the rules that explicitly require an incomplete draw/deckout result.

## 246 — deck_cards_discarded is a continuation handoff
A successful structured Attack deck discard emits the canonical `deck_cards_discarded` event handoff. Event Listener, Movement Listener and Heal Listener remain separate downstream owners and must preserve their accepted ordering.

## 247 — Noctivane SCHEDULE_ACTION is the next used-operation audit
Night Reading is the sole frozen `SCHEDULE_ACTION` consumer. Existing V2.4.73 evidence indicates the deferred action is server-owned, resolves at `controller_aftermath_finished`, delegates physical draw movement to Card-Zone, and runs before canonical turn advance; capability classification must be reconciled against that accepted owner.

## 248 — Scheduled actions are server lifecycle records
A structured `SCHEDULE_ACTION` does not execute in the browser and does not rely on a client timer. It records an authoritative deferred action with owner seat, source action/card identity, trigger, turn and exact nested steps.

## 249 — Scheduled action trigger matching is exact
A scheduled action resolves only for its recorded controller, recorded turn and supported trigger. A different controller's Aftermath leaves it queued; a terminal match may consume a match-active-only schedule without mutation.

## 250 — Scheduled fixed draws keep Card-Zone and deckout ownership
When a scheduled action executes `DRAW_FIXED`, Card-Zone owns exact deck -> hand movement. The scheduled-action owner only decides the requested count and incomplete-draw deckout result.

## 251 — Controller-AFTERMATH schedules resolve before turn advance
Match must resolve due `controller_aftermath_finished` actions after the controller's Aftermath work and before canonical turn advance. The deferred lifecycle must never be replayed or reordered by presentation code.

## 252 — Archivist Sol hand-to-deck shuffle is the next real runtime gap
Archive Reset is the sole frozen `SHUFFLE_ZONE_INTO_DECK` family. Tactic already has canonical Card-Zone and Randomization dependencies but does not yet parse this opcode. The repair must generically move all exact requested hand cards into that same player's deck through Card-Zone, then shuffle the resulting deck through Randomization, with owner-private semantics and no Archivist Sol branch.

## 253 — SHUFFLE_ZONE_INTO_DECK is Tactic orchestration over Card-Zone + Randomization
The Tactic interpreter owns recognition/sequencing of the structured operation only. Exact hand -> deck movement remains Card-Zone-owned and resulting deck permutation remains Randomization-owned. No third shuffle or zone owner is permitted.

## 254 — Frozen hand-to-deck shuffle visibility is owner-private
Release 1 `SHUFFLE_ZONE_INTO_DECK` accepts only `zone: "hand"` with `visibility: "owner_private"`. The operation must not expose opponent hand identities in public receipts or browser-owned state.

## 255 — Empty hand does not suppress the deck shuffle
A legal structured hand-to-deck shuffle with zero cards in hand performs no Card-Zone transfer but still runs the canonical deck shuffle. Empty source-zone state is not an error for this family.

## 256 — Archivist Sol is a consumer, never shuffle authority
Archive Reset is the sole frozen Release 1 consumer, but runtime recognition is shape-driven by operation/player/zone/visibility. Card ID and printed English are not dispatch authority.

## 257 — Quiet Step control-condition clear is the next used-operation reconciliation
The frozen Set One has exactly one `CHOOSE_AND_CLEAR_CONTROL_CONDITION` consumer, Shade — Quiet Step. Existing Tactic runtime aliases this structured operation to the generic condition-choice flow and filters legal options to the control slot before canonical clear mutation; capability status should be reconciled only after exact-head evidence confirms that accepted path.

## 258 — Control-condition clearing is a specialization of generic Condition choice
`CHOOSE_AND_CLEAR_CONTROL_CONDITION` shares the ordinary server-owned condition-choice transport but constrains legal options to the target Creature's control slot. It does not require a separate card or condition engine.

## 259 — Selected control-condition clearing remains canonical Condition-owned
Tactic may select the condition and preserve choice authority, but physical Condition-state mutation delegates through `clearRuntimeCondition` to the shared Condition engine. The Tactic compatibility facade is not a second mutation owner.

## 260 — Quiet Step is a consumer, not control-clear dispatch authority
Quiet Step is the sole frozen Release 1 consumer, but runtime recognition is operation/target/slot-driven and contains no Quiet Step/card-ID/name branch.

## 261 — Bastion Plate source-counter increment is the next real runtime gap
The frozen Set One has exactly one `INCREMENT_SOURCE_COUNTER` consumer, Stone — Bastion Plate. A generic counter primitive exists, but the Event Listener dispatcher has no opcode branch. The repair must bind listener-source identity generically and preserve the subsequent `source_counter_at_least` IF and source-discard lifecycle.

## 262 — attached-Relic incoming attack reduction belongs to Attack Damage
Structured Relic `continuous` entries with `kind: "incoming_attack_damage"` and `target: "$attached_creature"` are evaluated by the canonical Attack Damage owner. Relic/card identity is data, never dispatch authority. Existing Essence/Creature/temporary-protection ownership remains intact.

## 263 — exact damage prevention and historical prevention are separate evidence forms
Attack Damage may emit exact prevention details for live listener dispatch while preserving the existing aggregate prevention-history marker used by prior-turn event formulas. Adding exact listener evidence must not delete or redefine historical query evidence.

## 264 — attachment-scoped one-use Relic effects live on the Relic instance
A frozen continuous effect whose limit is `scope: attachment / owner: attachment` stores consumption on the exact attached Relic instance and consumes only after the effect actually prevents damage. It is not a turn flag and must not be recreated as a Match helper.

## 265 — Relic card-instance counters live on the source card instance
A Tactic counter declared with `owner: "card_instance"` is read and mutated on that exact Tactic/Relic instance. Creature flags are not a valid substitute for attached-card counter ownership.

## 266 — Event Listener owns damage-prevented listener orchestration
The generic Event Listener owns `damage_prevented` predicate evaluation, listener limits, card-instance counter steps, IF branching and the act of scheduling later work. It does not own physical Relic removal or attack-damage arithmetic.

## 267 — after_attack_finished timing belongs to Scheduled Action
`SCHEDULE_SOURCE_DISCARD` creates server-owned lifecycle work in the existing Scheduled Action owner. Event Listener does not create an ad-hoc timing queue, and Match does not encode a card-specific delayed-discard flag.

## 268 — physical attached-Relic removal belongs to Relic
The scalar `attached_relic` slot is specialist Relic state. Exact attached Relic -> discard mutation, uniqueness checks and destination collision preflight belong to the Relic owner rather than forcing Card-Zone to manufacture an array facade for the scalar slot.

## 269 — Match only orchestrates the attack-finished boundary
Match converts Attack Damage prevention details into Event Listener events and invokes due Scheduled Action work at the existing attack-completion boundary before defeat scan. It delegates both timing semantics and physical Relic mutation to their owners.

## 270 — Sapstone Charm is the next used-operation reconciliation
The frozen Set One has exactly one `MODIFY_CURRENT_HEAL` consumer, Grove — Sapstone Charm. Heal owner #21 already owns the before-heal predicates, turn-scoped attachment limit, modifier validation/application and pre-HP-mutation packet boundary; capability status may move only after the exact reconciled head remains green.

## 271 — before-heal mutation belongs to Heal #21
`before_heal_packet` amount modification is owned by the canonical Before-Heal / Heal Packet chain. The modifier phase validates listener authority before mutation, applies requested-heal changes before HP mutation, and persists the modified requested amount in the canonical packet. Tactic/Attack/Ability owners emit heal intent; they do not reimplement Sapstone math.

## 272 — capability predicates are accepted only after every frozen consumer is proved
A predicate may be shared across multiple event owners. `heal_packet_source_action_kind_is` is therefore classified implemented only after both Sapstone's before-heal use and Symbiote Essence's after-heal use are proven through their canonical owners. One passing consumer is not sufficient capability evidence.

## 273 — ADD_SHIELD_EACH requires Attack/Tactic parity
Frozen `ADD_SHIELD_EACH` has exactly two Release 1 consumers: Crowncrag's Attack `after_damage` program and Reversal Seal's Tactic IF branch. The Tactic interpreter already executes the operation generically. Capability must remain missing until the Attack consumer is proven through the canonical Attack/Shield owners or repaired without card-ID dispatch.

## 274 — mixed Attack choice programs remain whole-program specialist ownership
A mixed structured Attack program must not be partially executed by a narrow owner. The Crowncrag family is owned as one operation-shaped sequence — source Shield, bounded Creature selection, then Shield-each — while the existing pure `ADD_SHIELD` owner remains whole-program-only and returns compatibility authority for unrelated mixed shapes.

## 275 — optional multi-target Attack choices preflight every selected target before mutation
For a private Attack choice with min/max selection bounds, the resolver must rebind the exact source, current turn, every selected field position and current top-card identity, then re-evaluate declared filters for the complete selected set before mutating any selected target. A stale later selection must not leave an earlier selected target partially mutated.

## 276 — ADD_SHIELD_EACH parity shares one Shield mutation owner
Release 1 `ADD_SHIELD_EACH` is implemented only when both frozen consumers are proven: Crowncrag through the Attack shield-choice specialist and Reversal Seal through the Tactic interpreter. Both paths delegate actual Shield mutation and the 60-Shield cap to `addRuntimeShield`; neither path owns an alternate cap or card-specific Shield rule.

## 277 — damage-packet operation truth is narrower than shared predicate truth
Heatguard Bracer's `MODIFY_CURRENT_DAMAGE_PACKET` may be reconciled from Damage owner #20 once its exact before-damage contract is proven. Shared `damage_packet_*` predicates must not be promoted from Heatguard evidence alone when other frozen consumers, including after-damage listeners such as Thorn Crown, still require separate owner evidence.

## 278 — current damage-packet mutation belongs to Damage owner #20
`MODIFY_CURRENT_DAMAGE_PACKET` is packet-local mutation owned by the canonical Damage Packet Listener before HP/Shield application. It validates the current packet listener, applies bounded delta semantics, records modification evidence and consumes the declared listener limit. Match/Tactic/Attack owners must not independently subtract Heatguard values.

## 279 — operation capability and predicate capability may close independently
A used operation can be accepted while predicates that happen to appear in the same consumer remain missing. Shared predicates must be proven across every frozen consumer and event timing before they move to implemented; operation evidence must not be stretched into unrelated predicate acceptance.

## 280 — voluntary Withdrawal cost listeners must sit before Payment
A `before_voluntary_withdrawal_cost` listener, if implemented, must modify the canonical payable Withdrawal cost before exact attached-Essence payment preflight/commit. It must not alter Payment Engine semantics, bypass the once-per-turn Withdrawal gate or create a second Atomic Switch/transaction owner.

## 281 — voluntary Withdrawal current-cost listeners sit between Withdrawal and Payment
Withdrawal computes the canonical base cost first. A synchronous `before_voluntary_withdrawal_cost` Event Listener may then modify only the packet-local payable cost. Payment receives that resolved integer and keeps exact attached-Essence ownership. Atomic Switch remains downstream and unchanged.

## 282 — action projection may execute mutable listener logic only on cloned match state
If authoritative UI projection needs the same once-per-turn listener semantics as a command, the projection must run the canonical resolver against `structuredClone(state)` or an equivalently isolated copy. Read-only projection must never consume receipts, listener limits, event history or card-instance state in the authoritative match.

## 283 — current-cost opcode grammar must not grow beyond frozen data
`MODIFY_CURRENT_WITHDRAWAL_COST` currently owns only `delta` and `minimum` in Release 1. Runtime validation must fail closed on undeclared fields rather than silently inventing future semantics. Future card grammar may extend this through an explicit master-plan revision, not accidental permissiveness.

## 284 — Pilot Sera is the next partial-operation reconciliation target
The frozen Release 1 has exactly one `SET_ATTACK_ELIGIBILITY` consumer: Gale — Pilot Sera. Existing Tactic runtime writes a turn-scoped final-Vanguard anchor and Match already checks that anchor before Attack. V2.4.91 may move the capability from partial only after exact `controller_turn / only_final_vanguard_may_attack` grammar, repeated-switch final-anchor behavior and turn expiry/reset are proven end-to-end.



## 285 — Attack Eligibility is a shared Attack owner, not Tactic or Match policy
`SET_ATTACK_ELIGIBILITY` grammar, final-Vanguard anchoring, turn validity and declaration block reasons belong to one shared Attack Eligibility owner. Tactic may install the frozen rule and Match may query it, but neither owns a second interpretation of the lifecycle state.

## 286 — final-Vanguard eligibility binds Creature identity rather than one card face
Pilot Sera's final-Vanguard rule follows the current Vanguard Creature stack identity. Evolving that Creature in place must not invalidate the rule, while switching to a different Creature in the same controller turn must block Attack.

## 287 — controller-turn Attack Eligibility expires by turn authority
A `controller_turn` Attack Eligibility receipt is valid only for its recorded controller and `turn_seq`. Turn advancement expires it semantically; browser projection must not recreate or extend it.

## 288 — SET_WITHDRAWAL_MODIFIER must have one lifecycle owner
Release 1 uses `SET_WITHDRAWAL_MODIFIER` from multiple producer families. Event Listener, Tactic and Ability code must not each mutate `lifecycle_withdrawal_cost` independently. V2.4.92 must centralize installation/evaluation under Withdrawal lifecycle ownership while preserving the existing Payment and Atomic Switch owners.

## 289 — Withdrawal modifier duration and source semantics are gameplay state
Frozen withdrawal modifiers include end-of-turn, controller-aftermath and target-controller-aftermath boundaries, one-use declarations, source-aware caps and formula amounts. These semantics cannot be reduced to a same-turn scalar or presentation helper; they must be represented and consumed by the canonical server-side lifecycle owner.


## 290 — Withdrawal modifier producers delegate; they do not own lifecycle state
Triggered Event Listener programs and Tactic programs may request `SET_WITHDRAWAL_MODIFIER`, but one shared Withdrawal-modifier owner validates and stores the structured lifecycle record. Producer families must not create parallel scalar flag semantics for v0.2 cards.

## 291 — one-use Withdrawal modifiers are consumed by legal declaration authority
A `max_uses` modifier with `consume_on: legal_voluntary_withdrawal_declared` is consumed only by the authoritative legal Withdrawal declaration path. Presentation projection uses cloned state. A later Payment or Atomic Switch failure cannot persist that request-local consumption.

## 292 — Withdrawal increases respect canonical source immunity
A structured modifier that would increase a target's Withdrawal cost must pass the existing continuous `withdrawal_increase_immunity` owner. Source category is evaluated from the target's perspective; an opposing card effect cannot bypass Granite-style immunity by entering through a new producer route.

## 293 — target-controller aftermath expiry happens at Aftermath start
A modifier declared to expire on `target_controller_aftermath_started` remains valid through the target controller's playable turn and is removed when that controller's Aftermath begins. Match projection and turn-number heuristics must not expire it earlier.

## 294 — HEAL_EACH capability requires all four frozen execution surfaces
`HEAL_EACH` remains partial until Verdantusk Attack, Elderbloom active Ability, Marevault after-damage-finished Attack and Reef Medic Olan Tactic all execute through canonical Heal/Heal Packet/listener ownership. Existing Attack/Tactic success cannot be stretched into Ability or after-damage-finished acceptance.


## 295 — HEAL_EACH is Heal Packet/listener semantics, not a second Heal engine
Attack, active Ability, mixed Attack programs and Tactic may each orchestrate `HEAL_EACH`, but every physical heal mutation must pass through the canonical Heal Packet owner and every emitted packet must preserve the canonical after-heal listener boundary.

## 296 — multi-target HEAL_EACH preflights the complete selected set
Before a multi-target HEAL_EACH mutates the first target, the resolver must rebind every selected Creature against current field position, current top-card identity and declared filters. A stale later target must fail the choice before any earlier selected target is healed.

## 297 — mixed after-damage-finished Attack programs preserve operation order across listeners
A mixed program such as Essence movement -> HEAL_EACH -> optional switch may pause for player choice and nested listeners, but its declared operation order is authoritative. Movement Listener completes before heal selection; Heal Listener completes before later switch; resume receipts are server-owned.

## 298 — mixed Attack choices reuse the generic private server choice transport
A new structured Attack program may emit the existing server-owned `pending_attack_choice` shape with min/max/options. The Battle client renders and submits that generic choice state; it does not identify Marevault or decide program rules.

## 299 — after-damage-finished specialists cannot compete with ordinary after_damage owners
The V2.4.93 mixed Attack owner claims only its exact frozen `after_damage_finished` operation family and returns null when ordinary `after_damage` is non-empty. Future cards with both families require an explicit master-plan ownership revision rather than accidental double execution.

## 300 — SELECT_CARDS is the next cross-surface selection-unblocker
Frozen Release 1 has seven `SELECT_CARDS` consumers across Event Listener, Attack, active Ability and Tactic surfaces. Event Listener and the Myceliarch Attack specialist already own their families; V2.4.94 must close missing active-Ability/Tactic selection transport generically before dependent Essence-attachment programs can be completed.

## 301 — SELECT_CARDS selection authority is not Card-Zone mutation authority
`SELECT_CARDS` owns server-private legal option generation, min/max validation, selected identity/zone revalidation and variable binding. Any later physical zone mutation remains with Card-Zone or the specialist owner invoked by the following operation.

## 302 — active-Ability SELECT_CARDS may be a staged private continuation
A sequential active Ability may pause first for a private card selection and then for a later Creature selection. Each stage must have its own current server choice identity so reconnect/stale submissions cannot reuse a prior stage. Browser code renders the server choice; it does not own legality or variable binding.

## 303 — selected hidden card identity is server-private across continuation boundaries
A `SELECT_CARDS` result may bind a hidden card instance for a later operation, but public match receipts may expose only structural outcome such as selected count and already-public field position. Selected hidden-zone UID/card ID and private anchor identities must stay inside server state/private views.

## 304 — effect attachment state has one normalization owner
When an Event Listener, Ability or later Tactic attaches Essence with effect-defined attachment disposition/lifecycle metadata, producers must delegate normalization to the shared attachment-state owner and physical attachment to the canonical Essence Attachment route/engine. Producer families must not invent parallel borrowed/temporary attachment semantics.

## 305 — SELECT_CARDS capability cannot close on active-Ability evidence alone
The V2.4.94 active-Ability sub-slice is accepted on exact head `d88af8f3a1047c38a8935974709c6a6389f43be4` with Card Pass #1496 SUCCESS, but `SELECT_CARDS` remains missing until the frozen Tactic consumers Forager Nia and Quickcharge Cell also have canonical private selection/resume ownership. Event Listener and Attack evidence remains preserved rather than reimplemented.

## 306 — Tactic SELECT_CARDS owns selection and binding, not later mutation
The remaining V2.4.94 Tactic route must own legal option construction, min/max choice validation, current-zone/card revalidation and variable binding. Any following `MOVE_CARDS`, `ATTACH_ESSENCE_FROM_ZONE` or other physical mutation remains delegated to its canonical engine/specialist. Completing selection transport must not create a second Card-Zone or Essence Attachment owner.

## 307 — optional SELECT_CARDS binds an empty set, not a fake card
When declared minimum is zero and no legal option exists—or the controller legally chooses zero—the selection owner binds an empty server-side set and advances. It must not fabricate an identity, perform a zone mutation or manufacture an attachment.

## 308 — player-chosen card order is a separate private continuation
A later `MOVE_CARDS ... order: player_choice` over a selected hidden set receives a fresh server choice identity. The order choice validates the exact same selected instances and then delegates physical movement to Card-Zone. Selection ownership must not become ordering/movement ownership.

## 309 — cards-bound Essence attachment consumes the selected ref without a second selection prompt
When `ATTACH_ESSENCE_FROM_ZONE` references a prior `SELECT_CARDS` variable, the Tactic/Ability orchestrator rebinds that exact current card ref and sends it to canonical Essence Attachment ownership. It must not ask the player to select the same Essence again or move the card itself.

## 310 — SELECT_CARDS closes only as one all-surface operation contract
V2.4.94 is accepted only because Event Listener, Attack, active Ability and Tactic together cover all seven frozen Release 1 consumers. The shared Card Selection module owns legality/revalidation/binding only and is a submodule of existing owner families; canonical owner-family count remains 40.

## 311 — APPLY_CONDITION is the next Release 1 condition closeout target
The frozen 193-card inventory contains exactly 20 `APPLY_CONDITION` operation uses, the largest remaining used missing opcode after V2.4.94. V2.4.95 must freeze every exact condition/target/mode/timing shape before source changes, then route application through Condition owner #19. Producers may sequence the operation but must not create a second condition-state owner or owner #41.

## 312 — V2.4.94 exact acceptance
All-surface source/runtime + release-control accepted at `795a9e94da7e5eadedf41c653fed3cc44be8c8e5` with Card Pass #1502 SUCCESS; capability/control accepted at `ff6af2fde6029158eb63c74df01b4232412f94e3` with Card Pass #1503 SUCCESS. Match closure is 108 / `26a48f4d98d62d22010bc1a79616c0dce7b12899e1f7ca93070fd2294ab7d286`; Tactic closure is 45 / `ea17df9e55af4e18d80585113fe73045321d70d60b2d6c6160880a9c18bfb5d6`; `SELECT_CARDS` is implemented; production was not changed.

## 313 — APPLY_CONDITION stays inside Condition owner #19
The frozen Release 1 `APPLY_CONDITION` gap is producer-routing parity, not missing condition-state semantics. Condition owner #19 remains the sole authority for names, slot legality, immunity, temporary protection, application mode and lifecycle state. Event Listener, Attack and Tactic may sequence an application but must not own parallel condition mutation.

## 314 — triggered Ability condition producers are Event Listener consumers
Cindercrest, Veiljaw, Umbraspider and Sparkmoth use triggered Ability events and therefore execute through the generic Event Listener family. V2.4.95 must not invent an Active Ability route for them.

## 315 — source-aware condition protection is part of structured APPLY_CONDITION
A structured card-effect condition application with known source/controller/target context must use the context-aware Condition owner so temporary card-effect protection can be consumed correctly. The legacy context-free adapter remains only for compatibility callers whose source context is genuinely unavailable.

## 316 — after_attack_finished condition timing is distinct from after_damage
Aeralith — Storm Shepherd applies Blinded to the current opposing Vanguard only after the Attack's optional switch sequence is finished. The runtime must preserve this declared phase; ordinary after_damage condition ownership cannot execute it early.

## 317 — after-attack-finished specialists remain disjoint
The Marevault four-step `after_damage_finished` specialist remains exact to its Essence-move / HEAL_EACH / optional-switch family. Aeralith condition timing requires a separate operation-shaped subroute under Attack owner #14, not a permissive widening of the Marevault parser.

## 318 — structured condition producers must carry source identity when it exists
Event Listener, Attack and Tactic structured producers now supply controller, target, active-seat and source-action context to Condition owner #19. The context exists to evaluate protection and provenance; it does not transfer condition-state ownership to the producer.

## 319 — after_attack_finished Condition application targets live battlefield state
Aeralith's Blinded effect resolves against the current opposing Vanguard after its optional switch sequence and all emitted Movement/Heal listener work has completed. The target is rebound at that declared timing boundary rather than captured early during primary damage.

## 320 — APPLY_CONDITION Release 1 parity is accepted
All 20 frozen uses are covered across 6 Event Listener, 12 Attack after_damage, 1 Attack after_attack_finished and 1 Tactic consumer. `APPLY_CONDITION` is implemented at capability blob `702e41f5f72ead9cc17abb4290bfec11f0aa664c`. Final exact-head Card Pass #1513 is green at `2b09549535ab7df9dd25a57e5e139400fd8dd48f`.

## 321 — OPTIONAL is consent/resume ownership, not nested-effect ownership
V2.4.96 targets the 19 frozen Release 1 `OPTIONAL` uses. OPTIONAL may own whether the player accepts/declines and the deterministic resume point. Every accepted nested step must still execute through its existing semantic owner (Switch, Card-Zone, Condition, Withdrawal, Movement, Tactic destination, or other relevant engine).

## 322 — V2.4.95 release-control state
Match closure is 109 / `0eab3c83084c2ee60230be602cf22e1e5b451b713ad9655838008b9300c105c0`; Tactic closure is 45 / `c8ffe22b77007b382e7ae2897dc9c01fb31d668489a700a5c0ceb97145cd8ed2`; owner-family count remains 40; no production deployment or main merge occurred.

## 323 — OPTIONAL owns consent and resume only
The Release 1 OPTIONAL operation owns whether the declared player accepts or declines and where the structured program resumes. It does not absorb the semantic owner of nested steps. Accepted Switch, Card-Zone, Damage, Draw/discard, Condition, Withdrawal and destination operations continue to use their existing owners.

## 324 — ordinary Attack OPTIONAL switches must use server-owned choice state
The six frozen ordinary Attack OPTIONAL switch programs must not depend on browser-supplied `switch_reserve_index` or effect-text parsing. The server creates the legal current Reserve options, records source/turn anchors and resolves accept/decline through the canonical pending Attack choice transport.

## 325 — OPTIONAL decline is a first-class legal result
For a bounded optional Attack switch, declining performs no Atomic Switch and emits no movement events. The Attack then completes through the same defeat/Aftermath continuation as any other resolved post-damage choice.

## 326 — accepted OPTIONAL switch still belongs to Atomic Switch
OPTIONAL/Attack-choice code may select and revalidate the Reserve target, but the battlefield mutation remains Atomic Switch. Movement Listener and any resulting Heal Listener work must finish before Attack completion.

## 327 — OPTIONAL Attack filters remain data
The generic Attack OPTIONAL switch route must honor the nested SELECT_CREATURE filters from frozen card data, including element filters such as Aeralith's Gale-only Reserve selection, without card-ID/name dispatch.

## 328 — legacy Attack switch compatibility is not structured authority
Legacy effect-text / caller-supplied switch-index handling may remain for legacy snapshots, but once a structured OPTIONAL switch program is claimed by the canonical Attack choice owner, that structured attack must not also execute the legacy switch path.

## 329 — OPTIONAL ordinary Attack consent is a server choice, not a request parameter
The six frozen ordinary Attack OPTIONAL switches now use the same authoritative pending Attack choice transport as other structured Attack choices. Browser-provided legacy switch indexes are compatibility-only and cannot be structured authority.

## 330 — optional Attack switch filters are rebound at choice creation and resolution
Declared Reserve filters, including element filters, are evaluated from current structured card data. The selected Reserve anchor is rebound before Atomic Switch; no frozen card identity may determine filter behavior.

## 331 — OPTIONAL decline emits no semantic side effect
A legal zero-selection decline advances the Attack completion path without Atomic Switch, movement events or invented listener packets. Consent itself is the entire semantic outcome of the declined OPTIONAL node.

## 332 — OPTIONAL Release 1 parity is accepted
All 19 frozen OPTIONAL uses are covered across 9 Event Listener, 6 ordinary Attack, 3 Tactic and 1 mixed Attack consumer. `OPTIONAL` is implemented at capability blob `0e3dad5932f8511637d36fcd342c7e645944d506`. Final exact-head Card Pass #1520 is green at `3f247763c86a03eb3c8986f409acd5ecc4d8eb16`.

## 333 — OPTIONAL release-control state
Match closure is 109 / `8a29ec22c8b6db539c6f0bae4f4c2ce0301b0e411bee7d44c493e6cf804637b6`; Tactic closure remains 45 / `c8ffe22b77007b382e7ae2897dc9c01fb31d668489a700a5c0ceb97145cd8ed2`. Owner-family count remains 40 and production was not changed.

## 334 — INSPECT_ZONE is the next largest remaining used operation gap
After V2.4.96, the frozen 193-card scan contains exactly 13 `INSPECT_ZONE` uses, ahead of CHOOSE_FROM_SET 10, DIRECT_DAMAGE 8 and ATTACH_ESSENCE_FROM_ZONE 7. V2.4.97 must freeze all inspection shapes before source changes.

## 335 — inspection authority is not downstream choice/move authority
`INSPECT_ZONE` may own authoritative sample identity, visibility, ordering and private-view state. A following `CHOOSE_FROM_SET`, `MOVE_CARDS`, search, reward or zone mutation remains delegated to its own canonical owner.

## 336 — INSPECT_ZONE belongs to existing owner #31
Release 1 inspection parity is a closeout of Card Search / Filter / Inspection owner #31, not a new engine family. Specialized Attack/Ability/Reward/Event routes may orchestrate their declared families, but inspection identity/set semantics remain under owner #31 and no owner #41 is created.

## 337 — inspection never implies physical movement
An inspected card stays in its declared zone unless a later operation explicitly moves or reorders it. Later movement/order belongs to Card-Zone #30; Reward inspection ledger/privacy belongs to Reward #32; visibility belongs to Hidden Information #33.

## 338 — effect-owned-set inspection binds exact provenance
For a controller-private `effect_owned_set` inspection such as Seer Nyx, the server binds exact current card refs plus source zone/owner provenance. A later CHOOSE_FROM_SET may select from that set, but downstream mutation must rebind the exact current cards before Card-Zone movement.

## 339 — Tactic INSPECT_ZONE is the only proven V2.4.97 execution gap
Eleven of the thirteen frozen nodes already execute through bounded Attack, Ability, Reward or generic Event Listener ownership. The current Tactic interpreter has no INSPECT_ZONE branch, leaving only Parallax Window and Seer Nyx to close.

## 340 — Reward and deck-top inspection use different privacy ledgers but one capability
Reward inspection may reuse the existing Reward inspection ledger/private view. Deck-top inspection uses hidden-information/private inspection state. Capability parity is accepted only when both source-zone families obey the same declared selection/visibility/return-policy contract without leaking identities publicly.

