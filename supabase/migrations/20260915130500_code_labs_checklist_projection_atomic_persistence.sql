-- Code Labs: persist the server-generated Master Checklist projection through
-- the existing V50 atomic workspace owner.
--
-- Forward-only source candidate. This does not introduce another mutation
-- engine, checklist owner, Writer route or deployment path. It extends the
-- existing atomic effect policy and record-patch owner for one exact action:
-- checklist.persist_projection.

begin;

do $code_labs_checklist_effect_policy$
declare
  v_signature constant regprocedure :=
    'public.code_labs_effect_allowed(text,text)'::regprocedure;
  v_definition text;
  v_replaced text;
  v_record_old constant text := E'      ''code_god.review'',\n      ''undo.execute''\n    )\n    when ''file_intake_upsert''';
  v_record_new constant text := E'      ''code_god.review'',\n      ''checklist.persist_projection'',\n      ''undo.execute''\n    )\n    when ''file_intake_upsert''';
  v_receipt_old constant text := E'      ''github.writer_prepare'',\n      ''undo.execute''\n    )\n    else false';
  v_receipt_new constant text := E'      ''github.writer_prepare'',\n      ''checklist.persist_projection'',\n      ''undo.execute''\n    )\n    else false';
  v_record_count integer;
  v_receipt_count integer;
begin
  select pg_catalog.pg_get_functiondef(v_signature)
  into v_definition;

  if v_definition is null then
    raise exception using
      errcode = 'P0001',
      message = 'checklist_projection_effect_policy_missing';
  end if;

  if position(v_record_new in v_definition) > 0
     and position(v_receipt_new in v_definition) > 0
     and position(v_record_old in v_definition) = 0
     and position(v_receipt_old in v_definition) = 0 then
    return;
  end if;

  v_record_count := (
    length(v_definition) - length(replace(v_definition, v_record_old, ''))
  ) / length(v_record_old);
  v_receipt_count := (
    length(v_definition) - length(replace(v_definition, v_receipt_old, ''))
  ) / length(v_receipt_old);

  if v_record_count <> 1
     or v_receipt_count <> 1
     or position(v_record_new in v_definition) > 0
     or position(v_receipt_new in v_definition) > 0 then
    raise exception using
      errcode = 'P0001',
      message = 'checklist_projection_effect_policy_source_mismatch';
  end if;

  v_replaced := replace(v_definition, v_record_old, v_record_new);
  v_replaced := replace(v_replaced, v_receipt_old, v_receipt_new);
  execute v_replaced;

  select pg_catalog.pg_get_functiondef(v_signature)
  into v_definition;

  if position(v_record_new in v_definition) = 0
     or position(v_receipt_new in v_definition) = 0
     or position(v_record_old in v_definition) > 0
     or position(v_receipt_old in v_definition) > 0 then
    raise exception using
      errcode = 'P0001',
      message = 'checklist_projection_effect_policy_verification_failed';
  end if;
end;
$code_labs_checklist_effect_policy$;

