# CHECKPOINT - Web Builder Global Rail + Logo + Inbox Pass V7.12.299.7

Date: 2026-06-15

## Status

PASS / LOCK THIS SUCCESS.

This checkpoint records the Web Builder pass where the shared Web Builder header rail, Web Builder-only logo/avatar projection, and Web Builder inbox bridge were corrected enough to become the global Web Builder standard.

This is a Web Builder checkpoint only. It is not an `index.html` promotion, not a main Stream Bandit app shell rewrite, and not a Supabase schema/storage policy change.

## Core decision now locked

The Web Builder mini app now has its own global navigation pattern:

- One shared Web Builder header rail.
- One shared Web Builder route/search bar.
- One Web Builder-only avatar/logo projection.
- One lightweight Web Builder messages overlay route.
- One full app-synced Form Inbox route preserved for real form-submission management.

The shared rail must now be placed on every current Web Builder page that belongs to the builder workspace.

## Two global fixes to roll across every Web Builder page

### Fix 1 - Shared scrolling Web Builder rail on every page

The accepted rail is the horizontal scrolling Web Builder header rail now owned by:

`web-builder-global-projector-v7-12-263.js`

Current projector version:

`V7.12.299.7 Web Builder Centered Avatar Logo`

The rail contains the Web Builder route set:

- Back
- Hub
- Pages
- Web Builder
- Preview
- Menu
- Form
- Inbox
- Assets
- Route Map
- Control Map
- Source Map
- Header/Footer
- Manifest

The rail must be the Web Builder global navigation pattern. It replaces scattered/duplicated local top buttons on builder pages.

Important UX note to keep on pages where helpful:

`Scrolling Web Builder menu tabs: swipe or scroll the rail left/right to see every Web Builder page.`

### Fix 2 - Web Builder-only uploaded logo/avatar projection

The Web Builder logo/avatar source of truth for this pass is the uploaded Web Builder asset:

`https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/builder/assets/landing/1781530205862-1e5978b2-android_chrome_192.png`

This image must project only inside Web Builder surfaces:

- top-left header avatar `.mark`
- shared Web Builder rail avatar
- hover/account panel avatar
- hover/account panel logo
- Web Builder favicon/apple icon

The fix changed the logo fit behavior from cropped `cover` to centered `contain` for the header/rail/panel image boxes. This prevents the stag antlers/old background-looking crop from peeking at the bottom of the header avatar frame.

Stream Bandit app branding is untouched.

## Verified successes recorded in this pass

### Web Builder Account Control Hub

Route:

`web-builder-account-control-hub-v7-12-263-test.html`

Current visible version after pass:

`V7.12.299.3`

Result: PASS.

Verified behavior:

- Hub opens properly.
- Hub now loads the shared Web Builder rail.
- Hub shows the scrolling menu tabs note.
- Hub keeps personal workspace lock behavior.
- Platform owner workspace opens.
- No `sort_order` column required.
- No `page_type` column required.
- No schema/storage/index promotion.

### Shared rail projector

Route/script:

`web-builder-global-projector-v7-12-263.js`

Current version after final logo fit pass:

`V7.12.299.7 Web Builder Centered Avatar Logo`

Result: PASS.

Verified behavior:

- Rail works on phone first.
- Rail is horizontally scrollable.
- Rail keeps Web Builder route navigation in one place.
- Current slug is preserved in builder route links.
- Search stays attached to the Web Builder rail.
- Header avatar/rail avatar/panel avatar use the uploaded Web Builder logo.
- Logo is centered and contained instead of cropped low in the avatar frame.
- Broken/stale local logo state is overridden by the uploaded asset.

### Web Builder inbox bridge / messenger overlay

Route:

`web-builder-form-inbox-owned-v7-12-258-test.html`

Current passed behavior:

`V7.12.263.21 Web Builder Footer Messenger Overlay Replica`

Result: PASS.

Verified debug from Trevor:

