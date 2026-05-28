# Stream Bandit — Rollback Checkpoint Before Web Builder Pages Manager V7.12.107

Date: 2026-05-28

## Purpose

This checkpoint was created before starting the Web Builder Pages / Navigation Manager test page.

Trevor gave permission to continue, but requested the exact current checkpoint be saved first so the project can roll back if needed.

## Current safe checkpoint

- Current live/group checkpoint: V7.12.106 Web Builder Group Pass Checkpoint.
- Repo: trevieisking/stream-bandit.
- Branch: main.
- Protected shell: stream-bandit-shell-v6-24.js.
- Protected shell checkpoint: V7.12.104.
- Current Web Builder page: web-builder-live-studio-v7-12-97-test.html?page=test-page.
- Current Web Builder engine: web-builder-live-studio-v7-12-106.js.
- Published Preview route: web-builder-shared-style-preview-v7-9-2-test.html?page=test-page.
- Advanced Form route: web-builder-form-save-v7-12-94-test.html?page=test-page.
- Form Inbox route: web-builder-form-submissions-v7-12-94-test.html?page=test-page.
- Current index promotion anchor already recorded: 7258d602faeea788f6c16017f810aa17069c42cc.

## Strict rules for the next build

- Do not edit protected global shell.
- Do not edit Settings Hub or passed Settings group pages.
- Do not edit index.html.
- Do not promote anything until Trevor tests and passes it.
- Build the Pages / Navigation Manager as a separate full test page.
- No Supabase schema changes.
- Use existing sb_site_pages table.
- Store navigation extras inside settings_json because sb_site_pages has no separate menu_label, sort_order, show_in_menu, is_home_page or parent_slug columns.

## Target next test page

- New test page: web-builder-pages-manager-v7-12-107-test.html.

## Rollback instruction

If the Pages Manager test fails, delete or ignore web-builder-pages-manager-v7-12-107-test.html and keep the current V7.12.106 Web Builder group checkpoint untouched.
