# Stream Bandit Code Labz Future Plan

Date: 2026-06-22

Status: LOGGED FOR LATER / FUN TIME ONLY / DO NOT INTERRUPT CURRENT AUTH GATE PASS

This plan records Trevor's idea for turning the current Stream Bandit Code Fix Machine / Code Labz workflow into a more useful assistant-friendly tool later.

Current public tool route:

`stream-bandit-code-fix-machine-v1.html`

Public domain route:

`https://chatterfriendsstreambandit.co.uk/stream-bandit-code-fix-machine-v1.html`

## 1. Current tool truth

The current Code Fix Machine is a static browser helper. It lets Trevor paste a full HTML / JS / CSS file, search exact text, replace selected matches, replace line ranges, copy full output, download fixed output and create a report to send back to ChatGPT.

This is useful when GitHub tool output truncates, when line-safe patching is needed, or when Code Labz exact line replacement is safer than replacing a whole page.

## 2. Why this could help ChatGPT

The tool could become useful not only for Trevor but also for ChatGPT workflows when normal tools fail.

Potential future value:

- exact full-file paste and patch workspace
- line-range replacement helper
- output validator before GitHub upload
- report generator for what changed
- safe fallback when GitHub output truncates
- possible public helper that ChatGPT can reference through a future app/connector
- possible upgrade path where ChatGPT can fetch Code Labz records instead of relying only on pasted chat text

## 3. Future architecture idea

Recommended long-term structure:

### GitHub

GitHub remains the source of truth for real Stream Bandit files:

- live HTML pages
- JS helpers
- Master Plan
- Manifest
- checkpoints
- Code Labz plan files

### Supabase

Supabase can become the Code Labz memory/index layer later:

Possible future tables:

- `sb_code_labs_pages`
- `sb_code_labs_revisions`
- `sb_code_labs_patch_reports`

Possible stored fields:

- page name
- route
- GitHub path
- current version
- status
- full code snapshot if approved
- patch report
- created by
- created at
- tested status
- pass/fail notes

### ChatGPT app / connector / MCP server

A later read-only app could expose:

- `search_code_labs(query)`
- `fetch_code_lab_page(id)`
- `fetch_code_lab_revision(id)`

Write tools must not be added first. Start read-only.

## 4. Safety model

First version must be read-only for ChatGPT:

- search only
- fetch only
- no delete
- no write
- no publish
- no GitHub commit from the Code Labz app
- no SQL changes
- no RLS changes
- no storage policy changes
- no payment changes
- no private keys, service-role keys, Mux secrets or webhook secrets in the browser

Any future write tool would require a separate safety pass.

## 5. Upgrade path

### V1 current

Static browser helper:

- paste code
- search exact text
- replace selected match
- replace line range
- copy output
- download output
- generate report

### V2 future

Code Fix Machine with optional Supabase save:

- save page records
- save patch reports
- save test status
- save full code snapshots only when intentionally approved
- keep GitHub as source of truth

### V3 future

Code Labz read-only ChatGPT app:

- ChatGPT can search/fetch Code Labz records
- useful when tools truncate or fail
- still no write/delete/publish powers

### V4 future

Controlled write helper only if separately approved:

- draft patch suggestions
- produce exact line replacement instructions
- maybe prepare GitHub commit content, but not auto-commit without Trevor approval

## 6. Current priority lock

Do not build this during the current Auth Gate group pass.

Current priority remains:

1. Test Playlists Auth Gate V7.12.292.
2. If passed, update Master Plan and Manifest for Playlists only.
3. Continue Group Play auth-gate pages one page at a time.
4. Return to Code Labz fun-time project after eights.

## 7. Notes to remember

Trevor's requirement:

When tool block persists, use Code Labz style:

- exact line to remove
- exact line to swap in
- no vague replacement
- no whole-page replacement unless explicitly approved

This Code Labz plan is separate from the main Stream Bandit Master Plan and exists to preserve the future idea without interrupting today's controlled Auth Gate pass.
