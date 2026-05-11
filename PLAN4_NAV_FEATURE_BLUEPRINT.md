# Stream Bandit Plan 4 Navigation + Feature Recovery Blueprint

Checkpoint date: after Settings V5.77.3 Plan 4 audit passed.
Status at time of writing:
- Functional passed: 30 / 32
- Clean layout passed: 29 / 32
- Live app unchanged
- Remaining before release candidate: final navigation blueprint, feature recovery inventory, then shell/RC work

This document is a planning map only. It does not change the live app. It explains what is going to happen next, what belongs on each page, what tabs/pages should exist, what features must be recovered from the current live app, and some future ideas for Stream Bandit as a YouTube-cross-Netflix style video sharing system with its own twist.

---

## 1. Core product direction

Stream Bandit is planned as a streaming/video sharing platform that mixes:

- Netflix-style browsing: rows, genres, collections, playlists, Continue Watching, featured picks, high-quality artwork.
- YouTube-style sharing: creator channels, submissions, review queue, channel customization, user profiles, upload/URL flows.
- Stream Bandit twist: creator-controlled channel worlds, stronger accessibility, louder audio comfort, curated queues, safe admin tools, and a clear route map that Trevor can understand and test.

The new Plan 4 app should keep the clean standalone page structure already built, then recover the useful live-app features into this new structure as clean new code.

Important rule: do not revert the passed Plan 4 pages. Use the current live app as a feature reference, not as code to copy blindly.

---

## 2. Main navigation groups

The final app shell should have clear groups so Trevor and users can understand where everything lives.

### WATCH
Pages focused on watching and personal viewing:
- Home
- Continue Watching
- Watchlist
- Favourites
- Liked
- Watch History
- Play page
- Details page
- Accessibility / Player Comfort

### BROWSE
Pages focused on discovering content:
- Library
- Supabase Library
- Genres
- Search / Filters
- Channels
- Collections
- Playlists
- My Channel
- About

### CREATOR
Pages for creators and channel owners:
- My Channel
- Channel editor
- Channel theme/customization
- Submit Video
- Submission status
- Creator profile
- Creator dashboard later

### SUPABASE
Database and app data tools:
- Supabase Manager
- Supabase Test
- Supabase Migration locked route
- Supabase Library
- Table/readiness health views

### MUX / VIDEO
Video hosting and playback tools:
- Mux Manager
- HLS / URL helper
- Upload Plan
- Playback ID formatter
- Future backend upload route planning

### STORAGE
Image/browser/storage safety tools:
- Local Storage
- Storage Prep
- Backup / Safety
- Supabase image bucket planning
- Artwork/image checker later

### ADMIN TOOLS
Admin and moderation:
- Admin Centre
- Favourite Tools V5.24.1
- Review Queue
- Rules
- Test Checklist
- Health Check
- Live Readiness
- Link + Layout Audit

### SETTINGS
User/app customization:
- Settings
- Profile / Auth
- Accessibility settings
- Branding / Theme
- Channel themes
- Sign in / Sign out

---

## 3. Page/tab/button map

### Home
Purpose: main viewing entry point.
Tabs/sections later:
- Spotlight / hero
- Continue Watching
- Featured Playlist
- Recently Added
- Collections
- Local videos
- URL videos
- Admin Picks
- Genre Picks
Buttons:
- Search bar in global header
- Open Details
- Play
- Add/remove Watchlist
- Add/remove Favourites
- Like/unlike
- Open row / Play All
Required recovery:
- Home settings toggles from live app
- spotlight video
- featured playlist
- hero title/text
- global search across all pages

### Library
Purpose: all movie/video browsing.
Tabs/sections:
- All
- Genres/filter
- Channels/filter
- Source filter: Mux/HLS/URL/local/empty
- Sort
Buttons:
- Details
- Play
- Watchlist
- Favourite
- Like
Required recovery:
- library filter/search convenience
- global search top bar
- fix open-state behaviour later so filtered items show only correct items

### Details
Purpose: movie information page.
Tabs/sections:
- Overview
- Cast
- Trailers
- More Like This
- Technical / Source info later
Buttons:
- Play
- Trailer opens on Details, not external-only pages
- Watchlist
- Favourite
- Like
Required recovery:
- trailers should open on Details page
- cast formatting
- accessibility/player comfort links

