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
