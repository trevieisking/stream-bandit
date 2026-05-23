-- Stream Bandit V7.12.23 Policy Documents Supabase Setup
-- Purpose: protected policy document storage for admin-only editing and public read-only previews.
-- Run this in Supabase SQL Editor when ready.
-- Safe design:
-- - Public users can only read status='published' documents.
-- - Admin users can read/insert/update/delete policy documents.
-- - Admin check uses sb_profiles.id = auth.uid() and sb_profiles.role = 'admin'.
-- - Existing public HTML previews remain safe fallback until they are later connected.

create extension if not exists pgcrypto;

create table if not exists public.sb_policy_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  contact_email text not null default 'info@chatterfriendsstreambandit.co.uk',
  version_label text not null default 'V7.12.23',
  legal_review_required boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sb_policy_documents_slug_idx on public.sb_policy_documents(slug);
create index if not exists sb_policy_documents_status_idx on public.sb_policy_documents(status);

create or replace function public.sb_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sb_policy_documents_touch_updated_at on public.sb_policy_documents;
create trigger sb_policy_documents_touch_updated_at
before update on public.sb_policy_documents
for each row execute function public.sb_touch_updated_at();

create or replace function public.sb_is_admin()
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
      and lower(coalesce(p.role,'')) = 'admin'
  );
$$;

alter table public.sb_policy_documents enable row level security;

-- Cleanly recreate policies so the script can be re-run during testing.
drop policy if exists "Public can read published policy documents" on public.sb_policy_documents;
drop policy if exists "Admins can read all policy documents" on public.sb_policy_documents;
drop policy if exists "Admins can insert policy documents" on public.sb_policy_documents;
drop policy if exists "Admins can update policy documents" on public.sb_policy_documents;
drop policy if exists "Admins can delete policy documents" on public.sb_policy_documents;

create policy "Public can read published policy documents"
on public.sb_policy_documents
for select
to anon, authenticated
using (status = 'published' or public.sb_is_admin());

create policy "Admins can read all policy documents"
on public.sb_policy_documents
for select
to authenticated
using (public.sb_is_admin());

create policy "Admins can insert policy documents"
on public.sb_policy_documents
for insert
to authenticated
with check (public.sb_is_admin());

create policy "Admins can update policy documents"
on public.sb_policy_documents
for update
to authenticated
using (public.sb_is_admin())
with check (public.sb_is_admin());

create policy "Admins can delete policy documents"
on public.sb_policy_documents
for delete
to authenticated
using (public.sb_is_admin());

insert into public.sb_policy_documents (slug, title, body, status, contact_email, version_label, legal_review_required)
values
('terms','Terms of Use / End User Agreement','Draft Terms of Use text. Source currently exists in sb-policy-terms-eula-v7-11-6-test.html. Replace this body after admin editor test passes.','draft','info@chatterfriendsstreambandit.co.uk','V7.12.23',true),
('privacy','Privacy Policy','Draft Privacy Policy text. Source currently exists in sb-policy-privacy-v7-11-6-test.html. Replace this body after admin editor test passes.','draft','info@chatterfriendsstreambandit.co.uk','V7.12.23',true),
('cookies','Cookie Policy','Draft Cookie Policy text. Source currently exists in sb-policy-cookies-v7-11-6-test.html. Replace this body after admin editor test passes.','draft','info@chatterfriendsstreambandit.co.uk','V7.12.23',true),
('family-watch','Children / Family Watch Policy','Draft Family Watch text. Source currently exists in sb-policy-family-watch-v7-11-6-test.html. Replace this body after admin editor test passes.','draft','info@chatterfriendsstreambandit.co.uk','V7.12.23',true),
('cancellation','Cancellation / Refunds Policy','Draft Cancellation and Refunds text. Source currently exists in sb-policy-cancellation-refunds-v7-11-6-test.html. Replace this body after admin editor test passes.','draft','info@chatterfriendsstreambandit.co.uk','V7.12.23',true),
('creator-content','Creator / Content Rules','Draft Creator and Content Rules text. Source currently exists in sb-policy-creator-content-v7-11-6-test.html. Replace this body after admin editor test passes.','draft','info@chatterfriendsstreambandit.co.uk','V7.12.23',true),
('accessibility','Accessibility Statement','Draft Accessibility Statement text. Source currently exists in sb-policy-accessibility-v7-11-6-test.html. Replace this body after admin editor test passes.','draft','info@chatterfriendsstreambandit.co.uk','V7.12.23',true)
on conflict (slug) do nothing;

-- Quick admin check after running:
-- select public.sb_is_admin();
-- select slug,title,status,contact_email,updated_at from public.sb_policy_documents order by slug;