### Play
Purpose: player and queue page.
Tabs/sections:
- Player
- Up Next / queue
- Details panel
Buttons:
- Play/Pause native controls
- Fullscreen
- Audio boost / comfort controls
- Queue next/previous only when a queue exists
Required recovery:
- player comfort
- audio boost/louder audio
- fullscreen comfort
- buffer guard/monitor notes

### Continue Watching
Purpose: resume progress.
Tabs/sections:
- Continue
- Finished
- History shortcut
Buttons:
- Resume
- Remove progress
- Mark finished
Required recovery:
- Supabase-first progress
- user-specific progress after auth/profile wiring

### Watchlist / Favourites / Liked
Purpose: personal saves.
Tabs/sections:
- Saved items
- Empty state
- Sort/filter later
Buttons:
- Remove from Watchlist/Favourites/Liked
- Details
- Play
- Play All if list has multiple items
Required recovery:
- correct add/remove labels
- Supabase-first save state

### Watch History
Purpose: viewing history.
Tabs/sections:
- Recent
- Finished
- Stats later
Buttons:
- Details
- Resume
- Remove history item later
Required recovery:
- user profile specific history

### Genres
Purpose: browse by genre.
Tabs/sections:
- Genre list
- Selected genre
- Genre tools later
Buttons:
- Open Genre
- Filter
- Play All selected genre
Required recovery:
- genre page should look like the Tools page style where desired
- genre picker fields in admin/forms
- create/manage genre options before release

### Channels
Purpose: creator/channel browsing.
Tabs/sections:
- All channels
- Open Channel
- Channel videos
- Channel theme preview later
Buttons:
- Open Channel
- Play All
- Next/Previous only in channel queue
Required recovery:
- Open Channel card action
- Play All / next / previous on channel queues
- channel avatar/banner upload and URL options
- user channel customization and themes

### Collections
Purpose: curated groups.
Tabs/sections:
- All collections
- Open Collection
- Collection details
Buttons:
- Open Collection
- Play All
- Next/Previous when playing collection queue
Required recovery:
- open collection should show only real collection items
- Scream collection should show Scream 7 only when that is the collection item
- collection image upload and URL options later

### Playlists
Purpose: ordered queues.
Tabs/sections:
- All playlists
- Open Playlist
- Playlist details
Buttons:
- Open Playlist
- Play All
- Next/Previous playlist queue
Required recovery:
- playlist titles must show inside playlist
- playlist image upload and URL options

### My Channel
Purpose: signed-in creator home.
Tabs/sections:
- My profile
- My channel
- My uploads/submissions
- Customization later
Buttons:
- Edit channel later
- Submit video
- Open public channel
Required recovery:
- small profiles
- sign in/out
- sb_profiles
- channel look/feel customization

### About
Purpose: explain app.
Tabs/sections:
- What Stream Bandit is
- How to watch
- Creator idea
- Accessibility promise
Required recovery:
- keep simple and user-friendly

---

## 4. Admin/tools map

### Admin Centre
Purpose: safe route hub for admin work.
Tabs:
- Overview
- Movies / Rows
- Media / Uploads
- Review / Submit
- Safety
- Audit Checklist
- Rules
Future upgrades:
- real movie editor later
- genre management
- upload + URL controls
- status/publish controls
- safe admin-only protections

### Favourite Tools V5.24.1
Purpose: Trevor's favourite working tools page.
Rule:
- Do not delete tools-v5-24-1.html.
- Later either keep it linked or duplicate it with Plan 4 global nav above it.
Required:
- preserve its working features
- add Plan 4 nav/global header later

### Supabase Manager
Purpose: read/manage app data safely.
Tabs:
- Movies
- Channels
- Collections
- Playlists
- Profiles/settings later
Future upgrades:
- admin editing later after backup/safety
- image URL/upload fields
- genre picker

### Supabase Test
Purpose: verify Supabase auth, reads, table counts.
Tabs:
- Overview
- Auth/profile
- Table counts
- Rules
Required:
- keep sb_profiles rule
- do not assume sb_channels.user_id

### Supabase Migration
Purpose: locked historic migration route.
Tabs:
- Overview
- Migration status
- Locked tools
- Table line-up
- Rules
Rule:
- no import/overwrite/delete unless separately planned and backed up

