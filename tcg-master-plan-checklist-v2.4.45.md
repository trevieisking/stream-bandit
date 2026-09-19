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
- [ ] Keep purchase, price, currency, entitlement, reward-grant and progression values gated to canonical economy/Battle Pass owners.
- [ ] Do not imply that the Battle Pass automatically grants all 193 Set One cards.

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
- [ ] Human visual acceptance of Second Sky surfaces.
- [ ] Main/Pages/live release only after inherited end-to-end release gates.