do $code_labs_checklist_record_patch$
declare
  v_signature constant regprocedure :=
    'public.code_labs_apply_record_patch(uuid,text,text,uuid,timestamptz,jsonb)'::regprocedure;
  v_definition text;
  v_replaced text;
  v_action_old constant text := E'  elsif p_record_type = ''file'' then\n    if p_action not in (\n      ''file.replace_current'', ''canvas.save_candidate'', ''candidate.save'',\n      ''candidate.accept'', ''repo.prepare_handoff'', ''code_god.review'',\n      ''undo.execute''\n    ) then raise exception ''file_action_mismatch''; end if;';
  v_action_new constant text := E'  elsif p_record_type = ''file'' then\n    if p_action not in (\n      ''file.replace_current'', ''canvas.save_candidate'', ''candidate.save'',\n      ''candidate.accept'', ''repo.prepare_handoff'', ''code_god.review'',\n      ''checklist.persist_projection'', ''undo.execute''\n    ) then raise exception ''file_action_mismatch''; end if;';
  v_selection_old constant text := E'    if p_action <> ''undo.execute'' and v_state.current_file_id is distinct from p_record_id then\n      raise exception ''selected_file_mismatch'';\n    end if;';
  v_selection_new constant text := E'    if p_action not in (''undo.execute'', ''checklist.persist_projection'')\n       and v_state.current_file_id is distinct from p_record_id then\n      raise exception ''selected_file_mismatch'';\n    end if;';
  v_metadata_old constant text := E'    if p_patch ? ''metadata'' and jsonb_typeof(p_patch->''metadata'') <> ''object'' then\n      raise exception ''metadata_must_be_object'';\n    end if;\n    if p_action = ''candidate.accept'' and (';
  v_metadata_new constant text := E'    if p_patch ? ''metadata'' and jsonb_typeof(p_patch->''metadata'') <> ''object'' then\n      raise exception ''metadata_must_be_object'';\n    end if;\n    if p_action = ''checklist.persist_projection'' and (\n      coalesce(v_before->>''filename'', '''') <> ''code-labs/CODE-LABS-V1-PLAN.md''\n      or not (p_patch ? ''metadata'')\n      or coalesce(jsonb_typeof(p_patch->''metadata''->''exact_checklist''), '''') <> ''object''\n      or coalesce(p_patch->''metadata''->''exact_checklist''->>''plan_record_id'', '''') <> p_record_id::text\n      or coalesce(p_patch->''metadata''->''exact_checklist''->>''source_hash'', '''') !~ ''^[a-f0-9]{64}$''\n      or lower(coalesce(p_patch->''metadata''->''exact_checklist''->>''source_hash'', ''''))\n         <> lower(coalesce(v_before->>''current_hash'', ''''))\n      or coalesce(jsonb_typeof(p_patch->''metadata''->''exact_checklist''->''items''), '''') <> ''array''\n      or (coalesce(p_patch->''metadata'', ''{}''::jsonb) - ''exact_checklist'')\n         is distinct from (coalesce(v_before->''metadata'', ''{}''::jsonb) - ''exact_checklist'')\n    ) then\n      raise exception ''checklist_projection_binding_invalid'';\n    end if;\n    if p_action = ''candidate.accept'' and (';
  v_action_count integer;
  v_selection_count integer;
  v_metadata_count integer;
begin
  select pg_catalog.pg_get_functiondef(v_signature)
  into v_definition;

  if v_definition is null then
    raise exception using
      errcode = 'P0001',
      message = 'checklist_projection_record_patch_missing';
  end if;

  if position(v_action_new in v_definition) > 0
     and position(v_selection_new in v_definition) > 0
     and position(v_metadata_new in v_definition) > 0
     and position(v_action_old in v_definition) = 0
     and position(v_selection_old in v_definition) = 0
     and position(v_metadata_old in v_definition) = 0 then
    return;
  end if;

  v_action_count := (
    length(v_definition) - length(replace(v_definition, v_action_old, ''))
  ) / length(v_action_old);
  v_selection_count := (
    length(v_definition) - length(replace(v_definition, v_selection_old, ''))
  ) / length(v_selection_old);
  v_metadata_count := (
    length(v_definition) - length(replace(v_definition, v_metadata_old, ''))
  ) / length(v_metadata_old);

  if v_action_count <> 1
     or v_selection_count <> 1
     or v_metadata_count <> 1
     or position(v_action_new in v_definition) > 0
     or position(v_selection_new in v_definition) > 0
     or position(v_metadata_new in v_definition) > 0 then
    raise exception using
      errcode = 'P0001',
      message = 'checklist_projection_record_patch_source_mismatch';
  end if;

  v_replaced := replace(v_definition, v_action_old, v_action_new);
  v_replaced := replace(v_replaced, v_selection_old, v_selection_new);
  v_replaced := replace(v_replaced, v_metadata_old, v_metadata_new);
  execute v_replaced;

  select pg_catalog.pg_get_functiondef(v_signature)
  into v_definition;

  if position(v_action_new in v_definition) = 0
     or position(v_selection_new in v_definition) = 0
     or position(v_metadata_new in v_definition) = 0
     or position(v_action_old in v_definition) > 0
     or position(v_selection_old in v_definition) > 0
     or position(v_metadata_old in v_definition) > 0 then
    raise exception using
      errcode = 'P0001',
      message = 'checklist_projection_record_patch_verification_failed';
  end if;
end;
$code_labs_checklist_record_patch$;

comment on function public.code_labs_effect_allowed(text, text) is
  'Single atomic effect policy; checklist.persist_projection may update one file record and create one receipt.';

comment on function public.code_labs_apply_record_patch(
  uuid,
  text,
  text,
  uuid,
  timestamptz,
  jsonb
) is
  'Single atomic record-patch owner; checklist.persist_projection may update only the exact owner-scoped Master Plan metadata.exact_checklist while preserving all other metadata.';

commit;
