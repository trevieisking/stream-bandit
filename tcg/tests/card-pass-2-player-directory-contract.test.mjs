import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl=new URL('../../supabase/migrations/20260917201805_tcg_player_directory_v0_1.sql',import.meta.url);
const sql=(await readFile(migrationUrl,'utf8')).toLowerCase();

test('directory preference owner is privacy-first and RLS protected',()=>{
  assert.match(sql,/create table if not exists public\.tcg_player_directory_preferences/);
  assert.match(sql,/discoverable boolean not null default false/);
  assert.match(sql,/alter table public\.tcg_player_directory_preferences enable row level security/);
  assert.match(sql,/for select to authenticated[\s\S]*auth\.uid\(\)[\s\S]*user_id/);
  assert.match(sql,/for insert to authenticated[\s\S]*with check[\s\S]*auth\.uid\(\)[\s\S]*user_id/);
  assert.match(sql,/for update to authenticated[\s\S]*using[\s\S]*auth\.uid\(\)[\s\S]*with check[\s\S]*auth\.uid\(\)/);
  assert.match(sql,/revoke all on table public\.tcg_player_directory_preferences from public, anon/);
  assert.match(sql,/grant select, insert, update on table public\.tcg_player_directory_preferences to authenticated/);
});

test('privileged directory projection stays in non-exposed tcg_private ownership',()=>{
  assert.match(sql,/create table if not exists tcg_private\.player_directory_projection/);
  assert.match(sql,/alter table tcg_private\.player_directory_projection enable row level security/);
  assert.match(sql,/grant select on table tcg_private\.player_directory_projection to authenticated/);
  assert.match(sql,/function tcg_private\.refresh_player_directory_projection\(p_user_id uuid\)/);
  assert.match(sql,/security definer[\s\S]*set search_path = ''/);
  assert.match(sql,/revoke all on function tcg_private\.refresh_player_directory_projection\(uuid\) from public, anon, authenticated, service_role/);
  assert.match(sql,/dp\.discoverable is true/);
  assert.match(sql,/sp\.account_status = 'active'/);
  assert.match(sql,/ss\.profile_visibility = 'public'/);
});

test('public Directory RPCs are SECURITY INVOKER wrappers over the safe projection',()=>{
  assert.match(sql,/function public\.tcg_search_public_players\([\s\S]*security invoker[\s\S]*tcg_private\.player_directory_projection/);
  assert.match(sql,/function public\.tcg_get_public_player\([\s\S]*security invoker[\s\S]*tcg_private\.player_directory_projection/);
  assert.doesNotMatch(sql,/function public\.tcg_search_public_players\([\s\S]*security definer/);
  assert.doesNotMatch(sql,/function public\.tcg_get_public_player\([\s\S]*security definer/);
  assert.match(sql,/revoke all on function public\.tcg_search_public_players\(text, integer, integer\) from public, anon, service_role/);
  assert.match(sql,/revoke all on function public\.tcg_get_public_player\(uuid\) from public, anon, service_role/);
  assert.match(sql,/grant execute on function public\.tcg_search_public_players\(text, integer, integer\) to authenticated/);
  assert.match(sql,/grant execute on function public\.tcg_get_public_player\(uuid\) to authenticated/);
  assert.match(sql,/least\(greatest\(coalesce\(p_limit, 25\), 1\), 50\)/);
});

test('projection refreshes from all authoritative sources without browser-owned writes',()=>{
  for(const trigger of [
    'tcg_directory_refresh_from_preferences',
    'tcg_directory_refresh_from_tcg_profile',
    'tcg_directory_refresh_from_social_settings',
    'tcg_directory_refresh_from_shared_profile'
  ]) assert.ok(sql.includes(trigger),`missing ${trigger}`);
  assert.match(sql,/revoke all on table tcg_private\.player_directory_projection from public, anon, authenticated, service_role/);
  for(const forbidden of ['admin_level','permissions_json','admin_notes','battle_pass_tokens','trade_tokens','shop_coins','starter_granted_at']){
    assert.equal(sql.includes(forbidden),false,`directory migration must not expose ${forbidden}`);
  }
});

test('directory migration does not weaken source-table RLS',()=>{
  assert.equal(sql.includes('alter table public.tcg_player_profiles disable row level security'),false);
  assert.equal(sql.includes('alter table public.sb_profiles disable row level security'),false);
  assert.equal(sql.includes('create policy')&&sql.includes('on public.tcg_player_profiles'),false);
  assert.equal(sql.includes('create policy')&&sql.includes('on public.sb_profiles'),false);
});
