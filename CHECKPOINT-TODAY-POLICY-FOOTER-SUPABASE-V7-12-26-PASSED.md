# Stream Bandit Checkpoint - Policy / Supabase / Footer Work V7.12.22 to V7.12.26

Date: 2026-05-23

## Reason for checkpoint

The chat became very long and slow. This file records the full policy/footer/Supabase work completed today so the next chat can continue cleanly without losing the flow.

## User feedback for ChatGPT/OpenAI

Trevor noted that very long chats become slow to type in, slow to load, may boot the user out, and can eventually become difficult to reopen. Trevor suggested a user-choice feature to delete or trim the top/older part of long chat logs while keeping the useful recent work, so the chat can stay fresh and responsive.

## Project rules reinforced today

- No live/index promotion until test pages pass.
- No patching live pages blindly.
- Build new test pages first.
- Use owner rules: one global feature should have one owner page/helper, not duplicated across many pages.
- Public policy pages must stay read-only.
- Admin policy editing must be protected by Supabase Auth + sb_profiles.role = admin + RLS.
- No frontend shared password for real admin/editor protection.
- Normal users must never be able to edit policy/legal pages.
- Global footer/About promotion comes only after reader proof passes.

## Correct public contact email

All policy work should use:

info@chatterfriendsstreambandit.co.uk

This replaced the old Gmail/contact wording in policy pages.

## Existing policy source pages checked/updated

The 7 editable policy source documents were updated to the new contact email:

- sb-policy-terms-eula-v7-11-6-test.html
- sb-policy-privacy-v7-11-6-test.html
- sb-policy-cookies-v7-11-6-test.html
- sb-policy-family-watch-v7-11-6-test.html
- sb-policy-cancellation-refunds-v7-11-6-test.html
- sb-policy-creator-content-v7-11-6-test.html
- sb-policy-accessibility-v7-11-6-test.html

These are editable/admin/solicitor source-style pages, not normal public footer pages.

## Public read-only policy previews created/fixed

The following public read-only preview pages exist and passed Trevor's checks:

- policy-preview-terms-v7-12-22-test.html
- policy-preview-privacy-v7-12-22-test.html
- policy-preview-cookies-v7-12-22-test.html
- policy-preview-family-watch-v7-12-22-test.html
- policy-preview-cancellation-v7-12-22-test.html
- policy-preview-creator-content-v7-12-22-test.html
- policy-preview-accessibility-v7-12-22-test.html

Trevor confirmed these checks passed:

- Each preview opens.
- Correct new email shown.
- Theme/style applies.
- Brand logo appears.
- Search/header works.
- Policy Centre link works.
- Editable source link works.
- No contenteditable area.
- No save/upload/delete/live buttons.
- Draft/legal review warning visible.
- No blank/error page.

## Supabase table setup

Created SQL setup file:

- supabase-policy-documents-v7-12-23.sql

Trevor ran it in Supabase. Table now exists:

- sb_policy_documents

Important table fields:

- id uuid
- slug text unique
- title text
- body text
- status text check: draft / published / archived
- contact_email text default info@chatterfriendsstreambandit.co.uk
- version_label text
- legal_review_required boolean
- updated_by uuid references auth.users(id)
- created_at timestamptz
- updated_at timestamptz

RLS/admin protection design:

- Public can read only status='published' policy documents.
- Admin can read/insert/update/delete.
- Admin check uses sb_profiles.id = auth.uid() and lower(role) = 'admin'.

Seed rows created for:

- terms
- privacy
- cookies
- family-watch
- cancellation
- creator-content
- accessibility

## V7.12.23 admin save proof

Created page:

- policy-admin-save-proof-v7-12-23-test.html

Purpose:

- Admin-only save proof.
- Check Supabase Auth session.
- Check sb_profiles role.
- Load sb_policy_documents.
- Save selected policy only if admin.

Issue found:

- Page could hang on Checking admin access, so it was not clear why editor stayed locked.
- This was not a login failure; other pages stayed signed in.

## V7.12.24 admin diagnostic

Created replacement diagnostic page:

- policy-admin-save-diagnostic-v7-12-24-test.html

Trevor confirmed it passed.

Confirmed by screenshot:

- Page opened.
- Account header showed Stream Bandit Admin.
- Supabase session found.
- User email/id shown.
- sb_profiles row found.
- Profile role = admin.
- Admin access confirmed.
- sb_policy_documents table loaded.
- 7 policy rows loaded.
- Correct new contact email shown for rows.
- Global helpers loaded: Account sync, Avatar, Shared style, Brand logo, Settings bridge.
- No save buttons yet.
- No footer/global promotion yet.

Checkpoint file created:

- CHECKPOINT-POLICY-ADMIN-DIAGNOSTIC-V7-12-24-PASSED.md

## V7.12.25 admin save editor

Created page:

- policy-admin-save-editor-v7-12-25-test.html

Purpose:

