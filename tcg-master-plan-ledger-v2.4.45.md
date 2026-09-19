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
Seven canonical Standard/base PNGs are verified: Stardot, Orbitail, Cosmarch, Moonbit, Comettail, Nebulynx and Cometmanta.

Current progress: **7/193 Set One**, **7/24 Astral**.

At this checkpoint the ledger sequence identifies Orbitortoise next, subject to a fresh pre-generation GitHub read.

## 035 — Release boundary
This authority change is artwork/control-plane only. It changes no gameplay engine, rules, database, Supabase deployment, main/live/public release state.