### Mux Manager
Purpose: video URL/playback helper.
Tabs:
- Overview
- Playback formatter
- HLS / URL notes
- Locked actions
Future upgrades:
- private backend for Mux upload/create/delete
- never put Mux secrets in GitHub Pages

### Upload Plan
Purpose: safe upload rules.
Tabs:
- Overview
- Images
- Videos
- Locked uploads
Future upgrades:
- image upload to Supabase Storage
- video upload path through Mux/backend
- URL fields everywhere relevant

### Local Storage
Purpose: read browser storage only.
Tabs:
- Overview
- Storage Audit
- Legacy Keys
- Locked Actions
Future upgrades:
- cleanup after backup/safety only

### Storage Prep
Purpose: storage safety and artwork path.
Tabs:
- Overview
- Buckets / Paths
- Artwork Rules
- Locked Actions
Future upgrades:
- artwork scanner
- 1920x1080 checker
- broken URL checker

### Backup / Safety
Purpose: backup rules before cleanup or release.
Tabs:
- Overview
- Backup Rules
- Release Safety
- Locked Actions
Rule:
- no live promotion until RC passes and Trevor says promote live

### Live Readiness
Purpose: release gates.
Tabs:
- Overview
- Passed Blocks
- Before Live
- Risks / Hold Items
- Audit Checklist
- Rules
Future upgrades:
- remove temporary Issue #40 link before RC

### Health Check
Purpose: read-only app health.
Tabs:
- Overview
- System Checks
- Table Counts
- Risks / Holds
- Audit Checklist
- Rules
Future upgrades:
- add player/source checks later

### Test Checklist
Purpose: final manual QA checklist.
Tabs:
- Overview
- Page Checks
- Shell Checks
- Feature Recovery
- Release Checks
- Audit Checklist
- Rules
Future upgrades:
- update as RC checklist

### Rules
Purpose: submission/review rules.
Tabs:
- Overview
- Submission Rules
- Review Rules
- Locked Actions
- Checklist
- Rules
Future upgrades:
- accepted rules state later if needed

### Review Queue
Purpose: review submissions.
Tabs:
- Overview
- Queue Read
- Review Rules
- Locked Actions
- Checklist
- Rules
Future upgrades:
- approve/reject/request changes after admin/auth is ready
- publish to sb_movies only after review

### Submit Video
Purpose: creator/user submission.
Tabs:
- Overview
- Submission Preview
- Submission Flow
- Locked Actions
- Checklist
- Rules
Future upgrades:
- real sb_submissions write
- poster upload/URL
- video URL/Mux/HLS fields
- genre picker

### Settings
Purpose: app/profile/theme controls.
Tabs:
- Overview
- Live Settings Recovery
- Profile / Auth
- Accessibility
- Branding / Theme
- Channel Theme
- Audit Checklist
- Rules
Future upgrades:
- real app identity settings
- logo upload/URL
- app name/tagline/login text
- hero/home builder settings
- profile settings
- channel theme settings
- accessibility settings

---

## 5. Feature recovery inventory from live app

These live app features must be recovered into the new Plan 4 app before release.

### App identity and branding
- App name
- Tagline
- Login text
- Logo
- Sidebar brand/logo sync
- Accent colour A
- Accent colour B
- Public display labels

### Home builder
- Hero title
- Hero text
- Home hero toggle
- Continue Watching toggle
- Featured Playlist toggle
- New Uploads toggle
- Collections toggle
- Local Videos toggle
- URL Videos toggle
- Admin Picks toggle
- Genre Picks toggle
- Featured playlist selector
- Spotlight video selector

### Search and filtering
- Global top search on every main page
- Search by title, tags, genres, channel, rating, year
- Library filters
- Genre filters
- Channel filters
- Sort controls

### Upload and URL flexibility
Every relevant form should support both upload and URL where practical.

Images:
- movie poster
- movie backdrop
- channel avatar
- channel banner
- playlist image
- collection image
- profile image
- app logo

Videos:
- public video URL
- Mux playback ID
- HLS .m3u8 URL
- future upload route through Mux/backend

### Genre management
- Genre pickers on movie/admin/submission forms
- Multi-genre support
- Create/manage genres for admin/approved users
- Genre browse page remains Supabase-first

