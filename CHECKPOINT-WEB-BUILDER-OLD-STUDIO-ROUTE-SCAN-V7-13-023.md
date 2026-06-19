# Checkpoint: Web Builder Old Studio Route Scan V7.13.023

Date: 2026-06-19

Status: SCANNED / SAFE WRAPPER CONFIRMED / SOURCE HREF CLEANUP QUEUED

Governing plan: `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`

This checkpoint follows the master plan rule: scan first, patch only what fails, do not rewrite working pages, and do not touch Supabase config, schema, RLS, storage, payment, index or Home.

---

## Files scanned

```text
stream-bandit-shell-v6-24.js
web-builder-live-studio-v7-12-116-test.html
web-builder-form-save-v7-12-94-test.html
web-builder-form-submissions-v7-12-94-test.html
```

---

## Result 1 - Legacy shell bridge is already correct

`stream-bandit-shell-v6-24.js` already points the live Web Builder aliases to the current Web Builder Hub:

```text
builder -> web-builder-account-control-hub-v7-12-263-test.html
builderStudio -> web-builder-account-control-hub-v7-12-263-test.html
```

The shell bridge also keeps the old route in the legacy `FIX` map so old URLs resolve safely through the current doorway.

No shell bridge patch required.

---

## Result 2 - Old live studio route is not dead

`web-builder-live-studio-v7-12-116-test.html` is already a safe doorway wrapper.

It does not load the old Studio engine. It redirects/hands off to:

```text
web-builder-account-control-hub-v7-12-263-test.html
```

It preserves the query string and hash.

No wrapper patch required.

---

## Result 3 - Remaining stale source links found

Two owner/support pages still contain source-level hrefs or dynamic href builders pointing at the old route:

```text
web-builder-form-save-v7-12-94-test.html
web-builder-form-submissions-v7-12-94-test.html
```

These are not dead at runtime because the old route wrapper redirects to the Hub, but they should still be cleaned later to remove old route strings from source.

---

## Required route-only cleanup still queued

### `web-builder-form-save-v7-12-94-test.html`

Replace static links:

```text
web-builder-live-studio-v7-12-116-test.html?page=test-page
```

with:

```text
web-builder-account-control-hub-v7-12-263-test.html
```

Replace dynamic builder link construction:

```js
let builder='web-builder-live-studio-v7-12-116-test.html?page='+encodeURIComponent(s)
```

with:

```js
let builder='web-builder-account-control-hub-v7-12-263-test.html'
```

### `web-builder-form-submissions-v7-12-94-test.html`

Replace static link:

```text
web-builder-live-studio-v7-12-116-test.html?page=test-page
```

with:

```text
web-builder-account-control-hub-v7-12-263-test.html
```

Replace dynamic builder link assignment:

```js
$('builderLink').href='web-builder-live-studio-v7-12-116-test.html?page='+encodeURIComponent(s)
```

with:

```js
$('builderLink').href='web-builder-account-control-hub-v7-12-263-test.html'
```

---

## Why this checkpoint does not rewrite the two pages now

Both target pages are long, working, production-like HTML files with real Supabase form and message flows.

The available write path is full-file replacement, not a line-level patch primitive. A careless full-page rewrite would risk losing existing form submission, private message, upload, status, export or debug behavior.

Therefore this checkpoint records the exact route-only replacements and defers the source cleanup until it can be applied as a safe full-file replacement or line-level patch.

---

## Safety status

```text
Runtime old route: safe wrapper to Hub
Shell bridge: already correct
Dead link break: no
Stale source strings: yes, two pages
HTML rewrites performed: none
SQL required: no
RLS change required: no
Storage change required: no
Payment change required: no
Index/Home change required: no
Main App/Web Builder separation: preserved
```

---

## Next step

Continue with the master plan and scan remaining route/link surfaces. Do not rewrite `web-builder-form-save-v7-12-94-test.html` or `web-builder-form-submissions-v7-12-94-test.html` unless the full page can be preserved exactly except for the route strings above.
