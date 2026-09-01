-- Manic Records storage recovery.
-- Forward-only, idempotent repair for production environments where the
-- Manic Records foundation schema exists but its dedicated storage buckets
-- or object policies are missing.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'manic-records-public-audio',
    'manic-records-public-audio',
    true,
    524288000,
    array['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/x-m4a','audio/ogg']::text[]
  ),
  (
    'manic-records-audio',
    'manic-records-audio',
    false,
    524288000,
    array['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/x-m4a','audio/ogg']::text[]
  ),
  (
    'manic-records-public-covers',
    'manic-records-public-covers',
    true,
    20971520,
    array['image/jpeg','image/png','image/webp']::text[]
  ),
  (
    'manic-records-covers',
    'manic-records-covers',
    false,
    20971520,
    array['image/jpeg','image/png','image/webp']::text[]
  )
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Authenticated users may write only inside their own uid-prefixed folder.
drop policy if exists "Manic Records upload own" on storage.objects;
create policy "Manic Records upload own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in (
    'manic-records-public-audio',
    'manic-records-audio',
    'manic-records-public-covers',
    'manic-records-covers'
  )
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Manic Records update own" on storage.objects;
create policy "Manic Records update own"
on storage.objects
for update
to authenticated
using (
  bucket_id in (
    'manic-records-public-audio',
    'manic-records-audio',
    'manic-records-public-covers',
    'manic-records-covers'
  )
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in (
    'manic-records-public-audio',
    'manic-records-audio',
    'manic-records-public-covers',
    'manic-records-covers'
  )
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Manic Records delete own" on storage.objects;
create policy "Manic Records delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id in (
    'manic-records-public-audio',
    'manic-records-audio',
    'manic-records-public-covers',
    'manic-records-covers'
  )
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Private-object reads remain owner-only. Public buckets are delivered by
-- Supabase's public object route and therefore need no storage SELECT policy.
drop policy if exists "Manic Records private read own" on storage.objects;
create policy "Manic Records private read own"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('manic-records-audio','manic-records-covers')
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