- `iframe: false`
- `formSubmissionClone: false`
- `leakingSubmissionCards: false`
- `appGlobalFooterInjected: false`
- `webBuilderShell: true`
- `shellsRemainSeparate: true`
- `ownerOnlyGate: false`
- `creatorGrowthBlockedHere: false`
- `overlayTabs: Inbox, Sent, New Message, Friends, Blocked`
- `tables: sb_private_messages, sb_profiles, sb_user_friends, sb_user_blocks`
- `fullFormInboxStillOwnsSubmissions: true`
- `messagesLoaded: 25`
- `friendsLoaded: 1`
- `blocksLoaded: 0`
- `lastError: ""`

Correct interpretation:

- This is the lightweight footer-style messenger overlay rebuilt inside Web Builder.
- It is not a duplicate form submissions inbox.
- It is not an iframe.
- It does not inject the main Stream Bandit footer shell into Web Builder.
- The real full Form Inbox remains the proper form-submission management route.

### Real full Form Inbox route remains preserved

Route:

`web-builder-form-submissions-v7-12-94-test.html?page=<slug>`

Current rule:

- Preserve this route.
- Do not replace it with a clone.
- It remains the full form-submission manager.
- It remains the proper place for full submissions/inbox management, CSV/export, reply history, sent/outbox, spam/trash and soft status flows.

## Kayleigh / Creator Growth restriction state

This checkpoint intentionally does not finish the deeper Kayleigh restriction model.

Current pass only locks that:

- Kayleigh / Creator Growth successfully passed Form Designer solid-state flow earlier.
- Kayleigh real submit passed earlier.
- Kayleigh should not be blocked from Web Builder-only messenger overlay just because a menu group was previously owner-only.
- The correct later work is to organize Web Builder role/menu restrictions cleanly after the global rail and route pattern is stable.

Next restriction work should be separate and deliberate:

- Creator Growth should see their own Web Builder workspace/pages/inbox tools.
- Platform owner remains the all-workspace override.
- Admin role alone must not expose other private Web Builder workspaces.
- The route/menu grouping must not hide core Creator Growth Web Builder tools just because they originally lived under an Owner menu group.

## Hard no-change guarantees from this checkpoint

- No `index.html` promotion.
- No app registry promotion.
- No Stream Bandit global footer injected into Web Builder.
- No Supabase schema changes.
- No Supabase RLS changes.
- No storage bucket policy changes.
- No storage writes from the projector.
- No delete-file actions.
- No `web-builder-live-studio-v7-12-116.js` edits.
- No `web-builder-protected-page-v7-12-265.js` edits.

## Global rollout rule from here

Every Web Builder page should either already load or be upgraded to load:

`web-builder-global-projector-v7-12-263.js`

The shared projector now owns:

- global Web Builder rail
- global route search
- Web Builder-only logo/avatar projection
- shared hover/account panel
- duplicate local Studio top-button suppression

Do not rebuild the rail separately inside each page unless the page is a preserved legacy reference route.

## Current global Web Builder route set

Primary routes:

- `web-builder-account-control-hub-v7-12-263-test.html`
- `web-builder-pages-manager-owned-v7-12-256-test.html`
- `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>`
- `web-builder-preview-owned-v7-12-257-test.html?page=<slug>`
- `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>`
- `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>`
- `web-builder-assets-v7-12-252-test.html?page=<slug>`
- `web-builder-route-map-v7-12-252-test.html?page=<slug>`
- `web-builder-control-map-v7-12-253-test.html?page=<slug>`
- `web-builder-pages-source-map-v7-12-255-test.html?page=<slug>`
- `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>`
- `WEB-BUILDER-MANIFEST-V7-12-252.md`

Real full app-synced form inbox:

- `web-builder-form-submissions-v7-12-94-test.html?page=<slug>`

## Resume order

1. Verify the shared rail and centered Web Builder logo on Hub, Studio, Pages, Preview, Menu, Form, Inbox, Assets, Route Map, Control Map, Source Map and Header/Footer.
2. Add the shared projector script to any Web Builder page that does not yet show the accepted rail.
3. Remove/hide duplicate local top-page button rows where the shared rail makes them redundant.
4. Only after global rail verification, begin the separate Kayleigh/Creator Growth role/menu restriction pass.

## Final checkpoint sentence

Web Builder global rail, Web Builder-only uploaded logo projection, and lightweight Web Builder messenger overlay are now passed and should become global across Web Builder pages.
