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

Set One Standard/base PNG masters verified at canonical paths: **12/193**.
Astral verified: **12/24**.

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

The current ledger sequence indicates `astral-star-essence` next, but the workflow requires a fresh GitHub preflight again immediately before its image is generated.

## Rejected-candidate rule

A generated candidate that materially conflicts with the locked brief is rejected before upload and never counted. This is how the incorrect fox-like Cometmanta candidate was handled before the valid celestial manta was accepted.

## Safety / release boundary

No gameplay, runtime, database, Supabase, `main`, public Pages, live or production authority is changed by V2.4.45.
