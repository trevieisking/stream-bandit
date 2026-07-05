# Code Labs Menu Route Agreement V130

This note records the route/menu fix from PR #251 so future helpers do not start another menu war.

## Problem found

Packet Builder flickered between `Home` and `Packet Builder` because several helpers owned or rewrote the Code Labs menu with different route maps.

The main conflicting helpers were:

- `code-labs/assets/code-labs.js`
- `code-labs/assets/code-labs-v12-save.js`
- `code-labs/assets/code-labs-v33-workflow-tidy.js`
- `code-labs/assets/code-labs-workflow-clarity-v130.js`
- old compatibility helper `code-labs/assets/code-labs-packet-builder-route-v131.js`

## Current agreed main route

All menu/workflow helpers must treat this as the main route order:

1. Home
2. File Lab
3. Rescue Room
4. Packet Builder
5. Buddy Canvas
6. Workflow Hub
7. Patch Desk
8. Patch Lab
9. Preview + Test
10. Checkpoints
11. Repo Desk
12. GitHub Writer
13. GitHub Tracker

Support/proof pages such as Connection Guide, Read-Only Proof, Help, FAQ, About, Helper Route Map, and receipts may remain available, but they must not replace the main route order above.

## Rules for future helper work

1. Do not create a new menu route map without checking this file.
2. Do not make Packet Builder a support-only page. It is part of the main workflow after Rescue Room.
3. Do not make Buddy Canvas a support-only page. It is part of the main workflow after Packet Builder.
4. Do not use a helper that repeatedly edits the menu on an interval to fight another helper.
5. If a page label or menu label is wrong, fix the source route owner instead of adding a patch-on-patch overlay.
6. Real menu icons should show in the icon column. Text tokens such as `Home`, `File`, `Packet`, or `Buddy` must not spill over into the menu label.
7. Existing working buttons must stay. The clarity layer may add guidance and soft locks, but it must not remove working functions.

## Current source-of-truth helpers

- `code-labs/assets/code-labs-v12-save.js` owns the rebuilt sidebar menu, NEXT/PREV route logic, workflow panel, and safe-write panel.
- `code-labs/assets/code-labs-v33-workflow-tidy.js` polishes workflow panels and proof sections. It must match V12 route order.
- `code-labs/assets/code-labs-workflow-clarity-v130.js` adds page numbering, descriptions, soft locks, route icons, and save wording. It must match V12 route order.
- `code-labs/assets/code-labs-packet-builder-route-v131.js` is inert compatibility only after the V12/V33 root fix. It must not edit the menu.

## Passed manual test

Trevor confirmed the menu war stopped after V12 and V33 agreed on Packet Builder and Buddy Canvas as main workflow pages. The final follow-up restored real route icons while hiding bad text-token icon labels.
