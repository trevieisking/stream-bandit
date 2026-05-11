# Stream Bandit Platform Builder Vision

Status: long-term product roadmap note, created after V5.81.3 Interactive Settings Studio passed.

This document records the bigger Stream Bandit direction so it does not get forgotten during the staged build.

Stream Bandit is not only a streaming app. The long-term goal is to become a customizable video hosting platform and video website builder where creators, admins, small teams or businesses can build their own video sites, customize their look and feel, manage video content, and eventually connect their own domains.

This is a planning document only. It does not change the app.

---

## 1. Core vision

Stream Bandit should grow into a system that lets people create and manage their own video websites.

It should combine:

- Netflix-style browsing and watching
- YouTube-style video sharing and creator channels
- Website-builder customization
- Admin/moderation tools
- Upload/URL flexibility
- Strong accessibility and player comfort
- Own-brand / own-domain video sites later

The V5.81.3 Interactive Settings Studio is the first visible proof of this direction: users should eventually be able to control app identity, theme, colours, logo, home page layout, channel feel and video-site branding.

---

## 2. Product identity

Stream Bandit should be thought of as:

> A customizable video hosting and video website builder platform.

Not just:

> A single streaming site.

The future product should let users build something like:

- a movie/streaming site
- a creator channel hub
- a course/video library
- a private family video site
- a business video portal
- a music/video showcase
- a fan channel
- a paid/premium video library later
- a niche video network

---

## 3. Main user types

### Viewer
Watches videos, searches, saves items, continues watching, likes/favourites and uses accessibility/player comfort settings.

### Creator
Creates a profile/channel, submits videos, manages channel artwork/theme, builds playlists and collections.

### Admin
Approves submissions, edits movie/video data, manages genres/channels, checks health, controls app settings and protects release safety.

### Site Owner
Builds their own branded Stream Bandit video site, controls app identity, custom domain, theme, settings, home sections and content rules.

---

## 4. Website builder direction

The future builder should allow a user/site owner to control:

### Branding
- Site name
- Tagline
- Logo upload
- Logo URL
- Accent colours
- Background colour
- Card/panel colour
- Text colour
- Muted text colour
- Button style
- Font size / readability

### Home page builder
- Hero title
- Hero text
- Hero artwork/video
- Spotlight video
- Featured playlist
- Continue Watching row
- New Uploads row
- Collections row
- Local/URL videos row
- Admin Picks row
- Genre Picks row
- Creator/channel rows

### Navigation builder
- Show/hide nav groups
- Rename nav labels
- Choose homepage sections
- Choose default landing page
- Add custom pages later

### Channel builder
- Channel avatar
- Channel banner
- Channel colours
- Channel layout
- Pinned video
- Featured playlist
- Creator bio
- Social/external links later

### Video page builder
- Poster/backdrop style
- Cast/crew layout
- Trailer section
- Related videos
- Channel card
- Metadata fields
- Buttons shown/hidden

---

## 5. Video hosting platform features

Stream Bandit should eventually support:

### Video source options
- Mux playback ID
- Mux stream URL
- HLS .m3u8 URL
- External public video URL
- Future direct upload through private backend/Mux API

### Image source options
- Supabase Storage upload
- Image URL
- Poster
- Backdrop
- Channel avatar
- Channel banner
- Playlist image
- Collection image
- App logo
- Profile image

### Content management
- Add/edit videos
- Add/edit channels
- Add/edit playlists
- Add/edit collections
- Add/edit genres
- Add/edit tags
- Bulk health check
- Broken artwork check
- Source health check

### Review and moderation
- Submit video
- Review Queue
- Approve/reject/request changes
- Publish only after review
- Admin notes
- Backup before destructive changes

---

## 6. Own-domain hosting idea

Long-term, Stream Bandit should support a path where users can host their video website on their own domain.

Possible future models:

### Static export model
Generate a site package that can be hosted on GitHub Pages, Netlify, Vercel or similar.

### Connected domain model
User connects a custom domain to their Stream Bandit site.

### Template model
User chooses a Stream Bandit template, customizes it, then publishes it.

### Multi-site model later
One admin account can manage more than one video site.

Important future needs:
- site settings table
- site owner profile
- custom domain field
- per-site theme/settings
- per-site content collections
- per-site public/private rules
- backend for secure uploads and Mux actions

---

## 7. Anything-video-sites-need direction

Stream Bandit should aim to cover modern video-site needs, including:

- streaming playback
- upload/URL options
- Mux/HLS support
- creator profiles
- channels
- playlists
- collections
- genres
- search
- watch history
- continue watching
- likes/favourites/watchlist
- admin dashboards
- review queues
- moderation
- theme customization
- logo/branding
- home page builder
- accessibility settings
- player comfort
- subtitles/captions later
- custom domains later
- analytics later
- monetization/memberships later if desired

---

## 8. Builder templates idea

Future templates could include:

### Movie site template
Netflix-style rows, posters, genres and Continue Watching.

### Creator channel template
YouTube-style channel page, uploads, playlists and creator profile.

### Course/video library template
Lessons, modules, progress, locked/premium content later.

### Business video portal template
Training videos, internal channels, restricted access later.

### Fan/community template
Collections, playlists, channels and themed home page.

### Music/video showcase template
Artist channels, music videos, featured releases and playlists.

---

## 9. Settings Studio importance

The Interactive Settings Studio is not just a cosmetic test.

It proves the future builder idea:
- users can control branding
- users can preview themes
- users can adjust accessibility/readability
- users can upload or link images
- users can change home sections
- users can eventually copy/save/publish site settings

V5.81.3 should be remembered as the first proper step toward Stream Bandit becoming a customizable platform builder.

---

## 10. Suggested staged path

### Stage 1: Finish current staged recovery
- Final shell/navigation
- Global search
- Settings Studio preview
- Upload + URL options
- Genre tools
- Profiles/sign in/out
- Channel themes

### Stage 2: Make Settings real
- Save app settings safely
- Save theme settings
- Save home builder toggles
- Save logo/image URLs
- Later add Supabase Storage upload writes

### Stage 3: Creator/site owner tools
- Profile editor
- Channel editor
- Channel theme editor
- Submit video
- Review Queue

### Stage 4: Website builder mode
- Site identity
- Template choice
- Navigation builder
- Home builder
- Domain planning

### Stage 5: Own-domain / multi-site future
- Custom domain support
- Multi-site settings
- Public/private site options
- Secure backend for uploads and Mux actions

---

## 11. Protected rules

- Do not lose the simple streaming app while building the bigger platform vision.
- Do not add dangerous write actions without backup/safety.
- Do not put Mux secrets in frontend GitHub Pages.
- Keep accessibility/audio boost/player comfort protected.
- Keep upload and URL options together where practical.
- Keep the favourite Tools page protected.
- Build in stages so Trevor can test and understand each step.
- The live app should only be promoted after RC passes and Trevor approves.

---

## 12. One-line roadmap reminder

Stream Bandit should become:

> A customizable video hosting platform and video website builder, where users can create their own branded video sites with streaming, channels, uploads, playlists, themes, accessibility and eventually own-domain hosting.
