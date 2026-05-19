# Stream Bandit Settings Toggle Map V7.1.4

## Core rule

Settings should control availability, visibility and routing. It should not duplicate the specialist editor for each property.

Property owner rule:

- Profile fields belong to Profile Settings.
- Theme colours, logo, app identity and favicon belong to Global Studio / Theme Studio / Branding Studio.
- Payment setup belongs to Payments page.
- Pricing plan editor belongs to Pricing / Plans page.
- Video upload/submission fields belong to Submit Video / Supabase Library / Mux Manager.
- Player comfort belongs to Accessibility / Player pages.

Settings can show status, toggles and links to owner pages.

## Visibility mode pattern

For anything sensitive or plan-based, use this three-way visibility mode:

1. `private` — Only me / admin / owner.
2. `paid` — Paid service / members / plan-gated.
3. `public` — Public to everyone.

This mode should apply to public profile data, creator/channel areas, premium site sections, forms, links and feature visibility.

## Global on/off pattern

For features that should exist or not exist in the app shell/menu, use:

- `enabled: true/false`
- `visibility: private | paid | public`
- `owner_route: page that edits the real thing`
- `default: off when risky or unfinished`

## Suggested Settings tabs

### 1. Website Features

Feature availability and menu visibility.

Toggles:

- Home page enabled
- Library enabled
- Search enabled
- Details page enabled
- Watch/player enabled
- Continue Watching enabled
- Watch History enabled
- Watchlist enabled
- Favourites enabled
- Liked enabled
- Genres enabled
- Channels enabled
- Collections enabled
- Playlists enabled
- About page enabled
- Pricing page enabled
- Account page enabled
- Profile Settings enabled
- Creator dashboard / My Channel enabled
- Submit Video enabled
- Review Queue enabled
- Rules page enabled
- Web Builder enabled
- Admin Centre enabled
- Tools page enabled
- Health Check enabled
- Live Readiness enabled
- Backup / Safety enabled

Each feature should have:

- On/off
- Visibility: private / paid / public
- Owner page link

### 2. Home Page Controls

These control what appears on Home, but the movie/video editor stays with Supabase Library or relevant owner page.

Toggles:

- Feature movie on Home: on/off
- Feature movie default: off unless a title/video is chosen
- Choose feature video link: opens Supabase Library / Movie Manager / Video chooser
- Continue Watching row on/off
- Featured Playlist row on/off
- New Uploads row on/off
- Collections row on/off
- URL Videos row on/off
- Admin Picks row on/off
- Genre Picks row on/off
- Creator Channels row on/off
- Premium/paid row on/off
- Show trailers on Home on/off

Visibility modes:

- Featured movie visibility: private / paid / public
- Rows visibility: private / paid / public per row where needed

### 3. Profile Display Controls

Profile Settings owns the actual fields. Settings controls where/how they show.

Toggles / modes:

- Show profile stripe: private / paid / public
- Show profile avatar: private / paid / public
- Show profile banner: private / paid / public
- Show bio: private / paid / public
- Show contact email: private / paid / public
- Show creator badge: on/off
- Show admin badge: private/public only if safe
- Show channel name on cards: on/off
- Show profile links: private / paid / public
- Show social links: private / paid / public

Owner link:

- Profile Settings V7.0.4

### 4. Channels / Playlists / Collections

These have real owner pages. Settings controls whether the site uses them and who sees them.

Toggles:

- Channels enabled on/off
- Channels menu visible on/off
- Channels visibility: private / paid / public
- Channel creation enabled on/off
- Playlists enabled on/off
- Playlist menu visible on/off
- Playlists visibility: private / paid / public
- Playlist creation enabled on/off
- Collections enabled on/off
- Collections menu visible on/off
- Collections visibility: private / paid / public
- Collection creation enabled on/off
- Show channel artwork on/off
- Show playlist artwork on/off
- Show collection artwork on/off

Owner links:

- Channels page
- Playlists page
- Collections page

### 5. Creator / Upload Controls

Submit Video and Creator pages own the real workflows. Settings controls access.

Toggles:

- Creator mode enabled on/off
- My Channel enabled on/off
- Submit Video enabled on/off
- Creator rules enabled on/off
- Review Queue enabled on/off
- Public submissions enabled on/off
- Admin approval required on/off
- Creator uploads visibility: private / paid / public
- Submit Video visibility: private / paid / public
- Creator dashboard visibility: private / paid / public
- Show creator name on movie cards on/off
- Show creator profile links on/off

