# Stream Bandit Plan 4 Feature Recovery Inventory

Purpose: keep a clear list of the useful features from the current live Stream Bandit app that must be rebuilt into the new Plan 4 app before release candidate.

This is a planning document only. It does not change the app.

Important rule: use the live app as the feature reference, but rebuild the features cleanly into Plan 4. Do not undo the passed Plan 4 page audits.

---

## 1. Recovery status overview

Current audit status when this inventory was created:
- Functional passed: 30 / 32
- Clean layout passed: 29 / 32
- Live app unchanged
- Plan 4 blueprint created: PLAN4_NAV_FEATURE_BLUEPRINT.md

Main recovery goal:
Bring back the working features and convenience from the live app into the new Plan 4 structure, while keeping the cleaner page routing, tabs, safety rules, and Supabase-first direction.

---

## 2. Live app features found / known from index and app code

The current live app still contains important features that should not be forgotten.

### App / settings seed features
- App name
- Tagline
- Login text
- Hero title
- Hero text
- Home hero toggle
- Home Continue Watching toggle
- Home Featured Playlist toggle
- Home New Uploads toggle
- Home Collections toggle
- Home Local Videos toggle
- Home URL Videos toggle
- Home Admin Picks toggle
- Home Genre Picks toggle
- Featured playlist setting
- Spotlight video setting
- Last backup information
- Logo setting
- Accent colour A
- Accent colour B

### Auth/session features
- Admin login
- User login
- Session storage
- Logout button
- Role display
- Admin-only routes

### Navigation/features
- Home
- Continue Watching
- Library
- Genres
- Watch History
- Channels
- Playlists
- Collections
- Favourites
- Admin
- Settings
- Storage
- Backup

### Search/filter/sort features
- Search movies, tags and channels
- Genre filter
- Channel filter
- Source filter
- Library sort by newest/title/genre/channel
- Unique genre detection
- Unique channel detection

### Video/card features
- Movie cards
- Poster/thumb image
- Source pill
- Genre pills
- Featured badge
- Duration display
- Progress bar
- Details button
- Play button
- Trailer button
- Trailer embed helper
- Cast cleaner and cast layout

### Watch/progress features
- Continue Watching
- Watch History
- Finished items
- Watched time stats
- Mark finished
- Reset/remove progress
- Clear finished progress
- Resume progress

### Queue/player features
- Play All queue
- Queue next
- Queue previous
- Up Next style rows
- Queue should only show next/previous when a real queue exists
- Player comfort scripts loaded in live app
- Buffer guard scripts loaded in live app

### Local video/storage features
- Local video IndexedDB storage
- Save local video
- Load local video
- Delete local video
- List local videos
- Scan local videos
- Delete orphan local videos
- Local storage warning
- Backup/export style safety

### Admin/content features
- Add/edit video data
- Local upload/browser file workflow
- URL video workflow
- Poster/thumb pending image handling
- Channel image pending handling
- Playlist image pending handling
- Collection image pending handling
- Edit video index
- Edit channel index
- Edit playlist index
- Edit collection index

### Data structures
- Videos
- Channels
- Playlists
- Collections
- Progress
- Favourites
- Likes
- Settings
- Users
- Submissions

---

## 3. Must rebuild before release candidate

These are required before any final release candidate is considered.

### A. Global app shell
Rebuild into Plan 4:
- final header/global nav
- global search visible from every main page
- clear sign in / sign out
- profile/account area
- menu groups: WATCH, BROWSE, CREATOR, SUPABASE, MUX, STORAGE, ADMIN TOOLS, SETTINGS
- no old confusing sidebar hash routing

### B. Settings as a real control page
Settings must eventually control real app behaviour again.

Required controls:
- app name
- tagline
- login text
- logo upload and logo URL
- hero title
- hero text
- home section toggles
- spotlight video selector
- featured playlist selector
- accent colours
- profile/account settings
- accessibility settings
- channel theme settings

Storage direction:
- Supabase-first app settings where practical
- sb_profiles for user profile settings
- avoid relying only on localStorage

### C. Upload + URL flexibility
Every relevant form should have upload and URL paths where practical.

Images:
- movie poster upload
- movie poster URL
- movie backdrop upload
- movie backdrop URL
- app logo upload
- app logo URL
- profile avatar upload
- profile avatar URL
- channel avatar upload
- channel avatar URL
- channel banner upload
- channel banner URL
- playlist image upload
- playlist image URL
- collection image upload
- collection image URL

Videos:
- video URL
- Mux playback ID
- HLS .m3u8 URL
- future upload to Mux through private backend

