# Stream Bandit Checkpoint — Standalone Form IDE V7.7.0 Rebuilt / Not Promoted

Date: 2026-05-21

## Page created

A first rebuilt version of Trevor's lost Chatterfriends / Chatternet-era standalone browser Form IDE was created inside the Stream Bandit repository as a protected test page:

- `form-ide-standalone-v7-7-0-test.html`

Commit:

- `fe40c7d5ce0196194860ab21f66b41e0db634ebc`

## Purpose

This page recreates the direction of the old standalone `.browser` / `.html` Form IDE that Trevor used before Stream Bandit, likely around the Chatterfriends / Chatternet era in 2021 or 2022.

Trevor remembered using the old tool to build proper forms, copy/paste output, and create shopping-list/tick-off style pages shared through WhatsApp.

## Current status

- Rebuilt as a standalone Stream Bandit test page.
- Not promoted to the main menu route.
- Not connected to Supabase.
- Not connected to Web Builder yet.
- Not replacing the existing Web Builder form block editor.
- Protected as local/browser-only for now.

## Included in V7.7.0

- field builder
- short text
- long text
- email
- phone
- number
- date picker
- multiple choice
- check boxes
- dropdown/select
- policy URL / terms field
- signature placeholder
- live preview
- shopping-list tick-off mode
- WhatsApp/share text copy
- copy remaining shopping items
- copy/export JSON
- copy/export HTML
- import JSON
- local autosave in browser

## Shopping-list use case

Trevor specifically wanted the old phone/shopping workflow back:

- create a shopping list
- open it on phone
- tick items off
- copy/share remaining items through WhatsApp

V7.7.0 restores the first version of that workflow.

## Security note

Trevor remembered the old Chatternet-era page may have had Facebook app secret keys or similar integration values.

Important rule for future rebuilds:

- Public app IDs can exist in frontend when appropriate.
- App secrets, private keys, access tokens and service keys must never be placed in public frontend HTML/JavaScript.
- Anything secret must live in a backend/serverless function or secure environment variable.

V7.7.0 does not include Facebook secrets, API secrets, private keys, live publish controls, or Supabase service keys.

## Safety locks

V7.7.0 makes no dangerous changes:

- no Supabase writes
- no schema changes
- no storage uploads
- no publish/live/index action
- no Web Builder replacement
- no route promotion
- no secret keys

## Future options

Later, after the current Stream Bandit global-helper pass, decide whether to:

1. keep it as a protected standalone Form IDE tool,
2. add it into the menu under Tools/Admin/Web Builder,
3. connect it to the Web Builder form block system,
4. expand it into a dedicated Forms Builder module,
5. connect form outputs to future Messaging / Inbox / CRM / Bookings workflows.

## Project direction after this checkpoint

The Form IDE panic is resolved enough to continue the main Stream Bandit pass.

Next proper Stream Bandit target:

- Web Builder deep scan/pass

Reason:

- Web Builder owns page/form layout and global display/theme family.
- It is the last remaining major Settings group page.
- It should be handled carefully after Settings, Settings Sources, Platform Control Tower and Profile Settings have passed.
