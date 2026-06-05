# Stream Bandit Checkpoint — Web Builder Studio Hazard Map V7.12.116

Date: 2026-06-05

Status: SCAN ONLY.

Target scanned:

- web-builder-live-studio-v7-12-116-test.html
- web-builder-live-studio-v7-12-116.js
- web-builder-live-studio-v7-12-106.js

Architecture found:

1. web-builder-live-studio-v7-12-116-test.html is the visible wrapper page.
2. web-builder-live-studio-v7-12-116.js is a runtime repair wrapper.
3. web-builder-live-studio-v7-12-106.js is the true base Builder engine.

This page is a hybrid page and must be treated as a minefield page.

Important rule:

- Do not casually replace the JS engine.
- Do not change the saved page row workflow unless a specific bug is found.
- Do not change the block format without a planned migration.

Stale wrapper routes found:

- settings-studio-admin-shell-v6-55-test.html should become web-builder-theme-studio-controls-v7-8-9-test.html.
- web-builder-shared-style-preview-v7-9-2-test.html?page=test-page should become web-builder-shared-style-preview-v7-12-117-test.html?page=test-page.

Wrapper issue found:

- The wrapper still has a manual footer area.
- The Builder engine mounts itself before .footerPanel, so removing the footer area requires care.

Recommended first code pass:

- V7.12.223 Web Builder Wrapper Route/Footer Hotfix.

Allowed first pass:

- keep both JS files unchanged,
- fix stale wrapper links,
- avoid duplicate footer risk,
- preserve the engine mount point.

Not allowed first pass:

- no Builder engine rewrite,
- no saved row workflow rewrite,
- no block format change,
- no new database fields,
- no repository/domain split yet.

Future note:

The Web Builder should eventually become its own Builder Studio workspace with its own menu and a Back to Stream Bandit route, but that should be a later architecture pass.
