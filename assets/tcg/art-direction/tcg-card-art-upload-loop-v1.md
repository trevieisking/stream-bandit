# Stream Bandit TCG — Locked Card-Art Upload Loop V1.1

**Authority:** Set One Standard/base artwork production on PR #576.
**Recorded:** 2026-09-19.
**Purpose:** prevent stale-memory card selection, missing folders, dead GitHub links, filename drift, false artwork completion and loss of card-to-art identity.

## Required card-by-card sequence

For every Set One artwork identity, the workflow is exactly:

1. **Source-of-truth preflight — MUST happen before image generation**
   - Refresh PR #576 and record the current branch head.
   - Read `assets/tcg/art-direction/tcg-art-production-ledger-v1.json` from that exact active branch.
   - Resolve the next card from the locked batch order / first remaining `artwork_status: missing` identity.
   - Read and bind the exact `card_id`, `printing_id`, `artwork_id`, `target_path` and visual `brief`.
   - Cross-check that the canonical PNG does not already exist at `target_path`.
   - Never choose the next card from conversation memory, model memory, an earlier response, or a guessed sequence.
   - If the ledger, PR head, path state or expected sequence disagree, stop before image generation and repair the control state first.

2. **Generate image**
   - Generate only after Step 1 has resolved the exact source-of-truth card identity and brief.
   - Use the locked visual brief and lineage/style rules.
   - Raw art only: no card frame, rules text, rarity label or UI.
   - Reject a generated candidate if the subject materially conflicts with the locked brief; rejected candidates are never uploaded or counted.

3. **Create GitHub path**
   - After a valid image candidate exists, create the card's canonical repository folder.
   - The folder may be materialized with an `UPLOAD-HERE.md` marker.
   - The marker records the exact required PNG filename, Card ID, Printing ID, Artwork ID and final path.
   - The marker is not artwork and never counts toward completion.

4. **Verify path**
   - Read the repository folder back from GitHub on the active PR branch.
   - Do not hand off an upload link until the folder is proven to exist and open successfully.

5. **Give the upload package**
   - Provide the verified clickable GitHub folder link.
   - Provide the exact canonical PNG filename.
   - Provide the exact final repository path.
   - Provide the exact commit message.
   - Provide the commit description including Card ID, Printing ID and Artwork ID.

6. **User uploads; assistant verifies**
   - Trevor uploads the generated image to the verified folder and provides the resulting commit SHA.
   - Verify that commit and the actual repository file.
   - If GitHub kept a generated/download filename, normalize it repository-side by reusing the exact same blob bytes at the canonical filename and removing the stray filename.
   - Only after the canonical PNG is proven at the exact path may that artwork advance the material progress count.

7. **Synchronize control truth**
   - Update the art-production ledger status/progress truthfully.
   - Update the active master-plan progress/checklist/ledger checkpoint.
   - Do not count generated-only art, upload markers, commit messages or non-canonical filenames.

8. **Next card**
   - Return to Step 1.
   - Re-read GitHub source-of-truth again immediately before the next image generation.
   - Never carry the next-card identity forward solely from memory.

## Non-negotiable invariants

- Canonical identity chain: `card_id -> printing_id -> artwork_id -> repository asset path`.
- GitHub current branch state is the source of truth for the next-card decision.
- Source-of-truth preflight is mandatory before **every** image generation.
- One card at a time for the active upload loop.
- No dead-link handoff: create path first, verify second, share link third.
- Generated image names are never canonical game filenames.
- Canonical filename must match the reserved `artwork_id` path exactly.
- Blob-preserving filename normalization is allowed; image bytes must not be silently recompressed or redrawn.
- `UPLOAD-HERE.md` never counts as artwork.
- Generated-but-not-uploaded art never counts as approved/present repository artwork.
- A user commit alone is not enough; the canonical file path must be verified.
- Rejected image candidates never count and must not be uploaded.
- Gameplay rules, stats, attacks, abilities, database state and runtime owners are outside this art-upload loop.
- Rarity remains unassigned unless separately approved by content authority.

## Current material checkpoint

Verified canonical Set One Standard/base PNG masters present:
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

Material progress: **24/193**.
Astral material progress: **24/24**.
Next source-of-truth candidate at this checkpoint: **Glowcub** — but Step 1 must re-read GitHub again immediately before generating or accepting its image.

Astral Standard/base artwork is now complete at **24/24**.
