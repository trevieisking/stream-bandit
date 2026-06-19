-- Stream Bandit V7.13.005
-- Family Relationship Confirmation Foundation
-- Safe to run in Supabase SQL Editor.
-- Purpose: allow a user to request a confirmed family relationship with an accepted friend.
-- Nothing here changes Auth, existing profile settings, movies, likes, or existing friend rows.

create extension if not exists pgcrypto;

-- Keep updated_at fresh.
create or replace function public.sb_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admin helper, kept local to this migration so it can run even if the larger social SQL is not deployed yet.
create or replace function public.sb_family_is_admin()
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
        coalesce(p.role, '') = 'admin'
        or coalesce(p.admin_level, '') in ('owner', 'admin', 'platform_owner')
      )
  );
$$;

-- Accepted-friend helper using the existing Stream Bandit friends table.
create or replace function public.sb_family_are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sb_user_friends f
    where lower(coalesce(f.status, '')) in ('accepted', 'friend', 'friends')
      and (
        (f.requester_id = a and f.addressee_id = b)
        or
        (f.requester_id = b and f.addressee_id = a)
      )
  );
$$;

create table if not exists public.sb_user_family_relationships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.sb_profiles(id) on delete cascade,
  addressee_id uuid not null references public.sb_profiles(id) on delete cascade,

  -- Meaning: the requester is saying "this viewed/addressee profile is my brother/sister/mother/etc".
  relationship_type text not null,

  status text not null default 'pending',
  requester_note text,
  addressee_note text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb,

  constraint sb_user_family_no_self check (requester_id <> addressee_id),
  constraint sb_user_family_type_check check (
    relationship_type in (
      'brother',
      'sister',
      'mother',
      'father',
      'uncle',
      'auntie',
      'cousin',
      'grandmother',
      'grandfather',
      'partner',
      'family'
    )
  ),
  constraint sb_user_family_status_check check (
    status in ('pending', 'accepted', 'declined', 'canceled')
  )
);

create index if not exists sb_user_family_requester_idx
  on public.sb_user_family_relationships(requester_id, status, updated_at desc);

create index if not exists sb_user_family_addressee_idx
  on public.sb_user_family_relationships(addressee_id, status, updated_at desc);

create index if not exists sb_user_family_pair_idx
  on public.sb_user_family_relationships(requester_id, addressee_id);

-- Only one live pending/accepted family relationship per directed pair.
create unique index if not exists sb_user_family_live_pair_unique
  on public.sb_user_family_relationships(requester_id, addressee_id)
  where status in ('pending', 'accepted');

-- Guard the important transitions so users cannot accept their own request.
create or replace function public.sb_user_family_relationships_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  is_admin boolean := public.sb_family_is_admin();
begin
  if tg_op = 'INSERT' then
    if not is_admin and (current_user_id is null or new.requester_id <> current_user_id) then
      raise exception 'Only the signed-in requester can create a family request.';
    end if;

    if new.requester_id = new.addressee_id then
      raise exception 'You cannot request a family relationship with yourself.';
    end if;

    if not is_admin and not public.sb_family_are_friends(new.requester_id, new.addressee_id) then
      raise exception 'Family requests require an accepted friendship first.';
    end if;

    new.status := 'pending';
    new.requested_at := coalesce(new.requested_at, now());
    new.responded_at := null;
    new.created_at := coalesce(new.created_at, now());
    new.updated_at := now();
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if not is_admin and current_user_id is null then
      raise exception 'You must be signed in to update a family request.';
    end if;

    -- Do not allow identity/relationship rewrites after creation.
    if new.requester_id <> old.requester_id
       or new.addressee_id <> old.addressee_id
       or new.relationship_type <> old.relationship_type
       or new.created_at <> old.created_at
       or new.requested_at <> old.requested_at then
      raise exception 'Family request identity fields cannot be changed.';
    end if;

    if is_admin then
      if new.status <> old.status and new.status in ('accepted', 'declined', 'canceled') then
        new.responded_at := coalesce(new.responded_at, now());
      end if;
      new.updated_at := now();
      return new;
    end if;

    -- Addressee can confirm or decline a pending request.
    if current_user_id = old.addressee_id then
      if old.status <> 'pending' and new.status <> old.status then
        raise exception 'Only pending family requests can be answered.';
      end if;

      if new.status <> old.status and new.status not in ('accepted', 'declined') then
        raise exception 'The requested person can only accept or decline.';
      end if;

      if new.status <> old.status then
        new.responded_at := now();
      end if;

      new.updated_at := now();
      return new;
    end if;

    -- Requester can cancel their own pending request, but cannot accept it.
    if current_user_id = old.requester_id then
      if new.status <> old.status and not (old.status = 'pending' and new.status = 'canceled') then
        raise exception 'The requester can only cancel a pending family request.';
      end if;

      if new.status <> old.status then
        new.responded_at := now();
      end if;

      new.updated_at := now();
      return new;
    end if;

    raise exception 'You are not allowed to update this family request.';
  end if;

  return new;
end;
$$;

drop trigger if exists sb_user_family_relationships_guard_trg on public.sb_user_family_relationships;
create trigger sb_user_family_relationships_guard_trg
before insert or update on public.sb_user_family_relationships
for each row execute function public.sb_user_family_relationships_guard();

drop trigger if exists sb_user_family_relationships_touch_trg on public.sb_user_family_relationships;
create trigger sb_user_family_relationships_touch_trg
before update on public.sb_user_family_relationships
for each row execute function public.sb_touch_updated_at();

alter table public.sb_user_family_relationships enable row level security;

drop policy if exists sb_user_family_select on public.sb_user_family_relationships;
create policy sb_user_family_select
on public.sb_user_family_relationships
for select
to authenticated
using (
  public.sb_family_is_admin()
  or requester_id = auth.uid()
  or addressee_id = auth.uid()
);

drop policy if exists sb_user_family_insert on public.sb_user_family_relationships;
create policy sb_user_family_insert
on public.sb_user_family_relationships
for insert
to authenticated
with check (
  public.sb_family_is_admin()
  or (
    requester_id = auth.uid()
    and requester_id <> addressee_id
    and status = 'pending'
    and public.sb_family_are_friends(requester_id, addressee_id)
  )
);

drop policy if exists sb_user_family_update on public.sb_user_family_relationships;
create policy sb_user_family_update
on public.sb_user_family_relationships
for update
to authenticated
using (
  public.sb_family_is_admin()
  or requester_id = auth.uid()
  or addressee_id = auth.uid()
)
with check (
  public.sb_family_is_admin()
  or requester_id = auth.uid()
  or addressee_id = auth.uid()
);

drop policy if exists sb_user_family_delete on public.sb_user_family_relationships;
create policy sb_user_family_delete
on public.sb_user_family_relationships
for delete
to authenticated
using (
  public.sb_family_is_admin()
  or requester_id = auth.uid()
);

-- Quick verification checks.
select 'sb_user_family_relationships ready' as stream_bandit_family_status;

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'sb_user_family_relationships';

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'sb_user_family_relationships'
order by ordinal_position;
