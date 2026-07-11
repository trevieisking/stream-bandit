# Code Labs Three-Shell Transfer V145

## Purpose

Transfer the existing Code Labs runtime into three shared, compatibility-first helpers without replacing working pages, removing features, duplicating visible sections, changing the Buddy lane, or mixing Code Labs with Stream Bandit application files.

This plan is based on the V140 Helper Route Map scan dated 2026-07-11. That scan reported 35/35 Code Labs pages reachable and 52/52 seeded assets reachable.

## Non-negotiable rules

1. Preserve every current page, route, field, button, localStorage key, Supabase save path, GitHub handoff, receipt, undo path, and Buddy Canvas feature until its replacement has passed page-by-page tests.
2. Code Labs and Stream Bandit remain separate lanes. This transfer changes only files under `code-labs/` unless a separately reviewed Supabase connector repair is required.
3. Keep Code Labs V104 unchanged.
4. Treat Code Labs Live V107 as a separate connector repair. Do not hide a V107 failure inside the browser-shell transfer.
5. No direct write to `main`. Use branch and pull request workflow.
6. Safe pull requests with no warnings, no unresolved review findings, and passing checks may be merged automatically.
7. Do not delete old helpers first. A helper is removed only after all pages that depended on it pass the replacement runtime and the route-map scan proves that it is no longer referenced.
8. Do not duplicate headers, sidebars, page bodies, footers, Buddy Notes, Sol panels, status panels, or completion panels.
9. Existing helpers are source material. Copy only the required behaviour into the correct shell, keep compatibility globals during migration, and leave the original helper as a fallback until the relevant route group passes.
10. Browser pages still do not write GitHub directly.

## The three helpers

### 1. Header shell

Planned file: `code-labs/assets/code-labs-header-shell-v145.js`

Owns only shared chrome and navigation:

- Code Labs logo and sidebar/header chrome;
- stable workflow route order;
- active-page state;
- Setup placement after Home;
- mobile navigation behaviour;
- shared route labels and icons;
- no page-specific forms or content;
- no Buddy, Sol, Supabase, GitHub write, or footer rendering.

Primary source helpers to preserve and transfer from:

- `code-labs/assets/code-labs.js` shell/navigation portions;
- `code-labs/assets/cl-nav.js`;
- `code-labs/assets/code-labs-setup-route-v145.js`;
- `code-labs/assets/code-labs-workflow-clarity-v130.js` route agreement portions;
- `code-labs/CODE_LABS_MENU_ROUTE_AGREEMENT_V130.md`.

Compatibility requirement: keep the existing `window.CodeLabsStableNav` contract while pages are migrated.

### 2. Page runtime

Planned file: `code-labs/assets/code-labs-page-runtime-v145.js`

Owns the current page body and route-specific feature loading:

- detects `body[data-page]` or the current HTML filename;
- loads exactly the helpers required for that route;
- preserves existing page forms, textareas, buttons, IDs, events, localStorage keys, and Supabase paths;
- preserves current page-specific global APIs;
- never renders a second copy of a section that already exists;
- uses guarded, idempotent helper loading;
- supports pages with inline scripts without overwriting their body.

Page-specific source helpers remain protected until migrated, including:

- File Lab: V13 loader, V38 history save, V39 history label;
- Workflow Hub: V20;
- Patch Lab: V14 Patch Lab and V15 simplify;
- AI Handoff: V15 handoff;
- GitHub Writer: V16 publish prep;
- GitHub Tracker: V17 tracker;
- Fix Wizard: V18;
- Start Guide: V19;
- Repo Desk: V30, V31 and V33 bridge;
- current-file panels and workflow bridges: V32 and V33;
- Home: V36;
- Connector Status: V40;
- FAQ, Help and Checklist Builder helpers;
- Packet Builder route/source-control helpers;
- page polish and dedupe helpers.

Compatibility requirement: all existing route-specific globals and storage keys remain readable until the final cleanup PR.

### 3. Footer and Buddy shell

Planned file: `code-labs/assets/code-labs-footer-buddy-shell-v145.js`

Owns only shared lower-page safety and assistant lanes:

- safety/export/import/backup tools;
- page completion and save-language support;
- Buddy Canvas handoff and source-proof lanes;
- V140 page read/write bridge;
- stable field, section and action keys;
- receipts and one-step undo;
- Sol Workbench loading and status;
- authenticated history support;
- no header/sidebar ownership;
- no page-body replacement;
- no duplicate Buddy Notes or Sol panels.

Protected source helpers include:

- `code-labs/assets/code-labs-v1-1-safety.js`;
- `code-labs/assets/code-labs-v12-save.js`;
- `code-labs/assets/code-labs-v1-2-history.js`;
- promoted helpers V132, V134/V136, V138 and V139;
- Buddy Canvas V111, V112, V113, V114, V107 autosave, V124, V125 and V127;
- `code-labs/assets/code-labs-buddy-page-bridge-v139.js` operating as V140;
- Sol packet guards and `code-labs-sol-workbench-v141.js`.

Compatibility requirement: keep `window.CodeLabsBuddyPageBridge`, `window.CodeLabsBuddyPageBridgeV140`, Buddy Canvas globals, V140 storage keys, receipt keys and undo keys unchanged during transfer.

