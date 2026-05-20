# Stream Bandit Checkpoint — Supabase Library Repair Context

Date: 2026-05-20

## Trevor project memory

Supabase Library / SBL is one of the two feared pages, alongside Web Builder.

SBL had roughly 15–20 attempts before reaching the current mostly-working state. Web Builder had even more attempts, possibly 30–40. These pages must not be casually patched, wrapped, or rebuilt from scratch without a deliberate repair plan.

## Why SBL is hard

SBL is where movie information starts. It is the source of truth for movie information that later renders across Stream Bandit pages.

SBL has to coordinate several systems at once:

- Supabase SQL / `sb_movies` table fields.
- Supabase auth/RLS permissions.
- Mux/video URL data.
- Supabase Storage artwork/poster uploads.
- Movie metadata used by Home, Library, Search, Details, Player, Genres and other pages.
- Create/edit form fields and field mapping.
- Save verification after writes.

If SBL form saving fails, the issue may be any of these:

- Wrong code field mapping.
- Missing Supabase table column.
- Wrong Supabase column type.
- RLS/policy restrictions.
- Null/empty value mismatch.
- Array/text mismatch for genres/tags/cast fields.
- Upload/storage policy mismatch.
- Mux field naming mismatch.

## Current SBL state

Stable route:

- `supabase-library-browse-shell-v6-43-test.html` -> `supabase-library-clean-editor-v6-93-0-test.html`

Current rule:

- Leave stable V6.93.0 in place until a deliberate repair pass.
- Do not wrapper-patch SBL.
- Do not hand-rebuild SBL casually.
- Failed wrapper V7.4.5 is parked.
- Failed direct rebuild V7.4.6 is parked.

## Known SBL issue

The form/overlay has never worked 100%.

Known symptom from Trevor:

- Saving one field can work.
- Saving more than one entry/field can fail.

This suggests field mapping, data type, REST/PATCH payload, RLS, or table shape needs to be inspected together with the current code.

## Play All rule

SBL should not currently own Play All.

Reason:

- SBL is browse/editor/source-of-truth, not a group-play owner.
- SBL attempted a fake `queue=library` style route and Player 2 failed with `invalid input syntax for type uuid: "library"`.
- Genres worked because it built a real queue payload first.

Current locked rule:

- SBL card Play = Player 1.
- Details = Details V7.3.1.
- Remove Play All from future repaired SBL unless a deliberate real queue-payload feature is designed.

## Future proper repair plan

Do this later, not during normal route/global pass.

Needed inputs:

1. Full current SBL code from `supabase-library-clean-editor-v6-93-0-test.html` or from Trevor if the GitHub file is compressed/awkward.
2. Supabase `sb_movies` table column list or screenshots.
3. Any relevant Supabase Storage bucket/policy screenshots if poster upload is part of the repair.
4. Mux field names currently used in rows.
5. List of old SBL-related test pages, because failed test pages may still contain working fragments.

Repair strategy:

- Build a new full direct file only.
- Preserve all working Supabase reads.
- Preserve poster upload if currently working.
- Preserve/create stronger save verification.
- Replace fragile multi-field save with a clearly mapped, typed payload.
- Log changed fields before save.
- Verify by re-reading the row after save.
- Show a field-by-field debug result.
- Do not promote until Trevor tests create/edit/upload/details/player routing.

## Warning

SBL and Web Builder are not normal pages. They came from many attempts and contain hard-won working pieces. Any future edit should scan for useful fragments across old test pages before changing the stable route.
