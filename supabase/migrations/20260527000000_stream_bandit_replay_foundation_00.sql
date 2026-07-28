-- Stream Bandit replay foundation part.
-- SOURCE CANDIDATE ONLY.
-- Schema-only reconstruction of the pre-ledger foundation.
-- Test on a fresh database before any deployment or production decision.
-- Creates no rows and performs no destructive table or schema operation.

begin;

create table if not exists public.sb_profiles (
  id uuid not null,
  username text,
  display_name text,
  channel_name text,
  channel_about text,
  avatar_url text,
  banner_url text,
  role text default 'user'::text not null,
  can_submit boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  account_status text default 'active'::text not null,
  admin_level text default 'none'::text not null,
  permissions_json jsonb default '{}'::jsonb not null,
  plan_key text default 'free_viewer'::text not null,
  admin_notes text,
  managed_by uuid,
  managed_at timestamptz,
  constraint sb_profiles_account_status_check check (account_status = any (array['active','limited','restricted','banned','review']::text[])),
  constraint sb_profiles_admin_level_check check (admin_level = any (array['none','moderator','admin','owner']::text[])),
  constraint sb_profiles_pkey primary key (id),
  constraint sb_profiles_plan_key_check check (plan_key = any (array['free_viewer','viewer_plus','creator_starter','creator_growth','creator_pro','studio_business','platform_owner']::text[])),
  constraint sb_profiles_role_check check (role = any (array['user','admin']::text[])),
  constraint sb_profiles_username_key unique (username)
);

create table if not exists public.sb_channels (
  id uuid default gen_random_uuid() not null,
  name text not null,
  description text,
  owner_id uuid,
  image_url text,
  is_official boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  avatar_url text,
  constraint sb_channels_pkey primary key (id)
);

create table if not exists public.sb_movies (
  id uuid default gen_random_uuid() not null,
  title text not null,
  description text,
  mux_playback_url text,
  video_url text,
  thumbnail_url text,
  trailer_url text,
  year text,
  rating text,
  runtime_text text,
  age_rating text,
  director text,
  cast_text text,
  genres text[] default '{}'::text[] not null,
  tags text[] default '{}'::text[] not null,
  channel_id uuid,
  owner_id uuid,
  featured boolean default false not null,
  duration_seconds numeric default 0 not null,
  source_type text default 'url'::text not null,
  status text default 'published'::text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_movies_pkey primary key (id),
  constraint sb_movies_source_type_check check (source_type = any (array['mux','hls','url','local','missing']::text[])),
  constraint sb_movies_status_check check (status = any (array['published','draft','pending','hidden']::text[]))
);

create table if not exists public.sb_collections (
  id uuid default gen_random_uuid() not null,
  name text not null,
  description text,
  image_url text,
  created_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_collections_pkey primary key (id)
);

create table if not exists public.sb_collection_movies (
  collection_id uuid not null,
  movie_id uuid not null,
  sort_order integer default 0 not null,
  constraint sb_collection_movies_pkey primary key (collection_id, movie_id)
);

create table if not exists public.sb_playlists (
  id uuid default gen_random_uuid() not null,
  name text not null,
  image_url text,
  owner_id uuid,
  is_public boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  description text,
  constraint sb_playlists_pkey primary key (id)
);

create table if not exists public.sb_playlist_movies (
  playlist_id uuid not null,
  movie_id uuid not null,
  sort_order integer default 0 not null,
  constraint sb_playlist_movies_pkey primary key (playlist_id, movie_id)
);

create table if not exists public.sb_favourites (
  user_id uuid not null,
  movie_id uuid not null,
  created_at timestamptz default now() not null,
  constraint sb_favourites_pkey primary key (user_id, movie_id)
);

create table if not exists public.sb_likes (
  user_id uuid not null,
  movie_id uuid not null,
  created_at timestamptz default now() not null,
  constraint sb_likes_pkey primary key (user_id, movie_id)
);

create table if not exists public.sb_watch_progress (
  user_id uuid not null,
  movie_id uuid not null,
  progress_seconds numeric default 0 not null,
  finished boolean default false not null,
  last_watched_at timestamptz default now() not null,
  constraint sb_watch_progress_pkey primary key (user_id, movie_id)
);

create table if not exists public.sb_watchlist (
  user_id uuid not null,
  movie_id uuid not null,
  created_at timestamptz default now() not null,
  constraint sb_watchlist_pkey primary key (user_id, movie_id)
);

commit;
