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
