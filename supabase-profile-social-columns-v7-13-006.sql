-- Stream Bandit V7.13.006
-- Profile Social Columns Fix
-- Safe to run in Supabase SQL Editor.
-- Purpose: fixes Social Profile Questions / Privacy save errors such as:
-- "Could not find the 'profile_interests' column of 'sb_profiles' in the schema cache"
-- This only adds missing columns to public.sb_profiles and reloads the Supabase/PostgREST schema cache.
-- It does not change Auth, existing avatar/banner/profile account fields, movies, likes, friends, family, or player tables.

alter table public.sb_profiles
  add column if not exists profile_visibility text not null default 'public';

alter table public.sb_profiles
  add column if not exists wall_visibility text not null default 'friends';

alter table public.sb_profiles
  add column if not exists friends_visibility text not null default 'friends';

alter table public.sb_profiles
  add column if not exists activity_visibility text not null default 'friends';

alter table public.sb_profiles
  add column if not exists profile_questions jsonb not null default '{}'::jsonb;

alter table public.sb_profiles
  add column if not exists profile_social_links jsonb not null default '{}'::jsonb;

alter table public.sb_profiles
  add column if not exists profile_interests text[] not null default '{}'::text[];

alter table public.sb_profiles
  add column if not exists profile_website text;

alter table public.sb_profiles
  add column if not exists profile_location text;

alter table public.sb_profiles
  add column if not exists social_updated_at timestamptz;

-- Add visibility constraints only if they are missing.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sb_profiles_profile_visibility_check'
  ) then
    alter table public.sb_profiles
      add constraint sb_profiles_profile_visibility_check
      check (profile_visibility in ('public', 'friends', 'private'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'sb_profiles_wall_visibility_check'
  ) then
    alter table public.sb_profiles
      add constraint sb_profiles_wall_visibility_check
      check (wall_visibility in ('public', 'friends', 'private'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'sb_profiles_friends_visibility_check'
  ) then
    alter table public.sb_profiles
      add constraint sb_profiles_friends_visibility_check
      check (friends_visibility in ('public', 'friends', 'private'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'sb_profiles_activity_visibility_check'
  ) then
    alter table public.sb_profiles
      add constraint sb_profiles_activity_visibility_check
      check (activity_visibility in ('public', 'friends', 'private'));
  end if;
end;
$$;

-- Make sure any existing rows have safe values.
update public.sb_profiles
set
  profile_visibility = coalesce(profile_visibility, 'public'),
  wall_visibility = coalesce(wall_visibility, 'friends'),
  friends_visibility = coalesce(friends_visibility, 'friends'),
  activity_visibility = coalesce(activity_visibility, 'friends'),
  profile_questions = coalesce(profile_questions, '{}'::jsonb),
  profile_social_links = coalesce(profile_social_links, '{}'::jsonb),
  profile_interests = coalesce(profile_interests, '{}'::text[]);

-- Force Supabase/PostgREST to reload the schema cache.
notify pgrst, 'reload schema';

-- Verification check 1: should return these 10 rows.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'sb_profiles'
  and column_name in (
    'profile_visibility',
    'wall_visibility',
    'friends_visibility',
    'activity_visibility',
    'profile_questions',
    'profile_social_links',
    'profile_interests',
    'profile_website',
    'profile_location',
    'social_updated_at'
  )
order by column_name;

-- Verification check 2: should show ready.
select 'profile social columns ready' as stream_bandit_profile_social_status;
