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
The canonical card face is also the control surface. Active Abilities pulse/glow only while server capability projection says they are usable and stop after use. Attack rows show server-projected readiness/block reasons. Essence attachment remains tap-first on phones: select the card, then a highlighted legal Creature; optional drag is desktop convenience only.

## 061 — Orbitortoise layout applies globally
The Trevor-supplied Orbitortoise image remains the reference structure for all card types/surfaces: identity/HP/type header, large artwork window, readable Ability/Attack/effect area and lower metadata/footer. Missing art uses the same finished frame with an Artwork Pending window so every identity is game-ready before its final PNG arrives.


## 062 — Attached Essence has a visible element-orb rail
Every battlefield Creature exposes its authoritative attached Essence as tiny colored sphere/orb/pip markers attached visually to that Creature. The display exists so players can read resource availability without remembering a hidden count. It is derived from authoritative attached Essence plus structured `provides`; it does not create client-side resource authority.

## 063 — Essence orbs represent effective payable units
The resource rail represents effective Essence units available from attached sources. Element color/glyph comes from the canonical Stream Bandit element identity. Multi-unit providers produce the equivalent visible quantity; constrained layouts may group identical units as `orb ×N` but may not hide the total. The Attack's printed/canonical cost remains visible beside the Attack for direct visual comparison.

## 064 — Essence removal removes its visual resource immediately
Discard, expiry, movement, removal or any authoritative loss of attached Essence removes the corresponding orb contribution on the next authoritative Battle render. The browser may not keep stale attachment pips after the server state changes.

## 065 — Element color never stands alone
Astral, Ember, Gale, Grove, Shade, Stone, Tide and Volt use their canonical element palette, but every Essence orb also exposes the element glyph/mark and accessible text. Resource readability may not depend on color vision alone.

## 066 — V2.4.53 supersedes desktop-only drag in ledger 060
Ledger 060 remains historical evidence for the tap fallback, but its statement that drag is desktop-only is superseded. Phone/tablet now require finger drag/drop **and** retain tap-select -> highlighted destination. Both paths submit the same authoritative server command and legality remains server-owned.

## 067 — Touch drag requires pointer-safe transport
The current coarse-touch Battle client sets playable hand cards to `draggable="false"`, which explains Kay's observed inability to drag on phone. Mobile parity must use a Pointer Events/touch-safe gesture path rather than depending exclusively on native HTML5 drag/drop. It must preserve page scrolling outside an active card drag and must not change the accepted board geometry.

## 068 — Board decoration is a final presentation pass
Trevor/Kay have accepted the Battle layout geometry. Realm/background/table decoration is deliberately deferred until the playable interaction chain has passed: card readability -> attachment -> Attack/damage -> defeat/Reward -> result/quit plus phone drag/drop. Decoration may not alter rules, slots, zones, touch targets or server ownership.


## 069 — Essence overflow collapses to one counted orb per element
When attached Essence would visually crowd a Creature card, repeated units of the same element collapse to **one orb of that element with the numeric count inside it**. Example: twelve Astral units display as one Astral orb containing `12`. If multiple elements are attached, each element keeps its own counted orb (for example Astral `7` + Tide `5`) so type information is never lost.

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
