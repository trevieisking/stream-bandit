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
- [ ] Dreamglass.
- [ ] Set One Standard/base PNG masters complete: **21/193 -> 193/193**.
- [ ] Astral Standard/base PNG masters complete: **21/24 -> 24/24**.
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
- [ ] Reach Astral Standard/base artwork **24/24**.
- [ ] Confirm the existing Second Sky 60-card starter recipe remains valid at the preview head.
- [ ] Produce/verify Second Sky sleeve, battle coin and deck-box art for the product preview.
- [ ] Build a branch-only Shop preview using real approved Second Sky assets.
- [ ] Build a branch-only **Set One — Season 1** Battle Pass preview using real Set One assets.
- [ ] Keep purchase, price, currency, entitlement, reward-grant and progression values gated to canonical economy/Battle Pass owners.
- [ ] Do not imply that the Battle Pass automatically grants all 193 Set One cards.
