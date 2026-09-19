# Stream Bandit TCG — Locked Card-Art Upload Loop V1

**Authority:** Set One Standard/base artwork production on PR #576.
**Recorded:** 2026-09-19.
**Purpose:** prevent missing folders, dead GitHub links, filename drift, false artwork completion and loss of card-to-art identity.

## Required card-by-card sequence

For every Set One artwork identity, the workflow is exactly:

1. **Generate image**
   - Use the card's locked visual brief and lineage/style rules.
   - Raw art only: no card frame, rules text, rarity label or UI.

2. **Create GitHub path**
   - Before giving Trevor an upload link, create the card's canonical repository folder.
   - The folder may be materialized with an `UPLOAD-HERE.md` marker.
   - The marker records the exact required PNG filename, Card ID, Printing ID, Artwork ID and final path.
   - The marker is not artwork and never counts toward completion.

3. **Verify path**
   - Read the repository folder back from GitHub on the active PR branch.
   - Do not hand off an upload link until the folder is proven to exist and open successfully.

4. **Give the upload package**
   - Provide the verified clickable GitHub folder link.
   - Provide the exact canonical PNG filename.
   - Provide the exact final repository path.
   - Provide the exact commit message.
   - Provide the commit description including Card ID, Printing ID and Artwork ID.

5. **User uploads; assistant verifies**
   - Trevor uploads the generated image to the verified folder and provides the resulting commit SHA.
   - Verify the commit and actual repository file.
   - If GitHub kept a generated/download filename, normalize it repository-side by reusing the exact same blob bytes at the canonical filename and removing the stray filename.
   - Only after the canonical PNG is proven at the exact path may that artwork advance the material progress count.

6. **Next card**
   - Update the progress meter truthfully.
   - Resolve the next card from the locked Set One art-production ledger.
   - Repeat this same loop without skipping a step.

## Non-negotiable invariants

- Canonical identity chain: `card_id -> printing_id -> artwork_id -> repository asset path`.
- One card at a time for the active upload loop.
- No dead-link handoff: create path first, verify second, share link third.
- Generated image names are never canonical game filenames.
- Canonical filename must match the reserved `artwork_id` path exactly.
- Blob-preserving filename normalization is allowed; image bytes must not be silently recompressed or redrawn.
- `UPLOAD-HERE.md` never counts as artwork.
- Generated-but-not-uploaded art never counts as approved/present repository artwork.
- A user commit alone is not enough; the canonical file path must be verified.
- Gameplay rules, stats, attacks, abilities, database state and runtime owners are outside this art-upload loop.
- Rarity remains unassigned unless separately approved by content authority.

## Current material checkpoint

Verified canonical Set One Standard/base PNG masters present:
- Stardot
- Orbitail
- Cosmarch
- Moonbit

Material progress: **4/193**.
Next card in the locked sequence: **Comettail**.
