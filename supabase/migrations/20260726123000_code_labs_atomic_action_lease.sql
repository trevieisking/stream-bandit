-- Code Labs durable action lease and idempotency boundary.
-- A workflow action reserves an operation identity without consuming state.
-- Success records the result and increments state exactly once.
-- Failure releases the lease and leaves state_version unchanged.

begin;

alter table public.code_labs_workspace_state
  add column if not exists action_reservation_id uuid;

create table if not exists public.code_labs_action_runs (
  owner_id uuid not null references public.code_labs_owners(user_id) on delete cascade,
  operation_id uuid not null,
  action text not null,
  expected_state_version bigint not null,
  status text not null default 'running',
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (owner_id, operation_id),
  constraint code_labs_action_runs_status_check
    check (status in ('running', 'completed', 'failed'))
);

alter table public.code_labs_action_runs enable row level security;
revoke all on table public.code_labs_action_runs from public, anon, authenticated;
grant select, insert, update, delete on table public.code_labs_action_runs to service_role;

create index if not exists code_labs_action_runs_owner_updated_idx
  on public.code_labs_action_runs (owner_id, updated_at desc);

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
begin
  if p_owner_id is null or p_operation_id is null or nullif(btrim(p_action), '') is null
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

  if found and v_run.status = 'completed' then
    return jsonb_build_object(
      'state', 'completed',
      'state_version', v_state.state_version,
      'result', v_run.result
    );
  end if;

  if found and v_run.status = 'running' then
    return jsonb_build_object(
      'state', 'running',
      'state_version', v_state.state_version
    );
  end if;

  if v_state.state_version <> p_expected_state_version then
    raise exception 'Workspace state changed. Read the workspace again before writing.';
  end if;

  if v_state.action_reservation_id is not null
     and v_state.action_reservation_id <> p_operation_id then
    raise exception 'Another Code Labs action is already running.';
  end if;

  insert into public.code_labs_action_runs (
    owner_id, operation_id, action, expected_state_version, status,
    result, error_message, created_at, updated_at, completed_at
  ) values (
    p_owner_id, p_operation_id, p_action, p_expected_state_version, 'running',
    null, null, now(), now(), null
  )
  on conflict (owner_id, operation_id) do update
  set action = excluded.action,
      expected_state_version = excluded.expected_state_version,
      status = 'running',
      result = null,
      error_message = null,
      updated_at = now(),
      completed_at = null;

  update public.code_labs_workspace_state
  set action_reservation_id = p_operation_id,
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
  update public.code_labs_workspace_state
  set state_version = state_version + 1,
      action_reservation_id = null,
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
      result = coalesce(p_result, '{}'::jsonb),
      error_message = null,
      updated_at = now(),
      completed_at = now()
  where owner_id = p_owner_id
    and operation_id = p_operation_id
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
  update public.code_labs_action_runs
  set status = 'failed',
      error_message = left(coalesce(p_error_message, 'Action failed.'), 2000),
      updated_at = now(),
      completed_at = now()
  where owner_id = p_owner_id
    and operation_id = p_operation_id
    and status = 'running';

  update public.code_labs_workspace_state
  set action_reservation_id = null,
      updated_at = now()
  where owner_id = p_owner_id
    and state_version = p_expected_state_version
    and action_reservation_id = p_operation_id;

  return true;
end;
$$;

revoke all on function public.code_labs_begin_workspace_action(uuid, uuid, text, bigint) from public, anon, authenticated;
revoke all on function public.code_labs_complete_workspace_action(uuid, uuid, bigint, jsonb) from public, anon, authenticated;
revoke all on function public.code_labs_fail_workspace_action(uuid, uuid, bigint, text) from public, anon, authenticated;

grant execute on function public.code_labs_begin_workspace_action(uuid, uuid, text, bigint) to service_role;
grant execute on function public.code_labs_complete_workspace_action(uuid, uuid, bigint, jsonb) to service_role;
grant execute on function public.code_labs_fail_workspace_action(uuid, uuid, bigint, text) to service_role;

commit;