## Complete page inventory

The transfer and smoke-test matrix covers these 35 pages:

1. `code-labs/helper-route-map.html`
2. `code-labs/index.html`
3. `code-labs/about.html`
4. `code-labs/faq.html`
5. `code-labs/help.html`
6. `code-labs/setup.html`
7. `code-labs/project-picker.html`
8. `code-labs/file-lab.html`
9. `code-labs/rescue-room.html`
10. `code-labs/v20.html`
11. `code-labs/packet-builder.html`
12. `code-labs/patch-desk.html`
13. `code-labs/patch-lab.html`
14. `code-labs/preview-test.html`
15. `code-labs/checkpoints.html`
16. `code-labs/repo-desk.html`
17. `code-labs/publish-prep.html`
18. `code-labs/github-tracker.html`
19. `code-labs/ai-handoff.html`
20. `code-labs/fix-wizard.html`
21. `code-labs/start-guide.html`
22. `code-labs/context-packet.html`
23. `code-labs/oauth-discovery.html`
24. `code-labs/oauth-flow-test.html`
25. `code-labs/read-only-proof.html`
26. `code-labs/owner-read-proof.html`
27. `code-labs/connector-status.html`
28. `code-labs/connection-guide.html`
29. `code-labs/chatgpt-connection.html`
30. `code-labs/checklist-builder.html`
31. `code-labs/repair-bridge-status.html`
32. `code-labs/buddy-canvas.html`
33. `code-labs/buddy-canvas-receipt-v115.html`
34. `code-labs/app-reader-test.html`
35. `code-labs/url-reader-test.html`

Pages discovered later are added to this matrix before any legacy helper deletion.

## Transfer order

### Stage A — Freeze and compatibility contracts

- Record the current 35-page/52-asset route-map result.
- Record all existing script order, `data-page` values, global APIs, storage keys and page-specific helpers.
- Add the three new helpers with installation guards and no visible output.
- Add a compatibility loader that can be called from existing shared entry points without duplicate execution.

### Stage B — Header shell

- Copy stable navigation/chrome behaviour into the header shell.
- Keep `cl-nav.js` as a compatibility entry point.
- Test route order, active state, mobile menu and no menu jump on every page with shared chrome.
- Do not move page content or Buddy panels.

### Stage C — Page runtime

- Move route-specific helper selection into one page manifest.
- Migrate one route group at a time while the old helper remains fallback.
- Confirm each page has one body, one route identity and no duplicate sections.
- Fix incorrect or missing `data-page` only where the current page identity is proven wrong.

### Stage D — Footer and Buddy shell

- Move safety, completion, Buddy and Sol loading into the footer/Buddy shell.
- Keep V140 API names and storage keys unchanged.
- Confirm one Buddy Notes field per section, one Sol panel, one receipt lane and one undo lane.
- Keep dangerous-action confirmation and sensitive-field blocking unchanged.

### Stage E — All-page promotion

- Each page loads the same three-shell compatibility entry path.
- Route-specific helper selection happens only in the page runtime.
- Existing page HTML remains the source of page identity and fallback content.
- No old helper is deleted in this stage.

### Stage F — Cleanup

A legacy helper may be removed only when all of the following are true:

1. no HTML page directly references it;
2. no helper dynamically loads it;
3. its global API has a compatible replacement;
4. its storage keys remain supported or have a tested migration;
5. every dependent page passes desktop and mobile smoke tests;
6. the helper-route-map scan reports no missing asset and no duplicate ownership;
7. GitHub/Codex review has no unresolved findings.

## Required smoke tests

For every page in the 35-page matrix:

- HTTP 200 and correct title/page identity;
- one header/sidebar shell only;
- correct active navigation item;
- one page body only;
- one footer/safety lane only where applicable;
- one Buddy V140 bridge only;
- one Sol Workbench only where authenticated support is available;
- no duplicated sections, buttons, Buddy Notes or completion panels;
- existing localStorage data still loads;
- existing page-specific buttons still work;
- V140 read returns the correct page, sections, fields and actions;
- harmless Buddy Notes write succeeds;
- receipt records the exact field key;
- undo restores the old value;
- read-after-undo confirms restoration;
- mobile layout and menu remain usable;
- Stream Bandit application pages remain unchanged.

## Connector boundary

- V104 stays unchanged and remains the Code Labs repair-room connector.
- V107 is repaired separately after the three-shell browser runtime is stable.
- V107 must use existing Supabase functions/tables where they are correct, and only the proven broken connection path is changed.
- No pairing code, control token, secret, service-role key or private key belongs in ChatGPT-visible tool arguments or browser page fields.

## Pull-request policy

- Each PR must state the exact route group and helper ownership moved.
- The PR must contain no unrelated Stream Bandit files.
- Run syntax checks for every changed JavaScript file.
- Run searches proving no duplicate loader and no stale cache key for the changed route group.
- Request GitHub/Codex review when the PR changes runtime behaviour.
- Merge automatically only when mergeable, checks pass, and there are no warnings, unresolved review threads or concrete review findings.
- Send Trevor the merged PR link and merge SHA.
