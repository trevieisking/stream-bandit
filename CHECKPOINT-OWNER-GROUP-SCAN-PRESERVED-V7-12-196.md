# Stream Bandit Checkpoint — Owner Group Scan Preserved V7.12.196

Date: 2026-06-02

## Status

PRESERVATION SCAN / NO BROAD OWNER REWRITE.

## Owner routes reviewed

- `web-builder-form-submissions-v7-12-94-test.html?page=test-page`
- `web-builder-form-save-v7-12-94-test.html?page=test-page`
- `web-builder-live-studio-v7-12-116-test.html?page=test-page`
- `stream-bandit-one-machine-v7-12-73-test.html`
- `settings-platform-control-hub-v7-12-85-test.html`
- `health-check-global-helpers-v7-10-6-test.html`
- `stream-bandit-global-helper-shell-v7-12-126-test.html`
- `settings-brand-icons-promoted-v7-12-21-test.html`
- `brand-logo-helper-responsive-v7-12-20-test.html`
- `favicon-app-icon-builder-v7-12-15-test.html`
- `web-builder-pages-manager-v7-12-111-test.html`
- `web-builder-shared-style-preview-v7-12-117-test.html?page=test-page`

## Decision

No broad rewrite was made.

Reason: Owner group contains several high-risk tools that own real writes or hard-to-recover behaviour. Most visible issues are route-label/footer polish, not broken runtime behaviour.

## Preserved high-risk routes

### Form Inbox

- Reads `sb_form_submissions`.
- Writes private replies/messages to `sb_private_messages`.
- Includes inbox/outbox/spam/trash soft-message handling.
- Has some old visible builder/preview/settings route labels.
- Decision: preserve working message/submission logic; route-polish later.

### Advanced Form

- Loads form blocks from `sb_site_pages`.
- Saves full submissions to `sb_form_submissions`.
- Can upload form image/file answers to Supabase Storage bucket `stream-bandit-images`.
- Has old visible builder/preview/settings route labels.
- Decision: preserve working form/upload/submission logic; route-polish later.

### Web Builder Studio

Already scanned separately as protected:

- `CHECKPOINT-WEB-BUILDER-SCAN-PROTECTED-V7-12-194.md`

Do not rewrite casually.

### Pages Manager

- Owns `sb_site_pages` create/update/hide/restore/permanent-delete behaviour.
- Permanent delete is guarded but still dangerous.
- Has old visible builder/preview/settings route labels.
- Decision: preserve until a dedicated guarded Pages Manager pass.

### Published Preview

- Uses current Builder route `web-builder-live-studio-v7-12-116-test.html`.
- Renders saved builder pages.
- Handles viewer rating blocks and form links.
- Contains one old block-viewer route for a separate block preview path.
- Decision: preserve current main preview flow; block-view route polish later if needed.

## Previously passed/preserved owner routes

### Settings Hub / Platform Control Centre

- Passed V7.12.193/V7.12.194 route and counter tests.
- Current Settings Hub remains the platform-control route for now.

### Route Guard Proof

- Health Check scanned stable in Admin support tools pass.

### Brand / App Icons

- Owner Brand full pass already recorded.
- Brand / App Icons now points separately to:
  - `brand-logo-helper-responsive-v7-12-20-test.html`
  - `favicon-app-icon-builder-v7-12-15-test.html`
- No merge/collapse route issue on the Brand / App Icons page itself.

## Known owner route-map polish tasks for later

### One Machine

One Machine is read-only and mostly current, but its internal ownership map still collapses:

- Brand Image Helper -> `settings-brand-icons-promoted-v7-12-21-test.html`
- Favicon / App Icon Builder -> `settings-brand-icons-promoted-v7-12-21-test.html`

Current route truth should be:

- Brand Image Helper -> `brand-logo-helper-responsive-v7-12-20-test.html`
- Favicon / App Icon Builder -> `favicon-app-icon-builder-v7-12-15-test.html`

Decision: record for later map polish; not a runtime blocker.

### Final Shell Navigation / Global Helper Shell

`stream-bandit-global-helper-shell-v7-12-126-test.html` still uses the older global-helper stack rather than the compact V7.12.196 Live Readiness shell/search proof pattern.

It loads and remains useful as a compatibility witness, but a future dedicated shell-polish pass may refit it closer to Live Readiness if needed.

### Form/Builder route labels

Form Inbox, Advanced Form and Pages Manager still contain some old visible links such as older Web Builder, Settings Studio or Preview route labels.

Because these pages own real write/delete/upload/message flows, route-label polish should be done as a dedicated guarded pass, not by broad rewriting.

## Safety notes

- No Supabase writes were changed.
- No private-message logic was changed.
- No form submission logic was changed.
- No Storage upload logic was changed.
- No `sb_site_pages` create/delete logic was changed.
- No Web Builder engine files were changed.
- No protected shell files were changed.

Owner group is preserved for now. Future work should target one risky owner tool at a time.
