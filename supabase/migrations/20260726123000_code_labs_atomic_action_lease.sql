
-- Code Labs durable action lease and idempotency boundary.
-- Candidate only: this migration is reviewed in Code Labs before any production application.

begin;

alter table public.code_labs_workspace_state
  add column if not exists action_reservation_id uuid,
  add column if not exists action_reservation_started_at timestamptz;

create table if not exists public.code_labs_action_runs (
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  operation_id uuid not null,
  action text not null,
  expected_state_version bigint not null,
  completed_state_version bigint,
  status text not null default 'running',
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (owner_id, operation_id),
  constraint code_labs_action_runs_status_check
    check (status in ('running', 'completed', 'failed')),
  constraint code_labs_action_runs_completed_version_check
    check (
      (status = 'completed' and completed_state_version = expected_state_version + 1)
      or (status <> 'completed' and completed_state_version is null)
    )
);

alter table public.code_labs_action_runs
  add column if not exists completed_state_version bigint;

alter table public.code_labs_action_receipts
  add column if not exists operation_id uuid;

alter table public.code_labs_versions
  add column if not exists operation_id uuid;

alter table public.code_labs_write_requests
  add column if not exists operation_id uuid;

create unique index if not exists code_labs_action_receipts_owner_operation_uidx
  on public.code_labs_action_receipts (owner_id, operation_id)
  where operation_id is not null;

create unique index if not exists code_labs_versions_owner_operation_uidx
  on public.code_labs_versions (owner_id, operation_id)
  where operation_id is not null;

create unique index if not exists code_labs_write_requests_owner_operation_uidx
  on public.code_labs_write_requests (requested_by, operation_id)
  where operation_id is not null;

create index if not exists code_labs_action_runs_owner_updated_idx
  on public.code_labs_action_runs (owner_id, updated_at desc);

alter table public.code_labs_action_runs enable row level security;
revoke all on table public.code_labs_action_runs from public, anon, authenticated;
grant select, insert, update, delete on table public.code_labs_action_runs to service_role;

create or replace function public.code_labs_guard_workspace_action_lease()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_operation_id text;
begin
  if old.action_reservation_id is null then
    return new;
  end if;

  if new.state_version = old.state_version then
    return new;
  end if;

  v_operation_id := nullif(current_setting('code_labs.operation_id', true), '');
  if v_operation_id is not null
     and v_operation_id::uuid = old.action_reservation_id then
    return new;
  end if;

  raise exception 'Another Code Labs action owns the active workspace lease.';
end;
$$;

drop trigger if exists code_labs_workspace_action_lease_guard
  on public.code_labs_workspace_state;
create trigger code_labs_workspace_action_lease_guard
before update on public.code_labs_workspace_state
for each row execute function public.code_labs_guard_workspace_action_lease();

