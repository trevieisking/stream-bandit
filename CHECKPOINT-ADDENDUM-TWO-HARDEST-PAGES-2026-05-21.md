# Stream Bandit Checkpoint Addendum — Two Hardest Pages Cleared

Date: 2026-05-21

Correction / emphasis for the bedtime checkpoint:

The two hardest pages cleared in this session were:

1. Web Builder
2. Supabase Library

## Web Builder was a hard page

Web Builder was not just a normal page route. It involved:

- custom page layout storage in `sb_site_pages.layout_json`
- form block structure
- structured form question editing
- the separate public form submit flow
- the `sb_form_submissions.answers_json` table shape
- menu route connection
- keeping existing Web Builder pages useful and protected

Passed Web Builder files/routes from this session:

- `web-builder-full-edit-lock-v7-8-6-test.html`
- `web-builder-form-save-v7-6-7-test.html`
- `web-builder-admin-shell-v6-57-test.html`

Important result:

- The Web Builder form editor now keeps question label, type, required/optional and options together.
- Form submit now saves the full answers object into `sb_form_submissions.answers_json`.
- The menu Web Builder route now opens the passed V7.8.6 builder.

## Supabase Library was also a hard page

Supabase Library was the other hard page because it contains real editor tools:

- movie create/edit
- poster upload
- REST save
- verify-read
- hide/delete-from-library
- Details / Player 1 / Player 2 routes
- Player 2 queue carry
- global account/avatar/theme requirements

Passed Supabase Library route:

- `supabase-library-browse-shell-v6-43-test.html`

Now opens:

- `supabase-library-clean-editor-v6-93-3-test.html`

## Standing lesson

Do not understate Web Builder. It is one of the hard protected systems along with Supabase Library.

Both must stay on the project map for future checks:

- Web Builder
- Supabase Library
- Favourite Tools

The rule remains: after a page passes, connect/check its menu route before moving on.
