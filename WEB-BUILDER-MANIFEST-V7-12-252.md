# Web Builder Manifest V7.13.058

Date: 2026-06-19

Status: WEB BUILDER FINAL SCAN MAP / CURRENT OWNED ROUTES LOCKED / OLD SUPPORT ROUTES KEPT HIDDEN

## Purpose

This manifest tracks Web Builder as its own builder product area inside Stream Bandit.

The Stream Bandit movie/app manifest remains separate.

This file is the working project-memory checkpoint for Web Builder rules, shared Web Builder rails, projectors, Supabase table use, passed pages, old support-route handling and protected boundaries.

## What the full scan taught us

```text
Web Builder is not the Main App shell.
Web Builder has its own owned pages, rails and projector.
Old Web Builder pages are useful support/compatibility witnesses.
Normal user-facing Web Builder links should point to the current owned routes.
Do not delete old support pages blindly.
Do not merge Main App header/footer behavior into Web Builder pages.
```

## Current Web Builder route truth

Current user-facing Web Builder targets:

```text
Web Builder Hub
-> web-builder-account-control-hub-v7-12-263-test.html

Owned Pages Manager
-> web-builder-pages-manager-owned-v7-12-256-test.html

Owned Preview
-> web-builder-preview-owned-v7-12-257-test.html?page=test-page

Form Designer
-> web-builder-form-designer-owned-v7-12-258-test.html?page=test-page

Form Inbox Bridge
-> web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page
```

Core route group:

```text
Hub: web-builder-account-control-hub-v7-12-263-test.html
Pages Manager: web-builder-pages-manager-owned-v7-12-256-test.html
Studio / canvas: overlay-route-truth-machine-v7-12-66-test.html?page=<slug>
Published Full Preview: web-builder-preview-owned-v7-12-257-test.html?page=<slug>
Page Menu Builder: web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>
Header/Footer Builder: web-builder-header-footer-code-v7-12-254-test.html?page=<slug>
Form Designer: web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>
Form Inbox Bridge: web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>
Assets: web-builder-assets-v7-12-252-test.html
Planning Map: web-builder-route-map-v7-12-252-test.html
Control Map: web-builder-control-map-v7-12-253-test.html
Source Map: web-builder-pages-source-map-v7-12-255-test.html
```

## Legacy/support Web Builder routes

These old routes may remain available as compatibility/support/witness pages:

```text
web-builder-live-studio-v7-12-116-test.html
web-builder-pages-manager-v7-12-111-test.html
web-builder-shared-style-preview-v7-12-117-test.html
web-builder-form-save-v7-12-94-test.html
web-builder-form-submissions-v7-12-94-test.html
```

Support-route rules:

```text
Do not delete old useful pages just because they are old.
Do not expose old support routes as normal Web Builder menu items when current owned pages exist.
Patch only user-facing stale links.
Owner diagnostic pages may keep old witness links if they are clearly diagnostic.
```

## Main App and Web Builder separation

Main app and Web Builder stay on separate tracks:

- Main app global header/footer/theme/settings are for the main Stream Bandit app.
- Web Builder global rail/search/avatar/theme/settings are owned by Web Builder pages and the Web Builder engine/projector.
- Do not mix the main app page shell into Web Builder pages.
- Do not replace Web Builder rail/projector behavior with the main app footer/header shell.
- The global footer communications overlay can read the same communication tables, but it must not become the Web Builder page shell.
- Web Builder Form Inbox can show the same communication/submission data, but it must remain a Web Builder page with Web Builder engine rails.

## Current approved Web Builder table map

```text
sb_profiles
sb_site_pages
sb_form_submissions
sb_private_messages
sb_user_friends
sb_user_blocks
```

Approved existing write surfaces:

```text
Owned Pages Manager -> sb_site_pages
Studio / builder engine -> sb_site_pages
Menu Builder -> sb_site_pages.settings_json
Header/Footer Builder -> sb_site_pages.settings_json.web_builder_shell
Form Designer -> existing form/submission/private-message flow
Form Inbox Bridge -> existing private-message and submission-status flow
Published Preview -> sb_form_submissions and existing public image upload flow when form fields require it
```

Not approved by this manifest:

```text
New SQL tables
RLS changes
Storage policy changes
Bucket creation
Payment provider activation
DNS automation
Service-role browser logic
Main App Home replacement
Main App/Web Builder shell merge
```

## Current page status board

| Area | Route | Current status | Writes |
|---|---|---|---|
| Hub | `web-builder-account-control-hub-v7-12-263-test.html` | Current user-facing doorway / visual standard | none expected |
| Pages Manager | `web-builder-pages-manager-owned-v7-12-256-test.html` | Current owned page manager/control centre | `sb_site_pages` |
| Studio | `overlay-route-truth-machine-v7-12-66-test.html?page=<slug>` | Stable builder/canvas route | existing builder engine writes |
| Published Full Preview | `web-builder-preview-owned-v7-12-257-test.html?page=<slug>` | Current full preview route | submissions/uploads only as existing flow allows |
| Page Menu Builder | `web-builder-menu-builder-owned-v7-12-264-test.html?page=<slug>` | Passed menu route | `sb_site_pages.settings_json` |
| Header/Footer Builder | `web-builder-header-footer-code-v7-12-254-test.html?page=<slug>` | Passed shell-data builder | `sb_site_pages.settings_json.web_builder_shell` |
| Form Designer | `web-builder-form-designer-owned-v7-12-258-test.html?page=<slug>` | Passed / preserve | existing form/private-message flow |
| Form Inbox Bridge | `web-builder-form-inbox-owned-v7-12-258-test.html?page=<slug>` | Passed / preserve / Web Builder bridge | existing message/status flow |
| Assets | `web-builder-assets-v7-12-252-test.html` | Existing asset route | existing asset flow only |
| Planning Map | `web-builder-route-map-v7-12-252-test.html` | Read-only planning destination | none |
| Control Map | `web-builder-control-map-v7-12-253-test.html` | Read-only control map | none |
| Source Map | `web-builder-pages-source-map-v7-12-255-test.html` | Read-only source/debug map | none |

## What changed in the final scan pass

```text
Main shell route aliases were cleaned to current owned Web Builder targets.
Header Owner menu no longer exposes old Web Builder support pages as normal Owner items.
Current App Manifest V7.13.058 records final scan results.
Master Must-Follow Plan V7.13.058 records scan lessons.
Fix Memory V7.13.058 records active route truth.
What Changed V7.13.058 records actual changes and deferred work.
Master Audit Sheet V7.13.058 records full route-family audit.
```

## Deferred Web Builder work

```text
Do not delete old support pages yet.
Move/correct Form Inbox into Social later only in a controlled pass.
Clean old witness links inside Owner diagnostic pages only if they cause real confusion later.
Update route registry/access map only after direct source verification proves a user-facing stale route remains.
```

## Final Web Builder decision

```text
WEB BUILDER CURRENT OWNED ROUTES ARE LOCKED.
OLD WEB BUILDER SUPPORT PAGES ARE COMPATIBILITY/WITNESS PAGES.
MAIN APP AND WEB BUILDER STAY SEPARATE.
NO BACKEND OR STORAGE POLICY CHANGE IS APPROVED BY THIS MANIFEST.
```
