-- Code Labs CL-HIST-023: restore eligible selected-project undo.
--
-- Forward-only repair for the existing atomic record-patch owner. The production
-- migration history already contains the V50 foundation, so this migration does
-- not rewrite an applied migration and does not create a competing function.
-- It changes exactly one verified gate and fails closed if the live/replayed
-- function definition has drifted.

begin;

do $code_labs_project_undo_fix$
declare
  v_signature constant regprocedure :=
    'public.code_labs_apply_record_patch(uuid,text,text,uuid,timestamptz,jsonb)'::regprocedure;
  v_definition text;
  v_replaced text;
  v_old_gate constant text := E'if p_action <> ''setup.save'' or v_state.current_project_id is distinct from p_record_id then\n      raise exception ''selected_project_mismatch'';\n    end if;';
  v_new_gate constant text := E'if p_action not in (''setup.save'', ''undo.execute'')\n       or v_state.current_project_id is distinct from p_record_id then\n      raise exception ''selected_project_mismatch'';\n    end if;';
  v_old_count integer;
begin
  select pg_catalog.pg_get_functiondef(v_signature)
  into v_definition;

  if v_definition is null then
    raise exception using
      errcode = 'P0001',
      message = 'project_undo_patch_function_missing';
  end if;

  if position(v_new_gate in v_definition) > 0
     and position(v_old_gate in v_definition) = 0 then
    return;
  end if;

  v_old_count := (
    length(v_definition) - length(replace(v_definition, v_old_gate, ''))
  ) / length(v_old_gate);

  if v_old_count <> 1 or position(v_new_gate in v_definition) > 0 then
    raise exception using
      errcode = 'P0001',
      message = 'project_undo_patch_source_mismatch';
  end if;

  v_replaced := replace(v_definition, v_old_gate, v_new_gate);
  execute v_replaced;

  select pg_catalog.pg_get_functiondef(v_signature)
  into v_definition;

  if position(v_new_gate in v_definition) = 0
     or position(v_old_gate in v_definition) > 0 then
    raise exception using
      errcode = 'P0001',
      message = 'project_undo_patch_verification_failed';
  end if;
end;
$code_labs_project_undo_fix$;

comment on function public.code_labs_apply_record_patch(
  uuid,
  text,
  text,
  uuid,
  timestamptz,
  jsonb
) is 'Single atomic record-patch owner; CL-HIST-023 permits exact selected-project undo receipts.';

commit;