create or replace function public.code_labs_begin_workspace_action(
  p_owner_id uuid,
  p_operation_id uuid,
  p_action text,
  p_expected_state_version bigint
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_state public.code_labs_workspace_state%rowtype;
  v_run public.code_labs_action_runs%rowtype;
  v_reserved_run public.code_labs_action_runs%rowtype;
  v_stale_after interval := interval '5 minutes';
begin
  if p_owner_id is null or p_operation_id is null
     or nullif(btrim(p_action), '') is null
     or p_expected_state_version is null or p_expected_state_version < 1 then
    raise exception 'Invalid Code Labs action lease request.';
  end if;

  select * into v_state
  from public.code_labs_workspace_state
  where owner_id = p_owner_id
  for update;

  if not found then
    raise exception 'Code Labs workspace was not found.';
  end if;

  select * into v_run
  from public.code_labs_action_runs
  where owner_id = p_owner_id and operation_id = p_operation_id;

  if found then
    if v_run.action <> p_action
       or v_run.expected_state_version <> p_expected_state_version then
      raise exception 'The operation identity is already bound to different action arguments.';
    end if;

    if v_run.status = 'completed' then
      return jsonb_build_object(
        'state', 'completed',
        'state_version', v_run.completed_state_version,
        'result', coalesce(v_run.result, '{}'::jsonb)
      );
    end if;

    if v_run.status = 'running'
       and v_run.updated_at >= now() - v_stale_after then
      return jsonb_build_object(
        'state', 'running',
        'state_version', v_run.expected_state_version
      );
    end if;
  end if;

  if v_state.action_reservation_id is not null then
    select * into v_reserved_run
    from public.code_labs_action_runs
    where owner_id = p_owner_id
      and operation_id = v_state.action_reservation_id;

    if found and v_reserved_run.status = 'running'
       and v_reserved_run.updated_at >= now() - v_stale_after then
      raise exception 'Another Code Labs action is already running.';
    end if;

    update public.code_labs_action_runs
    set status = 'failed',
        error_message = 'Stale action lease reclaimed.',
        updated_at = now(),
        completed_at = now(),
        completed_state_version = null
    where owner_id = p_owner_id
      and operation_id = v_state.action_reservation_id
      and status = 'running';

    update public.code_labs_workspace_state
    set action_reservation_id = null,
        action_reservation_started_at = null,
        updated_at = now()
    where owner_id = p_owner_id;

    v_state.action_reservation_id := null;
    v_state.action_reservation_started_at := null;
  end if;

  if v_state.state_version <> p_expected_state_version then
    raise exception 'Workspace state changed. Read the workspace again before writing.';
  end if;

  insert into public.code_labs_action_runs (
    owner_id, operation_id, action, expected_state_version,
    completed_state_version, status, result, error_message,
    created_at, updated_at, completed_at
  ) values (
    p_owner_id, p_operation_id, p_action, p_expected_state_version,
    null, 'running', null, null,
    now(), now(), null
  )
  on conflict (owner_id, operation_id) do update
  set status = 'running',
      completed_state_version = null,
      result = null,
      error_message = null,
      updated_at = now(),
      completed_at = null
  where code_labs_action_runs.action = excluded.action
    and code_labs_action_runs.expected_state_version = excluded.expected_state_version
    and code_labs_action_runs.status in ('failed', 'running');

  update public.code_labs_workspace_state
  set action_reservation_id = p_operation_id,
      action_reservation_started_at = now(),
      updated_at = now()
  where owner_id = p_owner_id;

  return jsonb_build_object(
    'state', 'acquired',
    'state_version', v_state.state_version
  );
end;
$$;

create or replace function public.code_labs_complete_workspace_action(
  p_owner_id uuid,
  p_operation_id uuid,
  p_expected_state_version bigint,
  p_result jsonb
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_next bigint;
begin
  perform set_config('code_labs.operation_id', p_operation_id::text, true);

  update public.code_labs_workspace_state
  set state_version = state_version + 1,
      action_reservation_id = null,
      action_reservation_started_at = null,
      updated_at = now()
  where owner_id = p_owner_id
    and state_version = p_expected_state_version
    and action_reservation_id = p_operation_id
  returning state_version into v_next;

  if v_next is null then
    raise exception 'Code Labs action lease could not be completed.';
  end if;

  update public.code_labs_action_runs
  set status = 'completed',
      completed_state_version = v_next,
      result = coalesce(p_result, '{}'::jsonb),
      error_message = null,
      updated_at = now(),
      completed_at = now()
  where owner_id = p_owner_id
    and operation_id = p_operation_id
    and expected_state_version = p_expected_state_version
    and status = 'running';

  if not found then
    raise exception 'Code Labs action run could not be completed.';
  end if;

  return v_next;
end;
$$;

create or replace function public.code_labs_fail_workspace_action(
  p_owner_id uuid,
  p_operation_id uuid,
  p_expected_state_version bigint,
  p_error_message text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform set_config('code_labs.operation_id', p_operation_id::text, true);

  update public.code_labs_action_runs
  set status = 'failed',
      completed_state_version = null,
      error_message = left(coalesce(p_error_message, 'Action failed.'), 2000),
      updated_at = now(),
      completed_at = now()
  where owner_id = p_owner_id
    and operation_id = p_operation_id
    and expected_state_version = p_expected_state_version
    and status = 'running';

  update public.code_labs_workspace_state
  set action_reservation_id = null,
      action_reservation_started_at = null,
      updated_at = now()
  where owner_id = p_owner_id
    and action_reservation_id = p_operation_id;

  return true;
end;
$$;

revoke all on function public.code_labs_guard_workspace_action_lease() from public, anon, authenticated;
revoke all on function public.code_labs_begin_workspace_action(uuid, uuid, text, bigint) from public, anon, authenticated;
revoke all on function public.code_labs_complete_workspace_action(uuid, uuid, bigint, jsonb) from public, anon, authenticated;
revoke all on function public.code_labs_fail_workspace_action(uuid, uuid, bigint, text) from public, anon, authenticated;

grant execute on function public.code_labs_begin_workspace_action(uuid, uuid, text, bigint) to service_role;
grant execute on function public.code_labs_complete_workspace_action(uuid, uuid, bigint, jsonb) to service_role;
grant execute on function public.code_labs_fail_workspace_action(uuid, uuid, bigint, text) to service_role;

commit;
