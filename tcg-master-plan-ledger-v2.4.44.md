# Stream Bandit TCG V2.4.44 Ledger — Card-Art Upload Ownership

## 021 — Locked material-art loop
The material artwork phase must use this exact sequence for every card:

`generate image -> create GitHub path -> verify path -> give upload package -> Trevor uploads -> verify canonical file -> next card`.

The canonical procedure is stored in `assets/tcg/art-direction/tcg-card-art-upload-loop-v1.md`.

## 022 — Path-before-handoff rule
The assistant owns creation of the GitHub folder/path. Trevor must not be given a card upload link until that folder has been created on the active PR branch and read back successfully.

## 023 — Upload-package contract
Each handoff contains the verified clickable folder link, exact PNG filename, final path, commit message and commit description. The description identifies `card_id`, `printing_id` and `artwork_id`.

## 024 — Canonical-filename repair
Browser/download filenames are not game identities. If GitHub stores a generated filename, the assistant may perform a blob-preserving repository rename to the canonical artwork filename. The image blob must remain byte-identical.

## 025 — Completion semantics
A generated image is not completed artwork. An `UPLOAD-HERE.md` marker is not completed artwork. A commit message is not completed artwork. Completion advances only after the real PNG is verified at the reserved canonical path.

## 026 — Current verified material checkpoint
The canonical repository currently contains verified Standard/base PNGs for Stardot, Orbitail, Cosmarch and Moonbit: **4/193 Set One**, **4/24 Astral**.

The next material card is Comettail.

## 027 — Historical blueprint preserved
V2.4.43 remains the historical 193/193 blueprint checkpoint. V2.4.44 does not rewrite that history; it defines the live material-production loop used to turn reserved identities into actual repository artwork.

## 028 — Release boundary
This workflow is artwork/control-plane only on PR #576. It does not authorize gameplay, database, Supabase, `main`, public Pages, live or production changes.