- Real protected admin policy save editor.
- Unlocks only after session + profile + role admin + policy table access.
- Loads all 7 rows from sb_policy_documents.
- Allows selecting a policy.
- Allows editing title/status/contact/body.
- Saves selected policy to Supabase.
- Shows preview selected text.
- Keeps footer/global promotion locked.

Trevor confirmed TEST SAVE CHECK passed.

Confirmed:

- Admin editor unlocked.
- 7 policy rows loaded.
- Policy body edited.
- Save to Supabase worked.
- Saved change persisted.
- No public editor access enabled.
- No footer/global promotion yet.

Checkpoint file created:

- CHECKPOINT-POLICY-ADMIN-SAVE-EDITOR-V7-12-25-SAVE-TEST-PASSED.md

Cleanup note:

Trevor added temporary test wording to Accessibility row, including words like:

- hello testing docs
- TEST SAVE CHECK

Before using Supabase rows publicly, remove test wording and save the cleaned body again.

## V7.12.26 public reader proof

Created page:

- policy-public-reader-proof-v7-12-26-test.html

Purpose:

- Public read-only Supabase policy reader proof.
- Reads a published policy row from sb_policy_documents if available.
- Uses safe built-in fallback text while row is draft/unavailable.
- No edit fields.
- No save buttons.
- No admin controls.
- Includes footer-style proof links only on this test page.
- Does not promote footer globally.

Commit for page creation:

- 8bc8eeacb61ac1667e5a58833889cfb61121eeca

Trevor confirmed V7.12.26 passed.

Passed checks:

- Page opens.
- Policy buttons show all 7 policies.
- Terms loads safely.
- Privacy/Cookies/Family/Cancellation/Creator/Accessibility links work.
- No edit fields.
- No save buttons.
- No admin controls.
- Fallback text appears while rows are draft.
- Debug says fallback/no published row.
- Footer proof links work only on this test page.
- No global footer promotion yet.

## Current safe status

The full chain is now proven:

1. Policy preview pages work read-only.
2. Supabase policy table exists.
3. Admin profile/role check works.
4. Admin save editor works.
5. Public reader proof works with fallback while rows are draft.
6. No global footer/About promotion has happened yet.

## Next recommended continuation

Next build should be V7.12.27.

Recommended next step:

V7.12.27 - Policy Reader Published Row Test / Cleanup

Do this before global footer rollout:

1. Remove temporary test text from Accessibility row in policy-admin-save-editor-v7-12-25-test.html.
2. Save cleaned Accessibility row again.
3. Set exactly one safe row, probably Accessibility or Cookies, to status='published'.
4. Open policy-public-reader-proof-v7-12-26-test.html?policy=accessibility or ?policy=cookies.
5. Confirm source changes from fallback to supabase-published.
6. Confirm public page still has no edit/save/admin controls.
7. If passed, create checkpoint.

Then the next build after that should be:

V7.12.28 - Global Footer Policy Links Proof

Purpose:

- Build one global-footer helper/proof page.
- Links should point to the public reader page with ?policy=slug.
- Still test-only.
- No live/index promotion until Trevor passes it.

After footer proof passes:

V7.12.29 - About Page Policy Button Proof

Purpose:

- Add an About page button/section for Policies, Cookies & Agreements.
- Link to public policy reader/Policy Centre as appropriate.
- Test only first.

Only after those pass:

- Consider global footer rollout across shell/pages.
- Consider promoting routes in menu/control tower.
- Consider live/index promotion only after full smoke test.

## Useful URLs

Admin diagnostic:
https://chatterfriendsstreambandit.co.uk/policy-admin-save-diagnostic-v7-12-24-test.html

Admin save editor:
https://chatterfriendsstreambandit.co.uk/policy-admin-save-editor-v7-12-25-test.html

Public reader proof:
https://chatterfriendsstreambandit.co.uk/policy-public-reader-proof-v7-12-26-test.html

Public reader examples:
https://chatterfriendsstreambandit.co.uk/policy-public-reader-proof-v7-12-26-test.html?policy=terms
https://chatterfriendsstreambandit.co.uk/policy-public-reader-proof-v7-12-26-test.html?policy=privacy
https://chatterfriendsstreambandit.co.uk/policy-public-reader-proof-v7-12-26-test.html?policy=cookies
https://chatterfriendsstreambandit.co.uk/policy-public-reader-proof-v7-12-26-test.html?policy=family-watch
https://chatterfriendsstreambandit.co.uk/policy-public-reader-proof-v7-12-26-test.html?policy=cancellation
https://chatterfriendsstreambandit.co.uk/policy-public-reader-proof-v7-12-26-test.html?policy=creator-content
https://chatterfriendsstreambandit.co.uk/policy-public-reader-proof-v7-12-26-test.html?policy=accessibility

## Final note

Trevor said the assistant is improving as the chat goes on, but long chat performance is becoming the blocker. Continue in a fresh chat from this checkpoint if needed.
