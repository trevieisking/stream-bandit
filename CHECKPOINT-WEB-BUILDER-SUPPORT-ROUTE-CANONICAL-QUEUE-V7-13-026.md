# Checkpoint: Web Builder Support Route Canonical Queue V7.13.026

Status: queued because direct helper update was blocked by safety checks.

## Why this exists

The current support pages still contain old Web Builder support links, but the long pages and shell helper include direct Supabase client/config code. Full-file replacement is therefore not the safest path.

The safer plan is to keep the real working flows intact and canonicalize links through shared route helpers or exact route-only edits when safe.

## Confirmed old support targets found

```text
web-builder-live-studio-v7-12-116-test.html?page=test-page
web-builder-pages-manager-v7-12-111-test.html
web-builder-shared-style-preview-v7-12-117-test.html?page=test-page
web-builder-form-save-v7-12-94-test.html?page=test-page
web-builder-form-submissions-v7-12-94-test.html?page=test-page
```

## Current canonical targets

```text
Web Builder Hub:
web-builder-account-control-hub-v7-12-263-test.html

Owned Pages Manager:
web-builder-pages-manager-owned-v7-12-256-test.html

Owned Preview:
web-builder-preview-owned-v7-12-257-test.html?page=test-page

Owned Form Designer:
web-builder-form-designer-owned-v7-12-258-test.html?page=test-page

Owned Form Inbox:
web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page
```

## Scanned source files

```text
settings-platform-control-hub-v7-12-85-test.html
web-builder-theme-studio-controls-v7-8-9-test.html
web-builder-form-save-v7-12-94-test.html
web-builder-form-submissions-v7-12-94-test.html
stream-bandit-shell-v6-24.js
stream-bandit-global-helper-loader-v7-12-126.js
```

## Important safety note

```text
Do not blindly full-rewrite form/save/inbox/support pages.
Do not touch SQL.
Do not touch RLS.
Do not touch storage policy.
Do not touch payments.
Do not touch index or Home.
```

## Attempted but blocked

A full replacement attempt for `stream-bandit-global-helper-loader-v7-12-126.js` was blocked by safety checks. The intended change was route-only and contained no Supabase key, but the platform blocked the write.

A full replacement attempt for `stream-bandit-shell-v6-24.js` was also blocked earlier because that helper contains public Supabase config/key text in the existing source.

## Next safe options

```text
1. Patch only small safe files if full-file content is short and has no direct Supabase config.
2. Prefer registry/access-map canonicalization where possible.
3. Use the old wrapper/canonical maps as runtime protection until direct route strings can be cleaned.
4. Keep this queue in GitHub so the fix does not rely on chat memory.
```
