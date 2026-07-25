-- Stream Bandit social profile gallery foundation.
-- Security-first: dedicated private storage, owner-scoped metadata and viewer-aware RLS.

begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'stream-bandit-profile-gallery',
  'stream-bandit-profile-gallery',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm'
  ]::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.sb_profile_gallery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_kind text not null,
  storage_bucket text,
  storage_path text,
  external_url text,
  thumbnail_url text,
  caption text not null default '',
  alt_text text not null default '',
  visibility text not null default 'public',
  sort_order integer not null default 0,
  post_id uuid references public.sb_social_posts(id) on delete set null,
  metadata_json jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sb_profile_gallery_items_media_kind_check
    check (media_kind in ('image', 'video', 'external_video')),
  constraint sb_profile_gallery_items_visibility_check
    check (visibility in ('public', 'friends', 'private')),
  constraint sb_profile_gallery_items_status_check
    check (status in ('active', 'archived')),
  constraint sb_profile_gallery_items_source_check
    check (
      (
        media_kind in ('image', 'video')
        and storage_bucket = 'stream-bandit-profile-gallery'
        and nullif(btrim(storage_path), '') is not null
        and external_url is null
      )
      or
      (
        media_kind = 'external_video'
        and nullif(btrim(external_url), '') is not null
        and storage_path is null
        and storage_bucket is null
      )
    ),
  constraint sb_profile_gallery_items_owner_path_check
    check (
      storage_path is null
      or (
        split_part(storage_path, '/', 1) = user_id::text
        and split_part(storage_path, '/', 2) = 'gallery'
      )
    )
);

create index if not exists sb_profile_gallery_items_user_active_order_idx
  on public.sb_profile_gallery_items (user_id, status, sort_order, created_at desc);

create index if not exists sb_profile_gallery_items_post_idx
  on public.sb_profile_gallery_items (post_id)
  where post_id is not null;

create or replace function public.sb_profile_gallery_can_view(
  p_owner_id uuid,
  p_item_visibility text,
  p_viewer_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with profile_rule as (
    select coalesce(
      (
        select s.profile_visibility
        from public.sb_profile_social_settings s
        where s.user_id = p_owner_id
        limit 1
      ),
      'public'
    ) as visibility
  ), friendship as (
    select exists (
      select 1
      from public.sb_user_friends f
      where f.status = 'accepted'
        and (
          (f.requester_id = p_owner_id and f.addressee_id = p_viewer_id)
          or
          (f.addressee_id = p_owner_id and f.requester_id = p_viewer_id)
        )
    ) as accepted
  )
  select
    p_viewer_id is not null
    and (
      p_viewer_id = p_owner_id
      or (
        (select visibility from profile_rule) <> 'private'
        and (
          (select visibility from profile_rule) = 'public'
          or (select accepted from friendship)
        )
        and (
          p_item_visibility = 'public'
          or (p_item_visibility = 'friends' and (select accepted from friendship))
        )
      )
    );
$$;

revoke all on function public.sb_profile_gallery_can_view(uuid, text, uuid) from public;
grant execute on function public.sb_profile_gallery_can_view(uuid, text, uuid) to authenticated;

alter table public.sb_profile_gallery_items enable row level security;

revoke all on table public.sb_profile_gallery_items from anon;
grant select, insert, update, delete on table public.sb_profile_gallery_items to authenticated;

drop policy if exists sb_profile_gallery_items_select_visible on public.sb_profile_gallery_items;
create policy sb_profile_gallery_items_select_visible
on public.sb_profile_gallery_items
for select
to authenticated
using (
  status = 'active'
  and public.sb_profile_gallery_can_view(user_id, visibility, auth.uid())
);

drop policy if exists sb_profile_gallery_items_insert_own on public.sb_profile_gallery_items;
create policy sb_profile_gallery_items_insert_own
on public.sb_profile_gallery_items
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status in ('active', 'archived')
);

drop policy if exists sb_profile_gallery_items_update_own on public.sb_profile_gallery_items;
create policy sb_profile_gallery_items_update_own
on public.sb_profile_gallery_items
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists sb_profile_gallery_items_delete_own on public.sb_profile_gallery_items;
create policy sb_profile_gallery_items_delete_own
on public.sb_profile_gallery_items
for delete
to authenticated
using (user_id = auth.uid());

drop trigger if exists sb_profile_gallery_items_touch_updated_at
on public.sb_profile_gallery_items;
create trigger sb_profile_gallery_items_touch_updated_at
before update on public.sb_profile_gallery_items
for each row execute function public.sb_touch_updated_at();

-- Storage objects use <user-id>/gallery/<unique-file-name>.
-- Upload is allowed before the matching metadata row is inserted.
drop policy if exists "Stream Bandit profile gallery upload own" on storage.objects;
create policy "Stream Bandit profile gallery upload own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'stream-bandit-profile-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'gallery'
);

drop policy if exists "Stream Bandit profile gallery read visible" on storage.objects;
create policy "Stream Bandit profile gallery read visible"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'stream-bandit-profile-gallery'
  and exists (
    select 1
    from public.sb_profile_gallery_items item
    where item.storage_bucket = bucket_id
      and item.storage_path = name
      and item.status = 'active'
      and public.sb_profile_gallery_can_view(
        item.user_id,
        item.visibility,
        auth.uid()
      )
  )
);

drop policy if exists "Stream Bandit profile gallery update own" on storage.objects;
create policy "Stream Bandit profile gallery update own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'stream-bandit-profile-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'gallery'
)
with check (
  bucket_id = 'stream-bandit-profile-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'gallery'
);

drop policy if exists "Stream Bandit profile gallery delete own" on storage.objects;
create policy "Stream Bandit profile gallery delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'stream-bandit-profile-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'gallery'
);

comment on table public.sb_profile_gallery_items is
  'Profile-owned social gallery metadata. Stored files live in the private stream-bandit-profile-gallery bucket; longer videos may use an external URL.';

comment on function public.sb_profile_gallery_can_view(uuid, text, uuid) is
  'Returns whether an authenticated viewer may see one active profile gallery item under the profile and item visibility rules.';

commit;