### Profiles and auth
- Sign in
- Sign out
- Small profile cards
- Profile images
- User role display
- Admin/user modes
- sb_profiles, not legacy profiles

### Channel customization
- Channel avatar/banner upload + URL
- Channel colours/theme
- Channel layout feel
- Channel public display style
- User-owned channel identity

### Player and accessibility
- Audio boost / louder audio comfort
- Fullscreen comfort
- Player-first layout
- Compact queue when queue exists
- Next/Previous only when playing from channel/playlist/collection/watchlist queues
- Larger text/contrast/player comfort settings later

### Admin and safety
- Favourite Tools V5.24.1 protected
- Admin Centre route hub
- Backup before cleanup
- Locked dangerous actions until approved
- Live Readiness before release

---

## 6. New ideas for Stream Bandit

These are future ideas only, not build-now tasks.

### 1. Channel worlds
Each creator channel can feel like a mini streaming service:
- custom banner
- colours/theme
- channel intro text
- featured playlist
- pinned video
- genre shelves
- creator picks

### 2. Bandit Trails
A smart watch path that turns collections/playlists/channels into guided viewing journeys.
Example: Horror Night Trail, New Creator Trail, Short Film Trail, Family Safe Trail.

### 3. Stream Cards
Shareable video cards with poster, title, genre, channel and play link. Later these could be used for social sharing.

### 4. Creator badges
Badges for channels:
- New Creator
- Verified by Admin
- Family Friendly
- Horror Picks
- Staff Pick
- Accessibility Friendly

### 5. Watch rooms later
A future watch-together mode where a playlist can be shared and watched with friends. This is a later idea and would need backend/session support.

### 6. Bandit Picks
A curated row that mixes Netflix-style curation with YouTube discovery:
- admin picks
- new creators
- trending channels
- hidden gems
- continue from creator

### 7. Safe creator submissions
Creators submit, but nothing goes public until Review Queue approval. This keeps the app clean and safe.

### 8. Accessibility-first streaming
Make Stream Bandit stand out by treating accessibility as a core feature:
- louder audio modes
- large controls
- high contrast mode
- readable captions/subtitle plan later
- player comfort defaults

### 9. Creator profile cards
Small profile cards shown beside submitted videos or channel pages:
- avatar
- display name
- role
- channel link
- badges

### 10. Smart empty states
Every empty page should explain what to do next.
Example: No playlists yet — create one in Admin or save videos from Details.

### 11. Upload wizard
A future step-by-step upload flow:
1. Add title/details
2. Add poster/backdrop
3. Add video URL/Mux/HLS
4. Choose genre/channel
5. Preview card
6. Submit/review/publish

### 12. Source health score
Admin sees whether a movie is healthy:
- has poster
- has video source
- has genres
- has channel
- has description
- plays successfully

---

## 7. Release path from here

### Phase A: Finish Plan 4 audit
- Finish remaining page passes.
- Confirm Settings, Admin and map are available.
- Do not promote live yet.

### Phase B: Navigation blueprint / map
- Convert this blueprint into a proper in-app help/map page later.
- Remove or replace temporary Issue #40 links before RC.
- Add global nav/header plan.

### Phase C: Feature recovery inventory
- Compare live app to new Plan 4 app.
- List missing features.
- Rebuild missing features cleanly.
- Do not undo passed audit pages.

### Phase D: Functional wiring
- Auth/profile wiring
- Settings saving
- Upload/URL fields
- Genre management
- Channel customization
- Review Queue actions
- Admin editor actions

### Phase E: Shell and RC
- Build final shell/global nav.
- Add global search.
- Smoke test all pages.
- Fix artwork and broken links.
- Create release candidate test file.

### Phase F: Promote live only after approval
- Backup current live app.
- Run RC checklist.
- Trevor confirms pass.
- Then promote live.

---

## 8. Protected non-negotiables

- Do not delete tools-v5-24-1.html.
- Do not lose accessibility/audio boost/player comfort.
- Do not lose global search.
- Do not lose upload + URL flexibility.
- Do not lose creator/channel idea.
- Use sb_profiles for profile work.
- Do not assume sb_channels.user_id exists.
- Do not place Mux secrets in GitHub Pages.
- No live promotion until RC passes and Trevor says promote live.
