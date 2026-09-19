# Stream Bandit TCG Progress V2.4.44 — Locked Card-Art Upload Loop

V2.4.44 continues the accepted V2.4.43 Set One blueprint with the material upload workflow now locked as a repository rule.

## Locked production procedure

Authoritative workflow: `assets/tcg/art-direction/tcg-card-art-upload-loop-v1.md`.

For every card:

`generate image -> create GitHub path -> verify path -> give clickable link + exact filename + commit message + description -> Trevor uploads -> verify commit and canonical file -> next card`

No upload link is handed off before the GitHub folder exists and has been read back successfully.

If GitHub preserves the generated/download filename, the assistant must normalize the repository entry to the canonical reserved filename while reusing the same image blob bytes.

## Current material truth

Verified canonical Standard/base PNG masters present on PR #576:
- `astral-stardot`
- `astral-orbitail`
- `astral-cosmarch`
- `astral-moonbit`

Set One material artwork progress: **5/193**.

Astral material artwork progress: **5/24**.

Next card: `astral-nebulynx`.

Comettail is verified at its canonical PNG path. Nebulynx is the next card and is not counted until its GitHub path is created, verified, the image is uploaded, and the canonical PNG path is verified.

## Blueprint truth remains unchanged

- Set One production identities/printing IDs/artwork IDs/paths/briefs: **193/193**
- Production batches mapped: **25/25**
- Final clean client backgrounds approved: **0/8**
- Rarity assignments: **unassigned**

## Release boundary

This is branch-source artwork/control work on PR #576 only.
No gameplay rule, runtime owner, database schema, Supabase deployment, `main`, public Pages, live or production release is changed by this checkpoint.
