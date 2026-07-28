-- Stream Bandit replay foundation part.
-- SOURCE CANDIDATE ONLY.
-- Schema-only reconstruction of the pre-ledger foundation.
-- Test on a fresh database before any deployment or production decision.
-- Creates no rows and performs no destructive table or schema operation.

begin;

create table if not exists public.sb_genres (
  id uuid default gen_random_uuid() not null,
  name text not null,
  slug text not null,
  description text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_genres_name_not_blank check (length(trim(both from name)) > 0),
  constraint sb_genres_pkey primary key (id),
  constraint sb_genres_slug_not_blank check (length(trim(both from slug)) > 0),
  constraint sb_genres_slug_unique unique (slug)
);

create table if not exists public.sb_import_batches (
  id uuid default gen_random_uuid() not null,
  source_version text,
  backup_json jsonb,
  imported_by uuid,
  created_at timestamptz default now() not null,
  constraint sb_import_batches_pkey primary key (id)
);

create table if not exists public.sb_form_submissions (
  id uuid default gen_random_uuid() not null,
  page_slug text not null,
  form_title text,
  form_key text,
  block_id text,
  block_title text,
  answers_json jsonb default '{}'::jsonb not null,
  submitter_id uuid,
  submitter_email text,
  status text default 'new'::text not null,
  created_at timestamptz default now() not null,
  constraint sb_form_submissions_pkey primary key (id)
);

create table if not exists public.sb_submissions (
  id uuid default gen_random_uuid() not null,
  submitter_id uuid,
  channel_name text,
  title text not null,
  description text,
  video_url text,
  thumbnail_url text,
  trailer_url text,
  age_rating text,
  kids_suitable boolean default false not null,
  genres text[] default '{}'::text[] not null,
  reason text,
  status text default 'pending'::text not null,
  decline_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_submissions_pkey primary key (id),
  constraint sb_submissions_status_check check (status = any (array['pending','approved','declined']::text[]))
);

create table if not exists public.sb_account_deletion_requests (
  id uuid default gen_random_uuid() not null,
  requested_by uuid not null,
  profile_id uuid,
  email text,
  reason text not null,
  status text default 'requested'::text not null,
  requester_confirmed boolean default false not null,
  requested_at timestamptz default now() not null,
  approved_by uuid,
  approved_at timestamptz,
  executed_by uuid,
  executed_at timestamptz,
  rejected_by uuid,
  rejected_at timestamptz,
  owner_note text,
  failure_message text,
  request_payload jsonb default '{}'::jsonb not null,
  result_payload jsonb default '{}'::jsonb not null,
  updated_at timestamptz default now() not null,
  constraint sb_account_deletion_requests_pkey primary key (id),
  constraint sb_account_deletion_requests_reason_check check (char_length(trim(both from reason)) >= 10),
  constraint sb_account_deletion_requests_status_check check (status = any (array['requested','approved','processing','completed','rejected','cancelled','failed']::text[]))
);

create table if not exists public.sb_policy_documents (
  id uuid default gen_random_uuid() not null,
  slug text not null,
  title text not null,
  body text default ''::text not null,
  status text default 'draft'::text not null,
  contact_email text default 'info@chatterfriendsstreambandit.co.uk'::text not null,
  version_label text default 'V7.12.23'::text not null,
  legal_review_required boolean default true not null,
  updated_by uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint sb_policy_documents_pkey primary key (id),
  constraint sb_policy_documents_slug_key unique (slug),
  constraint sb_policy_documents_status_check check (status = any (array['draft','published','archived']::text[]))
);

commit;
