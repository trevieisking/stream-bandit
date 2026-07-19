-- Private Code Labs image gallery for registered owners with an active Pro entitlement.
-- No existing Stream Bandit bucket or policy is changed by this migration.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'code-labs-owner-gallery',
  'code-labs-owner-gallery',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Code Labs owner gallery read" on storage.objects;
create policy "Code Labs owner gallery read"
on storage.objects for select to authenticated
using (
  bucket_id = 'code-labs-owner-gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.code_labs_owners owner_row
    where owner_row.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.code_labs_entitlements entitlement
    where entitlement.owner_id = (select auth.uid())
      and entitlement.product_key = 'code_labs'
      and entitlement.plan_key = 'pro'
      and entitlement.status = 'active'
      and (entitlement.starts_at is null or entitlement.starts_at <= now())
      and (entitlement.expires_at is null or entitlement.expires_at > now())
  )
);

drop policy if exists "Code Labs owner gallery upload" on storage.objects;
create policy "Code Labs owner gallery upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'code-labs-owner-gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.code_labs_owners owner_row
    where owner_row.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.code_labs_entitlements entitlement
    where entitlement.owner_id = (select auth.uid())
      and entitlement.product_key = 'code_labs'
      and entitlement.plan_key = 'pro'
      and entitlement.status = 'active'
      and (entitlement.starts_at is null or entitlement.starts_at <= now())
      and (entitlement.expires_at is null or entitlement.expires_at > now())
  )
);

drop policy if exists "Code Labs owner gallery update" on storage.objects;
create policy "Code Labs owner gallery update"
on storage.objects for update to authenticated
using (
  bucket_id = 'code-labs-owner-gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.code_labs_owners owner_row
    where owner_row.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.code_labs_entitlements entitlement
    where entitlement.owner_id = (select auth.uid())
      and entitlement.product_key = 'code_labs'
      and entitlement.plan_key = 'pro'
      and entitlement.status = 'active'
      and (entitlement.starts_at is null or entitlement.starts_at <= now())
      and (entitlement.expires_at is null or entitlement.expires_at > now())
  )
)
with check (
  bucket_id = 'code-labs-owner-gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.code_labs_owners owner_row
    where owner_row.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.code_labs_entitlements entitlement
    where entitlement.owner_id = (select auth.uid())
      and entitlement.product_key = 'code_labs'
      and entitlement.plan_key = 'pro'
      and entitlement.status = 'active'
      and (entitlement.starts_at is null or entitlement.starts_at <= now())
      and (entitlement.expires_at is null or entitlement.expires_at > now())
  )
);

drop policy if exists "Code Labs owner gallery delete" on storage.objects;
create policy "Code Labs owner gallery delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'code-labs-owner-gallery'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.code_labs_owners owner_row
    where owner_row.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.code_labs_entitlements entitlement
    where entitlement.owner_id = (select auth.uid())
      and entitlement.product_key = 'code_labs'
      and entitlement.plan_key = 'pro'
      and entitlement.status = 'active'
      and (entitlement.starts_at is null or entitlement.starts_at <= now())
      and (entitlement.expires_at is null or entitlement.expires_at > now())
  )
);
