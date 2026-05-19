# Stream Bandit Settings Full Feature Control Map V7.1.5

## Main decision

Settings must not be a small list. It should control platform feature availability, visibility, routing, menu display, home/profile/card display, and safe defaults across the whole Stream Bandit app.

Settings should not duplicate specialist editors. The editor stays with the property owner page.

## Standard pattern

Most Settings controls should eventually have:

- enabled: on/off
- visibility: private / paid / public
- show in menu: on/off
- show on home: on/off when relevant
- show on profile: on/off when relevant
- show on cards: on/off when relevant
- owner page link
- safety/default note

## Visibility modes

- private = only me / admin / owner
- paid = paid service / members / plan-gated
- public = visible to everyone

Sensitive things default to private until confirmed.

## Property owner rule

- Profile text/avatar/banner editor belongs to Profile Settings.
- Theme/logo/app identity/favicon editor belongs to Global Studio / Theme Studio / Branding Studio.
- Payments/Stripe/paywall editor belongs to Payments page.
- Pricing plan editor belongs to Pricing/Plans page.
- Movie/video metadata belongs to Supabase Library / Movie Manager.
- Upload settings belong to Submit Video / Mux Manager / Storage owner pages.
- Player comfort belongs to Accessibility / Player.
- Settings controls whether these features are on, visible, private, paid, public, and where they appear.

## Full Settings tabs for next build

Recommended next page:

- settings-platform-control-hub-v7-1-5-test.html

Tabs:

1. Profile
2. Comments
3. Home
4. Watch / Player
5. Browse / Library
6. Channels / Playlists / Collections
7. Creator / Uploads
8. Payments / Paywall
9. Website Links
10. Branding Status
11. Web Builder
12. Admin / System
13. Privacy / Defaults
14. Helper Status

## Profile controls

- Profile enabled on/off
- Public profile enabled on/off
- Profile visibility: private / paid / public
- Show profile stripe on/off
- Profile stripe visibility: private / paid / public
- Show avatar on/off
- Avatar visibility: private / paid / public
- Show banner on/off
- Banner visibility: private / paid / public
- Show display name on/off
- Show username/handle on/off
- Show bio on/off
- Bio visibility: private / paid / public
- Show contact email on/off
- Contact email visibility: private / paid / public
- Show social/profile links on/off
- Social/profile links visibility: private / paid / public
- Show creator badge on/off
- Show admin badge on/off/admin-only by default
- Show channel name on movie cards on/off
- Show profile link on movie cards on/off
- Show profile link on creator submissions on/off
- Show profile tab on Account on/off
- Show profile tab on My Channel on/off

Owner route: Profile Settings V7.0.4.

## Comments controls

Comments must be a proper Settings feature group.

- Comments enabled on/off
- Comments visibility: private / paid / public
- Comments require login on/off
- Comments require moderation on/off
- Comments on profile on/off
- Profile comments visibility: private / paid / public
- Comments on videos on/off
- Video comments visibility: private / paid / public
- Comments on channels on/off
- Channel comments visibility: private / paid / public
- Comments on playlists on/off
- Playlist comments visibility: private / paid / public
- Comments on collections on/off
- Collection comments visibility: private / paid / public
- Creator replies enabled on/off
- Admin replies enabled on/off
- Public replies enabled on/off
- Like comments on/off
- Report comments on/off
- Pin comments on/off
- Delete own comments on/off
- Admin moderate/delete comments on/off
- Hide comments from public by default on/off
- Paid-only comments on/off
- Comments count on cards on/off
- Comments preview on profile on/off

Future owner page: Comments / Community Manager.

Safe defaults: comments off until built; moderation required by default.

## Home controls

- Home enabled on/off
- Home visibility: private / paid / public
- Featured movie enabled on/off
- Featured movie default off unless title/video selected
- Choose featured video link opens Supabase Library / Movie Manager
- Featured movie visibility: private / paid / public
- Spotlight row on/off
- Continue Watching row on/off
- Featured Playlist row on/off
- New Uploads row on/off
- Collections row on/off
- URL Videos row on/off
- Admin Picks row on/off
- Genre Picks row on/off
- Creator Channels row on/off
- Premium/Paid row on/off
- Trending row on/off
- Recently Added row on/off
- Most Liked row on/off
- Show trailers on Home on/off
- Show creator names on Home on/off
- Show channel/playlist/collection cards on Home on/off

## Watch / Player controls

- Watch/player enabled on/off
- Watch visibility: private / paid / public
- Details enabled on/off
- Details visibility: private / paid / public
- Player 2 enabled on/off
- Queue enabled on/off
- Autoplay next enabled on/off
- Continue Watching enabled on/off
- Continue Watching private/account only by default
- Watch History enabled on/off
- Watch History private/account only by default
- Resume progress saving enabled on/off
- Watchlist enabled on/off
- Favourites enabled on/off
- Likes enabled on/off
- Captions/subtitles status later
- Fullscreen comfort enabled on/off
- Audio boost enabled on/off
- Mux/HLS playback enabled on/off
- Direct URL playback enabled on/off
- External embed playback enabled on/off
- Premium video paywall enabled on/off

## Browse / Library controls

