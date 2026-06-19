-- Stream Bandit V7.13.001 Social Profile / Feed / Groups Supabase Setup
-- Purpose: foundation tables and RLS for public profiles, profile walls, friends-driven feed, rich posts, image attachments, video URL posts, groups, and group events.
-- Run this in Supabase SQL Editor only when ready.
-- Safe design:
-- - Uses existing auth.users, sb_profiles, sb_user_friends, and sb_private_messages foundation.
-- - Does not change payments, live promotion, index routing, or protected shell files.
-- - Adds only social/profile privacy columns and new social tables.
-- - Stores images in Supabase Storage; videos stay URL-based for MP4/WebM/MOV/HLS/Mux/external embeds.
-- - Public read is allowed only for public active content. Friends/private/group content requires authenticated access.

create extension if not exists pgcrypto;

create or replace function public.sb_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profile social/privacy columns
-- -----------------------------------------------------------------------------

alter table public.sb_profiles add column if not exists profile_visibility text not null default 'public';
alter table public.sb_profiles add column if not exists wall_visibility text not null default 'friends';
alter table public.sb_profiles add column if not exists friends_visibility text not null default 'friends';
alter table public.sb_profiles add column if not exists activity_visibility text not null default 'friends';
alter table public.sb_profiles add column if not exists profile_questions jsonb not null default '{}'::jsonb;
alter table public.sb_profiles add column if not exists profile_social_links jsonb not null default '{}'::jsonb;
alter table public.sb_profiles add column if not exists profile_interests text[] not null default '{}'::text[];
alter table public.sb_profiles add column if not exists profile_website text;
alter table public.sb_profiles add column if not exists profile_location text;
alter table public.sb_profiles add column if not exists social_updated_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'sb_profiles_profile_visibility_check') then
    alter table public.sb_profiles add constraint sb_profiles_profile_visibility_check check (profile_visibility in ('public','friends','private'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sb_profiles_wall_visibility_check') then
    alter table public.sb_profiles add constraint sb_profiles_wall_visibility_check check (wall_visibility in ('public','friends','private'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sb_profiles_friends_visibility_check') then
    alter table public.sb_profiles add constraint sb_profiles_friends_visibility_check check (friends_visibility in ('public','friends','private'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sb_profiles_activity_visibility_check') then
    alter table public.sb_profiles add constraint sb_profiles_activity_visibility_check check (activity_visibility in ('public','friends','private'));
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Social helper functions
-- -----------------------------------------------------------------------------

create or replace function public.sb_social_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sb_profiles p
    where p.id = auth.uid()
      and (
        lower(coalesce(p.role,'')) = 'admin'
        or lower(coalesce(p.admin_level,'')) in ('owner','admin')
      )
  );
$$;

create table if not exists public.sb_user_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create or replace function public.sb_social_has_block(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sb_user_blocks x
    where (x.blocker_id = a and x.blocked_id = b)
       or (x.blocker_id = b and x.blocked_id = a)
  );
$$;

create or replace function public.sb_social_are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select a is not null
     and b is not null
     and a <> b
     and exists (
       select 1
       from public.sb_user_friends f
       where lower(coalesce(f.status,'')) in ('accepted','friend','friends')
         and (
           (f.requester_id = a and f.addressee_id = b)
           or
           (f.requester_id = b and f.addressee_id = a)
         )
     );
$$;

create or replace function public.sb_social_can_view_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sb_profiles p
    where p.id = profile_id
      and (
        public.sb_social_is_admin()
        or p.id = auth.uid()
        or coalesce(p.profile_visibility,'public') = 'public'
        or (coalesce(p.profile_visibility,'public') = 'friends' and public.sb_social_are_friends(auth.uid(), p.id))
      )
      and not public.sb_social_has_block(auth.uid(), p.id)
  );
$$;

create or replace function public.sb_social_can_post_to_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sb_profiles p
    where p.id = profile_id
      and (
        public.sb_social_is_admin()
        or p.id = auth.uid()
        or coalesce(p.wall_visibility,'friends') = 'public'
        or (coalesce(p.wall_visibility,'friends') = 'friends' and public.sb_social_are_friends(auth.uid(), p.id))
      )
      and not public.sb_social_has_block(auth.uid(), p.id)
  );
$$;

-- -----------------------------------------------------------------------------
-- Groups
-- -----------------------------------------------------------------------------

create table if not exists public.sb_social_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text not null default '',
  avatar_url text,
  banner_url text,
  privacy text not null default 'public' check (privacy in ('public','private','unlisted')),
  join_policy text not null default 'request' check (join_policy in ('open','request','invite')),
  status text not null default 'active' check (status in ('active','hidden','archived','deleted')),
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sb_social_groups_owner_idx on public.sb_social_groups(owner_id);
create index if not exists sb_social_groups_slug_idx on public.sb_social_groups(slug);
create index if not exists sb_social_groups_status_privacy_idx on public.sb_social_groups(status, privacy);

drop trigger if exists sb_social_groups_touch_updated_at on public.sb_social_groups;
create trigger sb_social_groups_touch_updated_at
before update on public.sb_social_groups
for each row execute function public.sb_touch_updated_at();

create table if not exists public.sb_social_group_members (
  group_id uuid not null references public.sb_social_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','moderator','member')),
  status text not null default 'active' check (status in ('active','pending','invited','blocked','left')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists sb_social_group_members_user_idx on public.sb_social_group_members(user_id);
create index if not exists sb_social_group_members_group_status_idx on public.sb_social_group_members(group_id, status);

drop trigger if exists sb_social_group_members_touch_updated_at on public.sb_social_group_members;
create trigger sb_social_group_members_touch_updated_at
before update on public.sb_social_group_members
for each row execute function public.sb_touch_updated_at();

create or replace function public.sb_social_group_role(gid uuid, uid uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select gm.role
    from public.sb_social_group_members gm
    where gm.group_id = gid
      and gm.user_id = uid
      and gm.status = 'active'
    limit 1
  ), '')
$$;

create or replace function public.sb_social_can_view_group(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sb_social_groups g
    where g.id = gid
      and g.status = 'active'
      and (
        public.sb_social_is_admin()
        or g.owner_id = auth.uid()
        or g.privacy = 'public'
        or public.sb_social_group_role(g.id, auth.uid()) in ('owner','admin','moderator','member')
      )
  );
$$;

create or replace function public.sb_social_can_manage_group(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.sb_social_is_admin()
      or public.sb_social_group_role(gid, auth.uid()) in ('owner','admin','moderator')
      or exists (select 1 from public.sb_social_groups g where g.id = gid and g.owner_id = auth.uid());
$$;

-- -----------------------------------------------------------------------------
-- Unified posts: news feed, profile wall, group feed
-- -----------------------------------------------------------------------------

create table if not exists public.sb_social_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null default 'global' check (target_type in ('global','profile','group')),
  target_profile_id uuid references public.sb_profiles(id) on delete cascade,
  group_id uuid references public.sb_social_groups(id) on delete cascade,
  body_text text not null default '',
  body_html text not null default '',
  media_kind text not null default 'none' check (media_kind in ('none','image','video_url','mixed')),
  image_url text,
  video_url text,
  video_provider text,
  video_format text check (video_format is null or video_format in ('mp4','webm','mov','hls','mux','youtube','vimeo','embed','other')),
  visibility text not null default 'public' check (visibility in ('public','friends','private','group_members')),
  status text not null default 'active' check (status in ('active','hidden','deleted')),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (target_type = 'global' and target_profile_id is null and group_id is null)
    or (target_type = 'profile' and target_profile_id is not null and group_id is null)
    or (target_type = 'group' and group_id is not null and target_profile_id is null)
  )
);

create index if not exists sb_social_posts_author_idx on public.sb_social_posts(author_id);
create index if not exists sb_social_posts_target_profile_idx on public.sb_social_posts(target_profile_id);
create index if not exists sb_social_posts_group_idx on public.sb_social_posts(group_id);
create index if not exists sb_social_posts_feed_idx on public.sb_social_posts(status, visibility, created_at desc);

drop trigger if exists sb_social_posts_touch_updated_at on public.sb_social_posts;
create trigger sb_social_posts_touch_updated_at
before update on public.sb_social_posts
for each row execute function public.sb_touch_updated_at();

create or replace function public.sb_social_can_view_post(
  p_author uuid,
  p_target_type text,
  p_target_profile_id uuid,
  p_group_id uuid,
  p_visibility text,
  p_status text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.sb_social_is_admin()
    or (
      p_status = 'active'
      and not public.sb_social_has_block(auth.uid(), p_author)
      and (
        p_author = auth.uid()
        or coalesce(p_visibility,'public') = 'public'
        or (coalesce(p_visibility,'public') = 'friends' and public.sb_social_are_friends(auth.uid(), p_author))
        or (p_target_type = 'profile' and p_target_profile_id = auth.uid())
        or (p_target_type = 'profile' and public.sb_social_can_view_profile(p_target_profile_id))
        or (p_target_type = 'group' and public.sb_social_can_view_group(p_group_id))
        or (coalesce(p_visibility,'public') = 'group_members' and p_target_type = 'group' and public.sb_social_can_view_group(p_group_id))
      )
    )
$$;

create or replace function public.sb_social_can_insert_post(
  p_author uuid,
  p_target_type text,
  p_target_profile_id uuid,
  p_group_id uuid,
  p_visibility text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_author = auth.uid()
     and auth.uid() is not null
     and (
       p_target_type = 'global'
       or (p_target_type = 'profile' and public.sb_social_can_post_to_profile(p_target_profile_id))
       or (p_target_type = 'group' and public.sb_social_group_role(p_group_id, auth.uid()) in ('owner','admin','moderator','member'))
     )
     and (
       p_target_type <> 'group'
       or coalesce(p_visibility,'group_members') in ('group_members','public')
     )
$$;

create table if not exists public.sb_social_post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.sb_social_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('image','video_url')),
  url text not null,
  alt_text text not null default '',
  provider text,
  format text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sb_social_post_media_post_idx on public.sb_social_post_media(post_id, sort_order);

create table if not exists public.sb_social_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.sb_social_posts(id) on delete cascade,
  parent_id uuid references public.sb_social_post_comments(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body_text text not null default '',
  body_html text not null default '',
  status text not null default 'active' check (status in ('active','hidden','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sb_social_post_comments_post_idx on public.sb_social_post_comments(post_id, created_at);
create index if not exists sb_social_post_comments_author_idx on public.sb_social_post_comments(author_id);

drop trigger if exists sb_social_post_comments_touch_updated_at on public.sb_social_post_comments;
create trigger sb_social_post_comments_touch_updated_at
before update on public.sb_social_post_comments
for each row execute function public.sb_touch_updated_at();

create table if not exists public.sb_social_post_reactions (
  post_id uuid not null references public.sb_social_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like','love','laugh','wow','sad','boost')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, reaction)
);

-- -----------------------------------------------------------------------------
-- Group events
-- -----------------------------------------------------------------------------

create table if not exists public.sb_social_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.sb_social_groups(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  banner_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  location_text text,
  online_url text,
  privacy text not null default 'group_members' check (privacy in ('public','group_members')),
  status text not null default 'active' check (status in ('active','hidden','cancelled','deleted')),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sb_social_events_group_idx on public.sb_social_events(group_id, starts_at);

drop trigger if exists sb_social_events_touch_updated_at on public.sb_social_events;
create trigger sb_social_events_touch_updated_at
before update on public.sb_social_events
for each row execute function public.sb_touch_updated_at();

create table if not exists public.sb_social_event_rsvps (
  event_id uuid not null references public.sb_social_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  response text not null default 'going' check (response in ('going','maybe','not_going')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

drop trigger if exists sb_social_event_rsvps_touch_updated_at on public.sb_social_event_rsvps;
create trigger sb_social_event_rsvps_touch_updated_at
before update on public.sb_social_event_rsvps
for each row execute function public.sb_touch_updated_at();

-- -----------------------------------------------------------------------------
-- Storage bucket for social images
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'stream-bandit-social-images',
  'stream-bandit-social-images',
  true,
  10485760,
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.sb_user_blocks enable row level security;
alter table public.sb_social_groups enable row level security;
alter table public.sb_social_group_members enable row level security;
alter table public.sb_social_posts enable row level security;
alter table public.sb_social_post_media enable row level security;
alter table public.sb_social_post_comments enable row level security;
alter table public.sb_social_post_reactions enable row level security;
alter table public.sb_social_events enable row level security;
alter table public.sb_social_event_rsvps enable row level security;

-- Blocks

drop policy if exists "Users can read their own blocks" on public.sb_user_blocks;
drop policy if exists "Users can create their own blocks" on public.sb_user_blocks;
drop policy if exists "Users can delete their own blocks" on public.sb_user_blocks;

create policy "Users can read their own blocks"
on public.sb_user_blocks
for select
to authenticated
using (blocker_id = auth.uid() or blocked_id = auth.uid() or public.sb_social_is_admin());

create policy "Users can create their own blocks"
on public.sb_user_blocks
for insert
to authenticated
with check (blocker_id = auth.uid());

create policy "Users can delete their own blocks"
on public.sb_user_blocks
for delete
to authenticated
using (blocker_id = auth.uid() or public.sb_social_is_admin());

-- Groups

drop policy if exists "Users can view allowed groups" on public.sb_social_groups;
drop policy if exists "Users can create groups" on public.sb_social_groups;
drop policy if exists "Group managers can update groups" on public.sb_social_groups;
drop policy if exists "Group owners and admins can delete groups" on public.sb_social_groups;

create policy "Users can view allowed groups"
on public.sb_social_groups
for select
to anon, authenticated
using (public.sb_social_can_view_group(id));

create policy "Users can create groups"
on public.sb_social_groups
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Group managers can update groups"
on public.sb_social_groups
for update
to authenticated
using (public.sb_social_can_manage_group(id))
with check (public.sb_social_can_manage_group(id));

create policy "Group owners and admins can delete groups"
on public.sb_social_groups
for delete
to authenticated
using (owner_id = auth.uid() or public.sb_social_is_admin());

-- Group members

drop policy if exists "Users can view group members for visible groups" on public.sb_social_group_members;
drop policy if exists "Users can request or create own group member row" on public.sb_social_group_members;
drop policy if exists "Group managers can update members" on public.sb_social_group_members;
drop policy if exists "Users or managers can delete members" on public.sb_social_group_members;

create policy "Users can view group members for visible groups"
on public.sb_social_group_members
for select
to authenticated
using (public.sb_social_can_view_group(group_id) or user_id = auth.uid() or public.sb_social_is_admin());

create policy "Users can request or create own group member row"
on public.sb_social_group_members
for insert
to authenticated
with check (user_id = auth.uid() or public.sb_social_can_manage_group(group_id));

create policy "Group managers can update members"
on public.sb_social_group_members
for update
to authenticated
using (user_id = auth.uid() or public.sb_social_can_manage_group(group_id))
with check (user_id = auth.uid() or public.sb_social_can_manage_group(group_id));

create policy "Users or managers can delete members"
on public.sb_social_group_members
for delete
to authenticated
using (user_id = auth.uid() or public.sb_social_can_manage_group(group_id));

-- Posts

drop policy if exists "Users can view allowed social posts" on public.sb_social_posts;
drop policy if exists "Users can create allowed social posts" on public.sb_social_posts;
drop policy if exists "Authors and admins can update social posts" on public.sb_social_posts;
drop policy if exists "Authors and admins can delete social posts" on public.sb_social_posts;

create policy "Users can view allowed social posts"
on public.sb_social_posts
for select
to anon, authenticated
using (public.sb_social_can_view_post(author_id, target_type, target_profile_id, group_id, visibility, status));

create policy "Users can create allowed social posts"
on public.sb_social_posts
for insert
to authenticated
with check (public.sb_social_can_insert_post(author_id, target_type, target_profile_id, group_id, visibility));

create policy "Authors and admins can update social posts"
on public.sb_social_posts
for update
to authenticated
using (author_id = auth.uid() or public.sb_social_is_admin() or (target_type = 'group' and public.sb_social_can_manage_group(group_id)))
with check (author_id = auth.uid() or public.sb_social_is_admin() or (target_type = 'group' and public.sb_social_can_manage_group(group_id)));

create policy "Authors and admins can delete social posts"
on public.sb_social_posts
for delete
to authenticated
using (author_id = auth.uid() or public.sb_social_is_admin() or (target_type = 'group' and public.sb_social_can_manage_group(group_id)));

-- Post media

drop policy if exists "Users can view media for visible posts" on public.sb_social_post_media;
drop policy if exists "Authors can create media for own posts" on public.sb_social_post_media;
drop policy if exists "Authors can update media for own posts" on public.sb_social_post_media;
drop policy if exists "Authors can delete media for own posts" on public.sb_social_post_media;

create policy "Users can view media for visible posts"
on public.sb_social_post_media
for select
to anon, authenticated
using (exists (
  select 1 from public.sb_social_posts p
  where p.id = post_id
    and public.sb_social_can_view_post(p.author_id, p.target_type, p.target_profile_id, p.group_id, p.visibility, p.status)
));

create policy "Authors can create media for own posts"
on public.sb_social_post_media
for insert
to authenticated
with check (author_id = auth.uid() and exists (select 1 from public.sb_social_posts p where p.id = post_id and p.author_id = auth.uid()));

create policy "Authors can update media for own posts"
on public.sb_social_post_media
for update
to authenticated
using (author_id = auth.uid() or public.sb_social_is_admin())
with check (author_id = auth.uid() or public.sb_social_is_admin());

create policy "Authors can delete media for own posts"
on public.sb_social_post_media
for delete
to authenticated
using (author_id = auth.uid() or public.sb_social_is_admin());

-- Comments

drop policy if exists "Users can view comments for visible posts" on public.sb_social_post_comments;
drop policy if exists "Users can comment on visible posts" on public.sb_social_post_comments;
drop policy if exists "Authors and moderators can update comments" on public.sb_social_post_comments;
drop policy if exists "Authors and moderators can delete comments" on public.sb_social_post_comments;

create policy "Users can view comments for visible posts"
on public.sb_social_post_comments
for select
to anon, authenticated
using (status = 'active' and exists (
  select 1 from public.sb_social_posts p
  where p.id = post_id
    and public.sb_social_can_view_post(p.author_id, p.target_type, p.target_profile_id, p.group_id, p.visibility, p.status)
));

create policy "Users can comment on visible posts"
on public.sb_social_post_comments
for insert
to authenticated
with check (author_id = auth.uid() and exists (
  select 1 from public.sb_social_posts p
  where p.id = post_id
    and public.sb_social_can_view_post(p.author_id, p.target_type, p.target_profile_id, p.group_id, p.visibility, p.status)
));

create policy "Authors and moderators can update comments"
on public.sb_social_post_comments
for update
to authenticated
using (author_id = auth.uid() or public.sb_social_is_admin())
with check (author_id = auth.uid() or public.sb_social_is_admin());

create policy "Authors and moderators can delete comments"
on public.sb_social_post_comments
for delete
to authenticated
using (author_id = auth.uid() or public.sb_social_is_admin());

-- Reactions

drop policy if exists "Users can view reactions for visible posts" on public.sb_social_post_reactions;
drop policy if exists "Users can create own reactions" on public.sb_social_post_reactions;
drop policy if exists "Users can delete own reactions" on public.sb_social_post_reactions;

create policy "Users can view reactions for visible posts"
on public.sb_social_post_reactions
for select
to anon, authenticated
using (exists (
  select 1 from public.sb_social_posts p
  where p.id = post_id
    and public.sb_social_can_view_post(p.author_id, p.target_type, p.target_profile_id, p.group_id, p.visibility, p.status)
));

create policy "Users can create own reactions"
on public.sb_social_post_reactions
for insert
to authenticated
with check (user_id = auth.uid() and exists (
  select 1 from public.sb_social_posts p
  where p.id = post_id
    and public.sb_social_can_view_post(p.author_id, p.target_type, p.target_profile_id, p.group_id, p.visibility, p.status)
));

create policy "Users can delete own reactions"
on public.sb_social_post_reactions
for delete
to authenticated
using (user_id = auth.uid() or public.sb_social_is_admin());

-- Events

drop policy if exists "Users can view group events" on public.sb_social_events;
drop policy if exists "Group members can create events" on public.sb_social_events;
drop policy if exists "Event creators and managers can update events" on public.sb_social_events;
drop policy if exists "Event creators and managers can delete events" on public.sb_social_events;

create policy "Users can view group events"
on public.sb_social_events
for select
to anon, authenticated
using (status = 'active' and (privacy = 'public' or public.sb_social_can_view_group(group_id)));

create policy "Group members can create events"
on public.sb_social_events
for insert
to authenticated
with check (creator_id = auth.uid() and public.sb_social_group_role(group_id, auth.uid()) in ('owner','admin','moderator','member'));

create policy "Event creators and managers can update events"
on public.sb_social_events
for update
to authenticated
using (creator_id = auth.uid() or public.sb_social_can_manage_group(group_id))
with check (creator_id = auth.uid() or public.sb_social_can_manage_group(group_id));

create policy "Event creators and managers can delete events"
on public.sb_social_events
for delete
to authenticated
using (creator_id = auth.uid() or public.sb_social_can_manage_group(group_id));

-- RSVPs

drop policy if exists "Users can view rsvps for visible events" on public.sb_social_event_rsvps;
drop policy if exists "Users can create own rsvp" on public.sb_social_event_rsvps;
drop policy if exists "Users can update own rsvp" on public.sb_social_event_rsvps;
drop policy if exists "Users can delete own rsvp" on public.sb_social_event_rsvps;

create policy "Users can view rsvps for visible events"
on public.sb_social_event_rsvps
for select
to authenticated
using (user_id = auth.uid() or public.sb_social_is_admin() or exists (
  select 1 from public.sb_social_events e
  where e.id = event_id
    and (e.privacy = 'public' or public.sb_social_can_view_group(e.group_id))
));

create policy "Users can create own rsvp"
on public.sb_social_event_rsvps
for insert
to authenticated
with check (user_id = auth.uid() and exists (
  select 1 from public.sb_social_events e
  where e.id = event_id
    and (e.privacy = 'public' or public.sb_social_can_view_group(e.group_id))
));

create policy "Users can update own rsvp"
on public.sb_social_event_rsvps
for update
to authenticated
using (user_id = auth.uid() or public.sb_social_is_admin())
with check (user_id = auth.uid() or public.sb_social_is_admin());

create policy "Users can delete own rsvp"
on public.sb_social_event_rsvps
for delete
to authenticated
using (user_id = auth.uid() or public.sb_social_is_admin());

-- Storage policies for social image bucket

drop policy if exists "Public can read social images" on storage.objects;
drop policy if exists "Authenticated users can upload own social images" on storage.objects;
drop policy if exists "Authenticated users can update own social images" on storage.objects;
drop policy if exists "Authenticated users can delete own social images" on storage.objects;

create policy "Public can read social images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'stream-bandit-social-images');

create policy "Authenticated users can upload own social images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'stream-bandit-social-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Authenticated users can update own social images"
on storage.objects
for update
to authenticated
using (bucket_id = 'stream-bandit-social-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'stream-bandit-social-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Authenticated users can delete own social images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'stream-bandit-social-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- Quick checks after running
-- -----------------------------------------------------------------------------

-- select public.sb_social_is_admin();
-- select table_name from information_schema.tables where table_schema='public' and table_name like 'sb_social_%' order by table_name;
-- select column_name from information_schema.columns where table_schema='public' and table_name='sb_profiles' and column_name like '%visibility%' order by column_name;
-- select id, name, public from storage.buckets where id='stream-bandit-social-images';
