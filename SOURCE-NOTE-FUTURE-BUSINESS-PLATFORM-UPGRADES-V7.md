# Stream Bandit Source Note — Future Business / Platform Upgrades V7

Date: 2026-05-21

## Context

During the Settings Control Hub V7.6.4 pass, Trevor confirmed the future direction should be bigger and more realistic than simple email/contact links.

The future platform should support:

- domain hosting
- business/site creation
- built-in message systems
- platform services
- realistic creator/business tools
- future memberships and paid systems

This note is a source/reference list for later planning. It is not an implementation checkpoint.

## Core future direction

Stream Bandit should grow beyond a movie/video platform into a broader creator/business web platform.

The future goal can include:

- video streaming platform
- website builder
- business page builder
- creator/channel platform
- customer/contact system
- internal messaging/inbox
- booking/contact workflows
- membership/paywall tools
- domain/hosting setup guidance
- admin/platform diagnostics
- templates and reusable business pages

## Future upgrade categories

### 1. Domain and hosting layer

Possible future features:

- connect custom domain guidance
- domain status checklist
- DNS instruction panel
- hosted site publish status
- GitHub Pages status
- future hosting provider status
- SSL/HTTPS status checklist
- sitemap/SEO readiness
- robots/meta settings checklist
- custom business site URL display

Ownership idea:

- likely Platform Control Tower / Admin group for status
- Web Builder owns actual site/page content
- no duplicate theme ownership

### 2. Business creation system

Possible future features:

- create a business/site profile
- business name
- business logo
- business banner
- business category
- business description
- opening hours
- service area
- business contact options
- public business landing page
- business/team member list
- business policies
- business service cards
- business testimonials

Ownership idea:

- future Business Builder or Web Builder module
- Profile Settings remains personal/user profile owner
- Web Builder remains page layout owner

### 3. Built-in messaging system

Trevor specifically noted the future should be more than email.

Possible future features:

- internal site inbox
- contact form inbox
- message threads
- unread message count
- admin/customer message view
- creator/customer message view
- reply from dashboard
- message status: new, read, replied, archived
- attachment support later
- spam/report controls
- notification badges
- Supabase table such as `sb_messages` later

Ownership idea:

- future Messaging / Inbox page owns messages
- Contact forms can create messages/submissions
- Settings only controls links/status/visibility

### 4. Contact / CRM light system

Possible future features:

- saved contacts/leads
- contact source: form, booking, message, manual
- lead status: new, contacted, won, lost
- notes/history
- customer profile panel
- business enquiry tracking
- export later

Ownership idea:

- future Contacts / CRM page
- Web Builder forms can feed into it
- Settings only maps owner/status

### 5. Booking / appointments system

Possible future features:

- booking request form
- available times
- manual approve/decline booking
- booking dashboard
- customer booking confirmation
- booking status
- service selection
- calendar integration later

Ownership idea:

- future Bookings page/module
- Web Builder owns booking block layout
- Bookings module owns booking data

### 6. Memberships / paid systems

Possible future features:

- free/paid plans
- creator memberships
- premium video access
- business service paywall
- paywall overlay
- upgrade prompts
- billing status display
- protected pages/blocks
- pricing matrix connection

Ownership idea:

- future Payments / Memberships page
- Pricing Matrix currently read-only planning
- Settings only maps availability/status

### 7. Creator/business dashboard

Possible future features:

- dashboard overview
- uploaded videos count
- page views later
- messages count
- bookings count
- form submissions count
- profile completion
- route health
- next actions checklist

Ownership idea:

- future User Dashboard / Business Dashboard
- Platform Control Tower remains admin/project-wide scanner

### 8. Website Builder expansions

Possible future features:

- business landing page templates
- video landing page templates
- contact page templates
- service page templates
- pricing block
- FAQ block
- testimonials block
- gallery block
- booking block
- message/contact block
- newsletter block later
- SEO/meta block later

Ownership idea:

- Web Builder owns layout/blocks/forms/theme display family
- do not duplicate these controls in Settings

### 9. Platform diagnostics expansions

Possible future features for Platform Control Tower:

- 48/48 route scan remains master workflow
- owner conflict scanner
- table count scanner
- storage bucket policy scanner/status
- Mux URL/HLS scanner
- broken media URL scanner
- missing image scanner
- release gate dashboard
- backup status checklist
- final live readiness one-click report

Ownership idea:

- Platform Control Tower owns diagnostics/readiness only
- it does not edit underlying owner data

### 10. Admin safety and release workflow

Possible future features:

- release candidate checklist
- required backup before live
- route map scan before live
- version registry scan before live
- Supabase health check before live
- Mux health check before live
- storage health check before live
- broken link scan
- smoke test tracker

Ownership idea:

- Admin group / Platform Control Tower
- no live index promotion without Trevor approval

## Important non-duplication rule

Future upgrades must preserve the property ownership map:

- Profile Settings owns profile/avatar/banner.
- Web Builder owns global display/theme.
- Web Builder owns page/form layout.
- Platform Control Tower owns diagnostics/readiness.
- Settings Control Hub owns owner links/status/safety map only.
- Future Messaging owns messages/inbox.
- Future Business Builder owns business profile data if created.
- Future Bookings owns booking data.
- Future Payments/Memberships owns plan/paywall/billing state.

## Settings Control Hub future role

Settings should remain the map/hub, not the owner of everything.

Settings can show:

- owner links
- feature status
- visibility status
- safety locks
- local/future JSON summary
- links to business/messaging/domain/payment modules

Settings should not become:

- duplicate Web Builder
- duplicate Profile Settings
- duplicate Platform Control Tower
- duplicate Messaging/Inbox
- duplicate Payments page

## Practical future order idea

Later, after current global-helper pass:

1. Finish Settings group.
2. Finish Admin group.
3. Finish User Management group.
4. Run Platform Control Tower 48/48 scan.
5. Do final route/version registry check.
6. Then plan the first business-platform module, likely Messaging/Inbox or Business Profile, because those add real usefulness beyond email.

## Reminder

This document is a source note only.

Do not implement these future upgrades during the current global-helper correction pass unless Trevor specifically asks.