- Library enabled on/off
- Library visibility: private / paid / public
- Supabase Library enabled on/off
- Supabase Library private/admin by default
- Search enabled on/off
- Search visibility: private / paid / public
- Genres enabled on/off
- Genre counts show on/off
- Channels enabled on/off
- Collections enabled on/off
- Playlists enabled on/off
- About page enabled on/off
- Browse menu links on/off per route
- Show creator/channel labels on cards on/off
- Show premium badges on cards on/off

## Channels / Playlists / Collections controls

- Channels feature on/off
- Channels menu item on/off
- Channels visibility: private / paid / public
- Channel creation enabled on/off
- Public channel pages on/off
- Channel artwork display on/off
- Channel comments on/off
- Channel followers/subscribers later
- Channel Play All on/off
- Playlists feature on/off
- Playlists menu item on/off
- Playlists visibility: private / paid / public
- Playlist creation enabled on/off
- Playlist artwork display on/off
- Playlist comments on/off
- Playlist Play All on/off
- Public playlists on/off
- Collections feature on/off
- Collections menu item on/off
- Collections visibility: private / paid / public
- Collection creation enabled on/off
- Collection artwork display on/off
- Collection comments on/off
- Collection Play All on/off
- Public collections on/off

## Creator / Upload controls

- Creator mode enabled on/off
- Creator mode visibility: private / paid / public
- My Channel enabled on/off
- Submit Video enabled on/off
- Review Queue enabled on/off
- Rules page enabled on/off
- Public submissions enabled on/off
- Admin approval required on/off
- Auto-approve admin uploads on/off
- Creator uploads visibility: private / paid / public
- Creator profile links on submissions on/off
- Show creator name on movie cards on/off
- Show creator upload count on profile on/off
- Show creator comments/replies on/off
- Allow URL videos on/off
- Allow Mux/HLS videos on/off
- Allow embeds on/off
- Allow image uploads on/off

## Payments / Paywall controls

Payment editor belongs to the Payment page. Settings controls availability/status only.

- Payments enabled on/off
- Payments private/admin until built
- Pricing page enabled on/off
- Pricing page visibility: private / paid / public
- Paid service mode enabled on/off
- Default paid visibility mode
- Show plan badges on/off
- Show premium locks on/off
- Show upgrade prompts on/off
- Show paywall overlay on/off
- Use own paywall link on/off
- Build Stream Bandit paywall overlay link
- Paywall overlay inherits Global Studio theme
- Feature list visibility: private / paid / public
- Show current plan on profile on/off
- Show creator paid tier on channel on/off

## Website Links controls

- Main menu enabled on/off
- Lower tabs enabled on/off
- Home link on/off
- Browse/Library link on/off
- Search link on/off
- Pricing link on/off
- Profile link on/off
- Contact/About link on/off
- Terms/Policy link on/off
- Account/Login link on/off
- Creator dashboard link on/off
- Public channel link on/off
- Web Builder pages link on/off
- External website link on/off
- Social links on/off
- Footer links on/off
- Public header buttons on/off
- Logged-in-only links on/off
- Admin-only links visible to admin only on/off

## Branding / favicon / app icon status

Editor belongs to Branding/Global Studio. Settings shows status and links.

- Header logo status
- Favicon status
- Apple touch icon status
- Android/PWA icons status
- Browser tab title status
- App name status
- Tagline status
- Login text status
- Open Global Studio link
- Open Branding Studio link later

## Web Builder controls

- Web Builder enabled on/off
- Web Builder private/admin by default
- Published builder pages enabled on/off
- Builder pages visibility: private / paid / public
- Forms enabled on/off
- Form submissions enabled on/off
- Gallery/Pricing/FAQ/Reviews/Contact blocks on/off
- Paywall blocks on/off later
- Builder pages inherit Global Studio theme on/off

## Admin / System controls

- Admin Centre enabled on/off
- Tools page enabled on/off
- Health Check enabled on/off
- Mux Manager enabled on/off
- Storage Prep enabled on/off
- Backup / Safety enabled on/off
- Live Readiness enabled on/off
- Supabase test enabled on/off
- Migration tools enabled on/off
- Local storage legacy tools enabled on/off
- Dangerous actions safe mode on/off
- Show debug panels on/off
- Show route registry on/off

Admin/system tools default private/admin only.

## Privacy / Defaults controls

- Default new feature visibility: private / paid / public
- Default new creator content visibility: private / paid / public
- Default new Web Builder page visibility: private / paid / public
- Default new movie visibility: private / paid / public
- Default comments visibility: private / paid / public
- Default profile field visibility: private / paid / public
- Require login for account features on/off
- Require login for comments on/off
- Require login for likes/favourites/watchlist on/off
- Require approval for submissions on/off
- Hide email by default on/off
- Hide sensitive debug tools from public on/off
- Safe mode for admin actions on/off

## Helper Status tab

Support tab only, not the main Settings page.

- Shared shell loaded
- Menu route list loaded
- Search loaded
- Account/profile helper loaded
- Auth sync loaded
- Avatar helper loaded
- Shared style loaded
- Supabase client available
- Profile row found
- Admin role found
- Menu counts loaded
- Theme loaded from sb_app_settings
- Current route known

## Next build decision

Build:

- settings-platform-control-hub-v7-1-5-test.html

First pass should be a broad control-map page with safe local toggles and owner links. Do not write these toggles to Supabase until the exact JSON shape is approved.
