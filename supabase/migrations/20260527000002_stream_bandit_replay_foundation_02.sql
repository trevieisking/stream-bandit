-- Stream Bandit replay foundation part.
-- SOURCE CANDIDATE ONLY.
-- Schema-only reconstruction of the pre-ledger foundation.
-- Test on a fresh database before any deployment or production decision.
-- Creates no rows and performs no destructive table or schema operation.

begin;

create table if not exists public.sb_social_groups (
  id uuid default gen_random_uuid() not null,
  owner_id uuid not null,
  slug text not null,
  name text not null,
  description text,
  avatar_url text,
  banner_url text,
  privacy text default 'public'::text not null,
  join_policy text default 'open'::text not null,
  status text default 'active'::text not null,
  settings_json jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_social_groups_join_policy_check check (join_policy = any (array['open','request','invite']::text[])),
  constraint sb_social_groups_pkey primary key (id),
  constraint sb_social_groups_privacy_check check (privacy = any (array['public','private','unlisted']::text[])),
  constraint sb_social_groups_slug_key unique (slug),
  constraint sb_social_groups_status_check check (status = any (array['active','hidden','archived','deleted']::text[]))
);

create table if not exists public.sb_social_group_members (
  group_id uuid not null,
  user_id uuid not null,
  role text default 'member'::text not null,
  status text default 'active'::text not null,
  invited_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_social_group_members_pkey primary key (group_id, user_id),
  constraint sb_social_group_members_role_check check (role = any (array['owner','admin','moderator','member']::text[])),
  constraint sb_social_group_members_status_check check (status = any (array['active','pending','invited','blocked','left']::text[]))
);

create table if not exists public.sb_social_posts (
  id uuid default gen_random_uuid() not null,
  author_id uuid not null,
  target_type text default 'global'::text not null,
  target_profile_id uuid,
  group_id uuid,
  body_text text,
  body_html text,
  media_kind text default 'none'::text not null,
  image_url text,
  video_url text,
  video_provider text,
  video_format text,
  visibility text default 'public'::text not null,
  status text default 'active'::text not null,
  metadata_json jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_social_posts_media_kind_check check (media_kind = any (array['none','image','video_url','mixed']::text[])),
  constraint sb_social_posts_pkey primary key (id),
  constraint sb_social_posts_status_check check (status = any (array['active','hidden','deleted']::text[])),
  constraint sb_social_posts_target_check check ((target_type='global' and target_profile_id is null and group_id is null) or (target_type='profile' and target_profile_id is not null and group_id is null) or (target_type='group' and group_id is not null and target_profile_id is null)),
  constraint sb_social_posts_target_type_check check (target_type = any (array['global','profile','group']::text[])),
  constraint sb_social_posts_visibility_check check (visibility = any (array['public','friends','private','group_members']::text[]))
);

create table if not exists public.sb_social_post_comments (
  id uuid default gen_random_uuid() not null,
  post_id uuid not null,
  author_id uuid not null,
  parent_comment_id uuid,
  body_text text not null,
  body_html text,
  status text default 'active'::text not null,
  metadata_json jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_social_post_comments_pkey primary key (id),
  constraint sb_social_post_comments_status_check check (status = any (array['active','hidden','deleted']::text[]))
);

create table if not exists public.sb_social_post_media (
  id uuid default gen_random_uuid() not null,
  post_id uuid not null,
  user_id uuid not null,
  media_type text not null,
  url text not null,
  thumbnail_url text,
  alt_text text,
  sort_order integer default 0 not null,
  metadata_json jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  constraint sb_social_post_media_pkey primary key (id),
  constraint sb_social_post_media_type_check check (media_type = any (array['image','video_url','link','embed']::text[]))
);

create table if not exists public.sb_social_notifications (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  actor_id uuid,
  notification_type text not null,
  title text not null,
  body text,
  target_type text,
  target_id uuid,
  read_at timestamptz,
  metadata_json jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  constraint sb_social_notifications_pkey primary key (id),
  constraint sb_social_notifications_type_check check (notification_type = any (array['friend','family','post','comment','reaction','group','event','message','system']::text[]))
);

create table if not exists public.sb_user_friends (
  id uuid default gen_random_uuid() not null,
  requester_id uuid not null,
  addressee_id uuid not null,
  status text default 'pending'::text not null,
  requester_note text,
  addressee_note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_user_friends_check check (requester_id <> addressee_id),
  constraint sb_user_friends_pkey primary key (id),
  constraint sb_user_friends_status_check check (status = any (array['pending','accepted','declined','cancelled']::text[]))
);

create table if not exists public.sb_profile_social_settings (
  user_id uuid not null,
  profile_visibility text default 'public'::text not null,
  wall_visibility text default 'friends'::text not null,
  friends_visibility text default 'friends'::text not null,
  activity_visibility text default 'friends'::text not null,
  profile_questions jsonb default '{}'::jsonb not null,
  profile_social_links jsonb default '{}'::jsonb not null,
  profile_interests text[] default '{}'::text[] not null,
  profile_website text,
  profile_location text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_profile_social_settings_activity_visibility_check check (activity_visibility = any (array['public','friends','private']::text[])),
  constraint sb_profile_social_settings_friends_visibility_check check (friends_visibility = any (array['public','friends','private']::text[])),
  constraint sb_profile_social_settings_pkey primary key (user_id),
  constraint sb_profile_social_settings_profile_visibility_check check (profile_visibility = any (array['public','friends','private']::text[])),
  constraint sb_profile_social_settings_wall_visibility_check check (wall_visibility = any (array['public','friends','private']::text[]))
);

commit;
