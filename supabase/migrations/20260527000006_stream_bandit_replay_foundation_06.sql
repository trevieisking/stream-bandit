-- Stream Bandit replay foundation part.
-- SOURCE CANDIDATE ONLY.
-- Schema-only reconstruction of the pre-ledger foundation.
-- Test on a fresh database before any deployment or production decision.
-- Creates no rows and performs no destructive table or schema operation.

begin;

-- Shared update trigger helper already present in production before the
-- recorded migration ledger begins. Later migrations depend on this exact
-- contract when creating table-specific updated_at triggers.
create or replace function public.sb_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- RLS state mirrors the live foundation before later policy migrations replay.
alter table public.code_labs_audit_log enable row level security;
alter table public.code_labs_files enable row level security;
alter table public.code_labs_jobs enable row level security;
alter table public.code_labs_owners enable row level security;
alter table public.code_labs_packets enable row level security;
alter table public.code_labs_projects enable row level security;
alter table public.code_labs_test_runs enable row level security;
alter table public.code_labs_versions enable row level security;
alter table public.code_labs_write_requests enable row level security;
alter table public.sb_account_deletion_requests enable row level security;
alter table public.sb_channels enable row level security;
alter table public.sb_collection_movies enable row level security;
alter table public.sb_collections enable row level security;
alter table public.sb_favourites enable row level security;
alter table public.sb_form_submissions enable row level security;
alter table public.sb_genres enable row level security;
alter table public.sb_import_batches enable row level security;
alter table public.sb_likes enable row level security;
alter table public.sb_movies enable row level security;
alter table public.sb_playlist_movies enable row level security;
alter table public.sb_playlists enable row level security;
alter table public.sb_policy_documents enable row level security;
alter table public.sb_profile_social_settings enable row level security;
alter table public.sb_profiles enable row level security;
alter table public.sb_social_group_members enable row level security;
alter table public.sb_social_groups enable row level security;
alter table public.sb_social_notifications enable row level security;
alter table public.sb_social_post_comments enable row level security;
alter table public.sb_social_post_media enable row level security;
alter table public.sb_social_posts enable row level security;
alter table public.sb_submissions enable row level security;
alter table public.sb_user_friends enable row level security;
alter table public.sb_watch_progress enable row level security;
alter table public.sb_watchlist enable row level security;

commit;