Important:
- Supabase Storage is for images.
- Mux/HLS/public URLs are for video playback.
- Mux secrets must never go in GitHub Pages.

### D. Genre tools
Required:
- genre picker on movie forms
- genre picker on submit forms
- multi-genre support
- create/manage genre option for admin/approved users
- genre browse page stays Supabase-first
- genre filter and genre open behaviour stays understandable

### E. Creator/channel system
Required:
- My Channel
- public channel page
- channel avatar
- channel banner
- channel theme colours
- channel display style
- creator profile card
- channel videos
- Play All channel queue
- next/previous only when channel queue exists

### F. Playlists and collections
Required:
- Open Playlist shows only playlist titles
- Open Collection shows only collection items
- Play All queue
- next/previous only when playlist/collection queue exists
- playlist image upload/URL
- collection image upload/URL
- fix old open-state issues noted during audit

### G. Profiles and auth
Required:
- small profile cards
- visible signed-in user state
- sign in
- sign out
- role display
- admin mode clarity
- sb_profiles usage
- do not use legacy profiles

### H. Player/accessibility
Required:
- louder audio/audio boost preserved
- fullscreen comfort preserved
- player-first layout preserved
- readable controls
- compact Up Next only when queue exists
- accessibility page/settings connected later
- large text/contrast/player comfort preferences later

### I. Tools/Admin safety
Required:
- tools-v5-24-1.html protected
- add Plan 4/global nav to favourite tools later or duplicate it with nav
- Admin Centre remains a route hub
- Review Queue locked until ready
- Backup/Safety before any cleanup
- Live Readiness before any promotion

---

## 4. Things explicitly not to do

- Do not delete tools-v5-24-1.html.
- Do not remove accessibility/audio/player comfort work.
- Do not lose global search.
- Do not replace Plan 4 pages by reverting to old code.
- Do not put Mux secrets in frontend code.
- Do not make admin write tools live without backup/safety.
- Do not promote live without RC and Trevor approval.
- Do not rely on legacy profiles.
- Do not assume sb_channels.user_id exists.

---

## 5. Feature recovery order suggestion

Recommended order after the Plan 4 page audit is complete:

### Step 1: Build the app navigation/help map
Make an in-app page that shows:
- all page groups
- all tabs
- all buttons
- what each page does
- what is read-only vs active
- what is coming later

### Step 2: Build final shell/header
Add:
- global search
- sign in/out area
- profile chip
- clear nav groups
- links to the passed standalone pages

### Step 3: Recover Settings controls
Start with read/write-safe controls:
- app name
- tagline
- logo URL
- accent colours
- home section toggles
Then add upload options later.

### Step 4: Recover upload + URL fields
Start with images:
- posters
- channel images
- playlist/collection images
Then video URL/Mux/HLS fields.

### Step 5: Recover genres
Add:
- pickers
- create/manage genre option
- multi-genre fields

### Step 6: Recover profiles/auth
Add:
- profile card
- sign in/out in shell
- sb_profiles integration

### Step 7: Recover creator/channel themes
Add:
- channel avatar/banner
- channel colours
- channel layout feel
- public channel page polish

### Step 8: Recover admin/review writes carefully
Only after backup/safety:
- submit to sb_submissions
- review queue approve/reject
- publish to sb_movies
- admin edit actions

### Step 9: RC test
Create a release candidate file, smoke test everything, then promote only after Trevor confirms.

---

## 6. New product ideas to consider later

These are ideas only.

### Bandit Channel Worlds
Each channel feels like its own mini streaming service with theme, banner, rows and creator picks.

### Bandit Trails
Guided watch paths across playlists, collections and channels.

### Creator Badges
Badges such as Staff Pick, New Creator, Family Friendly, Horror Picks, Accessibility Friendly.

### Stream Cards
Shareable preview cards for videos and channels.

### Watch Rooms
Future watch-together playlists for friends.

### Source Health Score
Admin health score for each title:
- has poster
- has source
- has genres
- has channel
- has description
- has trailer
- plays successfully

### Upload Wizard
A step-by-step upload flow:
1. Details
2. Artwork
3. Video source
4. Genre/channel
5. Preview
6. Submit/review/publish

### Accessibility-first identity
Make Stream Bandit known for being easier to hear, easier to read and easier to control.

---

## 7. Final release gate

Before live release:
- Plan 4 page audit complete
- Feature recovery inventory complete
- Live settings recovered
- Global shell/header complete
- Global search restored
- Upload/URL fields added
- Profiles/auth clear
- Channel themes planned or wired
- Artwork cleanup done
- Favourite tools protected
- RC file created
- RC smoke test passed
- Backup made
- Trevor says promote live
