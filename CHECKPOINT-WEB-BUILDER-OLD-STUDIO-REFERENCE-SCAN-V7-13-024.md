# Web Builder Old Studio Reference Scan V7.13.024

Date: 2026-06-19

Status: SCANNED / CLASSIFIED / NO LIVE PAGE REWRITE

Governing plan: `STREAM-BANDIT-MASTER-MUST-FOLLOW-PLAN.md`

## Search target

```text
web-builder-live-studio-v7-12-116-test.html
```

## Result

The old live-studio route is still present in the repository, but most references are expected project history, route maps, wrappers, or old support pages.

## Safe current route truth

`stream-bandit-shell-v6-24.js` already maps:

```text
builder -> web-builder-account-control-hub-v7-12-263-test.html
builderStudio -> web-builder-account-control-hub-v7-12-263-test.html
```

`web-builder-live-studio-v7-12-116-test.html` is already a safe handoff wrapper to:

```text
web-builder-account-control-hub-v7-12-263-test.html
```

## Current source cleanup queue

Two working support pages still contain user-facing old Builder links:

```text
web-builder-form-save-v7-12-94-test.html
web-builder-form-submissions-v7-12-94-test.html
```

They should be route-only cleaned later by replacing old Builder links with:

```text
web-builder-account-control-hub-v7-12-263-test.html
```

## Current decision

Do not perform a full-page rewrite of those support pages unless the complete existing form, inbox, message, helper and debug behaviour can be preserved exactly.

## Safety status

```text
Shell bridge: safe
Old route wrapper: safe
Runtime break found: no
Source cleanup queued: yes
SQL: no
RLS: no
Storage policy: no
Payment: no
Index/Home: no
Main App and Web Builder separation: preserved
```
