# Stream Bandit Checkpoint — V7.12.185 Brand / App Icons Pass

Date: 2026-06-02

## Status

Brand / App Icons page passed browser testing after the Settings Sources replacement and witness-image fix.

## Files changed before this checkpoint

### Brand / App Icons page

File:

- `settings-brand-icons-promoted-v7-12-21-test.html`

Commits:

- `b6bd65c2379c19a2b95121e31124bcc1459036f2` — rebuilt Brand / App Icons with current global shell and removed old Settings Sources launcher.
- `73c8215e1c603292cd946ffa6768fb5537d038fd` — fixed broken installed icon witnesses by using current Supabase/global logo helper image instead of old missing root files.

### Header shell already passed before this page test

File:

- `stream-bandit-header-shell-v7-12-156.js`

Commit:

- `3bed5948f0ca9858de459a24daf62196ed8b1f48`

Purpose:

- Removed duplicate-current Owner route entries.
- Restored unique route targets for Platform Control Centre, Brand Image Helper, and Favicon / App Icon Builder.

### Footer shell route rewrite fix

File:

- `stream-bandit-footer-shell-v7-12-156.js`

Commit:

- `cf9c0bdd1f74eab034cd12c849d43f6370c40e8e`

Purpose:

- Stopped footer shell from rewriting Brand Image Helper and Favicon / App Icon Builder back to Brand / App Icons.
- Footer Owner group now uses unique Brand tool routes.

## Browser pass confirmed by user

Tested on Brand / App Icons:

1. Open Brand / App Icons: PASS
2. Witness images show instead of broken image icons: PASS
3. Open overlay: PASS
4. Only Brand / App Icons is Current: PASS
5. Preview image URL box works: PASS
6. Reset Global Logo appears to bring the app logo back; user did not have another image to fully compare, but marked acceptable: PASS

## Page state now

Brand / App Icons is now:

- Own active Owner route.
- No longer showing old Settings Sources wording.
- Running current global header shell.
- Running current global footer shell.
- Using current Supabase/global logo helper for icon witnesses.
- Providing safe preview-only image URL control.
- Not writing to Supabase.
- Not uploading files.
- Not promoting live/index.

## Remaining brand route tasks

Continue one file at a time:

1. Retest/fix `brand-logo-helper-responsive-v7-12-20-test.html` as Brand Image Helper.
2. Then fix `favicon-app-icon-builder-v7-12-15-test.html` as Favicon / App Icon Builder.
3. After both pass, update Registry / Manifest / Index / One Machine counts and create a full detailed brand-route checkpoint.

## Safety rule

Do not touch unrelated page groups until the Brand Image Helper and Favicon / App Icon Builder route pages pass with only their own current marker active.
