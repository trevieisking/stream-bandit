# Code Labs Menu Route Agreement V130/V146/V147

This note records the route/menu fixes so future helpers do not start another menu war.

## Problem found

Packet Builder flickered between `Home` and `Packet Builder` because several helpers owned or rewrote the Code Labs menu with different route maps.

The main conflicting helpers were:

- `code-labs/assets/code-labs.js`
- `code-labs/assets/code-labs-v12-save.js`
- `code-labs/assets/code-labs-v33-workflow-tidy.js`
- `code-labs/assets/code-labs-workflow-clarity-v130.js`
- old compatibility helper `code-labs/assets/code-labs-packet-builder-route-v131.js`

V144/V145 also restored the missing Setup prep page after Home. Setup was not deleted; it was hidden by the promoted route map. Setup is required because it holds the project, site, and repo details before File Lab.

V147 adds `code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md` as the no-drop list for every Code Labs page, so support/proof/test pages are not forgotten when the visible main route is simplified.

## Current agreed route

All menu/workflow helpers must treat this as the visible route order:

### Prep

1. Home
2. Setup

Setup is a prep/project page, not a locked repair workflow step. It must appear after Home and before File Lab.

### Main repair workflow

1. File Lab
2. Rescue Room
3. Packet Builder
4. Buddy Canvas
5. Workflow Hub
6. Patch Desk
7. Patch Lab
8. Preview + Test
9. Checkpoints
10. Repo Desk
11. GitHub Writer
12. GitHub Tracker

Support/proof pages such as Project Picker, Connection Guide, Read-Only Proof, Help, FAQ, About, Helper Route Map, and receipts may remain available, but they must not replace the prep route or the main repair workflow above. Use the V147 page role register before hiding or moving any working page.

## Rules for future helper work

1. Do not create a new menu route map without checking this file.
2. Do not remove Setup from the visible route. Setup belongs after Home and before File Lab.
3. Do not route Setup through Project Picker unless the user explicitly re-promotes Project Picker as a required prep step.
4. Do not make Packet Builder a support-only page. It is part of the main workflow after Rescue Room.
5. Do not make Buddy Canvas a support-only page. It is part of the main workflow after Packet Builder.
6. Do not use a helper that repeatedly edits the menu on an interval to fight another helper.
7. If a page label or menu label is wrong, fix the source route owner when possible. If a protected helper cannot be rewritten safely, document the stabilizer and keep it small.
8. Real menu icons should show in the icon column. Text tokens such as `Home`, `File`, `Packet`, or `Buddy` must not spill over into the menu label.
9. Existing working buttons must stay. The clarity layer may add guidance and soft locks, but it must not remove working functions.
10. Before removing or hiding a Code Labs page, check `code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md`.

## Current source-of-truth helpers

- `code-labs/assets/code-labs-v12-save.js` owns the rebuilt sidebar menu, NEXT/PREV route logic, workflow panel, and safe-write panel.
- `code-labs/assets/code-labs-setup-route-v145.js` keeps Setup visible after Home while the protected V12 route owner still omits Setup.
- `code-labs/assets/code-labs-v33-workflow-tidy.js` polishes workflow panels and proof sections. It must match the route agreement.
- `code-labs/assets/code-labs-workflow-clarity-v130.js` adds page numbering, descriptions, soft locks, route icons, and save wording. It must route Home -> Setup -> File Lab.
- `code-labs/assets/code-labs-packet-builder-route-v131.js` is inert compatibility only after the V12/V33 root fix. It must not edit the menu.
- `code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md` records every current Code Labs page and whether it is Prep, Main Workflow, Support, Proof/Test, Receipt, or Legacy/Watch.

## Passed manual tests

Trevor confirmed the menu war stopped after V12 and V33 agreed on Packet Builder and Buddy Canvas as main workflow pages. The final follow-up restored real route icons while hiding bad text-token icon labels.

Trevor confirmed V145 passed: Setup is visible after Home without the observed menu flicker on Code Labs workflow pages.