Owner links:

- My Channel
- Submit Video
- Review Queue
- Rules

### 6. Watch / Player Controls

Accessibility and Player pages own the real editor. Settings controls global availability/status.

Toggles:

- Watch/player enabled on/off
- Continue Watching enabled on/off
- Watch History enabled on/off
- Resume progress saving enabled on/off
- Watchlist enabled on/off
- Favourites enabled on/off
- Likes enabled on/off
- Audio boost enabled on/off
- Captions/subtitles preference on/off/status later
- Autoplay next enabled on/off
- Queue enabled on/off
- Player 2 enabled on/off
- Mux/HLS mode enabled on/off
- Direct video URL mode enabled on/off

Visibility modes:

- Watch page visibility: private / paid / public
- Premium videos visibility: paid/public/private per video later

Owner links:

- Accessibility
- Player
- Mux Manager
- Supabase Library

### 7. Payments / Paywall Status

Settings must not build the Payment page. Payment page owns Stripe/plans/paywall tools.

Settings should show:

- Payments enabled on/off
- Payment provider status: not connected / connected / needs setup
- Pricing page enabled on/off
- Paid service mode enabled on/off
- Default paid visibility mode
- Open Payments page link
- Open Pricing Plans link
- Open Paywall Builder link

Paywall builder belongs on Payment page and should allow:

- Use own paywall link
- Build Stream Bandit paywall overlay
- Overlay inherits Global Studio theme
- Overlay title
- Overlay description
- Overlay button text
- Price / plan label
- Checkout link
- Feature list
- Access rule

### 8. Website Links / Public Pages

Settings can manage visibility/status for public routes, but editing page content belongs to Web Builder / page owner.

Toggles:

- Public Home link enabled on/off
- Browse/Library link enabled on/off
- Pricing link enabled on/off
- Profile link enabled on/off
- Contact/About link enabled on/off
- Terms/Policy link enabled on/off
- Account/Login link enabled on/off
- Creator dashboard link enabled on/off
- Public channel page link enabled on/off
- External website link enabled on/off
- Social links visibility: private / paid / public

Owner link:

- Web Builder / Global Studio / Policy page as appropriate

### 9. Branding / App Icon Status

Do not duplicate the editor here. Settings shows status and owner links.

Controls / status:

- Favicon status
- App icon status
- PWA icons status
- Header logo status
- Open Global Studio / Branding Studio link

Future owner:

- Global Studio / Branding Studio

### 10. Privacy / Safety Defaults

Important for paid/public/private features.

Toggles:

- Default new feature visibility: private / paid / public
- Default new creator content visibility: private / paid / public
- Default new Web Builder page visibility: private / paid / public
- Show admin-only pages in menu: on/off
- Require login for account features: on/off
- Require approval for submissions: on/off
- Hide sensitive debug tools from public: on/off
- Safe mode for dangerous admin actions: on/off

### 11. Global Helper Status

Keep from V7.1.2 because it is useful.

Status cards:

- Shared shell loaded
- Search loaded
- Account/profile helper loaded
- Auth sync loaded
- Avatar helper loaded
- Shared style loaded
- Menu count helper loaded
- Supabase connection status
- Profile row found
- Admin role found

## Recommended next Settings build

Build a new page:

- `settings-platform-control-hub-v7-1-4-test.html`

Main tabs:

1. Website Features
2. Home Controls
3. Profile Display
4. Channels / Playlists / Collections
5. Creator / Uploads
6. Watch / Player
7. Payments / Paywall Status
8. Website Links
9. Branding Status
10. Privacy / Defaults
11. Global Helper Status

This page should be mostly controls/status and owner links. It should not duplicate property editors.

## Default values suggestion

Use safe defaults:

- Featured movie on Home: off unless a video/title is chosen.
- Paid features: private until payment page exists.
- Creator uploads: private/admin until approval workflow confirmed.
- Review Queue: private/admin.
- Web Builder pages: private until published.
- Admin tools: private/admin.
- Watch/player: public if content is public.
- Continue Watching / Watch History: private/account only.
- Profile email: private by default.
- Bio/avatar/banner: public by default only if user chooses.
