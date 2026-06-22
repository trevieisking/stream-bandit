# Code Labs V1 Plan

Status: branch build / manual rescue first / no live writes.

## Mission

Code Labs helps non-coders give ChatGPT the exact code context needed, receive safe full-file fixes, preview them, save checkpoints, and recover when normal tools are blocked.

## Name and separation

Public product name: **Code Labs**.

The UI must not use Stream Bandit branding. It can live in the existing repository during testing and use the existing GitHub/Supabase environment later, but it is treated as a separate product.

## Page count rule

Current registered app pages counted before this build: 38.

New Code Labs HTML pages in V1: 11.

Projected total: 49.

Hard limit: do not allow current registered pages plus Code Labs pages to reach 1000. Stop and ask before adding pages if the combined count gets near 950.

## Pages

1. `index.html` - start page and repair overview.
2. `setup.html` - workspace/site setup.
3. `project-picker.html` - choose manual/GitHub/Supabase project path.
4. `file-lab.html` - paste or upload full file code.
5. `rescue-room.html` - describe problem and protected rules.
6. `packet-builder.html` - build copyable ChatGPT repair packet.
7. `patch-desk.html` - paste fixed code, compare, copy/download.
8. `preview-test.html` - preview and checklist test before replacing.
9. `checkpoints.html` - local rollback versions and saved test results.
10. `connector-status.html` - planned GitHub/Supabase/ChatGPT connector status.
11. `help.html` - plain-English help for non-coders.

## Current V1 functionality

- Manual repair mode.
- Local browser storage.
- Full-file paste/upload.
- ChatGPT packet builder.
- Fixed-code paste area.
- Compare summary.
- Preview iframe.
- Test checklist.
- Local checkpoints.
- Copy/download buttons.

## Not in V1 yet

- No automatic GitHub writes.
- No Supabase writes.
- No service-role key or secret storage.
- No live promotion.
- No Stream Bandit route registry changes.

## Safety rules

- Never overwrite without a checkpoint.
- Never push to live main from the browser.
- Never hide what changed.
- Always support manual copy/paste rescue mode.
- Prefer full-file replacement for non-coders.
