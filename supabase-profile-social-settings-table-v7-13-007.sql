-- Stream Bandit V7.13.007
-- Profile Social Settings Table
-- Safe to run in Supabase SQL Editor.
-- Purpose: create a separate social profile settings table so the existing Auth-linked profile table is preserved.
-- This fixes Questions / Privacy saves without adding more columns to the protected profile/account table.

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

create table if not exists public.sb_profile_social_settings (
  user_id uuid primary key references public.sb_profiles(id) on delete cascade,

  profile_visibility text not null default 'public',
  wall_visibility text not null default 'friends',
  friends_visibility text not null default 'friends',
  activity_visibility text not null default 'friends',

  profile_questions jsonb not null default '{}'::jsonb,
  profile_social_links jsonb not null default '{}'::jsonb,
  profile_interests text[] not null default '{}'::text[],
  profile_website text,
  profile_location text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint sb_profile_social_settings_profile_visibility_check
    check (profile_visibility in ('public', 'friends', 'private')),
  constraint sb_profile_social_settings_wall_visibility_check
    check (wall_visibility in ('public', 'friends', 'private')),
  constraint sb_profile_social_settings_friends_visibility_check
    check (friends_visibility in ('public', 'friends', 'private')),
  constraint sb_profile_social_settings_activity_visibility_check
    check (activity_visibility in ('public', 'friends', 'private'))
);

create index if not exists sb_profile_social_settings_updated_idx
  on public.sb_profile_social_settings(updated_at desc);

drop trigger if exists sb_profile_social_settings_touch_trg on public.sb_profile_social_settings;
create trigger sb_profile_social_settings_touch_trg
before update on public.sb_profile_social_settings
for each row execute function public.sb_touch_updated_at();

alter table public.sb_profile_social_settings enable row level security;

drop policy if exists sb_profile_social_settings_select on public.sb_profile_social_settings;
create policy sb_profile_social_settings_select
on public.sb_profile_social_settings
for select
to anon, authenticated
using (true);

drop policy if exists sb_profile_social_settings_insert_own on public.sb_profile_social_settings;
create policy sb_profile_social_settings_insert_own
on public.sb_profile_social_settings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists sb_profile_social_settings_update_own on public.sb_profile_social_settings;
create policy sb_profile_social_settings_update_own
on public.sb_profile_social_settings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists sb_profile_social_settings_delete_own on public.sb_profile_social_settings;
create policy sb_profile_social_settings_delete_own
on public.sb_profile_social_settings
for delete
to authenticated
using (user_id = auth.uid());

-- Optional seed: create a default social settings row for every existing profile.
insert into public.sb_profile_social_settings (user_id)
select p.id
from public.sb_profiles p
where not exists (
  select 1
  from public.sb_profile_social_settings s
  where s.user_id = p.id
);

-- Force Supabase/PostgREST to reload the schema cache.
notify pgrst, 'reload schema';

-- Verification check 1: should return one row named sb_profile_social_settings.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'sb_profile_social_settings';

-- Verification check 2: should return these columns.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'sb_profile_social_settings'
order by ordinal_position;

-- Verification check 3: should show ready.
select 'sb_profile_social_settings ready' as stream_bandit_profile_social_settings_status;
