-- Code Labs atomic boolean owner cleanup.
-- POST-CUTOVER CLEANUP ONLY.
-- Candidate only: keep with the hardening bundle until it is folded into the
-- final hardening migration before any deployment decision.

begin;

revoke all on function public.code_labs_jsonb_boolean(jsonb, boolean, text)
  from public, anon, authenticated, service_role;

drop function if exists public.code_labs_jsonb_boolean(jsonb, boolean, text);

-- The strict expansion boundary remains the sole service-role boolean owner.
revoke all on function public.code_labs_require_jsonb_boolean(jsonb, boolean, text)
  from public, anon, authenticated;
grant execute on function public.code_labs_require_jsonb_boolean(jsonb, boolean, text)
  to service_role;

commit;
