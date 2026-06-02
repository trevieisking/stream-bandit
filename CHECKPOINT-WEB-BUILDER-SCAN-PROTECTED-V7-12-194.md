# Stream Bandit Checkpoint — Web Builder Scan Protected V7.12.194

Date: 2026-06-02

## Status

SCAN PROTECTED / NO EDIT MADE.

## Pages/files scanned

- `web-builder-live-studio-v7-12-116-test.html`
- `web-builder-live-studio-v7-12-116.js`
- `web-builder-live-studio-v7-12-106.js`

## Why this was treated as highest risk

Web Builder is one of the hardest and most protected areas of the app. It owns the page-builder workflow and has already required many hours of recovery/preservation work.

A casual clean-shell rewrite could break:

- saved page loading,
- block editing,
- modal editor behaviour,
- custom HTML/code block rendering,
- video/HLS blocks,
- form blocks,
- page selector,
- Save + Publish,
- Supabase row verification,
- published preview routes,
- advanced form and form inbox links.

## Current architecture confirmed

### HTML route

- `web-builder-live-studio-v7-12-116-test.html`

This page is a host/wrapper page. It still has old local header/footer shape and some stale footer links, but it loads the protected V7.12.116 builder repair engine.

### Runtime repair engine

- `web-builder-live-studio-v7-12-116.js`

This is not a full replacement engine. It is a preservation wrapper around the passed V7.12.106 builder.

It runtime-patches only targeted fixes:

- same-window links,
- page selector from V7.12.115,
- long-session save refresh,
- re-read before save,
- save verification,
- publish notice panel with exact status/error.

### Protected source engine

- `web-builder-live-studio-v7-12-106.js`

This remains the base overlay builder engine. It owns:

- block types,
- editor modal,
- preview rendering,
- custom HTML/code block,
- video/HLS handling,
- form blocks,
- Supabase client,
- save/load route functions.

## Decision

No code change was made.

Reason: the Web Builder architecture is deliberately layered for preservation. Rewriting the page for shell polish would create high risk for a working builder workflow.

## Known cosmetic/stale notes not changed

The host page still has:

- old local header/footer markup,
- stale footer route labels such as old Settings Studio / old Preview links.

These were not changed in this pass because they are not proven builder-breaking faults and the global route sanitizer can correct visible route truth at runtime.

## Future safe refit rule

Do not clean-shell Web Builder casually.

If Web Builder is ever refit, it should be handled as a dedicated preservation project:

1. Back up the current V7.12.116 host and repair engine.
2. Prove V7.12.106 base engine still loads.
3. Preserve every V7.12.116 runtime patch.
4. Preserve Save + Publish verification.
5. Preserve page selector.
6. Preserve custom HTML/code blocks.
7. Preserve HLS/video blocks.
8. Preserve form block routing.
9. Test existing saved pages before and after.
10. Only then clean host layout.

## Safety notes

- No Web Builder files were changed.
- No Supabase writes were changed.
- No page-builder schema was changed.
- No custom code block behaviour was changed.
- No published preview behaviour was changed.
- No form routing was changed.

Web Builder remains protected.
