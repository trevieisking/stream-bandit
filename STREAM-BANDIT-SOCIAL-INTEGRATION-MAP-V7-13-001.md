# Stream Bandit Social Integration Map V7.13.001

## Purpose

This file records how the new Social Profile / Feed / Friends / Groups work must reuse the existing Stream Bandit data that is already live in Supabase.

The social layer is not a replacement for the current app tables. It is an overlay that must read and connect the existing account, friend, message, likes, movies, and Web Builder page data.

## Existing data that must be reused

### 1. Friends

Existing table:

```text
public.sb_user_friends
```

Known real columns from supplied export:

```text
id
requester_id
addressee_id
status
requester_note
addressee_note
created_at
updated_at
```

Confirmed use:

```text
- status='accepted' means users are friends.
- requester_id and addressee_id are both profile/auth user ids.
- social privacy must use this table for friends-only visibility.
- Friends Manager must not create a second friendship table.
```

Implementation note:

```text
public.sb_social_are_friends(a,b)
```

must continue to check both directions:

```text
(requester_id=a and addressee_id=b) or (requester_id=b and addressee_id=a)
```

Accepted statuses should include:

```text
accepted
friend
friends
```

The current SQL foundation already follows this direction.

### 2. Likes / liked movies

Existing table:

```text
public.sb_likes
```

Known real columns from supplied export:

```text
user_id
movie_id
created_at
```

Confirmed use:

```text
- Profile pages need a Liked Movies / Watch Taste section.
- News Feed can optionally show activity such as "liked a movie".
- Social reactions on feed posts must stay separate in sb_social_post_reactions.
- Do not migrate movie likes into post reactions.
```

Page behavior:

```text
Profile -> Activity tab reads sb_likes joined with sb_movies.
Profile -> Liked Movies tab reads sb_likes for visible profile users.
News Feed -> optional activity card can read sb_likes, but should be a read-only social signal.
```

### 3. Private messages

Existing table:

```text
public.sb_private_messages
```

Known real columns from supplied export:

```text
id
thread_id
parent_message_id
form_submission_id
page_slug
sender_id
sender_email
sender_name
recipient_id
recipient_email
recipient_name
subject
body
kind
status
sent_at
read_at
sender_trashed_at
recipient_trashed_at
sender_deleted_at
recipient_deleted_at
spam_at
meta
created_at
updated_at
```

Confirmed use:

```text
- Friends Manager should open/start private message threads using this table.
- Profile cards should show Message button where privacy/block rules allow.
- News Feed and Groups should not duplicate private messages.
- Global footer messenger remains the universal communications overlay.
```

Important compatibility note:

```text
Some legacy/private-message rows use recipient_email without recipient_id.
New social pages should prefer recipient_id when available, but fallback to email-based display where existing data has no recipient_id.
```

### 4. Web Builder pages / one-page context

Existing table:

```text
public.sb_site_pages
```

Known real columns from supplied export:

```text
id
slug
title
page_type
status
layout_json
settings_json
owner_id
created_at
updated_at
```

Confirmed use:

```text
- The social/profile "one" page may need to show owned pages, forms, and builder-shell links.
- sb_site_pages must remain the Web Builder page source of truth.
- Social Profile should link to public/owned pages where visibility allows.
- Do not create a duplicate social_pages table.
```

Page behavior:

```text
Profile -> Pages tab can read published sb_site_pages for that owner_id.
Owner view can show draft/hidden pages for own profile.
Groups may later link a group landing page to sb_site_pages through settings_json, not a new page table.
```

## Unified social page dependencies

The eventual social/profile one-page build should load in this order:

```text
1. Supabase Auth session
2. Current user's sb_profiles row
3. Viewed user's sb_profiles row
4. Friend relationship from sb_user_friends
5. Block relationship from sb_user_blocks
6. Profile privacy settings from sb_profiles
7. Profile wall / feed posts from sb_social_posts
8. Profile comments/reactions from sb_social_post_comments and sb_social_post_reactions
9. Liked movies from sb_likes + sb_movies
10. Messages from sb_private_messages
11. Owned/published pages from sb_site_pages
12. Groups/events from sb_social_groups, sb_social_group_members, sb_social_events
```

## Build order adjusted after supplied data

```text
1. Keep supabase-social-profile-feed-groups-v7-13-001.sql as foundation.
2. Build Friends Manager first using sb_user_friends real columns.
3. Add Profile Activity/Liked Movies using sb_likes + sb_movies.
4. Add Message button using sb_private_messages compatibility.
5. Add Profile Pages tab using sb_site_pages owner_id/status.
6. Then build News Feed and Groups pages on top of sb_social_posts.
```

## Safety notes

```text
- No production data should be inserted by repo files.
- Supplied INSERT rows are evidence/fixtures, not migration content.
- Keep personal emails and private message body examples out of UI test files.
- Do not duplicate existing tables.
- Use existing sb_user_friends, sb_likes, sb_private_messages, sb_site_pages as source-of-truth dependencies.
```
