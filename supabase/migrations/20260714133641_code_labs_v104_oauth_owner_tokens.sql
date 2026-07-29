-- Code Labs V104 OAuth authenticates the sole configured owner independently
-- from the short-lived live browser page session used by live page controls.
alter table public.code_labs_oauth_grants
  alter column session_id drop not null;

comment on column public.code_labs_oauth_grants.session_id is
  'Optional live page session captured for legacy grants. Durable V104 owner OAuth grants do not require a page session.';
